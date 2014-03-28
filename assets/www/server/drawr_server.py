import json
import SocketServer
import socket
import re
import time
#import drawr_server_brushes
#import drawr_server_map

#from PIL import Image

host = "" #127.0.0.1
port = 27182 # 80


def utc_now():
    return int(round(time.time() * 1000))
    

def parse_path(p):
    reg = r"^([a-z]+:\/\/[^\/]*)?\/*(?P<path>.*)$"
    m = re.match(reg, p)
    return m.group('path')

def parse_headers(headers_str):
    # sexy regex thx to http://stackoverflow.com/questions/4685217/parse-raw-http-headers
    headers = dict(re.findall(r"(?P<name>.*?): ?(?P<value>.*?)\r?\n", header))
    return headers

class DrawrHandler(SocketServer.StreamRequestHandler):

    """
    Instantiated once per connection to the server.
    """

    unique_connection_id = 0

    def __init__(self, request, client_address, server):
        self.remote_addr = client_address
        super(DrawrHandler, self).__init__(request, client_address, server)

    def route(self):
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

    def request_chunk(self,query):
    

    def route(self):
        just_path = parse_path(self.path)
        match = re.match(r'(?P<path>[a-z]+)\?(?P<query>.*)$', just_path)

        if match.group('path') == "drawr" or "Upgrade" in self.headers:
            
        

    def readline(self):
        try:
            line = self.rfile.readline()
            if not line:
                #self.close_connection = 1
                return False

            line = line.decode(encoding="UTF-8")
            print(str(self.conn_id) + "|" + line.decode(encoding="UTF-8"))
            return line
            #######self.wfile.flush()
        except socket.timeout as e:
            # a read or write timed out. Discard connection
            #self.close_connection = 1
            return False

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

        print(str(self.conn_id) + "|connect: " + str(self.remote_addr))

        while not self.close_connection:
            self.handle_one_request()

        print(str(self.conn_id) + "|closed: " + str(self.remote_addr))


    def send_error(self, code, message="Error"):
        body = "error. " +str(code) + " " + message + "\n";
        
        self.wfile.write(("HTTP/1.1 " + str(code) + " " + message + """
Content-Type: text/html; charset=utf-8
Content-Length: """ + str(len(body)) + """
Access-Control-Allow-Origin: *
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
Connection: close

""" + body).encode('UTF-8'))
        return


    def send_response(self, body):
        self.wfile.write(("""HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: """ + str(len(body)) + """
Access-Control-Allow-Origin: *
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
Connection: keep-alive

""" + body).encode('UTF-8'))


######################
if __name__ == "__main__":
    server = socketserver.TCPServer((host,port), DrawrHandler)

    server.serve_forever()
