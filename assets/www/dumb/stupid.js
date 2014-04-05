
/* stupid
var js = document.createElement("script");
js.type = "text/javascript";
js.src = "dumb/stupid.js";
document.body.appendChild(js);
draw_img("http://i.imgur.com/ozMYFdX.png");
*/


function get_image(url, continuation){
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    
    img.onload = function(){
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img,0,0);
        continuation(canvas);
        /*var dataURL = canvas.toDataURL("image/png");
        var newimg = new Image();
        newimg.src = dataURL;
        newimg.onload = function(){
            callback(dataURL);
        }*/
    }
}

function closest_color(colors, color){
    var mini = 0;
    var mindist = 256*256*256;
    for(var i=0; i<colors.length; ++i){
        var r = colors[i].r - color.r;
        var g = colors[i].g - color.g;
        var b = colors[i].b - color.b;
        var thisdist = Math.sqrt(r*r + g*g + b*b);
        if(thisdist < mindist){
            mini = i;
            mindist = thisdist;
        }
    }
    return mini;
}

function make_some_colors(whatever){
    //var whatever = 64;
    var crap = [];
    for(var r=0;r<256;r+=whatever){
        for(var g=0;g<256;g+=whatever){
            for(var b=0;b<256;b+=whatever){
                crap.push({r:r,g:g,b:b});
            }
        }
    }
    return crap;
}

function brush_maek(img, color){
    var brush_obj = {
        img: img,
        name: "circle",
        sizes: [1],
        sized_images: [img],
        color: color,
        type: "brush",
        loaded: 1
    }
    return brush_obj;
}

function draw_img(url, offsetthings, whatever){
    offsetthings = offsetthings || 0;
    whatever = whatever || 64;
    
    var stupid = new Image();
    stupid.src = "brushes/circle/1.png";
    stupid.onload = function(){
        var dumb_brushes = [];
        var cs = make_some_colors(whatever);//brushes.named_colors
        for(var i=0; i<cs.length; ++i){
            var asdf = brush_maek(DrawrBrushes.setImageColor(stupid, 1, cs[i].r, cs[i].g, cs[i].b), cs[i]);
            dumb_brushes.push(asdf);
        }
        console.log(cs.length +"|"+ dumb_brushes.length);

        get_image(url, function(canvas){
            var ctx = canvas.getContext("2d");
            var img_data = ctx.getImageData(0,0,canvas.width,canvas.height);
            
            for (var i = 0; i < img_data.data.length; i+= 4){
                var r = img_data.data[i];
                var g = img_data.data[i+1];
                var b = img_data.data[i+2];
                var mini = closest_color(cs, {r:r,g:g,b:b});
                //var x = (i/4) % (canvas.width*2);
                //var y = Math.floor((i/1)/(canvas.width*2));
                var x = (i/4) % (canvas.width);
                var y = Math.floor((i/4)/(canvas.width));
                var extra_offset = offsetthings * canvas.width;
                drawr.drawr_map.addPoint(x+300 + extra_offset,y+300,dumb_brushes[mini],1);
            }
        });
    }
}

function draw_pretty(url){
    var ugh = 0;
    for(var i=32; i<128; i+=8){
        draw_img(url, ugh, i);
        ugh++;
    }
}