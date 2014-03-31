package com.meow.kittypaintdev.server;

import java.net.ServerSocket;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.codec.binary.Base64;
import com.meow.kittypaintdev.DrawrServerMap;

public class DrawrServer { 
	String host = ""; //"127.0.0.1"
	int port = 27182; //80
	
	public long utc_now(){
		return Math.round(System.currentTimeMillis()*1000);
	}
	
	/***************
	** HTTP STUFF **
	***************/
	public String parse_path(String p){
		String reg = "^([a-z]+:\/\/[^\/]*)?\/*(?P<path>.*)$";
		Pattern pat = Pattern.compile(reg);
		Matcher m = pat.matcher(p);
		return m.group("path");
	}
	
	public HashMap parse_headers(String headers_str){
		//sexy regex thx to http://stackoverflow.com/questions/4685217/parse-raw-http-headers
		HashMap headers = new HashMap();
		String reg = "(?P<name>.*?): ?(?P<value>.*?)\r?\n";
		Pattern pat = Pattern.compile(reg);
		Matcher m = pat.matcher(headers_str);
		while (m.find()){
			headers.put(m.group("name"), m.group("value"));
		}
		return headers;
	}
	
	public HashMap form_resp_headers(int body_len, String mime){
		if (StringUtils.isBlank(mime)) mime = "text/html; charset=utf-8";
		HashMap headers = new HashMap();
		headers.put("Content-Type", mime);
		headers.put("Content-Length", "" + body_len);
		headers.put("Access-Control-Allow-Origin", "*");
		headers.put("Cache-Control", "no-cache, no-store, must-revalidate");
		headers.put("Pragma", "no-cache");
		headers.put("Expires", "0");
		headers.put("Connection", "close");
		return headers;
	}
	
	public String form_header_str(HashMap headers){
		String str = "";
		Iterator<Map.Entry<String, String>> it = headers.entrySet().iterator();
		
		while(it.hasNext()){
			Map.Entry<String, String> entry = it.next();
			str += entry.getKey() + ": " + entry.getValue() + "\r\n";
		}
		return str;
	}
	
	/********************
	** WEBSOCKET STUFF **
	********************/
	public byte[] hash_websocket_key(String key){
		MessageDigestPasswordEncoder encoder = new MessageDigestPasswordEncoder("SHA");
		String magic_string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
		return Base64.encodeBase64(encoder.encodePassword(key + magic_string, ""));
	}
	
	/*public ??? make_websocket_frame(??? message){
		//http://stackoverflow.com/questions/8125507/how-can-i-send-and-receive-websocket-messages-on-the-server-side
	}*/

	/***********
	** SERVER **
	***********/
	/*public class DrawrHandler extends ??? {
	}*/

	public static void main(String[] args) {
		// TODO Auto-generated method stub
	}
}
