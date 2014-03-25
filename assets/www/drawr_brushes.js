


function DrawrBrushes(onload_continuation){
    this.brushes = [];
    this.filenames = ["circle1", "circle4","circle8","circle16","circle32","kappa32","cathead32","bar8"];
	this.brushnames = this.filenames;
	this.colors = ["black", "orange", "white"];
    this.filewidths = [1,4,8,16,32,32,32,8];
	this.numrealbrushes = this.filenames.length;
    this.selected_brush = 0;
    this.loaded_count = 0;
    
    
	for(var j=0; j<this.colors.length; ++j){
		var color = this.colors[j];
		for(var i=0; i<this.filenames.length; ++i){
			var temp_img = new Image();
			temp_img.src = "brushes/" + color + "/" + this.filenames[i] + ".png";
			var brush_obj = {
				img: temp_img, 
				name: this.filenames[i], 
				color: color, 
				size: this.filewidths[i], 
				loaded: 0
			};
			
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

}

DrawrBrushes.prototype.loadNamedColorsOfBrush = function(){ // asdfasdfasdf
    // take black mask icons and load a new brush for each named color
    
}

DrawrBrushes.prototype.getBrushes = function(){
    return this.brushes;
}

DrawrBrushes.prototype.getBrushNames = function(){
	return this.brushnames;
}

DrawrBrushes.prototype.getColors = function(){
    return this.colors;
}

DrawrBrushes.prototype.selectBrush = function(brush, color){
    if(brush + '' == (1*brush) + ''){ // if brush by number
        this.selected_brush = 1*brush;
    }else{
        for(var i=0; i<this.brushes.length; ++i){
            if(this.brushes[i].name == brush && this.brushes[i].color == color){
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