import socketserver

host = ""
port = 27182

class TCPHandler(socketserver.StreamRequestHandler):

    id_whatever = 0

    def __init__(self, request, client_address, server):
        print("NEW HANDLER FOR: "  + str(client_address))
        self.remoteaddr = client_address
        super(TCPHandler, self).__init__(request, client_address, server)
        
    def handle(self):
        iddd = TCPHandler.id_whatever
        TCPHandler.id_whatever += 1
        print(str(iddd) + " CONNECTED: " + str(self.remoteaddr))
        while True:
            try:
                self.data = self.rfile.readline()
                if not self.data:
                    break
                self.data = self.data.decode(encoding="UTF-8")
                print(str(iddd) + " " + self.data.strip())
            except:
                break
        print(str(iddd) + " DISCONNECT: " + str(self.remoteaddr))

        
server = socketserver.TCPServer((host, port), TCPHandler)
server.serve_forever()
