function toggleAutoHideUI(){
	auto_hide_ui = !auto_hide_ui;
	if ($("auto_hide_ui").className === "select_box"){
		$("auto_hide_ui").className = "selected_box";
		$("auto_hide_ui").style.background = "url('slime/brushes/hide.png')";
	}else{
		$("auto_hide_ui").className = "select_box";
		$("auto_hide_ui").style.background = "url('slime/brushes/unhide.png')";
	}
}

function debug_toggle(){
        if(!DEBUG_MODE_GLOBAL){
            DEBUG_MODE_GLOBAL = 1;
            $("debug_toggle").style.background = "url('slime/brushes/debug.png')";
			$("debug_toggle").className = "selected_box";
        }else{
            DEBUG_MODE_GLOBAL = 0;
            $("debug_toggle").style.background = "url('slime/brushes/bug.png')";
			$("debug_toggle").className = "select_box";
        }
    }
	
function toggleBrushSize(){
	if ($("brush_size_menu").style.display == "none"){
		$("brush_size_menu").style.left = $("brush_size_box").offsetLeft;
		$("brush_size_menu").style.top = $("brush_size_box").offsetTop + 33;
		$("brush_size_menu").style.display = "block";
		$("brush_size_box").style.border = "1px solid #4444ff";
	}else{
		$("brush_size_menu").style.display = "none";
		$("brush_size_box").style.border = "1px solid black";
	}
}

function toggleBrushSizeOff(){
	if ($("brush_size_menu").style.display != "none"){
		$("brush_size_menu").style.display = "none";
		$("brush_size_box").style.border = "1px solid black";
	}
}

function togglePattern(){
	drawr.togglePattern();
	stampdrawr.togglePattern();
	if ($("pattern_box").className == "select_box"){
		$("pattern_box").className = "selected_box";
	}else{
		$("pattern_box").className = "select_box";
	}
}

function toggleBlend(){
	drawr.toggleBlend();
	stampdrawr.toggleBlend();
	if ($("blend_box").className == "select_box"){
		$("blend_box").className = "selected_box";
	}else{
		$("blend_box").className = "select_box";
	}
}

function toggleZoom(){
	if ($("stampcanvas").style.display == "none"){
		if ($("zoom_menu").style.display == "none"){
			$("zoom_menu").style.left = $("zoom_box").offsetLeft;
			$("zoom_menu").style.top = $("zoom_box").offsetTop + 33;
			$("zoom_menu").style.display = "block";
			$("zoom_box").style.border = "1px solid #4444ff";
		}else{
			$("zoom_menu").style.display = "none";
			$("zoom_box").style.border = "1px solid black";
		}
	}
	
	else{
		if ($("stamp_zoom_menu").style.display == "none"){
			$("stamp_zoom_menu").style.left = $("zoom_box").offsetLeft;
			$("stamp_zoom_menu").style.top = $("zoom_box").offsetTop + 33;
			$("stamp_zoom_menu").style.display = "block";
			$("zoom_box").style.border = "1px solid #4444ff";
		}else{
			$("stamp_zoom_menu").style.display = "none";
			$("zoom_box").style.border = "1px solid black";
		}
	}
}

function toggleZoomOff(){
	if ($("stampcanvas").style.display == "none"){
		if ($("zoom_menu").style.display != "none"){
			$("zoom_menu").style.display = "none";
			$("zoom_box").style.border = "1px solid black";
		}
	}
	
	else{
		if ($("stamp_zoom_menu").style.display != "none"){
			$("stamp_zoom_menu").style.display = "none";
			$("zoom_box").style.border = "1px solid black";
		}
	}
}

function toggleSize(){
	if ($("size_menu").style.display == "none"){
		$("size_menu").style.left = $("size_box").offsetLeft;
		$("size_menu").style.top = $("size_box").offsetTop + 33;
		$("size_menu").style.display = "block";
		$("size_box").style.border = "1px solid #4444ff";
	}else{
		$("size_menu").style.display = "none";
		$("size_box").style.border = "1px solid black";
	}
}

function toggleSizeOff(){
	if ($("size_menu").style.display != "none"){
		$("size_menu").style.display = "none";
		$("size_box").style.border = "1px solid black";
	}
}

function minimizeUI(){
	dui = $("drawr_ui");
	mdui = $("minimized_ui");
	if (dui.style.display != "none"){
		dui.style.display = "none";
		mdui.style.display = "block";
	}
}

function toggleStampUI(){
	turnOffStampErase();
	fixZoom();
	toggleSizeOff();
	toggleZoomOff();
	if ($("stampcanvas").style.display != "none"){
		$("stampcanvas").style.display = "none";
		$("stamp_options").style.display = "none";
		
		$("kittycanvas").style.display = "block";
	}else{
		$("stampcanvas").style.display = "block";
		$("stamp_options").style.display = "block";
		
		$("kittycanvas").style.display = "none";
	}
}

function toggleMinimizeUI(){
	a = $("adv_tab");
	dui = $("drawr_ui");
	mdui = $("minimized_ui");
	toggleSizeOff();
	toggleZoomOff();
	if (dui.style.display == "none"){
		dui.style.display = "block";
		mdui.style.display = "none";
	}else if (a.style.display != "none"){
		a.style.display = "none";
	}else{
		dui.style.display = "none";
		mdui.style.display = "block";
	}
}

function toggleAdv(){
	a = $("adv_tab");
	toggleSizeOff();
	toggleZoomOff();
	if(a.style.display != "none"){
		a.style.display = "none";
	}else{
		a.style.display = "inline";
	}
}

function toggleStampErase(){
	if ($("stamp_erase_box").className == "select_box"){
		turnOffEyeDrop();
		drawr.eye_drop = false;
		stampdrawr.eye_drop = false;
		stampdrawr.toggleStampErase();
		$("stamp_erase_box").className = "selected_box";
		
		for (var i=0; i<current_brushes.length;++i){
			brush_boxes[i].className = "select_box";
		}
		$("color_box").className = "disabled_select_box";
		$("color_box").type="";
		$("color_box").value="";
		$("color_box").readOnly = true;
		$("color_box").style.backgroundColor = "#888888";
		
		$("eyedrop_box").className = "disabled_select_box";
		$("eyedrop_box").readOnly = true;
		$("eyedrop_box").background = "url('slime/brushes/eyedropdisabled.png')";
	}else{
		turnOffStampErase();
	}
}

function turnOffStampErase(){
	if ($("stamp_erase_box").className == "selected_box"){
		stampdrawr.toggleStampErase();
		$("stamp_erase_box").className = "select_box";
		selectBrush(brush_index);
	}
}

function toggleEyeDrop(){
	if ($("eyedrop_box").className == "select_box"){
		stampdrawr.toggleEyeDrop();
		drawr.toggleEyeDrop();
	
		$("eyedrop_box").className = "selected_box";
		for (var i=0; i<current_brushes.length;++i){
			brush_boxes[i].className = "select_box";
		}
	}else{
		turnOffEyeDrop();
	}	
}

function turnOffEyeDrop(){
	if ($("eyedrop_box").className == "selected_box"){
		stampdrawr.toggleEyeDrop();
		drawr.toggleEyeDrop();
	
		$("eyedrop_box").className = "select_box";
		selectBrush(brush_index);
	}
}