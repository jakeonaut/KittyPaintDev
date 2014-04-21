

function draw_as_ascii(ctx_from){
    //drawr.drawr_map.ascii_mode = 1
    
    var tcanvas = document.createElement("canvas");
    var ctx = tcanvas.getContext("2d");
    
    var w = tcanvas.width = ctx_from.canvas.width;
    var h = tcanvas.height = ctx_from.canvas.height;
    
    var font_height = 12; //Math.ceil(w / 16);
    ctx.font = font_height + "px monospace";
    var font_width = ctx.measureText("M").width;
    
    var img_data = ctx_from.getImageData(0, 0, w, h);
    
    for(var x=0; x<w; x += font_width){
        for(var y=0; y<h; y += font_height){
            var dx = font_width;
            if(dx + x > w){
                dx = w % font_width;
            }
            var dy = font_height;
            if(dy + y > h){
                dy = h % font_height;
            }
            var style = style_for_data(img_data, w, x, y, dx, dy);
            
            if(style.ch != " "){
                ctx.fillStyle = style.style;
                ctx.fillText(style.ch, x, y);
            }
        }
    }
    drawLine(ctx, "yellow", 1, 1, w - 1, 1, 1);
    drawLine(ctx, "red", w-1, w-1, w-1, 1, 1);
    drawLine(ctx, "green", 1, 1, 1, w-1, 1);
    drawLine(ctx, "purple", 1, w-1, w-1, w-1, 1);
    return tcanvas;
}

function rgbToHsl(r, g, b){
    // xoxoxo http://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}

function style_for_data(img_data, width, x, y, dx, dy){
    var gradient = ["M","N","D","B","O","Z","$","I","7","?","+","=","~",":",",",".", " "];
    var avg_r = 0;
    var avg_g = 0;
    var avg_b = 0;
    
    for(var i=0; i<dx; ++i){
        for(var j=0; j<dy; ++j){
            var offset = (j+y)*4 * width + (i+x);
            avg_r += img_data.data[offset];
            avg_g += img_data.data[offset+1];
            avg_b += img_data.data[offset+2];
        }
    }
    avg_r /= dx*dy;
    avg_g /= dx*dy;
    avg_b /= dx*dy;
    
    var hsl = rgbToHsl(avg_r, avg_g, avg_b);
    
    var ch_id = Math.min(gradient.length - 1, Math.floor(hsl[1] * gradient.length));
    var ch = gradient[gradient.length - 1 - ch_id]; // gradient is backwards...
    
    //return {style: "hsl(" + hsl[0] + ", 95%, " + hsl[2] + "%)", ch: ch}; // swap s and l
    return {style: "hsl(" + hsl[0] + ", 95%, " + hsl[2] + "%)", ch: ch};
}