package com.clubreadyapp;

import android.app.Activity;
import android.app.DialogFragment;
import android.os.Bundle;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

/**
 * Created by stan229 on 10/6/15.
 */
public class AlertManager extends ReactContextBaseJavaModule {
    private Activity activity;

    public AlertManager(ReactApplicationContext context, Activity activity) {
        super(context);
        this.setActivity(activity);
    }

    @Override
    public String getName() {
        return "AlertManager";
    }

    @ReactMethod
    public void showAlert(String title, String message, ReadableArray buttons, final Callback buttonCallback) {
        AlertDialogFragment dialog = new AlertDialogFragment();

        Bundle arguments = new Bundle();

        arguments.putString("title", title);
        arguments.putString("message", message);
        this.parseButtonLabels(arguments, buttons);

        dialog.setArguments(arguments);
        dialog.setButtonCallback(buttonCallback);

        dialog.show(this.getActivity().getFragmentManager(), "AlertDialog");
    }

    private void parseButtonLabels(Bundle arguments, ReadableArray buttons) {

        for (int i = 0; i < buttons.size(); i++) {
            arguments.putString(this.getButtonKey(i), buttons.getString(i));
        }

    }

    private String getButtonKey(int buttonIndex) {

        switch (buttonIndex) {
            case 0:
                return "positiveButton";
            case 1:
                return "negativeButton";
            case 2:
                return "neutralButton";
            default:
                return null;

        }
    }

    public Activity getActivity() {
        return activity;
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

}
