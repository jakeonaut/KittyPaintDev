function DrawrMap(){
    this.paperSize = {
        width: 320, // in px
        height: 240, // in px
    };
	this.per_pixel_scaling = 2; // paper pixel is 2x2
    
    this.paper = document.createElement("canvas");
    this.paper.width = this.width = this.paperSize.width;
    this.paper.height = this.height = this.paperSize.height;
    this.paperCtx = this.paper.getContext("2d");
    
    this.paperCtx.imageSmoothingEnabled = false;
    this.paperCtx.mozImageSmoothingEnabled = false;
    this.paperCtx.webkitImageSmoothingEnabled = false;
	
	this.pattern_mode = false;
	this.blend_mode = false;
	this.eye_drop = false;
    
    this.offsetX = 0; // offset in client pixels of top left of chunk (0,0)
    this.offsetY = 0;
}

DrawrMap.prototype.getCanvasSize = function() {
    return {
        width: this.paperSize.width * this.per_pixel_scaling,
        height: this.paperSize.height * this.per_pixel_scaling,
    };
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
    // x, y, offsets are true pixels per client
    var relx = x + screenOffsetX;
    var rely = y + screenOffsetY;
    this.addPoint(relx, rely, brush);
}

DrawrMap.prototype.normalizeCoordinates = function(x, y) {
    x = x - this.offsetX;
    y = y - this.offsetY;

    x /= this.per_pixel_scaling;
    y /= this.per_pixel_scaling;
    return {x, y};
}

DrawrMap.prototype.startPath = function(x, y) {
    this.lastCoords = this.normalizeCoordinates(x, y);
}

DrawrMap.prototype.endPath = function(x, y) {
    this.lastCoords = undefined;
}

DrawrMap.prototype.drawLine = function(x, y, brush, size) {
    let linePointX = this.lastCoords.x;
    let linePointY = this.lastCoords.y;
    const step = ~~(size / 2);

    const VerticalLine = (linePointX, x, linePointY, y) => {
        if (linePointY > y) {
            let swap = y;
            y = linePointY;
            linePointY = swap;

            swap = x;
            x = linePointX;
            linePointX = swap;
        }

        const slope = (x - linePointX) / (y - linePointY);
        const base = linePointX - (slope * linePointY);
        while (linePointY <= y) {
            DrawrBrushes.draw(this.paperCtx, linePointX, linePointY, brush, size, this.pattern_mode, this.blend_mode);
    
            linePointX = ~~((slope * linePointY) + base);
            linePointY += step;
        }
    };

    // Vertical line
    if (this.lastCoords.x == x) {
        // Always force a "positive" line for calculations
        VerticalLine(linePointX, x, linePointY, y);
    }

    // Always force a "positive" line for calculations
    if (linePointX > x) {
        let swap = x;
        x = linePointX;
        linePointX = swap;

        swap = y;
        y = linePointY;
        linePointY = swap;
    }
    const slope = (y - linePointY) / (x - linePointX);
    const base = linePointY - (slope * linePointX);
    if (Math.abs(slope) > 1) {
        VerticalLine(linePointX, x, linePointY, y);
    } else {
        while (linePointX <= x) {
            DrawrBrushes.draw(this.paperCtx, linePointX, linePointY, brush, size, this.pattern_mode, this.blend_mode);

            linePointX += step;
            linePointY = ~~(base + (slope * linePointX));
        }
    } 
}

DrawrMap.prototype.addPoint = function(x, y, brush, size){
    // if(this.per_pixel_scaling < 1) return; // don't do this while we're in dev mode
    
    ({x, y} = this.normalizeCoordinates(x, y));

    var gamex = Math.floor(x/this.per_pixel_scaling); // convert to ingame (big) pixels
    var gamey = Math.floor(y/this.per_pixel_scaling);
	
	if (this.pattern_mode && !this.eye_drop){
		gamex = Math.floor((gamex)/size)*size + (size/2);
		gamey = Math.floor((gamey)/size)*size + (size/2);
	}

    if (!this.eye_drop) {
        if (this.lastCoords) {
            this.drawLine(x, y, brush, size);
        }
        DrawrBrushes.draw(this.paperCtx, x, y, brush, size, this.pattern_mode, this.blend_mode);
        this.lastCoords = {x, y};
    } else {
        //EYE DROP
        // TODO(jaketrower): allow for eyedrop drag selection
        var imageData = this.paperCtx.getImageData(x, y, 1, 1);
        var data = imageData.data;
        var hex = rgbToHex(data[0], data[1], data[2]);
        $("color_box").value = hex;
        editColor();
        turnOffEyeDrop();
    }
}

DrawrMap.prototype.drawImage = function(img, x, y) {
    this.paperCtx.drawImage(
        img, x, y, 
        img.width / this.per_pixel_scaling, 
        img.height / this.per_pixel_scaling);
}

DrawrMap.prototype.clear = function() {
    this.paperCtx.fillStyle = "#ffffff";
    const canvasSize = this.getCanvasSize();
    this.paperCtx.fillRect(0, 0, canvasSize.width, canvasSize.height);
}

DrawrMap.prototype.draw = function(ctx){    
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
        
    const canvasSize = this.getCanvasSize();
    ctx.drawImage(
        this.paper, 
        0 /* x */,  0 /* y */, 
        canvasSize.width, 
        canvasSize.height);
}


// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Using_images
// http://www.w3schools.com/tags/canvas_drawimage.asp
// http://stackoverflow.com/questions/10525107/html5-canvas-image-scaling-issue