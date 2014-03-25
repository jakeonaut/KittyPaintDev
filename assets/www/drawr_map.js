function DrawrChunk(drawr_map){
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width = drawr_map.chunk_block_size;
    this.canvas.height = this.height = drawr_map.chunk_block_size;
    this.ctx = this.canvas.getContext("2d");
    
    drawLine(this.ctx, "yellow", 1, 1, drawr_map.chunk_block_size - 1, 1, 1);
    drawLine(this.ctx, "red", drawr_map.chunk_block_size-1, drawr_map.chunk_block_size-1, drawr_map.chunk_block_size-1, 1, 1);
    drawLine(this.ctx, "green", 1, 1, 1, drawr_map.chunk_block_size-1, 1);
    drawLine(this.ctx, "purple", 1, drawr_map.chunk_block_size-1, drawr_map.chunk_block_size-1, drawr_map.chunk_block_size-1, 1);
}
DrawrChunk.prototype.addPoint = function(local_x,local_y,brush,size){
    var brush_img = brush.img;
    var s = Math.floor(size/2);
	this.ctx.drawImage(brush_img, local_x-s, local_y-s, size, size);
}


function DrawrMap(){
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
}

DrawrMap.prototype.getIngameOffsetX = function(){
	return Math.floor(this.offsetX/this.per_pixel_scaling);
}

DrawrMap.prototype.setIngameOffsetX = function(offsetX){
	this.offsetX = offsetX * this.per_pixel_scaling;
}

DrawrMap.prototype.getIngameOffsetY = function(){
	return Math.floor(this.offsetY/this.per_pixel_scaling);
}

DrawrMap.prototype.setIngameOffsetY = function(offsetY){
	this.offsetY = offsetY * this.per_pixel_scaling;
}

DrawrMap.prototype.moveX = function(dist){
    this.offsetX += dist;
}

DrawrMap.prototype.moveY = function(dist){
    this.offsetY += dist;
}

DrawrMap.prototype.loadChunk = function(chunk_numx, chunk_numy){
    // THIS ISNT REALLY LOADING YET!!!!!
    if(!this.chunks.hasOwnProperty(chunk_numx)){
        this.chunks[chunk_numx] = {};
    }
    this.chunks[chunk_numx][chunk_numy] = new DrawrChunk(this);
    this.chunks_loaded.push({x: chunk_numx, y: chunk_numy}); // NOT EXACTRLY TRUE LOADED
}

DrawrMap.prototype.loadNearbyChunks = function(viewer_radius){
    // viewer_radius is max(screen width, screen height), and is approximately 1 "screen length"
    // load all chunks within 1 screen length away from what is visible
    // load from the center out! <---- TODO!!!
    var ingameX = this.getIngameOffsetX();
    var ingameY = this.getIngameOffsetY();
    var ingameRadius = viewer_radius/this.per_pixel_scaling;
    
    //ingameX is topleft of screen. go 1 screen to right side of screen, then 1 more to fill out the radius
    var chunk_min_x = Math.floor((ingameX - ingameRadius) / this.chunk_block_size);
    var chunk_max_x = Math.floor((ingameX + 2*ingameRadius) / this.chunk_block_size);
    var chunk_min_y = Math.floor((ingameY - ingameRadius) / this.chunk_block_size);
    var chunk_max_y = Math.floor((ingameY + 2*ingameRadius) / this.chunk_block_size);
    
    for(var i=chunk_min_x; i <= chunk_max_x; ++i){
        for(var j=chunk_min_y; j <= chunk_max_y; ++j){
            if(!this.isChunkLoaded(i, j)){
                this.loadChunk(i,j);
                console.log("Chunk loaded!!: (" + i + ", " + j + ")");
            }
        }
    }
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

  
DrawrMap.prototype.addPoint = function(x,y,brush,size){

    x = x - this.offsetX;
    y = y - this.offsetY;

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
    
}

DrawrMap.prototype.oldAddPoint = function(x,y,brush){
    // DEPRECATED - will incorrectly draw near the edge of chunks
    // find where to add to chunk
    var gamex = Math.floor(x/this.per_pixel_scaling); // convert to ingame (big) pixels
    var gamey = Math.floor(y/this.per_pixel_scaling);
    var chunk_numx = Math.floor(gamex / this.chunk_block_size); // calculate which chunk this pixel is in
    var chunk_numy = Math.floor(gamey / this.chunk_block_size);
    var chunk_localx = gamex % this.chunk_block_size; // pixel location in chunk local coordinates
    var chunk_localy = gamey % this.chunk_block_size; 
    
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

DrawrMap.prototype.draw = function(ctx){
    /*ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.drawImage(this.canvas, 0, 0, this.chunk_block_size*this.per_pixel_scaling, this.chunk_block_size*this.per_pixel_scaling); //x, y, width, height
    */
    
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    
    for(var i=0; i<this.chunks_loaded.length; ++i){
        var chunk_numx = this.chunks_loaded[i].x;
        var chunk_numy = this.chunks_loaded[i].y;
        var onscreenx = chunk_numx * this.chunk_onscreen_size + this.offsetX;
        var onscreeny = chunk_numy * this.chunk_onscreen_size + this.offsetY;
        var chunk_canvas = this.chunks[chunk_numx][chunk_numy].canvas;
        ctx.drawImage(chunk_canvas, onscreenx, onscreeny, this.chunk_onscreen_size, this.chunk_onscreen_size);
    }
}


// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Using_images
// http://www.w3schools.com/tags/canvas_drawimage.asp
// http://stackoverflow.com/questions/10525107/html5-canvas-image-scaling-issue