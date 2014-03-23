


function DrawrBrushes(onload_continuation){
    this.brushes = [];
    this.brush_names = ["circle1", "circle4","circle8","circle16","circle32","bar8"];
    this.stamp_names = ["kappa32", "cathead32"];
    this.brush_widths = [1,4,8,16,32,8];
    this.stamp_widths = [32,32];
    this.selected_brush = 0;
    this.loaded_count = 0;
    
    this.named_colors = [
        {name: "black", r: 0, g: 0, b: 0},
        {name: "orange", r: 255, g: 107, b: 53},
        {name: "white", r: 255, g: 255, b: 255}
    ];
    
    // load brushes in named colors
    for(var i=0; i<this.brush_names.length; ++i){
        var temp_img = new Image();
        temp_img.src = "brushes/" + this.brush_names[i] + ".png";
        var brush_obj = {
            img: temp_img, 
            name: this.brush_names[i], 
            color: color, 
            size: this.brush_widths[i], 
            loaded: 0
        };
        
        var self_ref = this;
        temp_img.onload = function(){
            brush_obj.loaded = 1;
            self_ref.loaded_count++;
            
            // load all other colors of this brush
            self_ref.loadNamedColorsOfBrush(temp_img,....)
            
            if(self_ref.loaded_count == self_ref.filenames.length){
                onload_continuation();
            }
        }
        this.brushes.push(brush_obj);
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