var DEBUG_MODE_GLOBAL = 0;
    
var num_brush_boxes = 10;
var num_available_brush_boxes = 10;
var brush_box_page = 0;
var num_brush_box_pages = 0;
var brush_boxes = [];
var num_size_boxes = 5;
var size_boxes = [];
var current_brushes = [];
var brush_index = 0;
var brush_size_index = 2;
var brush_size = 8;
var auto_hide_ui = false;
var zoom = 2;
var stamp_zoom = 32;

for (var i=0; i<num_brush_boxes;++i){
    brush_boxes[i] = $("brush_box"+i);
}
for (var i=0; i<num_size_boxes;++i){
    size_boxes[i] = $("size_box"+i);
}
//TODO:: Update this selectedIndex if we update the zoom select options
/*$("zoom_list").selectedIndex = 1;*/


/******* SETUP *******/
var brushes;
var drawr;
var stampdrawr;

function saveStorage() {
    localStorage.setItem("kittycanvas", drawr.stage.toDataURL());
    console.log("save!");
}

function loadStorage() {
    const startSaving = () => {
        window.setInterval(() => saveStorage(), 1000);
    };

    const dataURL = localStorage.getItem("kittycanvas");
    if (dataURL) {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => {
            console.log("successful load!");
            drawr.drawImage(img);
            startSaving();
        }
    } else {
        startSaving();
    }
}

// main() 
window.onload = () => {
    brushes = new DrawrBrushes(() => {  // maybe we need a loading screen for this
        //Load Brushes
        num_brush_box_pages = Math.ceil(brushes.getBrushes().length / num_available_brush_boxes);
        setBrushBoxes();
    });

    drawr = new KittyDrawr("kittycanvas", brushes, "debug");

    stampdrawr = new StampDrawr("stampcanvas", "ministampcanvas", brushes, "debug");
    if (window.innerWidth < 32*16 || window.innerHeight < 32*16){
        select_stamp_zoom(16);
    }
    
    ui_onresize();
    loadStorage();
}

window.onresize = function(){ 
    ui_onresize(); 
    drawr.screenResizeEvent(); 
    stampdrawr.resize();
}

function ui_onresize(){
    // see if the line of brush boxes wraps around. if so, hide the ones that go too far past the edge, so it stays 1 row.
    var brush_box_row1 = $("brush_box0").offsetTop;
    var s = brush_box_row1 + " ";
    var count_row1_boxes = 1;
    for (var i=1; i<num_brush_boxes;++i){
        var thisbox_top = $("brush_box"+i).offsetTop;
        s += thisbox_top + " ";
        if(thisbox_top == 0 || $("brush_box"+i).style.display == "none"){
            // block is hidden, make it visible to check where its offset would be
            $("brush_box"+i).style.display = "block";
            thisbox_top = $("brush_box"+i).offsetTop;
        }
        if(thisbox_top == brush_box_row1){
            count_row1_boxes++;
            $("brush_box"+i).style.display = "block";
        }else{
            $("brush_box"+i).style.display = "none";
        }
    }

    //hide 1 more brush_box if the arrow button is moved to next line too!
    if($("right_brush_arrow").offsetTop-1 != brush_box_row1){
        if(count_row1_boxes > 2){ // make sure we actually have a button to hide
            count_row1_boxes -= 1;
            $("brush_box"+count_row1_boxes).style.display = "none";
        }
    }
    
    num_available_brush_boxes = count_row1_boxes;
    num_brush_box_pages = Math.ceil(brushes.getBrushes().length/num_available_brush_boxes);
    setBrushBoxes();
}

function showAndroidToast(toast) {
    Android.showToast(toast);
}

/***NOT SETUP***/	
function prevBrushPage(){
    brush_box_page--;
    if (brush_box_page < 0) brush_box_page = num_brush_box_pages-1;
    setBrushBoxes();
}

function nextBrushPage(){
    brush_box_page++;
    if (brush_box_page >= num_brush_box_pages) brush_box_page = 0;
    setBrushBoxes();
}