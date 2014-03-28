import drawr_server_brushes

class DrawrChunk():
    def __init__(self, drawr_map, numx, numy):
        # chunk sizes and such...
        self.size = drawr_map.chunk_block_size
        self.chunk_im = Image.new("RGB", (self.size, self.size), "white")
        self.numx = numx
        self.numy = numy

    def addPoint(self, local_x, local_y, brush, size):
        box = (local_x, local_y, local_x + size, local_y + size)
        self.chunk_im.paste(brush.img, box)
        pass

    def write(self):
        # output to png file to be served with HTTP
        # every 0.1 seconds or so?
        self.chunk_im.save("chunks/chunk" + self.numx + "x" + self.numy + ".png")

class DrawrMap():
    # ### ALL CHUNKS SHUOLD BE LOADED AT ALL TIMES???
    # # I DUNO
    # ## CAN EASYILY UNLOAD AND RELOAD FROM THE CHUNK PNGs
    # # BUT HOW DO WE DECIDE WHEN WE CAN UNLOAD THEM?
    def __init__(self):
        self.chunk_block_size = 256
        
        # hash of chunks - not array because we need negative and positive locations, and to be able to skip some
        self.chunks = {} # keyed by xth chunk, value is a hash keyed by yth chunk
        
        for i in range(-1,2):
            for j in range(-1,2):
                self.loadChunk(i,j)

    def isChunkLoaded(self, numx, numy):
        (numx, numy) = (str(numx), str(numy))
        if numx in self.chunks and numy in self.chunks[numx]:
            return true
        return false
        
    def loadChunk(self, numx, numy):
        # todo: if this chunk exists in ./chunks/, load that image
        (numx, numy) = (str(numx), str(numy))
        if numx not in self.chunks:
            self.chunks[numx] = {}
        
        self.chunks[numx][numy] = DrawrChunk(self, numx, numy)
        
    
    def getChunksAffected(self, gamex, gamey, brush, size):
        # To find chunks affected: find 1 or more chunks for each 4 points of the square mask of the brush
        # getChunksAffected will always return in this order: topleft, bottomleft, topright, bottomright
        # if one of those 4 chunks isn't loaded, its location in the return array will be null
        
        chunks_found = []
        brush_delta = size/2
        # coordinates of the 4 coordinates of the brush, in the correct order
        brush_xs = [gamex - brush_delta, gamex - brush_delta, gamex + brush_delta, gamex + brush_delta]
        brush_ys = [gamey - brush_delta, gamey + brush_delta, gamey - brush_delta, gamey + brush_delta]
        
        for i in range(0,4):
            chunk_numx = int(brush_xs[i] / self.chunk_block_size) # calculate which chunk this (ingame) pixel is in
            chunk_numy = int(brush_ys[i] / self.chunk_block_size)
            if self.isChunkLoaded(chunk_numx, chunk_numy):
                chunks_found.append({"x": chunk_numx, "y": chunk_numy})
            else:
                chunks_found.append(0) # preserve the order of the chunks in the return value!
        
        return chunks_found
        
    def getChunkLocalCoordinates(self, gamex, gamey, chunk_nums_affected, brush){
        # calculate pixel location in local coordinates of each of the 4 possible chunks.
        # getChunksAffected will always return in this order: topleft, bottomleft, topright, bottomright 
        # Preserve this order in this return
        # this function will probably explode if brush size > this.chunk_block_size. that should never happen.
        
        chunk_general_localx = gamex % this.chunk_block_size # these are correct for the chunk where the *CENTER OF THE BRUSH* is
        chunk_general_localy = gamey % this.chunk_block_size
        
        chunk_numx = int(gamex / this.chunk_block_size) # calculate which chunk the *CENTER OF THE BRUSH* is in
        chunk_numy = int(gamey / this.chunk_block_size)
        
        chunk_local_coords = []
        for i in range(0,4):
            if chunk_nums_affected[i]:
                dx = chunk_numx - chunk_nums_affected[i]['x']
                dy = chunk_numy - chunk_nums_affected[i]['y']
                chunk_local_coords.append({'x': chunk_general_localx + dx * this.chunk_block_size,
                                           'y': chunk_general_localy + dy * this.chunk_block_size }) # this is beautiful
            else:
                chunk_local_coords.append(0)
        return chunk_local_coords;

    def addPoint(self, gamex, gamey, brush, size):
    
        chunks_affected = self.getChunksAffected(gamex, gamey, brush, size);
        chunks_local_coords = self.getChunkLocalCoordinates(gamex, gamey, chunks_affected, brush);
        
        chunks_written = [] # store the chunks already written to, to avoid redundancy
        
        for i in range(0,4){
            if chunks_affected[i] and chunks_local_coords[i]:
                chunk_numx = chunks_affected[i]['x'];
                chunk_numy = chunks_affected[i]['y'];
                chunk_written_id = str(chunk_numx) + ":" + str(chunk_numy)
                if chunk_written_id not in chunks_written:
                    if not self.isChunkLoaded(chunk_numx, chunk_numy):
                        self.loadChunk(chunk_numx, chunk_numy)
                    
                    chunk = self.chunks[chunk_numx][chunk_numy]
                    chunk.addPoint(chunks_local_coords[i]['x'], chunks_local_coords[i]['y'], brush, size)
                    
                    chunks_written.append(chunk_written_id)
                }
            }
        }
        pass
