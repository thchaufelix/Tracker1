package com.cerebro.tracker1.backend.workers;

import android.content.Context;
import android.os.BatteryManager;
import android.os.Build;
import android.telephony.TelephonyManager;

import androidx.annotation.RequiresApi;


public class DeviceScanner {
    Context context;
    TelephonyManager mTelephonyManager;
    BatteryManager mBatteryManager;

    public DeviceScanner(Context context) {
        this.context = context;
    }


    public void initSignalStrength() {
        try {
            mTelephonyManager = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
        } catch (Exception e) {
        }
    }

    public void initBatteryLevel() {
        mBatteryManager = (BatteryManager) context.getSystemService(Context.BATTERY_SERVICE);
    }

    private final String[] simState = {"Unknown State", "No SIM", "PIN Lock", "PUK Lock",
            "NetWork PIN Lock", "Ready"};

    @RequiresApi(api = Build.VERSION_CODES.P)
    public String getSignalStrength() {
        int mSimState = mTelephonyManager.getSimState();
        String ss;
        if (mSimState == 5) {
            ss = String.valueOf(mTelephonyManager.getSignalStrength().getLevel());
        } else {
            ss = simState[mTelephonyManager.getSimState()];
        }
        return ss;
    }

    public String getBatteryLevel() {
        int level = mBatteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
        if (level < 10) {
            return "0";
        }
        if (level < 30) {
            return "1";
        }
        if (level < 60) {
            return "2";
        }
        if (level <= 100) {
            return "3";
        }
        return String.valueOf(level);
    }

    public void start(){
        initSignalStrength();
        initBatteryLevel();
    }

    public void stop(){

    }
}
