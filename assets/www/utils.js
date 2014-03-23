
/*** utils.js V1.0 ***/

function drawCircle(ctx,color,x,y,r){
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI);
    ctx.stroke()
}
function fillCircle(ctx,color,x,y,r){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI);
    ctx.fill();
}

function drawLine(ctx, color, x1, y1, x2, y2, thickness, cap){
    cap = cap || "round";
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.lineCap = cap;
    ctx.stroke();
}

function hypot(x,y){
    return Math.sqrt(x*x + y*y);
}

function mod(m, n) {
    return ((m % n) + n) % n;
}

function now(){
    return (new Date)*1;
}

function replaceColor(ctx, old_r, old_g, old_b, n_r, n_g, n_b, ){
    var pixels = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    for(var i=0; i<imageData.data.length; i+=4){
        if(pixels.data[i]==old_r && pixels.data[i+1]==old_g && pixels.data[i+2]==old_b){
              imageData.data[i] = n_r;
              imageData.data[i+1] = n_g;
              imageData.data[i+2] = n_b;
        }
    }
    ctx.putImageData(pixels,0,0);
}

// http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
function padl(n, width, z){
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}