


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
    
    // 1 image for each brush, 1 image for every color of every stamp
    this.total_brushes_to_load = this.brush_names.length + this.stamp_names.length * this.named_colors.length;
    
    // load brushes in named colors
    for(var i=0; i<this.brush_names.length; ++i){
        var temp_img = new Image();
        temp_img.src = "brushes/" + this.brush_names[i] + ".png";
        temp_img.crossOrigin = "anonymous";
        
        var self_ref = this;
        temp_img.onload = function(){
            
            // load all other colors of this brush
            self_ref.loadNamedColorsOfBrush(temp_img, i)
            
            if(self_ref.loaded_count == this.total_brushes_to_load){
                onload_continuation();
            }
        }
    }
    
    // load stamps in named colors
    for(var j=0; j<this.named_colors.length; ++j){
        var color = this.named_colors[j];
        for(var i=0; i<this.stamp_names.length; ++i){
            var temp_img = new Image();
            temp_img.src = "brushes/" + color.name + "/" + this.stamp_names[i] + ".png";
            temp_img.crossOrigin = "anonymous";
            
            var self_ref = this;
            temp_img.onload = function(){
                var brush_obj = {
                    img: temp_img, 
                    name: this.stamp_names[i], 
                    color: color.name, 
                    size: this.stamp_widths[i], 
                    loaded: 1
                };
                this.brushes.push(brush_obj);
                
                if(self_ref.loaded_count == this.total_brushes_to_load){
                    onload_continuation();
                }
            }
        }
    }
}

DrawrBrushes.prototype.loadNamedColorsOfBrush = function(brush_mask, brush_index){
    // take black mask icons and load a new brush for each named color
    
    for(var i=0; i<this.named_colors.length; ++i){
        
        var canvas = document.createElement("canvas");
        canvas.width = this.brush_widths[brush_index];
        canvas.height = this.brush_widths[brush_index];
        var ctx = canvas.getContext("2d");
        ctx.drawImage(brush_mask, 0, 0);
        
        var ncolor = this.named_colors[i];
        if(ncolor.name != "black"){
            replaceColor(ctx, 0,0,0, ncolor.r, ncolor.g, ncolor.b);
        }
        
        var brush_obj = {
            img: canvas, 
            name: this.brush_names[brush_index], 
            color: ncolor.name, 
            size: this.brush_widths[brush_index], 
            loaded: 1
        };
        
        this.brushes.push(brush_obj);
    }
    
    self_ref.loaded_count++;
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