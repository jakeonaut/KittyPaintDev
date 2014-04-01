package com.meow.kittypaintdev.server;

import java.net.*;
import java.io.*;

public abstract class BaseServer {
	private ServerSocket serversock;

	public BaseServer(int port){
		serversock = new ServerSocket(port);
	}
	
	public void serve_forever(){
		while(true){
			Socket clientsock = serversock.accept();
			
			try{
				
			    new Thread(){
			    	public void run(){
			    		handle(clientsock);
			    	}
			    }.start();
			    
			}catch(Exception e){
				e.printStackTrace();
			}
		}
	}
	
	abstract private void handle(Socket clientSocket);
	

}
