function StampDrawr(canvas_id, brushes){
    this.stage = document.getElementById(canvas_id);
    //this.debug_div = debug_id && document.getElementById(debug_id) || 0;
    this.ctx = this.stage.getContext("2d");
	this.ctx['imageSmoothingEnabled'] = false;
	this.ctx['mozImageSmoothingEnabled'] = false;
	this.ctx['oImageSmoothingEnabled'] = false;
	this.ctx['webkitImageSmoothingEnabled'] = false;
	this.ctx['msImageSmoothingEnabled'] = false;
    
    this.drawr_brushes = brushes || new DrawrBrushes();
    this.drawr_map = new DrawrMap();
    
    //this.setup_mouse();
    
    this.update_lock = false;
    
    //this.loadNearbyChunks();
    
    /*var self_reference = this;
    this.game_loop = setInterval(function(){
        self_reference.update();
    }, this.frame_time);*/
	
	this.canvas_pixelated_size = 16;
	this.pixel_size = 32;
	this.resize();
}

StampDrawr.prototype.resize = function(){
	this.stage.width = window.innerWidth-128;
    this.stage.height = window.innerHeight-128;
	var top_frame = 128;
	var left_frame = 128;
	var right_frame = (this.pixel_size*this.canvas_pixelated_size);
	var bottom_frame = (this.pixel_size*this.canvas_pixelated_size);
	
	//Draw frame
	this.ctx.fillStyle = "rgb(164,164,164)";
    this.ctx.fillRect(0,0,this.getWidth(),this.getHeight());
	
	//Draw sprite area
	/*this.pixel_size = (this.getWidth()-frame_size*2)/this.canvas_pixelated_size;
	if (this.getWidth() > this.getHeight()){
		this.pixel_size = (this.getHeight()-frame_size*2)/this.canvas_pixelated_size;
	}*/
	this.ctx.fillStyle = "rgb(255,255,255)";
	this.ctx.fillRect(left_frame, top_frame, right_frame, bottom_frame);
	
	//Draw lines seperating pixels
	for (var i = 0; i <= this.canvas_pixelated_size; ++i){		
		//vertical line
		drawLine(this.ctx,"black",left_frame,top_frame+(i)*this.pixel_size,left_frame+right_frame, top_frame+(i)*this.pixel_size,1);
		//horizontal line
		drawLine(this.ctx,"black",left_frame+(i)*this.pixel_size, top_frame,left_frame+(i)*this.pixel_size,top_frame+bottom_frame,1);
	}
}

StampDrawr.prototype.getWidth = function(){
    return this.stage.width;
}
StampDrawr.prototype.getHeight = function(){
    return this.stage.height;
}