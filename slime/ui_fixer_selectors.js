function fixSelectedBrush(){
	if (brush_index >= current_brushes.length){
		for (var i=0; i<brush_boxes.length;++i){
			if (i < current_brushes.length){
				brush_index = i;
			}else{
				brush_boxes[i].className = "disabled_select_box";
			}
		}
	}else{
		for (var i=current_brushes.length-1; i < brush_boxes.length;++i){
			brush_boxes[i].className = "disabled_select_box";
		}
	}
}

function selectBrush(index){
	if (index >= current_brushes.length) return;
	for (var i=0; i<current_brushes.length;++i){
		brush_boxes[i].className = "select_box";
	}
	
	brushes.selectBrush(index+(num_available_brush_boxes*brush_box_page));
	brush_boxes[index].className = "selected_box";
	$("minimized_brush_box").style.background = brush_boxes[index].style.background;
	brush_index = index;
		
	fixBrushSize();
	fixBrushColorEdit();
	turnOffStampErase();
	turnOffEyeDrop();
	
	drawr_client.setBrush(brushes); // abstract this better maybe
}

function clearCanvas() {
	drawr.clear();
	document.querySelector("#clear_box").style.background = "url('slime/brushes/unhide.png')";
}

function stopClearingCanvas() {
	document.querySelector("#clear_box").style.background = "url('slime/brushes/hide.png')";
}

function fixBrushSize(){
	for (var i=0; i<size_boxes.length; ++i){
		size_boxes[i].style.display = "block";
	}
	var brush = brushes.getBrush();
	if (brush.type == "stamp"){
		var index = 1;
		size_boxes[0].style.display = "none";
		if (brush.img.width >= 8){ 
			index = 2;
			size_boxes[1].style.display = "none";
		}
		if (brush.img.width >= 16){ 
			index = 3;
			size_boxes[2].style.display = "none";
		}
		if (brush.img.width >= 32){ 
			index = 4;
			size_boxes[3].style.display = "none";
		}
	
		if (brush_size < brush.img.width){
			brush_size = brush.img.width;
			brush_size_index = index;
		}
	}
	selectBrushSize(brush_size_index, brush_size);
}

function selectBrushSize(index, size){
	var brush = brushes.getBrush();
	if (brush.type == "stamp"){
		if (size < brush.img.width) return;
	}
	$("brush_size_box").innerHTML = size;
	brush_size_index = index;
	brush_size = size;
	brushes.setBrushSize(size);
}

function fixBrushColorEdit(){
	var edit_color = $("color_box");
	var eyedrop = $("eyedrop_box");
	var brush = brushes.getBrush();
	if (brush.type == "brush"){
		edit_color.className = "select_box";
		edit_color.type="color";
		edit_color.value = rgbToHex(brush.color.r, brush.color.g, brush.color.b);
		edit_color.readOnly = false;
		edit_color.style.backgroundColor = ""+edit_color.value;
		
		if (eyedrop.className == "disabled_select_box"){
			eyedrop.className = "select_box";
			eyedrop.readOnly = false;
			eyedrop.style.background = "url('kittypaint/brushes/eyedrop.png')";
		}
	}else if (brush.type == "stamp"){
		edit_color.className = "disabled_select_box";
		edit_color.type="";
		edit_color.value="";
		edit_color.readOnly = true;
		edit_color.style.backgroundColor = "#888888";
		
		turnOffEyeDrop();
		eyedrop.className = "disabled_select_box";
		eyedrop.readOnly = true;
		eyedrop.style.background = "url('kittypaint/brushes/eyedropdisabled.png')";
	}
}

function editColor(){
	var brush = brushes.getBrush();
	if (brush.type == "stamp") return false;		
	
	var color = hexToRgb($("color_box").value);
	
	var r = color.r;
	var g = color.g;
	var b = color.b;
	
	r > 255 && (r = 255) || r < 0 && (r = 0);
	g > 255 && (g = 255) || g < 0 && (g = 0);
	b > 255 && (b = 255) || b < 0 && (b = 0);
	
	DrawrBrushes.setBrushColor(brush, r, g, b);
	brush_boxes[brush_index].style.background = "url('" + brush.sized_images[4].src + "') no-repeat center";
	$("minimized_brush_box").style.background = brush_boxes[brush_index].style.background;
	fixBrushColorEdit();
}

function select_zoom(selected_zoom){
	zoom = selected_zoom;
	$("zoom_box").innerHTML = zoom;
	drawr.changePixelScale(zoom);
	drawr.loadNearbyChunks();
	$("zoom_menu").blur();
	$("kittycanvas").focus();
	
	if (zoom < 1){
		$("kittycanvas").style.cursor = "not-allowed";
	}else{ $("kittycanvas").style.cursor = "default";
	}
}

function select_stamp_zoom(zoom){
	stamp_zoom = zoom;
	$("zoom_box").innerHTML = zoom;
	stampdrawr.changePixelScale(zoom);
	$("stamp_zoom_menu").blur();
	$("stampcanvas").focus();
}

function select_size(size){
	$("size_box").innerHTML = size;
	stampdrawr.changeCanvasSize(size);
	$("size_menu").blur();
	$("stampcanvas").focus();
}

function setBrushBoxes(){
	current_brushes = [];
	var brush_list = brushes.getBrushes();
	for (var i=0; i<num_available_brush_boxes;++i){
		var real_brush_index = i+(num_available_brush_boxes*brush_box_page);
		if (real_brush_index < brush_list.length){
			var brush = brush_list[real_brush_index];
			current_brushes.push(brush);
			
			if (brush.type == "brush"){
				brush_boxes[i].style.background = "url('" + brush.sized_images[4].src + "') no-repeat center";
			}else if (brush.type == "stamp"){
				brush_boxes[i].style.background = "url('"+brush.img.src+"') no-repeat center";
			}
		}else{
			brush_boxes[i].style.background = "";
		}
	}
	if ($("stamp_erase_box").className !== "selected_box"){
		fixSelectedBrush();
		selectBrush(brush_index);
		selectBrushSize(brush_size_index, brush_size);
	}
}

function fixZoom(){
	if ($("stampcanvas").style.display !== "none"){
		$("zoom_box").innerHTML = zoom;
	}
	
	else{
		$("zoom_box").innerHTML = stamp_zoom;
	}
}