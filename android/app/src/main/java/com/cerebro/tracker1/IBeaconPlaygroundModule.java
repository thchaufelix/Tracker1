package com.cerebro.tracker1;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.cerebro.tracker1.backend.ForegroundService;
import com.cerebro.tracker1.backend.workers.BeaconScanner;
import com.cerebro.tracker1.worker.LocationWorker;
import com.cerebro.tracker1.services.BeaconScannerJobService;
import com.cerebro.tracker1.ulti.StorageFunction;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Objects;

import pub.devrel.easypermissions.EasyPermissions;
import pub.devrel.easypermissions.PermissionRequest;


public class IBeaconPlaygroundModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static ReactApplicationContext reactContext;
    MyBroadcast myBroadcast = new MyBroadcast();
    private static JobScheduler ForegroundJobScheduler;
    private static JobScheduler ScannerJobScheduler;

    private static boolean mScannerStopped = false;
    private static boolean mForegroundStopped = false;

    public static final int RC_CAMERA_AND_LOCATION = 11224;

    LocationWorker mLocationWorker;


    IBeaconPlaygroundModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        reactContext.addActivityEventListener(this);

        reactContext.registerReceiver(myBroadcast, new IntentFilter(ForegroundService.RECEIVE_ACTION));
        reactContext.registerReceiver(myBroadcast, new IntentFilter(BeaconScanner.RECEIVE_ACTION));

        ForegroundJobScheduler = (JobScheduler) reactContext.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        ScannerJobScheduler = (JobScheduler) reactContext.getSystemService(Context.JOB_SCHEDULER_SERVICE);
    }

    @RequiresApi(api = Build.VERSION_CODES.Q)
    @ReactMethod
    public void checkPermission(){
        String[] perms = new String[0];
        perms = new String[]{
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.READ_PHONE_STATE,
                Manifest.permission.FOREGROUND_SERVICE,
                Manifest.permission.WRITE_EXTERNAL_STORAGE,
                Manifest.permission.VIBRATE,
        };

        EasyPermissions.requestPermissions(
                new PermissionRequest.Builder(Objects.requireNonNull(reactContext.getCurrentActivity()), RC_CAMERA_AND_LOCATION, perms)
                        .setRationale(R.string.camera_and_location_rationale)
                        .setPositiveButtonText(R.string.rationale_ask_ok)
                        .setNegativeButtonText(R.string.rationale_ask_cancel)
                        .setTheme(R.style.my_fancy_style)
                        .build());

    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void updateConfig(String config){
        Intent serviceIntent = new Intent(reactContext.getApplicationContext(), BeaconScanner.class);
        serviceIntent.putExtra("NewConfig", config);
        serviceIntent.putExtra("cmd", "ConfigUpdate");
        reactContext.startForegroundService(serviceIntent);

        Intent serviceIntent2 = new Intent(reactContext.getApplicationContext(), ForegroundService.class);
        serviceIntent2.putExtra("NewConfig", config);
        serviceIntent2.putExtra("cmd", "ConfigUpdate");
        reactContext.startForegroundService(serviceIntent2);
    }

    @ReactMethod
    public void readLog(Callback logContent, Boolean clear){
        String text = StorageFunction.readFileOnInternalStorage(reactContext);

        if (clear){
            StorageFunction.clearOfflineData(reactContext);
        }

        logContent.invoke(text);
    }

    @ReactMethod
    public void writeLog(String message, Boolean append){
        StorageFunction.writeFileOnInternalStorage(reactContext, message, append);
    }


    @ReactMethod
    public void makeToast(String msg) {
        Toast.makeText(reactContext, msg, Toast.LENGTH_SHORT).show();
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void makeUDPRequest(String msg) {
        Intent serviceIntent2 = new Intent(reactContext, ForegroundService.class);
        serviceIntent2.putExtra("cmd", ForegroundService.MAKE_REQUEST);
        serviceIntent2.putExtra("value", msg);
        reactContext.startForegroundService(serviceIntent2);
    }

    @SuppressLint({"MissingPermission", "HardwareIds"})
    @ReactMethod
    public void getDeviceImei(Callback successCallback) {
        String mDeviceIMEI = "000000";
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                mDeviceIMEI = Settings.Secure.getString(reactContext.getContentResolver(), Settings.Secure.ANDROID_ID);


            } else {
                TelephonyManager mTelephonyManager = (TelephonyManager) Objects.requireNonNull(this.getCurrentActivity()).getSystemService(Context.TELEPHONY_SERVICE);
                if (mTelephonyManager.getDeviceId() != null) {
                    mDeviceIMEI = mTelephonyManager.getDeviceId();
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        mTelephonyManager.getImei(1);
                    }
                } else {
                    mDeviceIMEI = Settings.Secure.getString(
                            reactContext.getContentResolver(),
                            Settings.Secure.ANDROID_ID);
                }
            }
        } catch (Exception e) {
            makeToast(String.valueOf(e));
            Log.d("IBeaconModule", "SecurityException" + e);
        }
        makeToast(String.valueOf(mDeviceIMEI));
        successCallback.invoke(String.valueOf(mDeviceIMEI));
    }


    /**
     * Data Emitter
     */

    private class MyBroadcast extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            String mAction = intent.getAction();
            assert mAction != null;


            switch (mAction) {
                /**接收來自UDP回傳之訊息*/
                case ForegroundService.RECEIVE_ACTION:
                    reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("foreground_data", intent.getStringExtra(ForegroundService.RECEIVE_STRING));
                    break;
                case BeaconScanner.RECEIVE_ACTION:
                    reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("scanner_data", intent.getStringExtra(BeaconScanner.RECEIVE_STRING));
                    break;
                case BeaconScanner.CONFIG_UPDATE:
                    reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("config_data", intent.getStringExtra(BeaconScanner.RECEIVE_STRING));
                    break;
            }
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
//    public void setSOS(Callback sosState) {
    public void setSOS() {
        Intent serviceIntent = new Intent(reactContext.getApplicationContext(), ForegroundService.class);
        serviceIntent.putExtra("cmd", "sos");
        reactContext.startForegroundService(serviceIntent);
    }

    /**
     * Foreground Service Function
     */

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void initForeground() {
        Intent serviceIntent = new Intent(reactContext.getApplicationContext(), ForegroundService.class);
        serviceIntent.putExtra("cmd", "init");
        reactContext.startForegroundService(serviceIntent);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void startForeground() {
        Intent serviceIntent = new Intent(reactContext.getApplicationContext(), ForegroundService.class);
        serviceIntent.putExtra("cmd", "start");
        reactContext.startForegroundService(serviceIntent);
        mForegroundStopped = false;
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void stopForeground() {
        Intent serviceIntent = new Intent(reactContext.getApplicationContext(), ForegroundService.class);
        serviceIntent.putExtra("cmd", "stop");
        reactContext.startForegroundService(serviceIntent);
        mForegroundStopped = true;
    }

    /**
     * Looper Function
     */

    private static Boolean getDeviceName() {
        String manufacturer = Build.MANUFACTURER;
        String model = Build.MODEL;
        return manufacturer !="OPPO";
//        if (model.toLowerCase().startsWith(manufacturer.toLowerCase())) {
//            return model;
//        } else {
//            return manufacturer + " " + model;
//        }
    }


    public static void startScannerPeriod() {
        if (!mScannerStopped) {
            ComponentName mServiceComponent = new ComponentName(reactContext, BeaconScannerJobService.class);
//            Log.d("Modal", getDeviceName());
            // set up conditions for the job
            JobInfo task = new JobInfo.Builder(50, mServiceComponent)
                    .setMinimumLatency(2500)
                    .setOverrideDeadline(3500)
                    .setRequiresDeviceIdle(!getDeviceName())
//                .setRequiresCharging(true) // default is "false"
                    .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                    .build();
            // inform the system of the job
//            JobScheduler jobScheduler = (JobScheduler) reactContext.getSystemService(Context.JOB_SCHEDULER_SERVICE);
            ScannerJobScheduler.schedule(task);
        }
    }

    /**
     * Scanner Service Function
     */

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void initScanning() {
        Intent serviceIntent = new Intent(reactContext.getApplicationContext(), BeaconScanner.class);
        serviceIntent.putExtra("cmd", "ScannerInit");
        reactContext.startForegroundService(serviceIntent);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void startScanning() {
        Intent serviceIntent = new Intent(reactContext.getApplicationContext(), BeaconScanner.class);
        serviceIntent.putExtra("cmd", "ScannerStart");
        reactContext.startForegroundService(serviceIntent);
        mScannerStopped = false;
        startScannerPeriod();
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void stopScanning() {
        Intent serviceIntent = new Intent(reactContext.getApplicationContext(), BeaconScanner.class);
        serviceIntent.putExtra("cmd", "ScannerStop");
        reactContext.startForegroundService(serviceIntent);
        mScannerStopped = true;
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    @ReactMethod
    public void initLocationCallback() {
        mLocationWorker = new LocationWorker(reactContext);
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    @ReactMethod
    public void requestLastLocation() {
        mLocationWorker.getLocation();
    }

    @ReactMethod
    public void stopLocationCallback() {
        if (mLocationWorker != null){
            mLocationWorker.stop();
        }
    }




    @NonNull
    @Override
    public String getName() {
        return "IBeaconPlaygroundModule";
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

    }

    @Override
    public void onNewIntent(Intent intent) {

    }
}
