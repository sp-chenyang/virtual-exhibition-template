package com.example.helloworld;//HelloWorld为project名称

import android.os.Bundle;
import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.view.Menu;
import org.apache.cordova.*;//调用cordova.3.0.0.jar包的接口

public class MainActivity extends DroidGap { 
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);//设置设备横屏显示
	    super.loadUrl("file:///android_asset/www/index.html");//加载index.html页面
	}


}