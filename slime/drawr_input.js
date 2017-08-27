 

KittyDrawr.prototype.setup_mouse = function(){
    this.mousex = this.mousey = 0;
    this.mouselastx = this.mouselasty = 0;
    this.mousedown = 0;
    this.screenmove_callback = function(){};
    
    var self_reference = this; // weird interaction with listeners and object methods
    
    this.addEventListener("mapmove", () => self_reference.loadNearbyChunks()); // custom event listener
    
    var downfunc = (e) => self_reference.mousedownEvent(e);
    var movefunc = (e) => self_reference.mousemoveEvent(e);
    var upfunc = (e) => self_reference.mouseupEvent(e);
    this.stage.addEventListener("mousedown", downfunc, false);
    this.stage.addEventListener("touchstart", downfunc, false);
    this.stage.addEventListener("mousemove", movefunc, false);
    this.stage.addEventListener("touchmove", movefunc, false);
    this.stage.addEventListener("mouseup", upfunc, false);
    this.stage.addEventListener("touchend", upfunc, false);
    
    this.KEY_LEFT = 37;
    this.KEY_UP = 38;
    this.KEY_RIGHT = 39;
    this.KEY_DOWN = 40;
    this.keyspressed = {};
    
    var keydownfunc = function(e){ self_reference.keyDownEvent(e); };
    var keyupfunc = function(e){ self_reference.keyUpEvent(e); };
    window.addEventListener("keydown", keydownfunc, false);
    window.addEventListener("keyup", keyupfunc, false);
    setInterval(function(e){ self_reference.handleKeys(); }, this.frame_time);
}

KittyDrawr.prototype.addEventListener = function(event, callback){
    if (event == "mapmove") {
        var previous_callback = this.screenmove_callback;
        this.screenmove_callback = function(){ callback(); previous_callback(); }
    } else if (event == "addpoint") {
        var previous_callback = this.addpoint_callback;
        this.addpoint_callback = function(){ callback(); previous_callback(); }
    }
}

KittyDrawr.prototype.changePixelScale = function(pixel_scale){
	//store ingameoffsets before scaling and reset to those stored offsets
    var dmap = this.drawr_map;
    var old_pixel_scale = dmap.per_pixel_scaling;
    
    // differences between top-left of window and center in ingame coordinates
    var deltaX = Math.floor(this.getWidth()/2 / old_pixel_scale);
    var deltaY = Math.floor(this.getHeight()/2 / old_pixel_scale);
	var center_offsetX = dmap.getIngameOffsetX() - deltaX;
	var center_offsetY = dmap.getIngameOffsetY() - deltaY;
	
	dmap.per_pixel_scaling = pixel_scale;
	dmap.chunk_onscreen_size = dmap.chunk_block_size * dmap.per_pixel_scaling;
    
    // new deltas in ingame coordinates after resize
    var zoomDeltaX = Math.floor(this.getWidth()/2 / dmap.per_pixel_scaling);
    var zoomDeltaY = Math.floor(this.getHeight()/2 / dmap.per_pixel_scaling);
	
	dmap.setIngameOffsetX(center_offsetX + zoomDeltaX);
	dmap.setIngameOffsetY(center_offsetY + zoomDeltaY);
}



KittyDrawr.prototype.isMoveKeyPressed = function(){ // hold this button and drag with mouse to move screen
    var moveKeyCode = 77; // m
    for(var keyCode in this.keyspressed){
        if(keyCode == moveKeyCode) return this.keyspressed[keyCode];
    }
    return 0;
}

KittyDrawr.prototype.handleKeys = function(){
    var dist_moved = 20;

    for(var keyCode in this.keyspressed){
        if(this.keyspressed[keyCode]){
            if(keyCode == this.KEY_LEFT){
                this.drawr_map.moveX(dist_moved);
                this.screenmove_callback();
            }else if(keyCode == this.KEY_UP){
                this.drawr_map.moveY(dist_moved);
                this.screenmove_callback();
            }else if(keyCode == this.KEY_RIGHT){
                this.drawr_map.moveX(-dist_moved);
                this.screenmove_callback();
            }else if(keyCode == this.KEY_DOWN){
                this.drawr_map.moveY(-dist_moved);
                this.screenmove_callback();
            }
        }
    }
}

KittyDrawr.prototype.keyDownEvent = function(e){
    this.keyspressed[e.keyCode] = 1;
}

KittyDrawr.prototype.keyUpEvent = function(e){
    this.keyspressed[e.keyCode] = 0;
}

KittyDrawr.prototype.getMouseX = function(e){
    let x = 0;
    if(e.touches){
        const touch = e.touches[0]; //array, for multi-touches
        if (!touch) return;
        x = touch.pageX;
    } else {
        if (window.event) {
            x = window.event.clientX;
        }
        x = e.pageX || e.clientX;
    }
    return x - this.stage.offsetLeft;
}
KittyDrawr.prototype.getMouseY = function(e){
    let y = 0;
    if(e.touches){
        const touch = e.touches[0]; //array, for multi-touches
        if (!touch) return;
        y = touch.pageY;
    } else {
        if (window.event) {
            y = window.event.clientY;
        }
        y = e.pageY || e.clientY;
    }
    return y - this.stage.offsetTop;
}


KittyDrawr.prototype.mousedownEvent = function(e){
    this.mouselastx = this.mousex;
    this.mouselasty = this.mousey;
    this.mousex = this.getMouseX(e) || this.mousex;
    this.mousey = this.getMouseY(e) || this.mousey;
    
    if(e.which == 1 || e.touches && e.touches.length <= 1){ //e.touchs if is only 1 touch
		if (auto_hide_ui) minimizeUI();
		////editColor(); // xxxxxx
        this.mousedown = true;
		if (!this.eye_drop) {
            this.drawr_map.startPath(this.mousex, this.mousey);
            this.drawr_map.addPoint(
                this.mousex, this.mousey, this.drawr_brushes.getBrush(), this.drawr_brushes.getBrushSize());
        }
    }
    
    e.preventDefault(); //prevent mouse drag from trying to drag webpage
    if (e.stopPropagation) e.stopPropagation();
    e.cancelBubble = true;
    return false;
}


KittyDrawr.prototype.mousemoveEvent = function(e){
    this.mouselastx = this.mousex;
    this.mouselasty = this.mousey;
    this.mousex = this.getMouseX(e);
    this.mousey = this.getMouseY(e);

    if (!this.isMoveKeyPressed() && e.which == 1 || e.touches && e.touches.length <= 1) {
        if (this.mousedown && !this.eye_drop) {
            this.drawr_map.addPoint(this.mousex, this.mousey, this.drawr_brushes.getBrush(), this.drawr_brushes.getBrushSize());
        }
    } 
    else if (this.isMoveKeyPressed() || e.which || e.touches && e.touches.length > 1) {
        var dx = this.mousex - this.mouselastx;
        var dy = this.mousey - this.mouselasty;
        
        this.drawr_map.moveX(dx);
        this.drawr_map.moveY(dy);

        // call mapmove event callback
        this.screenmove_callback();
    }
    
    e.preventDefault(); // prevent mouse drag from trying to drag webpage
    if (e.stopPropagation) e.stopPropagation();
    e.cancelBubble = true;
    return false;
}

KittyDrawr.prototype.mouseupEvent = function(e){
	//return false;
    // getMouseX(e) may be undefined for a "touchend" event. if so, use previous value
    this.mouselastx = this.mousex;
    this.mouselasty = this.mousey;
    this.mousex = this.getMouseX(e) || this.mousex;
    this.mousey = this.getMouseY(e) || this.mousey;
    
    if(e.which == 1 || e.touches && e.touches.length <= 1){
        this.mousedown = false;
		if (this.eye_drop){
            this.drawr_map.addPoint(this.mousex, this.mousey, this.drawr_brushes.getBrush(), this.drawr_brushes.getBrushSize());
            this.drawr_map.endPath();
			this.eye_drop = false;
		}
    }
    
    e.preventDefault(); //prevent mouse drag from trying to drag webpage
    if (e.stopPropagation) e.stopPropagation();
    e.cancelBubble = true;
    return false;
}
