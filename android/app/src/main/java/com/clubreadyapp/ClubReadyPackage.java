package com.clubreadyapp;

/**
 * Created by stan229 on 9/30/15.
 */

import android.app.Activity;

import com.facebook.react.ReactPackage;

import com.clubreadyapp.CalendarManager;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.List;

public class ClubReadyPackage extends MainReactPackage {
    private Activity activity;

    public ClubReadyPackage(Activity activity) {
        super();
        this.setActivity(activity);
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        ArrayList<NativeModule> modules = new ArrayList<NativeModule>(super.createNativeModules(reactContext));
        modules.add(new CalendarManager(reactContext));
        modules.add(new AlertManager(reactContext, activity));
        return modules;
    }

    public Activity getActivity() {
        return activity;
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

}
