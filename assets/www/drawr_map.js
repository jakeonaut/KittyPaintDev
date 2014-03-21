
var CHUNK_BLOCK_SIZE = 256;
var PER_PIXEL_SCALING = 2; // pixel is 2x2
var CHUNK_ONSCREEN_SIZE = CHUNK_BLOCK_SIZE * PER_PIXEL_SCALING;
// TODO: MAYBE disable double scaling on small screens??

function DrawrChunk(){
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width = CHUNK_BLOCK_SIZE;
    this.canvas.height = this.height = CHUNK_BLOCK_SIZE;
    this.ctx = this.canvas.getContext("2d");
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

DrawrMap.prototype.loadNearbyChunks = function(){}
DrawrMap.prototype.freeFarChunks = function(){}

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
    // find where to add to chunk
    var gamex = Math.floor(x/PER_PIXEL_SCALING); // convert to ingame (big) pixels
    var gamey = Math.floor(y/PER_PIXEL_SCALING);
    var chunk_numx = Math.floor(gamex / CHUNK_BLOCK_SIZE); // calculate which chunk this pixel is in
    var chunk_numy = Math.floor(gamey / CHUNK_BLOCK_SIZE);
    var chunk_localx = gamex % CHUNK_BLOCK_SIZE; // pixel location in chunk local coordinates
    var chunk_localy = gamey % CHUNK_BLOCK_SIZE; 
    
    /*
     AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
     WHJAT 
     IF THE FBRUISH IS ON THE EDGE OF ONE OF THE CHUNKS UGGGGGGGGGGGGGGGGGGGGGGH ADFGASDFASDF WHATEVER
     SSSSASASASDFASDFASDFASDFASDFASDF
    */
    
    if(this.isChunkLoaded(chunk_numx, chunk_numy)){
        var chunk = this.chunks[chunk_numx][chunk_numy];
        chunk.addPoint(chunk_localx, chunk_localy, brush);
    }else{
        console.log("Chunk not loaded: (" + chunk_numx + ", " + chunk_numy + ")");
    }
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
        var onscreenx = chunk_numx * CHUNK_ONSCREEN_SIZE;
        var onscreeny = chunk_numy * CHUNK_ONSCREEN_SIZE;
        var chunk_canvas = this.chunks[chunk_numx][chunk_numy].canvas;
        ctx.drawImage(chunk_canvas, onscreenx, onscreeny, CHUNK_ONSCREEN_SIZE, CHUNK_ONSCREEN_SIZE);
    }
}


// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Using_images
// http://www.w3schools.com/tags/canvas_drawimage.asp
// http://stackoverflow.com/questions/10525107/html5-canvas-image-scaling-issue