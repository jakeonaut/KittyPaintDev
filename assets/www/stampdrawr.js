function StampDrawr(canvas_id, brushes){
    this.stage = document.getElementById(canvas_id);
    //this.debug_div = debug_id && document.getElementById(debug_id) || 0;
    this.ctx = this.stage.getContext("2d");
	this.ctx['imageSmoothingEnabled'] = false;
	this.ctx['mozImageSmoothingEnabled'] = false;
	this.ctx['oImageSmoothingEnabled'] = false;
	this.ctx['webkitImageSmoothingEnabled'] = false;
	this.ctx['msImageSmoothingEnabled'] = false;
    
    this.stage.width = window.innerWidth;
    this.stage.height = window.innerWidth;
    
    this.drawr_brushes = brushes || new DrawrBrushes();
    this.drawr_map = new DrawrMap();
    
    //this.setup_mouse();
    
    this.update_lock = false;
    
    //this.loadNearbyChunks();
    
    /*var self_reference = this;
    this.game_loop = setInterval(function(){
        self_reference.update();
    }, this.frame_time);*/
	
	
	this.ctx.fillStyle = "rgb(0,255,255)";
    this.ctx.fillRect(0,0,this.getWidth(),this.getHeight());
	this.canvas_pixelated_size = 16;
	this.pixel_size = this.getWidth()/this.canvas_pixelated_size;
	for (var i = 0; i <= this.canvas_pixelated_size; ++i){		
		drawLine(this.ctx,"black",1,(i)*this.pixel_size,this.getWidth()-1,(i)*this.pixel_size,1);
		drawLine(this.ctx,"black",(i)*this.pixel_size, 1,(i)*this.pixel_size,this.getHeight()-1,1);
	}
}

StampDrawr.prototype.getWidth = function(){
    return this.stage.width;
}
StampDrawr.prototype.getHeight = function(){
    return this.stage.height;
}