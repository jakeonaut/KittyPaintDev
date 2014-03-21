
function KittyDrawr(canvas_id, brushes, debug_id){
    this.stage = document.getElementById(canvas_id);
    this.debug_div = debug_id && document.getElementById(debug_id) || 0;
    this.ctx = this.stage.getContext("2d");
    this.ctx.fillStyle = "black";
    
    this.stage.width = window.innerWidth;
    this.stage.height = window.innerHeight;
    
    this.drawr_brushes = brushes || new DrawrBrushes();
    this.drawr_map = new DrawrMap();
    
    this.setup_fps();
    this.setup_mouse();
    
    this.debug_log = [{msg: "Starting...", time: now(), date: new Date()}];
    this.debug_string = "";
    this.update_lock = false;
    
    ///////// TODO: mouse things, make a mouse type object that handles this
    this.drawrObjects = [];
    this.tempDrawrObject = 0;
    
    var self_reference = this;
    this.game_loop = setInterval(function(){
        self_reference.update();
    }, this.frame_time);
}

KittyDrawr.prototype.setup_mouse = function(){
    this.mousex = this.mousey = 0;
    this.mouselastx = this.mouselasty = 0;
    this.mousedown = 0;
    
    var self_reference = this; // weird interaction with listeners and object methods
    var movefunc = function(e){ self_reference.mousemoveEvent(e); };
    var downfunc = function(e){ self_reference.mousedownEvent(e); };
    var upfunc = function(e){ self_reference.mouseupEvent(e); };
    this.stage.addEventListener("mousemove",movefunc,false);
    this.stage.addEventListener("touchmove",movefunc,false);
    this.stage.addEventListener("mousedown",downfunc,false);
    this.stage.addEventListener("touchstart",downfunc,false);
    this.stage.addEventListener("mouseup",upfunc,false);
    this.stage.addEventListener("touchend",upfunc,false);
    /*this.stage.addEventListener("mousemove",this.mousemoveEvent,false);
    this.stage.addEventListener("touchmove",this.mousemoveEvent,false);
    this.stage.addEventListener("mousedown",this.mousedownEvent,false);
    this.stage.addEventListener("touchstart",this.mousedownEvent,false);
    this.stage.addEventListener("mouseup",this.mouseupEvent,false);
    this.stage.addEventListener("touchend",this.mouseupEvent,false);*/
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
    }
    this.writeDebug();
    
    // HERE! TODO: optimize this, we don't have to redrawr everything every single frame
    this.ctx.fillStyle = "rgb(255,255,255)";
    this.ctx.fillRect(0,0,this.getWidth(),this.getHeight());
    
    // blit drawr_map to screen
    this.drawr_map.draw(this.ctx);
    
    // OPTIMIZE THIS. have it draw to a bitmap, and then just print that, then update the bitmap on changes to drawrObjects

    this.update_lock = false; // let a new update() run
}



KittyDrawr.prototype.getMouseX = function(e){
    if(e.touches){
        var touch = e.touches[0]; //array, for multi-touches
        if(!touch) return;
        return touch.pageX - this.stage.offsetLeft;
    }else{
        if(window.event) return window.event.clientX;
        return e.pageX || e.clientX;
    }
}
KittyDrawr.prototype.getMouseY = function(e){
    if(e.touches){
        var touch = e.touches[0]; //array, for multi-touches
        if(!touch) return;
        return touch.pageY - this.stage.offsetTop;
    }else{
        if(window.event) return window.event.clientY;
        return e.pageY || e.clientY;
    }
}


KittyDrawr.prototype.mousemoveEvent = function(e){
    this.mousex = this.getMouseX(e);
    this.mousey = this.getMouseY(e);
    
    // DRAWR CODE
    if(this.mousedown){
        this.drawr_map.addPoint(this.mousex, this.mousey, this.drawr_brushes.getBrush());
    }
    
    e.preventDefault(); //prevent mouse drag from trying to drag webpage
}

KittyDrawr.prototype.mousedownEvent = function(e){
    this.debug("mousedown");
    this.mousedown = true;
    this.mouselastx = this.getMouseX(e) || this.mousex;
    this.mouselasty = this.getMouseY(e) || this.mousey;
    
    // DRAWR CODE
    this.drawr_map.addPoint(this.mousex, this.mousey, this.drawr_brushes.getBrush());
    
    e.preventDefault(); //prevent mouse drag from trying to drag webpage
}

KittyDrawr.prototype.mouseupEvent = function(e){
    this.debug("mouseup");
    this.mousedown = false;
    // getMouseX(e) may be undefined for a "touchend" event. if so, use previous value
    this.mousex = this.getMouseX(e) || this.mousex;
    this.mousey = this.getMouseY(e) || this.mousey;
    
    // DRAWR CODE
    //tempDrawrObject.addPoint(mousex,mousey,stage.width,stage.height);
    //this.drawrObjects.push(this.tempDrawrObject);
    ////post_drawr_object(this.tempDrawrObject);
    //this.tempDrawrObject = 0;
    
    this.drawr_map.addPoint(this.mousex, this.mousey, this.drawr_brushes.getBrush()); // nothing else needed (!)
    
    
    e.preventDefault(); //prevent mouse drag from trying to drag webpage
}