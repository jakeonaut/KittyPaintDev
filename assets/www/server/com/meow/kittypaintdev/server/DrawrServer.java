package com.meow.kittypaintdev.server;

import java.io.BufferedReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.HashMap;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.codec.binary.Base64;
import com.meow.kittypaint.server.DrawrServerMap;
import com.meow.kittypaint.server.BaseServer;

private class DrawrHandler {
	private static int unique_conn_id = 0;
	public static int socket_timeout = 60000; // 60 seconds i guess
	
	private Socket clientsock;
	private InputStream rstream;
	private BufferedReader rreader;
	private OutputStream wstream;
	private PrintWriter wwriter;
	private boolean verbose;
	private boolean close_connection;
	private int conn_id;
	private String client_addr;
	
	private String path;
	private HashMap<String,String> headers;
	
	public DrawrHandler(Socket cs, boolean v){
		clientsock = cs;
		client_addr = cs.getRemoteSocketAddress().toString();
		verbose = v;
		rstream = cs.getInputStream();
		wstream = cs.getOutputStream();
		rreader = new BufferedReader(new InputStreamReader(rstream));
		wwriter = new PrintWriter(wstream, true);
		cs.setSoTimeout(socket_timeout);
	}
	
	public void log(String msg){
		if(verbose){
			System.out.println(conn_id + "|" + msg);
		}
	}
	
	public void handle(){
		close_connection = false;
		conn_id = unique_conn_id;
		unique_conn_id++;
		
		log("**CONNECT: " + client_addr);
		
		while(!close_connection){
			handle_one_request();
		}
		
		log("**CLOSED: " + client_addr);
		clientsock.close(); // ?
	}
	
	public void handle_one_request(){
		String line = rreader.readLine();
		if(line == null) return; // END OF STREAM
		line = line.trim();
		
		String[] words = line.split(" ");
		
		if(words.length != 2 && words.length != 3){
			send_error(404, "Invalid Request");
			return;
		}
		
		String command = words[0];
		path = words[1];
		
		if(command.equals("GET")){
			read_request_handlers();
			route();
		}else{
			send_error(404, "Invalid Request - only GET supported");
		}
	}
	
	public void read_request_handlers(){
		String headers_str = "";
		while(true){
			String line = rreader.readLine();
			if(line == null) return; // END OF STREAM
			if(line.trim().equals("")){
				break; // blank line, finished reading headers
			}
			headers_str += line;
		}
		headers = Utils.parse_headers(headers_str);
	}
	
	public void route(){
		String just_path = Utils.parse_path(path);

		Pattern pat = Pattern.compile("(?P<path>[a-z]*)\??(?P<query>.*)$");
		Matcher m = pat.matcher(just_path);
		if(!m.matches()){
			send_error("404", "Not Found");
			return;
		}
		String mpath = m.group("path");
		String mquery = m.group("query");
		
		if(mpath.equals("drawr") || mpath.equals("") || headers.containsKey("Upgrade")){
			handle_drawr_session();
		}else if(mpath.equals("chunk")){
			request_chunk(mquery);
		}else{
			send_error("404", "Not Found");
		}
	}
	
	public void request_chunk(String query){
		// TODO: MAKE MORE EFFECIENT. THESE CHUNKS ARE ALL ALREADY LOADED IN THE MAP.
		Pattern pat = Pattern.compile("^(?P<x>[0-9]+)&(?P<y>[0-9]+)");
		Matcher m = pat.matcher(query);

		if(!m.matches()){
			send_error("404", "Not Found");
			return;
		}
		
		String chunk_path = "chunks/chunk" + m.group("x") + "x" + m.group("x") + ".png";
		String blank_path = "chunks/blank.png";
		
		try{
			InputStream in = new FileInputStream(chunk_path);
			send_binary(in);
			in.close();
		}catch(IOException e){
			// chunk not found
			InputStream in = new FileInputStream(blank_path);
			send_binary(in);
			in.close();
			
		}
		close_connection = true;
	}
	
	/******************
	 * SOCKET SESSION *
	 ******************/
	
	public void handle_drawr_session(){
		String key = "";
		if(headers.containsKey("Sec-WebSocket-Key")){
			key = Utils.hash_websocket_key(headers.get("Sec-WebSocket-Key"));
		}
		send_websocket_handshake(key);
		
		send_frame(">pony1");
		send_frame(">VIDEO2");
		send_frame(">gams3");
		
		while(true){
			String m = read_frame();
			if(m == null || m.equals("exit")) break;
			send_frame(StringUtils.join(m.split(""), "<3"));
		}
	}
	
	
	public void send_frame(String msg){
		wstream.write(Utils.make_websocket_frame(msg));
	}
	
	public String read_frame(){
		return Utils.read_websocket_frame(rstream);
	}
	
	/***********
	 * IO'NPUT *
	 ***********/
	
	public void send_response(int code, String httpmsg, String body, String mime){
		String http_resp = "HTTP/1.1 " + code + " " + httpmsg;
		String headers = Utils.form_header_str(Utils.form_resp_headers(body.length(), mime));
		String full_resp = http_resp + "\r\n" + headers + "\r\n" + body;
		
		wwriter.print(full_resp);
	}
	
	public void send_error(int code, String message){
		String body = "error. " + code + " " + message + "\n";
		send_response(code, message, body, "text/html; charset=utf-8")
	}
	
	public void send_response(String body){
		send_response(200, "OK", body, "text/html; charset=utf-8");
	}
	
	public void send_binary(InputStream body){ send_binary(body, "image/png"); }
	public void send_binary(InputStream body, String mime){
		String http_resp = "HTTP/1.1 200 OK";
		String headers = Utils.form_header_str(Utils.form_resp_headers(body.length(), mime));
		String full_resp = http_resp + "\r\n" + headers + "\r\n";
		
		wwriter.print(full_resp);
		// pipe file into wstream
		int n;
		byte[] buffer = new byte[1024];
		while((n = body.read(buffer)) > -1){
			wstream.write(buffer, 0, n);
		}
	}
	
	public void send_websocket_handshake(String accept_key){
		String http_resp = "HTTP/1.1 101 WebSocket Protocol Handshake";
		HashMap<String, String> headers = new HashMap();
		headers.put("Connection", "Upgrade");
		headers.put("Upgrade", "WebSocket");
		if(!accept_key.equals("")){
			headers.put("Sec-WebSocket-Accept", accept_key);
		}
		String full_resp = http_resp + "\r\n" + Utils.form_headers_str(headers) + "\r\n";
		
		wwriter.print(full_resp);
	}
}

public class DrawrServer extends BaseServer{ 
	private static String host = ""; //"127.0.0.1"
	private static int port = 27182; //80
	private static boolean verbose = true;
	

	private void handle(Socket clientsock){
		new DrawrHandler(clientsock).handle();
	}

	public static void main(String[] args) {
		DrawrServer drawrserver = new DrawrServer(port, verbose);
		drawrserver.serve_forever();
	}
}
