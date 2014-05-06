function StampDrawr(canvas_id, mini_canvas_id, brushes){
    this.stage = document.getElementById(canvas_id);
	this.mini_stage = document.getElementById(mini_canvas_id);
    //this.debug_div = debug_id && document.getElementById(debug_id) || 0;
    this.ctx = this.stage.getContext("2d");
	this.mini_ctx = this.mini_stage.getContext("2d");
	
	this.stage.width = window.innerWidth;
    this.stage.height = window.innerHeight;
	this.offsetX = 0;
	this.offsetY = 0;
	this.resize();
	this.eye_drop = false;
	
	this.canvas_pixelated_size = 16;
	this.pixel_size = 32;
	this.real_size = this.canvas_pixelated_size * this.pixel_size;
    
    this.drawr_brushes = brushes || new DrawrBrushes();
    this.drawr_map = new StampDrawrMap(this.canvas_pixelated_size, this.pixel_size);
    
    this.setup_fps();
    this.setup_mouse();
    
    this.update_lock = false;
    
    var self_reference = this;
    this.game_loop = setInterval(function(){
        self_reference.update();
    }, this.frame_time);
}

StampDrawr.prototype.setup_fps = function(){
    this.frame_time = 33; // 30 fps
    this.total_frame_count = 0;

    this.fps_counter = 0;
    this.fps = 0;
    this.fpsLastUpdate = now();
}

StampDrawr.prototype.saveImage = function(){
	var image = this.drawr_map.saveImage();
	if (image === false){
		alert("Empty Stamp or No updates since last save.");
	}else{
		this.drawr_brushes.addCustomStamp(image);
		setBrushBoxes();
	}
}

StampDrawr.prototype.changeCanvasSize = function(size){
	this.canvas_pixelated_size = size;
	this.real_size = this.canvas_pixelated_size * this.pixel_size;
	this.resize();
	this.drawr_map.resizeCanvas(size);
}

StampDrawr.prototype.clearCanvas = function(){
	this.mini_ctx.clearRect(0, 0, 32, 32);
	this.drawr_map.clearCanvas();
}

StampDrawr.prototype.toggleStampErase = function(){
	this.drawr_map.toggleStampErase();
}

StampDrawr.prototype.toggleEyeDrop = function(){
	this.eye_drop = true;
	this.drawr_map.toggleEyeDrop();
}

StampDrawr.prototype.resize = function(){
	this.stage.width = window.innerWidth;
    this.stage.height = window.innerHeight;
	this.offsetX = Math.floor((this.stage.width - this.real_size)/2);
	this.offsetY = Math.floor((this.stage.height - this.real_size)/2);
	/*
	var top_frame = this.offsetY;
	var left_frame = this.offsetX;
	var right_frame = (this.pixel_size*this.canvas_pixelated_size);
	var bottom_frame = (this.pixel_size*this.canvas_pixelated_size);
	
	//Draw frame
	this.ctx.fillStyle = "rgb(164,164,164)";
    this.ctx.fillRect(0,0,this.getWidth(),this.getHeight());*/
}

StampDrawr.prototype.showGrid = function(offset_x, offset_y){
	var top_frame = this.offsetY + offset_y;
	var left_frame = this.offsetX + offset_x;
	var right_frame = (this.pixel_size*this.canvas_pixelated_size);
	var bottom_frame = (this.pixel_size*this.canvas_pixelated_size);
	
	//Draw lines seperating pixels
	for (var i = 0; i <= this.canvas_pixelated_size; ++i){		
		//vertical line
		drawLine(this.ctx,"rgb(0,164,164)",left_frame,top_frame+(i)*this.pixel_size,left_frame+right_frame, top_frame+(i)*this.pixel_size,1);
		//horizontal line
		drawLine(this.ctx,"rgb(0,164,164)",left_frame+(i)*this.pixel_size, top_frame,left_frame+(i)*this.pixel_size,top_frame+bottom_frame,1);
	}
}

StampDrawr.prototype.getWidth = function(){
    return this.stage.width;
}
StampDrawr.prototype.getHeight = function(){
    return this.stage.height;
}

StampDrawr.prototype.update = function(){
    if(this.update_lock) return; // only allow 1 instance of update to run at a time
    this.update_lock = true;

    this.total_frame_count++;
    this.fps_counter++;
    var nowTime = now();
    if(this.debug_div) this.debug_div.innerHTML = this.fps.toFixed(1) + " fps<br/>";
    if(nowTime - this.fpsLastUpdate > 1000){
        this.fps = this.fps_counter;
        this.fpsLastUpdate = nowTime;
        this.fps_counter = 0;
    }
    
    // HERE! TODO: optimize this, we don't have to redrawr everything every single frame
    this.ctx.fillStyle = "rgb(164,164,164)";
    this.ctx.fillRect(0,0,this.getWidth(),this.getHeight());
    
    // blit drawr_map to screen
    this.drawr_map.draw(this.ctx, this.mini_ctx, this.offsetX, this.offsetY);
	this.showGrid(this.drawr_map.getOffsetX(), this.drawr_map.getOffsetY());
    
    // OPTIMIZE THIS. have it draw to a bitmap, and then just print that, then update the bitmap on changes to drawrObjects

    this.update_lock = false; // let a new update() run
}