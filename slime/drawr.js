
function KittyDrawr(canvas_id, brushes, debug_id){
    this.stage = document.getElementById(canvas_id);
    this.debug_div = debug_id && document.getElementById(debug_id) || 0;
    this.ctx = this.stage.getContext("2d");
	/*this.ctx['imageSmoothingEnabled'] = false;
	this.ctx['mozImageSmoothingEnabled'] = false;
	this.ctx['oImageSmoothingEnabled'] = false;
	this.ctx['webkitImageSmoothingEnabled'] = false;
	this.ctx['msImageSmoothingEnabled'] = false;*/
    this.ctx.fillStyle = "black";
	this.eye_drop = false;
    
    this.stage.width = window.innerWidth;
    this.stage.height = window.innerHeight;
    
    this.drawr_brushes = brushes || new DrawrBrushes();
    this.drawr_map = new DrawrMap();
    
    this.setup_fps();
    this.setup_mouse();
    
    this.debug_log = [{msg: "Starting...", time: now(), date: new Date()}];
    this.debug_string = "";
    this.update_lock = false;
    
    this.loadNearbyChunks();
    
     this.game_loop = setInterval(() => this.update(), this.frame_time);
}

KittyDrawr.prototype.clear = function() {
    this.ctx.fillStyle = "rgb(255,255,255)";
    this.ctx.fillRect(0,0,this.getWidth(),this.getHeight());
    this.drawr_map.clear();
}

KittyDrawr.prototype.togglePattern = function(){
	this.drawr_map.togglePattern();
}

KittyDrawr.prototype.toggleBlend = function(){
	this.drawr_map.toggleBlend();
}

KittyDrawr.prototype.toggleEyeDrop = function(){
	this.eye_drop = true;
	this.drawr_map.toggleEyeDrop();
}

KittyDrawr.prototype.setup_fps = function(){
    this.frame_time = 33; // 30 fps
    this.total_frame_count = 0;

    this.fps_counter = 0;
    this.fps = 0;
    this.fpsLastUpdate = now();
}

KittyDrawr.prototype.getWidth = function(){
    return this.stage.width;
}
KittyDrawr.prototype.getHeight = function(){
    return this.stage.height;
}

KittyDrawr.prototype.debug = function(msg_string){
    this.debug_log.unshift({msg: msg_string, time: now(), date: new Date()});
    this.updateDebugString();
}
KittyDrawr.prototype.updateDebugString = function(){
    // Cache the debug string, update it only every second
    if(this.debug_div){
        this.debug_string = ""
        for(var i=0; i<this.debug_log.length; ++i){
            if(now() - this.debug_log[i].time < 30000){
                var s = "[" + padl(this.debug_log[i].date.getHours(),2) + 
                        ":" + padl(this.debug_log[i].date.getMinutes(),2) +
                        ":" + padl(this.debug_log[i].date.getSeconds(),2) + "] ";
                s += this.debug_log[i].msg + "<br/>";
                this.debug_string += s;
            }
        }
    }
}
KittyDrawr.prototype.writeDebug = function(){
    if(this.debug_div){
        this.debug_div.innerHTML += this.debug_string;
    }
}

KittyDrawr.prototype.refresh = function(){
    this.drawr_map.refresh(Math.max(this.getWidth(), this.getHeight()));
}

KittyDrawr.prototype.loadNearbyChunks = function(){
    // this.drawr_map.loadNearbyChunks(Math.max(this.getWidth(), this.getHeight()));
}

KittyDrawr.prototype.freeFarChunks = function(){
    // this.drawr_map.freeFarChunks(Math.max(this.getWidth(), this.getHeight()));
}

KittyDrawr.prototype.update = function(){
    
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
        
        this.updateDebugString(); // update this every second while we're at it
        this.freeFarChunks();
    }
    this.writeDebug();
    
    // HERE! TODO: optimize this, we don't have to redrawr everything every single frame
    this.ctx.fillStyle = "rgb(255,255,255)";
    // this.ctx.fillRect(0,0,this.getWidth(),this.getHeight());
    
    // blit drawr_map to screen
    this.drawr_map.draw(this.ctx);
    
    // OPTIMIZE THIS. have it draw to a bitmap, and then just print that, then update the bitmap on changes to drawrObjects

    this.update_lock = false; // let a new update() run
}


