import drawr_server_brushes

class DrawrChunk():
    def __init__(self):
        # chunk sizes and such...
        self.chunk_im = Image.new("RGB", (chunk_block_size, chunk_block_size), "white")
        

    def addPoint(self, local_x, local_y, brush, size):
        box = (local_x, local_y, local_x + size, local_y + size)
        self.chunk_im.paste(brush.img, box)
        pass

    def write(self):
        # output to png file to be served with HTTP
        # every 0.1 seconds or so?
        # IT NEEDS TO KNOW ITS OWN NUMX NUMY
        self.chunk_im.save("chunk" + numx + "x" + numy + ".png")
        
        pass

class DrawrMap():
    #### ALL CHUNKS SHUOLD BE LOADED AT ALL TIMES???
    ## I DUNO
    ### CAN EASYILY UNLOAD AND RELOAD FROM THE CHUNK PNGs
    ## BUT HOW DO WE DECIDE WHEN WE CAN UNLOAD THEM?
    def __init__(self):
	this.chunk_block_size = 256;
	this.per_pixel_scaling = 2; // pixel is 2x2
	this.chunk_onscreen_size = this.chunk_block_size * this.per_pixel_scaling;
	// TODO: MAYBE disable double scaling on small screens??
	
        // hash of chunks - not array because we need negative and positive locations, and to be able to skip some
        this.chunks = {}; // keyed by xth chunk, value is a hash keyed by yth chunk
        this.chunks_loaded = [];
        
        this.offsetX = 0; // offset in client pixels of top left of chunk (0,0)
        this.offsetY = 0;
        
        for(var i=-1; i<2; ++i){
            for(var j=-1; j<2; ++j){
                this.loadChunk(i,j);
            }
        }

    def addPoint(self, gamex, gamey, brush, size):

    var gamex = Math.floor(x/this.per_pixel_scaling); // convert to ingame (big) pixels
    var gamey = Math.floor(y/this.per_pixel_scaling);
    
    var chunks_affected = this.getChunksAffected(gamex, gamey, brush, size);
    var chunks_local_coords = this.getChunkLocalCoordinates(gamex, gamey, chunks_affected, brush);
    
    var chunks_written = []; // store the chunks already written to, to avoid redundancy
    
    for(var i=0; i<4; ++i){
        if(chunks_affected[i] && chunks_local_coords[i]){
            var chunk_numx = chunks_affected[i].x;
            var chunk_numy = chunks_affected[i].y;
            var chunk_written_id = chunk_numx + ":" + chunk_numy;
            if(chunks_written.indexOf(chunk_written_id) < 0){
                if(this.isChunkLoaded(chunk_numx, chunk_numy)){
                    var chunk = this.chunks[chunk_numx][chunk_numy];
                    chunk.addPoint(chunks_local_coords[i].x, chunks_local_coords[i].y, brush,size);
                }else{
                    console.log("Chunk not loaded: (" + chunk_numx + ", " + chunk_numy + ")");
                }
                chunks_written.push(chunk_written_id);
            }
        }
    }
        pass

DrawrMap.prototype.getChunkLocalCoordinates = function(gamex, gamey, chunk_nums_affected, brush){
    // calculate pixel location in local coordinates of each of the 4 possible chunks.
    // getChunksAffected will always return in this order: topleft, bottomleft, topright, bottomright 
    // Preserve this order in this return
    // this function will probably explode if brush size > this.chunk_block_size. that should never happen.
    
    var chunk_general_localx = mod(gamex, this.chunk_block_size); // these are correct for the chunk where the *CENTER OF THE BRUSH* is
    var chunk_general_localy = mod(gamey, this.chunk_block_size); 
    
    var chunk_numx = Math.floor(gamex / this.chunk_block_size); // calculate which chunk the *CENTER OF THE BRUSH* is in
    var chunk_numy = Math.floor(gamey / this.chunk_block_size);
    
    var chunk_local_coords = [];
    for(var i=0; i<4; ++i){
        if(chunk_nums_affected[i]){
            var dx = chunk_numx - chunk_nums_affected[i].x;
            var dy = chunk_numy - chunk_nums_affected[i].y;
            chunk_local_coords.push({x: chunk_general_localx + dx * this.chunk_block_size,
                                     y: chunk_general_localy + dy * this.chunk_block_size }); // this is beautiful
        }else{
            chunk_local_coords.push(0);
        }
        
    }
    return chunk_local_coords;
}

DrawrMap.prototype.getChunksAffected = function(gamex, gamey, brush, size){
    // To find chunks affected: find 1 or more chunks for each 4 points of the square mask of the brush
    // getChunksAffected will always return in this order: topleft, bottomleft, topright, bottomright
    // if one of those 4 chunks isn't loaded, log it, and its location in the return array will be null
    
    var chunks_found = [];
    var brush_delta = size/2;
    // coordinates of the 4 coordinates of the brush, in the correct order
    var brush_xs = [gamex - brush_delta, gamex - brush_delta, gamex + brush_delta, gamex + brush_delta];
    var brush_ys = [gamey - brush_delta, gamey + brush_delta, gamey - brush_delta, gamey + brush_delta];
    
    for(var i=0; i<4; ++i){
        var chunk_numx = Math.floor(brush_xs[i] / this.chunk_block_size); // calculate which chunk this (ingame) pixel is in
        var chunk_numy = Math.floor(brush_ys[i] / this.chunk_block_size);
        if(this.isChunkLoaded(chunk_numx, chunk_numy)){
            chunks_found.push({x: chunk_numx, y: chunk_numy});
        }else{
            chunks_found.push(0); // preserve the order of the chunks in the return value!
            console.log("Chunk not loaded: (" + chunk_numx + ", " + chunk_numy + ")");
        }
    }
    return chunks_found;
}
