package com.cerebro.tracker1.services;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;

import com.cerebro.tracker1.MainActivity;
import com.cerebro.tracker1.R;
import com.cerebro.tracker1.ulti.BeaconUlti;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.util.Arrays;
import java.util.Iterator;
import java.util.Objects;

public class BeaconScanner extends Service {

    public static final String TAG = "BeaconScanner";
    public static final String RECEIVE_ACTION = "GetPeripherals";
    public static final String RECEIVE_STRING = "ReceivePeripherals";

    private boolean mStopScanning = false;
    private boolean mScanning;

    BluetoothLeScanner mBluetoothScanner;
    BluetoothAdapter mBluetoothAdapter;
    Vibrator mVibrator;

    private Handler scannerHandler;
    private Handler processHandler;

    ScanFilter mScanFilter;
    ScanSettings mScanSettings;

    BeaconUlti mBeaconUlti;
    JsonObject peripherals = new JsonObject();
    JsonObject mBeaconConfig = new JsonObject();


    public BeaconScanner() {
    }

    public void makeToast(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
    }

    private void setBeaconConfig(){
        mBeaconUlti = new BeaconUlti();

        // Basic Setting
        mBeaconConfig.addProperty("local_imei", "");
        mBeaconConfig.addProperty("role", "");
        mBeaconConfig.add("whiteList", new JsonArray());
        mBeaconConfig.add("blackList", new JsonArray());

        // Beacon Scanner Setting
        mBeaconConfig.addProperty("onTime", 2);
        mBeaconConfig.addProperty("offTime", 2);
        mBeaconConfig.addProperty("memoryTime", 2);
        mBeaconConfig.addProperty("inRangeDistance", 2);
        mBeaconConfig.add("measuredPowerLookup", new JsonObject());

        // Extra Config
        mBeaconConfig.addProperty("heathWarning", "");
        mBeaconConfig.addProperty("alertSet", false);
        mBeaconConfig.addProperty("sosSet", false);
    }

    @SuppressLint("MissingPermission")
    private void checkAlert() {

        int devices = 0;
        for (String key : peripherals.keySet()) {
            JsonObject p = peripherals.get(key).getAsJsonObject();
            if (p.has("alert")) {
                if (p.get("alert").getAsBoolean()) {
                    devices++;
                }
            }
        }

        if (devices > 0) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                mVibrator.vibrate(VibrationEffect.createOneShot(500, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                //deprecated in API 26
                mVibrator.vibrate(500);
            }
            makeToast("Alert ! detected: " + devices);
        }
    }


    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @SuppressLint("MissingPermission")
    public void activateBeaconScanner() {
        // Delay Function for on time, default 2s
        scannerHandler.postDelayed(new Runnable() {
            @SuppressLint("MissingPermission")
            @Override
            public void run() {
                if (mScanning) {
                    mScanning = false;
                    mBluetoothScanner.stopScan(scanCallback);

                    // make beacon detail
                    Iterator<String> iterator = peripherals.keySet().iterator();
                    while (iterator.hasNext()) {
                        String key = iterator.next();
                        parserPeripheral(peripherals.get(key).getAsJsonObject());
                    }
                }
            }
        }, (long) mBeaconConfig.get("onTime").getAsInt() * 1000L);

        // Delay Function for off time, default 2 + 2s
        processHandler.postDelayed(new Runnable() {
            @RequiresApi(api = Build.VERSION_CODES.P)
            @Override
            public void run() {
                if (!mScanning) {
                    try {
                        if (mBeaconConfig.get("alertSet").getAsBoolean()) {
                            checkAlert();
                        }

                        putBroadcast();

                        Iterator<String> iterator = peripherals.keySet().iterator();
                        while (iterator.hasNext()) {
                            String key = iterator.next();
                            JsonObject peripheral = peripherals.get(key).getAsJsonObject();

                            int lastSeen = peripheral.get("lastSeen").getAsInt() + 1;
                            if (lastSeen > mBeaconConfig.get("memoryTime").getAsInt()) {
                                iterator.remove();
                            } else {
                                peripheral.addProperty("lastSeen", lastSeen);
                            }
                        }

                        if (!mStopScanning) {
                            activateBeaconScanner();
                        }
                    } catch (Exception e) {
                    }
                }
            }
        }, (long) mBeaconConfig.get("onTime").getAsInt() * 1000L + mBeaconConfig.get("offTime").getAsInt() * 1000L);

        if (!mScanning) {
            mScanning = true;
            mBluetoothScanner.startScan(Arrays.asList(mScanFilter), mScanSettings, scanCallback);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d("SCANNER INFO", "Calling Wrong Services!!!!" );
//        activateBeaconScanner();
        return START_NOT_STICKY;
    }

    @SuppressLint("MissingPermission")
    private void putBroadcast(){
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            mVibrator.vibrate(VibrationEffect.createOneShot(500, VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            //deprecated in API 26
            mVibrator.vibrate(500);
        }

        Intent intent = new Intent();
        intent.setAction(RECEIVE_ACTION);
        intent.putExtra(RECEIVE_STRING, peripherals.toString());
        this.sendBroadcast(intent);
    }

    @Override
    public void onCreate() {
        super.onCreate();

        mVibrator = (Vibrator) this.getSystemService(Context.VIBRATOR_SERVICE);
        setBeaconConfig();
        initBeaconScanner();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mStopScanning = true;
    }

    public void setScanFilter() {
        ScanFilter.Builder mBuilder = new ScanFilter.Builder();
        mScanFilter = mBuilder.build();
    }

    public void setScanSettings(int SCAN_MODE) {
        ScanSettings.Builder mBuilder = new ScanSettings.Builder();
        mBuilder.setReportDelay(0);
        mBuilder.setScanMode(SCAN_MODE);
        mScanSettings = mBuilder.build();
    }

    private final ScanCallback scanCallback = new ScanCallback() {
        @RequiresApi(api = Build.VERSION_CODES.O)
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            super.onScanResult(callbackType, result);

            JsonObject detail = mBeaconUlti.payloadDecoder(result.getScanRecord().getBytes());
            // Peripheral Detail JSON Object
            if (!detail.keySet().isEmpty()) {
                String name = String.valueOf(result.getScanRecord().getDeviceName());
                String id = String.valueOf(result.getDevice());
                int rssi = result.getRssi();

                JsonObject peripheral = new JsonObject();
                peripheral.add("detail", detail);
                peripheral.addProperty("name", name);
                peripheral.addProperty("id", id);
                peripheral.addProperty("rssi", rssi);
                peripheral.addProperty("lastSeen", 0);
                peripherals.add(id, peripheral);
            }
        }
    };

    @SuppressLint("MissingPermission")
    public void initBeaconScanner() {
        mStopScanning = false;
        scannerHandler = new Handler();
        processHandler = new Handler();
        final BluetoothManager bluetoothManager =
                (BluetoothManager) this.getSystemService(Context.BLUETOOTH_SERVICE);
        mBluetoothAdapter = bluetoothManager.getAdapter();
        mBluetoothAdapter.getScanMode();
        mBluetoothScanner = mBluetoothAdapter.getBluetoothLeScanner();

        setScanFilter();
        setScanSettings(ScanSettings.SCAN_MODE_LOW_LATENCY);
    }

    private void parserPeripheral(JsonObject peripheral) {

        JsonObject detail = peripheral.get("detail").getAsJsonObject();
        if (!detail.keySet().isEmpty()) {

            JsonArray whiteList = mBeaconConfig.get("whiteList").getAsJsonArray();
//            JsonArray blackList = mBeaconConfig.get("blackList").getAsJsonArray();
//            Boolean alert = mBeaconUlti.getAlert(detail, whiteList, blackList);
            Boolean whileListCheck = mBeaconUlti.checkDetailIn(whiteList, detail);


            JsonObject measuredPowerLookup = mBeaconConfig.get("measuredPowerLookup").getAsJsonObject();
            int measuredPower = mBeaconUlti.getMeasuredPower(measuredPowerLookup, detail);
            double distance = mBeaconUlti.getDistance(peripheral.get("rssi").getAsInt(), measuredPower);

            int inRangeDistance = mBeaconConfig.get("inRangeDistance").getAsInt();
            Boolean inRange = mBeaconUlti.getDetailInRange(distance, inRangeDistance);

            peripheral.addProperty("distance", distance);
            peripheral.addProperty("alert", !whileListCheck && inRange);
            peripheral.addProperty("inRange", inRange);
            peripheral.addProperty("measuredPower", measuredPower);
            peripheral.addProperty("inRangeDistance", inRangeDistance);
        }

    }

}