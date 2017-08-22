function DrawrMap(drawr_client, offline_mode){
    this.drawr_client = drawr_client;
    this.offline_mode = offline_mode || 0;
    
	this.chunk_block_size = 256;
	this.per_pixel_scaling = 2; // pixel is 2x2
    this.chunk_onscreen_size = this.chunk_block_size * this.per_pixel_scaling;
    
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width = this.chunk_block_size;
    this.canvas.height = this.height = this.chunk_block_size;
    this.ctx = this.canvas.getContext("2d");
    
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
	
	this.pattern_mode = false;
	this.blend_mode = false;
	this.eye_drop = false;
    
    this.offsetX = 0; // offset in client pixels of top left of chunk (0,0)
    this.offsetY = 0;
}

DrawrMap.prototype.togglePattern = function(){
	this.pattern_mode = !this.pattern_mode;
}

DrawrMap.prototype.toggleBlend = function(){
	this.blend_mode = !this.blend_mode;
}

DrawrMap.prototype.toggleEyeDrop = function(){
	this.eye_drop = !this.eye_drop;
}

DrawrMap.prototype.setOfflineMode = function(offline_mode){
    this.offline_mode = offline_mode;
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

DrawrMap.prototype.addPointRelative = function(x, y, screenOffsetX, screenOffsetY, brush){
    // x,y, offsets are true pixels per client
    var relx = x + screenOffsetX;
    var rely = y + screenOffsetY;
    this.addPoint(relx, rely, brush);
}

DrawrMap.prototype.addPoint = function(x,y,brush,size){
    // if(this.per_pixel_scaling < 1) return; // don't do this while we're in dev mode
    
    x = x - this.offsetX;
    y = y - this.offsetY;

    var gamex = Math.floor(x/this.per_pixel_scaling); // convert to ingame (big) pixels
    var gamey = Math.floor(y/this.per_pixel_scaling);
	
	if (this.pattern_mode && !this.eye_drop){
		gamex = Math.floor((gamex)/size)*size + (size/2);
		gamey = Math.floor((gamey)/size)*size + (size/2);
	}
    
    var chunks_local_coords = this.getChunkLocalCoordinates(gamex, gamey, brush);
    
    var local_x = chunks_local_coords[0].x;
    var local_y = chunks_local_coords[0].y;
    if (!this.eye_drop) {
        DrawrBrushes.draw(this.ctx, local_x, local_y, brush, size, 
            this.pattern_mode, this.blend_mode);
    } else {
        //EYE DROP
        var imageData = this.ctx.getImageData(local_x, local_y, 1, 1);
        var data = imageData.data;
        var hex = rgbToHex(data[0], data[1], data[2]);
        $("color_box").value = hex;
        editColor();
        turnOffEyeDrop();
    }
}

DrawrMap.prototype.getChunkLocalCoordinates = function(gamex, gamey, brush){
    // calculate pixel location in local coordinates of each of the 4 possible chunks.
    // getChunksAffected will always return in this order: topleft, bottomleft, topright, bottomright 
    // Preserve this order in this return
    // this function will probably explode if brush size > this.chunk_block_size. that should never happen.
    
    // these are correct for the chunk where the *CENTER OF THE BRUSH* is
    var chunk_general_localx = mod(gamex, this.chunk_block_size);
    var chunk_general_localy = mod(gamey, this.chunk_block_size); 
    
    // calculate which chunk the *CENTER OF THE BRUSH* is in
    var chunk_numx = Math.floor(gamex / this.chunk_block_size); 
    var chunk_numy = Math.floor(gamey / this.chunk_block_size);
    
    var dx = chunk_numx;
    var dy = chunk_numy;
    return [{
        x: chunk_general_localx + dx * this.chunk_block_size,
        y: chunk_general_localy + dy * this.chunk_block_size,
    }]; // this is beautiful
}

DrawrMap.prototype.draw = function(ctx){    
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    
    var onscreenx = this.offsetX;
    var onscreeny = this.offsetY;	
    ctx.drawImage(
        this.canvas, 
        onscreenx, 
        onscreeny, 
        this.chunk_onscreen_size, 
        this.chunk_onscreen_size);
}


// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Using_images
// http://www.w3schools.com/tags/canvas_drawimage.asp
// http://stackoverflow.com/questions/10525107/html5-canvas-image-scaling-issue