package com.clubreadyapp;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.content.DialogInterface;
import android.os.Bundle;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;

import java.util.ArrayList;


/**
 * Created by stan229 on 12/6/15.
 */
public class AlertDialogFragment extends DialogFragment {
    private Callback buttonCallback;

    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        final Callback buttonCallback = this.getButtonCallback();

        Bundle arguments = this.getArguments();

        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());

        builder.setMessage(arguments.getString("message"))
                .setTitle(arguments.getString("title"));

        String positiveButtonLabel = arguments.getString("positiveButton");
        if (positiveButtonLabel != null) {
            builder.setPositiveButton(positiveButtonLabel, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    if (buttonCallback != null) {
                        buttonCallback.invoke("POSITIVE");
                    }
                }
            });
        }

        String negativeButtonLabel = arguments.getString("negativeButton");
        if (negativeButtonLabel != null) {
            builder.setNegativeButton(negativeButtonLabel, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    if (buttonCallback != null) {
                        buttonCallback.invoke("NEGATIVE");
                    }
                }
            });
        }

        String neutralButtonLabel = arguments.getString("neutralButton");
        if (neutralButtonLabel != null) {
            builder.setNeutralButton(neutralButtonLabel, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    if (buttonCallback != null) {
                        buttonCallback.invoke("NEUTRAL");
                    }
                }
            });
        }


        return builder.create();
    }

    public Callback getButtonCallback() {
        return buttonCallback;
    }

    public void setButtonCallback(Callback buttonCallback) {
        this.buttonCallback = buttonCallback;
    }
}
