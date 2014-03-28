import json
import SocketServer
import socket
import re
import time
import hashlib
import base64
#import drawr_server_brushes
import drawr_server_map

#from PIL import Image

host = "" #127.0.0.1
port = 27182 # 80


def utc_now():
    return int(round(time.time() * 1000))

################
## HTTP STUFF ##
################

def parse_path(p):
    reg = r"^([a-z]+:\/\/[^\/]*)?\/*(?P<path>.*)$"
    m = re.match(reg, p)
    return m.group('path')

def parse_headers(headers_str):
    # sexy regex thx to http://stackoverflow.com/questions/4685217/parse-raw-http-headers
    headers = dict(re.findall(r"(?P<name>.*?): ?(?P<value>.*?)\r?\n", headers_str))
    return headers

def form_resp_headers(body_len, mime = "text/html; charset=utf-8"):
    headers = {}
    headers['Content-Type'] = mime
    headers['Content-Length'] = str(body_len)
    headers['Access-Control-Allow-Origin'] = "*"
    headers['Cache-Control'] = "no-cache, no-store, must-revalidate"
    headers['Pragma'] = "no-cache"
    headers['Expires'] = "0"
    headers['Connection'] = "close"
    return headers

def form_header_str(headers):
    s = ""
    for k in headers:
        s += k + ": " + headers[k] + "\r\n"
    return s

#####################
## WEBSOCKET STUFF ##
#####################

def hash_websocket_key(key):
    m = hashlib.sha1()
    magic_string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    m.update(key + magic_string)
    return base64.b64encode(m.digest())

def make_websocket_frame(message):
    # http://stackoverflow.com/questions/8125507/how-can-i-send-and-receive-websocket-messages-on-the-server-side
    msgb = message.encode('utf-8')
    frame = bytes(chr(129))
    if len(msgb) <= 125:
        frame += bytes(chr(len(msgb)))
    elif len(msgb) <= 65535:
        frame += bytes(chr(126))
        frame += bytes(chr((len(msgb) >> 8) & 255))
        frame += bytes(chr(len(msgb) & 255))
    else:
        frame += bytes(chr(127))
        for i in range(0,8):
            n = 7 - i
            frame += bytes(chr((len(msgb) >> (n*8)) & 255))
    frame += msgb
    return frame
    

############
## SERVER ##
############

class DrawrHandler(SocketServer.StreamRequestHandler):

    """
    Instantiated once per connection to the server.
    """

    unique_connection_id = 0

    def __init__(self, request, client_address, server):
        self.remote_addr = client_address
        SocketServer.StreamRequestHandler.__init__(self, request, client_address, server)
        #super(DrawrHandler, self).__init__(request, client_address, server)

    def route_old(self):
        #### below, r is current time to prevent caching
        #### 
        # requests possible: /post?r&room&json_of_new_object(s?)
        #    - replies with update id
        # /check?r&room
        #    - replies with latest id
        # /get?r&room&updates_after_this_id
        #    - replies with JSON list of new objects from all client
        #      that are not the requesting client
        # add /clear?r&room
        #    - returns 0

        parse_path_str = self.path
        parse_path_str = re.sub(r'^https?:\/\/[^\/]*', '', parse_path_str)
        parse_path_str = re.sub(r'^\/+', '', parse_path_str)

        match = re.match(r'([a-z]+)\?(.*)$', parse_path_str)
        if not match:
            self.send_error(404, "Invalid Request")

        if match.group(1) == 'post':
            post_match = re.match(r'^[^&]+&([^&]*)&(.*)$', match.group(2))
            if not match: self.send_error(404, "Invalid Request")
            room = post_match.group(1)
            json_str = post_match.group(2)
            print("POST: " + urllib.parse.unquote(json_str))
            response = DrawrRoomsHolder.post(room, json_str)
            self.send_response(response)
            
        elif match.group(1) == 'check':
            post_match = re.match(r'^[^&]+&(.*)$', match.group(2))
            if not match: self.send_error(404, "Invalid Request")
            room = post_match.group(1)
            response = DrawrRoomsHolder.check(room)
            self.send_response(response)
            
        elif match.group(1) == 'get':
            post_match = re.match(r'^[^&]+&([^&]*)&(.*)$', match.group(2))
            if not match: self.send_error(404, "Invalid Request")
            room = post_match.group(1)
            after_id = post_match.group(2)
            response = DrawrRoomsHolder.get(room, after_id)
            print("GET: " + urllib.parse.unquote(response))
            self.send_response(response)
            
        elif match.group(1) == 'clear':
            post_match = re.match(r'^[^&]+&(.*)$', match.group(2))
            if not match: self.send_error(404, "Invalid Request")
            room = post_match.group(1)
            response = DrawrRoomsHolder.clear(room)
            self.send_response(response)

        else:
            self.send_error(404, "Invalid Request")
            

    def handle_drawr_session(self):
        key = None
        if "Sec-WebSocket-Key" in self.headers:
            key = hash_websocket_key(self.headers["Sec-WebSocket-Key"])
        self.send_websocket_handshake(key)

        self.send_frame("pony")
        self.send_frame("VIDEO")
        self.send_frame("gams")

        while True:
            m = self.read_frame()
            if m == "exit": break
            self.send_frame("<3".join(list(m)))

    def send_frame(self, msg):
        self.wfile.write(make_websocket_frame(msg))
        self.wfile.flush()

    def read_frame(self):
        self.read_byte() # drop the type byte
        length = ord(self.read_byte()) & 127
        if length == 126:
            length = ord(self.read_byte()) << 8
            length += ord(self.read_byte())
        elif length == 127:
            length = 0
            for i in range(0,8):
                length += ord(self.read_byte()) << ((7 - i) * 8)

        masks = [ord(self.read_byte()) for i in range(0,4)]
        msgb = bytes()
        for i in range(0, length):
            bytein = ord(self.read_byte())
            m = masks[i % 4]
            msgb += bytes(chr(bytein ^ m))

        return msgb.decode('utf-8')
        

    def request_chunk(self,query):
        match = re.match(r"^(?P<x>[0-9]+)&(?P<y>[0-9]+)", query)
        if not match:
            self.send_error(404, "Not Found")

        numx = str(int(match.group('x')))
        numy = str(int(match.group('y')))
        chunk_path = "chunks/chunk" + numx + "x" + numy + ".png"

        try:
            fp = open(chunk_path, 'rb')
            body = fp.read()
            fp.close()
            self.send_binary(body)
        except IOError:
            fp = open("chunks/blank.png", 'rb')
            body = fp.read()
            fp.close()
            self.send_binary(body)
        self.close_connection = 1
        

    def route(self):
        just_path = parse_path(self.path)
        match = re.match(r'(?P<path>[a-z]*)\??(?P<query>.*)$', just_path)

        if match.group('path') == "drawr" or match.group('path') == "" or "Upgrade" in self.headers:
            self.handle_drawr_session()
        elif match.group('path') == "chunk":
            self.request_chunk(match.group('query'))
        else:
            self.send_error(404, "Not Found")
            
        

    def readline(self):
        try:
            line = self.rfile.readline()
            if not line:
                self.close_connection = 1
                return False

            line = line.decode("utf-8")
            print(str(self.conn_id) + ">" + line.decode("utf-8").strip())
            return line
        except socket.timeout as e:
            # a read or write timed out. Discard connection
            self.close_connection = 1
            return False

    def read_byte(self):
        return self.wfile.read(1)

    def read_request_headers(self):
        headers_str = ""
        while True:
            line = self.readline()
            if not line: return False

            if not line.strip():
                # finished reading headers, got a blank line
                break

            headers_str += line
        self.headers = parse_headers(headers_str)

    def handle_one_request(self):
        line = self.readline()
        if not line: return False
        line = line.strip()
        
        words = line.split()

        if len(words) not in [2,3]:
            self.send_error(404, "Invalid Request");
            return False

        self.command = words[0]
        self.path = words[1]

        if self.command == "GET":
            self.read_request_headers()
            self.route()
        else:
            self.send_error(404, "Invalid Request - only GET supported")
            return False
    
    def handle(self):
        """Handle multiple HTTP requests if necessary"""
        self.close_connection = 0
        self.conn_id = DrawrHandler.unique_connection_id
        DrawrHandler.unique_connection_id += 1

        print(str(self.conn_id) + "***connect: " + str(self.remote_addr))

        while not self.close_connection:
            self.handle_one_request()

        print(str(self.conn_id) + "***closed: " + str(self.remote_addr))

    def send_error(self, code, message="Error"):
        http_resp = "HTTP/1.1 " + str(code) + " " + message
        body = "error. " +str(code) + " " + message + "\n";
        headers = form_header_str(form_resp_headers(len(body)))
        full_resp = http_resp + "\r\n" + headers + "\r\n" + body
        
        self.wfile.write(full_resp.encode('utf-8'))
        self.wfile.flush()

    def send_response(self, body):
        http_resp = "HTTP/1.1 200 OK"
        headers = form_header_str(form_resp_headers(len(body)))
        full_resp = http_resp + "\r\n" + headers + "\r\n" + body
        
        self.wfile.write(full_resp.encode('utf-8'))
        self.wfile.flush()

    def send_binary(self, body, mime="image/png"):
        http_resp = "HTTP/1.1 200 OK"
        headers = form_header_str(form_resp_headers(len(body), mime))
        full_resp = http_resp + "\r\n" + headers + "\r\n"
        
        self.wfile.write(full_resp.encode('utf-8') + body)
        self.wfile.flush()

    def send_websocket_handshake(self, accept_key):
        http_resp = "HTTP/1.1 101 WebSocket Protocol Handshake"
        headers = {}
        headers['Connection'] = "Upgrade"
        headers['Upgrade'] = "WebSocket"
        if accept_key:
            headers['Sec-WebSocket-Accept'] = accept_key
            #headers['Sec-WebSocket-Protocol'] = "chat"
        full_resp = http_resp + "\r\n" + form_header_str(headers) + "\r\n"
        
        self.wfile.write(full_resp.encode('utf-8'))
        self.wfile.flush()


######################
if __name__ == "__main__":
    server = SocketServer.TCPServer((host,port), DrawrHandler)

    server.serve_forever()
