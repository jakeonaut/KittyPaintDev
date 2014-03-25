function DrawrBrushes(onload_continuation){
    this.brushes = [];
    //this.brush_names = ["circle1", "circle4","circle8","circle16","circle32","bar8"];
	this.brush_names = ["circle","cathead","goblin","kappa"];
    this.brush_types = ["brush","stamp","stamp","stamp"];
	this.brush_size = 1;
    this.selected_brush = 0;
    this.loaded_count = 0;
    
	var num_brushes = this.brush_names.length;
	//load brushes
	for(var i=0; i<num_brushes; ++i){
		name = this.brush_names[i];
		for (var j = 0; j<10; ++j){
			var temp_img = new Image();
			temp_img.src = "brushes/" + name + "/" + j + ".png";
			var brush_name = name + j;
			
			var brush_obj = {
				img: temp_img, 
				name: brush_name, 
				type: this.brush_types[i], 
				loaded: 0
			};
			
			var self_ref = this;
			temp_img.onload = function(){
				brush_obj.loaded = 1;
				self_ref.loaded_count++;
				
				if(self_ref.loaded_count == self_ref.brush_names.length){
					onload_continuation();
				}
			}
			this.brushes.push(brush_obj);
		}
	}
}

DrawrBrushes.prototype.getBrushes = function(){
    return this.brushes;
}

DrawrBrushes.prototype.getBrushNames = function(){
	return this.brush_names;
}

DrawrBrushes.prototype.getBrushAndStampNames = function(){
	var brushAndStampNames = [];
	for (var i=0; i < this.brush_names.length; ++i){
		brushAndStampNames.push(this.brush_names[i]);
	}
	for (var i=0; i < this.stamp_names.length; ++i){
		brushAndStampNames.push(this.stamp_names[i]);
	}
	return brushAndStampNames;
}

DrawrBrushes.prototype.getColors = function(){
    return this.named_colors;
}

DrawrBrushes.prototype.selectBrush = function(brush){
    if(brush + '' == (1*brush) + ''){ // if brush by number
        this.selected_brush = 1*brush;
    }else{
        for(var i=0; i<this.brushes.length; ++i){
            if(this.brushes[i].name == brush){
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

DrawrBrushes.prototype.getBrushSize = function(){
	return this.brush_size;
}

DrawrBrushes.prototype.setBrushSize = function(size){
	this.brush_size = size;
}