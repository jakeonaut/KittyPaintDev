package com.meow.kittypaintdev;


import android.os.Build;
import android.os.Build.VERSION_CODES;
import android.os.Bundle;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.view.Menu;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class KittyPaint extends Activity {

	@SuppressLint({ "SetJavaScriptEnabled", "NewApi" })
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_kitty_paint);

		WebView mainWebView = (WebView) findViewById(R.id.main_webview);
		WebSettings webSettings = mainWebView.getSettings();
		webSettings.setJavaScriptEnabled(true);
		
		if (Build.VERSION.SDK_INT >= VERSION_CODES.JELLY_BEAN) 
			  mainWebView.getSettings().setAllowUniversalAccessFromFileURLs(true);
		
		//mainWebView.setInitialScale(100);
		
		mainWebView.addJavascriptInterface(new WebAppInterface(this), "Android");
		mainWebView.loadUrl("file:///android_asset/www/index.html");
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.kitty_paint, menu);
		return true;
	}

}
