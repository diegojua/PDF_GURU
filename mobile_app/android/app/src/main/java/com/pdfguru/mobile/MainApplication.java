package com.pdfguru.mobile;

import android.app.Application;
import android.content.res.Configuration;
import androidx.annotation.NonNull;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;

import expo.modules.ApplicationLifecycleDispatcher;
import expo.modules.ExpoReactHostFactory;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  @Override
  public ReactHost getReactHost() {
    return ExpoReactHostFactory.getDefaultReactHost(
      getApplicationContext(),
      new PackageList(this).getPackages()
    );
  }

  @Override
  public void onCreate() {
    super.onCreate();
    ApplicationLifecycleDispatcher.onApplicationCreate(this);
  }

  @Override
  public void onConfigurationChanged(@NonNull Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig);
  }
}
