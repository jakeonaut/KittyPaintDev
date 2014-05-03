function StampDrawrMap(chunk_block_size, pixel_size){
    this.drawr_client = drawr_client;
    
	this.canvas_size = chunk_block_size;
	this.per_pixel_scaling = pixel_size;
	this.chunk_onscreen_size = this.canvas_size * this.per_pixel_scaling;
	
	this.canvas = document.createElement("canvas");
    this.canvas.width = this.width = chunk_block_size;
    this.canvas.height = this.height = chunk_block_size;
    this.ctx = this.canvas.getContext("2d");
	this.ctx.fillStyle = "rgba(255,255,255,0)";
    this.ctx.fillRect(0,0,this.chunk_onscreen_size,this.chunk_onscreen_size);
	
	this.has_user_drawn = false;
	
    // hash of chunks - not array because we need negative and positive locations, and to be able to skip some
    this.chunks = {}; // keyed by xth chunk, value is a hash keyed by yth chunk
    this.chunks_loaded = [];
    
    this.offsetX = 0; // offset in client pixels of top left of chunk (0,0)
    this.offsetY = 0;
}

StampDrawrMap.prototype.clearCanvas = function(){
    this.ctx.clearRect(0,0,this.chunk_onscreen_size,this.chunk_onscreen_size);
	this.ctx.fillStyle = "rgba(255,255,255,0)";
    this.ctx.fillRect(0,0,this.chunk_onscreen_size,this.chunk_onscreen_size);
}

StampDrawrMap.prototype.resizeCanvas = function(size){
	var temp_canvas = this.canvas;
	this.canvas_size = size;
	this.chunk_onscreen_size = this.canvas_size * this.per_pixel_scaling;
	this.canvas.width = this.width = size;
	this.canvas.height = this.height = size;
	
	this.ctx.drawImage(temp_canvas, 0, 0, this.chunk_onscreen_size, this.chunk_onscreen_size);
}

StampDrawrMap.prototype.setOfflineMode = function(offline_mode){
    this.offline_mode = offline_mode;
}

StampDrawrMap.prototype.getIngameOffsetX = function(){
	return Math.floor(this.offsetX/this.per_pixel_scaling);
}

StampDrawrMap.prototype.setIngameOffsetX = function(offsetX){
	this.offsetX = offsetX * this.per_pixel_scaling;
}

StampDrawrMap.prototype.getIngameOffsetY = function(){
	return Math.floor(this.offsetY/this.per_pixel_scaling);
}

StampDrawrMap.prototype.setIngameOffsetY = function(offsetY){
	this.offsetY = offsetY * this.per_pixel_scaling;
}

StampDrawrMap.prototype.moveX = function(dist){
    this.offsetX += dist;
}

StampDrawrMap.prototype.moveY = function(dist){
    this.offsetY += dist;
}

StampDrawrMap.prototype.addPointRelative = function(x, y, screenOffsetX, screenOffsetY, brush, size){
    // x,y, offsets are true pixels per client
    var relx = x - screenOffsetX;
    var rely = y - screenOffsetY;
    this.addPoint(relx, rely, brush, size);
}

  
StampDrawrMap.prototype.addPoint = function(x,y,brush,size){    
    // if(this.per_pixel_scaling < 1) return; // don't do this while we're in dev mode
	this.has_user_drawn = true;
    
    x = x - this.offsetX;
    y = y - this.offsetY;
	s = size/2;

	// convert to ingame (big) pixels
    var gamex = Math.floor(x/this.per_pixel_scaling); 
    var gamey = Math.floor(y/this.per_pixel_scaling);
   
    DrawrBrushes.draw(this.ctx, gamex, gamey, brush, size);
}

StampDrawrMap.prototype.draw = function(ctx, mini_ctx, offset_x, offset_y){
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
	mini_ctx.imageSmoothingEnabled = false;
	mini_ctx.mozImageSmoothingEnabled = false;
	mini_ctx.webkitImageSmoothingEnabled = false;
	
	//TODO:: blit transparent pixels as white grey block pattern
    /*ctx.drawImage(this.canvas, offset_x, offset_y, 
		this.canvas_size*this.per_pixel_scaling, this.canvas_size*this.per_pixel_scaling); //x, y, width, height*/
	var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
	var data = imageData.data;
	var w = this.canvas.width;
	var h = this.canvas.height;
	var p = this.per_pixel_scaling;
	var q = Math.floor(p/2);
	for (var i = 0; i < data.length; i += 4){
		var j = i/4;
		if (data[i+3] === 0){			
			ctx.fillStyle = "rgb(200, 200, 200)";
			ctx.fillRect(offset_x+(j%w*p), offset_y+(Math.floor(j/h)*p), q, q);
			ctx.fillRect(offset_x+(j%w*p)+q, offset_y+(Math.floor(j/h)*p)+q, q, q);
			
			ctx.fillStyle = "rgb(164, 164, 164)";
			ctx.fillRect(offset_x+(j%w*p)+q, offset_y+(Math.floor(j/h)*p), q, q);
			ctx.fillRect(offset_x+(j%w*p), offset_y+(Math.floor(j/h)*p)+q, q, q);
		}else{
			ctx.drawImage(this.canvas, j%w, Math.floor(j/h), 1, 1, 
				offset_x+((j%w)*p), offset_y+(Math.floor(j/h)*p), p, p);
		}
	}

	mini_ctx.drawImage(this.canvas, 
		(32-this.canvas_size)/2, (32-this.canvas_size)/2, 
		this.canvas_size, this.canvas_size);
}


// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Using_images
// http://www.w3schools.com/tags/canvas_drawimage.asp
// http://stackoverflow.com/questions/10525107/html5-canvas-image-scaling-issue