package com.meow.kittypaintdev.server;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.security.MessageDigest;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.codec.binary.Base64;

public class Utils {
	
	public static long utc_now(){
		return System.currentTimeMillis();
	}
	
	/***************
	** HTTP STUFF **
	***************/
	public static String parse_path(String p){
		String reg = "^([a-z]+:\/\/[^\/]*)?\/*(?P<path>.*)$";
		Pattern pat = Pattern.compile(reg);
		Matcher m = pat.matcher(p);
		return m.group("path");
	}
	
	public static HashMap parse_headers(String headers_str){
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
	
	public static HashMap form_resp_headers(int body_len){
		return form_resp_headers(body_len, "text/html; charset=utf-8");
	}
	
	public static HashMap form_resp_headers(int body_len, String mime){
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
	
	public static String form_header_str(HashMap headers){
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
	public static String hash_websocket_key(String key){
		MessageDigest md = MessageDigest.getInstance("SHA-1");
		String magic_string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
		md.update((key + magic_string).getBytes("UTF-8"));
		return Base64.encodeBase64String(md.digest());
	}
	
	public static byte[] make_websocket_frame(String message){
		//http://stackoverflow.com/questions/8125507/how-can-i-send-and-receive-websocket-messages-on-the-server-side
		
		byte[] msg = message.getBytes("UTF-8");
		ByteArrayOutputStream frame = new ByteArrayOutputStream();
		frame.write(129);
		
		// write the message length
		if(msg.length <= 125){
			frame.write(msg.length);
		}else if(msg.length <= 65535){
			frame.write(126);
			frame.write((msg.length >> 8) & 255);
			frame.write(msg.length & 255); 
		}else{
			frame.write(127);
			int n;
			for(int i=0; i<8; ++i){
				n = (7 - i) * 8;
				frame.write((msg.length >> n) & 255);
			}
		}
		// write the message
		frame.write(msg);
		
		return frame.toByteArray();
	}
	
	public String read_websocket_frame(InputStream ins){
		if(ins.read() < 0) return null;
		
		// read length
		int length = ins.read() & 127;
		if(length == 126){
			length = ins.read() << 8;
			length += ins.read();
		}else if(length == 127){
			length = 0;
			int n;
			for(int i=0; i<8; ++i){
				n = (7 - i) * 8;
				length += (ins.read() << n) & 255;
			}
		}
		
		// read message masks (THESE ARE STUPID WHY DO THEY EXIST)
		int[] masks = new int[4];
		for(int i=0; i<4; ++i) masks[i] = ins.read();
		
		// read and unmask message
		byte[] msg = new byte[length];
		for(int i=0; i<length; ++i){
			byte bytein = ins.read();
			msg[i] = bytein ^ masks[i % 4];
		}
		
		return new String(msg, "UTF-8");
	}
}
