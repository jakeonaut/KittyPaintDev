

var XHRUniqueUrlId = 0;

function DrawrClient(){
    if("WebSocket" in window){
        this.socket = new WebSocket("ws://localhost:27182/");
        this.socket.onopen = function(){
            this.socket.send("PONY");
            alert("SENT");
        };
        this.socket.onmessage = function(e){
            var rec_msg = evt.data;
            alert("messagerino + " + rec_msg);
        };
        this.socket.onclose = function(e){
            alert("ded ;-;");
        };
    }
}

function loadJSON(uri_string, handler){
    var http_request = new XMLHttpRequest();
    
    http_request.onreadystatechange = function(){
        if(http_request.readyState == 4){
            if(http_request.status == 200){
                // decodeURI because it's stored on the server as the URI encode that we sent it
                document.getElementById("debug").innerHTML = http_request.responseText;
                var jsonObj = JSON.parse(decodeURI(http_request.responseText));
                //var jsonObj = http_request.responseText; //return plaintext for now (drawobject.js handles deserialize)
                handler(jsonObj);
            }else{
                document.getElementById("debug").innerHTML = "status: " + http_request.status + "#" + loadJsonUniqueUrlId;
            }
        }
    };
    loadJsonUniqueUrlId++;
    if(uri_string.indexOf("?") >= 0){
        uri_string = uri_string.replace(/\?/, "?" + loadJsonUniqueUrlId + "&");
    }else{
        uri_string += "?" + loadJsonUniqueUrlId;
    }
    http_request.open("GET", uri_string, true);
    http_request.send();
    
    /*loadJsonUniqueUrlId++;
    if(uri_string.indexOf("?") >= 0){
        uri_string = uri_string.replace(/\?/, "?" + loadJsonUniqueUrlId + "&");
    }else{
        uri_string += "?" + loadJsonUniqueUrlId;
    }
    
    setTimeout(function(){
        var response = Android.loadJSON(uri_string);
        try{
            var jsonObj = JSON.parse(decodeURI(response));
            handler(jsonObj);
        }catch(err){
            document.getElementById("debug").innerHTML = response + "#" + loadJsonUniqueUrlId;
        }
    }, 0);*/
}
    
    ///////// DO THINGS ABOUT THIS !!!!
    function post_drawr_object(drawr_obj){
        url_post = get_server() + "/post?" + get_room() + "&" + drawr_obj.serialize();
        loadJSON(url_post, function(jsonObj){
            newest_id = 1 * jsonObj;
            debug.innerHTML += "id: " + newest_id + ",";
        });
    }