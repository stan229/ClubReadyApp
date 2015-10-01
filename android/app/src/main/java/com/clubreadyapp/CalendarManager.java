package com.clubreadyapp;

/**
 * Created by stan229 on 9/30/15.
 */

import android.content.Intent;
import android.provider.CalendarContract;
import android.provider.ContactsContract;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;


public class CalendarManager extends ReactContextBaseJavaModule {
    public CalendarManager(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "CalendarManager";
    }

    @ReactMethod
    public void addEvent(String name, String date, String location, String instructor) {
        Date dateObj = null;
        try {
            dateObj = parseDate(date);
        } catch (ParseException e) {
            e.printStackTrace();
        }

        if (dateObj != null) {
            Calendar beginTime = Calendar.getInstance();
            beginTime.setTime(dateObj);

            Calendar endTime = Calendar.getInstance();
            endTime.setTime(dateObj);
            endTime.add(Calendar.HOUR, 1);


            Intent intent = new Intent(Intent.ACTION_INSERT)
                    .setData(CalendarContract.Events.CONTENT_URI)
                    .putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, beginTime.getTimeInMillis())
                    .putExtra(CalendarContract.EXTRA_EVENT_END_TIME, endTime.getTimeInMillis())
                    .putExtra(CalendarContract.Events.TITLE, name)
                    .putExtra(CalendarContract.Events.EVENT_LOCATION, location)
                    .putExtra(CalendarContract.Events.DESCRIPTION, instructor)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);


            getReactApplicationContext().getApplicationContext().startActivity(intent);
        }
    }

    private Date parseDate(String dateString) throws ParseException {
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");


        if (dateString.endsWith("Z")) {
            dateString = dateString.substring(0, dateString.length() - 1) + "GMT-00:00";
        } else {
            int inset = 6;

            String s0 = dateString.substring(0, dateString.length() - inset);
            String s1 = dateString.substring(dateString.length() - inset, dateString.length());

            dateString = s0 + "GMT" + s1;
        }

        return df.parse(dateString);

    }
}
