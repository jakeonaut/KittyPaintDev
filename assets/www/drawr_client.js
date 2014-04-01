

function DrawrClient(server){
    this.server = server || "localhost:27182";
    
    if("WebSocket" in window){
        this.socket = new WebSocket("ws://" + this.server);
        var self = this;
        
        this.socket.onopen = function(){
            //this.socket.send("PONY");
            //alert("SENT");
            console.log("DrawrClient: connected to " + self.server);
        };
        this.socket.onclose = function(e){
            alert("server connection closed");
        };
        this.socket.onerror = function(e){
            console.log(e.toString());
            // disconnect + reconnect?
        };
        
        this.socket.onmessage = function(e){
            var rec_msg = e.data.replace(/<.*?>/g,"");
            console.log("DrawrClient recv: " + rec_msg);
        };
        
        this.ping_timer = setInterval(function(){ self.sendPing(); }, 5000);
    }
}

DrawrClient.prototype.getServer = function(){
    return this.server;
}

DrawrClient.prototype.isConnected = function(){
    return this.socket.readyState == 1;
}

DrawrClient.prototype.sendPing = function(){
    if(this.isConnected()){
        this.socket.send("PING");
    }else{
        console.log("PING: not connected - STOPPING");
        clearInterval(this.ping_timer);
    }
}

DrawrClient.prototype.setBrush = function(brush, size){
    if(this.isConnected()){
        if(!size){
            size = brush.getBrushSize();
            brush = brush.getBrush();
        }
        var path = DrawrBrushes.brushToPath(brush, size);
        var rgb = brush.color.r + ":" + brush.color.g + ":" + brush.color.b;
        this.socket.send("SETBRUSH:" + path + ":" + size + ":" + rgb);
    }else{
        console.log("SETBRUSH: not connected");
    }
}

DrawrClient.prototype.addPoint = function(numx, numy, localx, localy, brush, size){
    if(this.isConnected()){
        if(brush){
            if(!size){
                size = brush.getBrushSize();
                brush = brush.getBrush();
            }
            var chunk = numx + ":" + numy;
            var loc = localx + ":" + localy;
            var path = DrawrBrushes.brushToPath(brush, size);
            var rgb = brush.color.r + ":" + brush.color.g + ":" + brush.color.b;
            this.socket.send("ADDPOINTBR:" + chunk + ":" + loc + ":" + path + ":" + size + ":" + rgb);
        }else{
            var chunk = numx + ":" + numy;
            var loc = localx + ":" + localy;
            this.socket.send("ADDPOINT:" + chunk + ":" + loc);
        }
    }else{
        console.log("SETBRUSH: not connected");
    }
}

DrawrClient.prototype.setViewPort = function(numx1, numy1, numx2, numy2){
    if(this.isConnected()){
        this.socket.send("UPDATESFOR:" + numx1 + ":" + numy1 + ":" + numx2 + ":" + numy2);
    }else{
        console.log("SETBRUSH: not connected");
    }
}

/////////////////

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