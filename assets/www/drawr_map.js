
var CHUNK_BLOCK_SIZE = 256;
var PER_PIXEL_SCALING = 2; // pixel is 2x2
var CHUNK_ONSCREEN_SIZE = CHUNK_BLOCK_SIZE * PER_PIXEL_SCALING;
// TODO: MAYBE disable double scaling on small screens??

function DrawrChunk(){
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width = CHUNK_BLOCK_SIZE;
    this.canvas.height = this.height = CHUNK_BLOCK_SIZE;
    this.ctx = this.canvas.getContext("2d");
    
    drawLine(this.ctx, "yellow", 1, 1, CHUNK_BLOCK_SIZE - 1, 1, 1);
    drawLine(this.ctx, "red", CHUNK_BLOCK_SIZE-1, CHUNK_BLOCK_SIZE-1, CHUNK_BLOCK_SIZE-1, 1, 1);
    drawLine(this.ctx, "green", 1, 1, 1, CHUNK_BLOCK_SIZE-1, 1);
    drawLine(this.ctx, "purple", 1, CHUNK_BLOCK_SIZE-1, CHUNK_BLOCK_SIZE-1, CHUNK_BLOCK_SIZE-1, 1);
}
DrawrChunk.prototype.addPoint = function(local_x,local_y,brush){
    var brush_img = brush.img;
    var s = Math.floor(brush.size/2);
    this.ctx.drawImage(brush_img, local_x-s, local_y-s);
}


function DrawrMap(){
    // hash of chunks - not array because we need negative and positive locations, and to be able to skip some
    this.chunks = {}; // keyed by xth chunk, value is a hash keyed by yth chunk
    this.chunks_loaded = [];
    
    this.offsetX = 0; // offset in client pixels of top left of chunk (0,0)
    this.offsetY = 0;
    
    for(var i=-1; i<2; ++i){
        this.chunks[i] = {};
        for(var j=-1; j<2; ++j){
            this.chunks[i][j] = new DrawrChunk();
            this.chunks_loaded.push({x: i, y: j}); // NOT EXACTRLY TRUE LOADED
        }
    }
}

DrawrMap.prototype.moveX = function(dist){
    this.offsetX += dist;
}

DrawrMap.prototype.moveY = function(dist){
    this.offsetY += dist;
}

DrawrMap.prototype.loadNearbyChunks = function(){
    
}
DrawrMap.prototype.freeFarChunks = function(){
    
}

DrawrMap.prototype.addPointRelative = function(x, y, screenOffsetX, screenOffsetY, brush){
    // x,y, offsets are true pixels per client
    var relx = x + screenOffsetX;
    var rely = y + screenOffsetY;
    this.addPoint(relx, rely, brush);
}

DrawrMap.prototype.isChunkLoaded = function(chunk_numx, chunk_numy){
    if(this.chunks.hasOwnProperty(chunk_numx) && this.chunks[chunk_numx].hasOwnProperty(chunk_numy)){
        return true;
    }else{
        return false;
    }
}

  
DrawrMap.prototype.addPoint = function(x,y,brush){

    x = x - this.offsetX;
    y = y - this.offsetY;

    var gamex = Math.floor(x/PER_PIXEL_SCALING); // convert to ingame (big) pixels
    var gamey = Math.floor(y/PER_PIXEL_SCALING);
    
    var chunks_affected = this.getChunksAffected(gamex, gamey, brush);
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
                    chunk.addPoint(chunks_local_coords[i].x, chunks_local_coords[i].y, brush);
                }else{
                    console.log("Chunk not loaded: (" + chunk_numx + ", " + chunk_numy + ")");
                }
                chunks_written.push(chunk_written_id);
            }
        }
    }
    
}

DrawrMap.prototype.oldAddPoint = function(x,y,brush){
    // DEPRECATED - will incorrectly draw near the edge of chunks
    // find where to add to chunk
    var gamex = Math.floor(x/PER_PIXEL_SCALING); // convert to ingame (big) pixels
    var gamey = Math.floor(y/PER_PIXEL_SCALING);
    var chunk_numx = Math.floor(gamex / CHUNK_BLOCK_SIZE); // calculate which chunk this pixel is in
    var chunk_numy = Math.floor(gamey / CHUNK_BLOCK_SIZE);
    var chunk_localx = gamex % CHUNK_BLOCK_SIZE; // pixel location in chunk local coordinates
    var chunk_localy = gamey % CHUNK_BLOCK_SIZE; 
    
    if(this.isChunkLoaded(chunk_numx, chunk_numy)){
        var chunk = this.chunks[chunk_numx][chunk_numy];
        chunk.addPoint(chunk_localx, chunk_localy, brush);
    }else{
        console.log("Chunk not loaded: (" + chunk_numx + ", " + chunk_numy + ")");
    }
}

DrawrMap.prototype.getChunkLocalCoordinates = function(gamex, gamey, chunk_nums_affected, brush){
    // calculate pixel location in local coordinates of each of the 4 possible chunks.
    // getChunksAffected will always return in this order: topleft, bottomleft, topright, bottomright 
    // Preserve this order in this return
    // this function will probably explode if brush.size > CHUNK_BLOCK_SIZE. that should never happen.
    
    var chunk_general_localx = mod(gamex, CHUNK_BLOCK_SIZE); // these are correct for the chunk where the *CENTER OF THE BRUSH* is
    var chunk_general_localy = mod(gamey, CHUNK_BLOCK_SIZE); 
    
    var chunk_numx = Math.floor(gamex / CHUNK_BLOCK_SIZE); // calculate which chunk the *CENTER OF THE BRUSH* is in
    var chunk_numy = Math.floor(gamey / CHUNK_BLOCK_SIZE);
    
    var chunk_local_coords = [];
    for(var i=0; i<4; ++i){
        if(chunk_nums_affected[i]){
            var dx = chunk_numx - chunk_nums_affected[i].x;
            var dy = chunk_numy - chunk_nums_affected[i].y;
            chunk_local_coords.push({x: chunk_general_localx + dx * CHUNK_BLOCK_SIZE,
                                     y: chunk_general_localy + dy * CHUNK_BLOCK_SIZE }); // this is beautiful
        }else{
            chunk_local_coords.push(0);
        }
        
    }
    return chunk_local_coords;
}

DrawrMap.prototype.getChunksAffected = function(gamex, gamey, brush){
    // To find chunks affected: find 1 or more chunks for each 4 points of the square mask of the brush
    // getChunksAffected will always return in this order: topleft, bottomleft, topright, bottomright
    // if one of those 4 chunks isn't loaded, log it, and its location in the return array will be null
    
    var chunks_found = [];
    var brush_delta = brush.size/2;
    // coordinates of the 4 coordinates of the brush, in the correct order
    var brush_xs = [gamex - brush_delta, gamex - brush_delta, gamex + brush_delta, gamex + brush_delta];
    var brush_ys = [gamey - brush_delta, gamey + brush_delta, gamey - brush_delta, gamey + brush_delta];
    
    for(var i=0; i<4; ++i){
        var chunk_numx = Math.floor(brush_xs[i] / CHUNK_BLOCK_SIZE); // calculate which chunk this (ingame) pixel is in
        var chunk_numy = Math.floor(brush_ys[i] / CHUNK_BLOCK_SIZE);
        if(this.isChunkLoaded(chunk_numx, chunk_numy)){
            chunks_found.push({x: chunk_numx, y: chunk_numy});
        }else{
            chunks_found.push(0); // preserve the order of the chunks in the return value!
            console.log("Chunk not loaded: (" + chunk_numx + ", " + chunk_numy + ")");
        }
    }
    return chunks_found;
}

DrawrMap.prototype.draw = function(ctx){
    /*ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.drawImage(this.canvas, 0, 0, CHUNK_BLOCK_SIZE*PER_PIXEL_SCALING, CHUNK_BLOCK_SIZE*PER_PIXEL_SCALING); //x, y, width, height
    */
    
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    
    for(var i=0; i<this.chunks_loaded.length; ++i){
        var chunk_numx = this.chunks_loaded[i].x;
        var chunk_numy = this.chunks_loaded[i].y;
        var onscreenx = chunk_numx * CHUNK_ONSCREEN_SIZE + this.offsetX;
        var onscreeny = chunk_numy * CHUNK_ONSCREEN_SIZE + this.offsetY;
        var chunk_canvas = this.chunks[chunk_numx][chunk_numy].canvas;
        ctx.drawImage(chunk_canvas, onscreenx, onscreeny, CHUNK_ONSCREEN_SIZE, CHUNK_ONSCREEN_SIZE);
    }
}


// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Using_images
// http://www.w3schools.com/tags/canvas_drawimage.asp
// http://stackoverflow.com/questions/10525107/html5-canvas-image-scaling-issue