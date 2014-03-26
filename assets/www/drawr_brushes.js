function DrawrBrushes(onload_continuation){
    this.brushes = [];
    //this.brush_names = ["circle1", "circle4","circle8","circle16","circle32","bar8"];
	this.brush_names = ["circle","cathead","goblin","kappa"];
    this.brush_types = ["brush","stamp","stamp","stamp"];
	this.brush_sizes = [32, 16, 16, 32];
	this.size_variations = [1, 4, 8, 16, 32];
	this.num_brush_variations_per_brush = 10;
    this.selected_brush = 0;
    this.brush_size = 1;
    this.loaded_count = 0;
    
	//load brushes and stamps
	for(var i=0; i<this.brush_names.length; ++i){
		name = this.brush_names[i];
		for (var j = 0; j<this.num_brush_variations_per_brush; ++j){
			var type = this.brush_types[i];
			if (type == "brush"){
				var sizes = [];
				var brush_obj = {
					img: new Image(),
					name: name + j,
					size: 0,
					sizes: [],
					type: type,
					loaded: 1 - this.size_variations.length
				}
				for (var k = 0; k<this.size_variations.length;++k){
					var temp_img = new Image();
					var size = this.size_variations[k];
					temp_img.src = "brushes/"+name+"/"+j+"/"+size+".png"; //brushes/circle/0/16.png
					var brush_size_obj = {
						img: temp_img,
						size: size,
						loaded: 0
					}
					sizes.push(brush_size_obj);
					
					var self_ref = this;
					temp_img.onload = function(){
						brush_obj.loaded += 1;
						if (brush_obj.loaded == 1)
							self_ref.loaded_count++;
						if (self_ref.loaded_count == self_ref.brush_names.length){
							onload_continuation();
						}
					}
				}
				brush_obj.sizes = sizes;
				this.brushes.push(brush_obj);
			}
			else if (type == "stamp"){
				var temp_img = new Image();
				temp_img.src = "brushes/" + name + "/" + j + ".png";
				var brush_name = name + j;
				
				var brush_obj = {
					img: temp_img, 
					name: brush_name, 
					size: this.brush_sizes[i],
					type: type, 
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