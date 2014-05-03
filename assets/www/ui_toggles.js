function toggleZoom(){
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

function toggleZoomOff(){
	if ($("zoom_menu").style.display != "none"){
		$("zoom_menu").style.display = "none";
		$("zoom_box").style.border = "1px solid black";
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
	if(a.style.display != "none"){
		a.style.display = "none";
	}else{
		a.style.display = "inline";
	}
}