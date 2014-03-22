


function DrawrBrushes(onload_continuation){
    this.brushes = [];
    this.blackfilenames = ["circle1.png", "circle4.png","circle8.png","circle16.png","circle32.png","kappa32.png","cathead32.png","bar8.png"];
	this.orangefilenames = ["orangecircle1.png", "orangecircle4.png","orangecircle8.png","orangecircle16.png","orangecircle32.png","orangekappa32.png","orangecathead32.png","orangebar8.png"];
	this.filenames = this.blackfilenames;
    this.filewidths = [1,4,8,16,32,32,32,8];
	this.numrealbrushes = this.filenames.length;
    this.selected_brush = 0;
    this.loaded_count = 0;

    for(var i=0; i<this.filenames.length; ++i){
        var temp_img = new Image();
        temp_img.src = "brushes/" + this.filenames[i];
        var brush_obj = {img: temp_img, name: this.filenames[i], size: this.filewidths[i], loaded: 0};
        
        var self_ref = this;
        temp_img.onload = function(){
            brush_obj.loaded = 1;
            self_ref.loaded_count++;
            if(self_ref.loaded_count == self_ref.filenames.length){
                onload_continuation();
            }
        }
        this.brushes.push(brush_obj);
    }
	this.filenames = this.orangefilenames
	for(var i=0; i<this.filenames.length; ++i){
        var temp_img = new Image();
        temp_img.src = "brushes/" + this.filenames[i];
        var brush_obj = {img: temp_img, name: this.filenames[i], size: this.filewidths[i], loaded: 0};
        
        var self_ref = this;
        temp_img.onload = function(){
            brush_obj.loaded = 1;
            self_ref.loaded_count++;
            if(self_ref.loaded_count == self_ref.filenames.length){
                onload_continuation();
            }
        }
        this.brushes.push(brush_obj);
    }
}

DrawrBrushes.prototype.getBrushes = function(){
    return this.brushes.slice(0, this.numrealbrushes);
}

DrawrBrushes.prototype.selectBrush = function(brush, color){
    if(brush + '' == (1*brush) + ''){ // if brush by number
        this.selected_brush = 1*brush;
    }else{
        var stripfiletype = function(x){return x.indexOf('.') >= 0 ? x.substr(0, x.indexOf('.')) : x;};
        brush = stripfiletype(brush);
		brush = color + brush;
        for(var i=0; i<this.brushes.length; ++i){
            if(stripfiletype(this.brushes[i].name) == brush){
                this.selected_brush = i;
                return this.selected_brush;
            }
        }
        this.selected_brush = 0;
        return this.selected_brush;
    }
}

DrawrBrushes.prototype.getBrush = function(){
    return this.brushes[this.selected_brush];
}