package com.cerebro.tracker1.backend.workers;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.os.Build;

import androidx.annotation.RequiresApi;

import com.cerebro.tracker1.ulti.BeaconUlti;
import com.cerebro.tracker1.ulti.ProfileCheck;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.util.Arrays;
import java.util.Iterator;

public class BLEScannerWorker {
    Context context;

    private boolean mScanning;
    ScanFilter mScanFilter;
    ScanSettings mScanSettings;

    private BluetoothLeScanner mBluetoothScanner;
    private BluetoothAdapter mBluetoothAdapter;

    JsonObject peripherals = new JsonObject();
    ProfileCheck mProfileCheck;
    BeaconUlti mBeaconUlti;

    JsonObject measuredPowerLookup = new JsonObject();
    JsonArray whiteList = new JsonArray();
    int inRangeDistance = 5;
    int memoryTime = 2;

    JsonArray pjPrefixList = new JsonArray();

    private String deviceType = "00000000";
    private String categoryPrefix = "0000";
    private String pjPrefix = "0000";
    private String cbPrefix = "0000";
    private String UDID = "000000000000";


    public BLEScannerWorker(Context context, JsonObject config) {
        this.context = context;
        this.updateConfig(config);

        mProfileCheck = new ProfileCheck(context, config);
        mBeaconUlti = new BeaconUlti();
        initBeaconScanner();
    }

    @SuppressLint("MissingPermission")
    public void initBeaconScanner() {

        final BluetoothManager bluetoothManager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        mBluetoothAdapter = bluetoothManager.getAdapter();
        mBluetoothAdapter.getScanMode();
        if (mBluetoothScanner == null) {
            mBluetoothScanner = mBluetoothAdapter.getBluetoothLeScanner();
            setScanFilter();

            setScanSettings(ScanSettings.SCAN_MODE_LOW_LATENCY);
//            setScanSettings(ScanSettings.SCAN_MODE_BALANCED);
//            setScanSettings(ScanSettings.SCAN_MODE_LOW_POWER);

        }
    }

    public void updateConfig(JsonObject config) {
        try {

            // Other Checking and Setting
            if (config.has("mpl")) {
                measuredPowerLookup = config.get("mpl").getAsJsonObject();
            }
            if (config.has("pj_wwl")) {
                whiteList = config.get("pj_wwl").getAsJsonArray();
            }
            if (config.has("ad")) {
                inRangeDistance = config.get("ad").getAsInt();
            }

            // Project White List
            if (config.has("pj_prefix")) {
                pjPrefixList = config.get("pj_prefix").getAsJsonArray();
            }

            // Project Device Setting
            if (config.has("device_type_batch")) {
                deviceType = config.get("device_type_batch").getAsString();
            }
            if (config.has("cat_prefix")) {
                categoryPrefix = config.get("cat_prefix").getAsString();
            }
            if (config.has("pj_uuid_prefix")) {
                pjPrefix = config.get("pj_uuid_prefix").getAsString();
            }
            if (config.has("cb_prefix")) {
                cbPrefix = config.get("cb_prefix").getAsString();
            }
            if (config.has("udid")) {
                UDID = config.get("udid").getAsString();
            }
        } catch (Exception ignored) {

        }
    }

    public JsonObject getPeripherals() {
//        Log.d("peripherials",peripherals.toString());
        return peripherals;
    }

    public void resetPeripherals() {
        peripherals = new JsonObject();
    }

    public void updateAge() {
        Iterator<String> iterator = peripherals.keySet().iterator();
        while (iterator.hasNext()) {
            String key = iterator.next();
            JsonObject peripheral = peripherals.get(key).getAsJsonObject();

            int lastSeen = peripheral.get("lastSeen").getAsInt() + 1;
            if (lastSeen > memoryTime) {
                iterator.remove();
            } else {
                peripheral.addProperty("lastSeen", lastSeen);
//                parserPeripheral(peripheral);
            }
        }
    }

    public boolean isRunning() {
        return mScanning;
    }

    private boolean parserPeripheral(JsonObject peripheral) {
        JsonObject detail = peripheral.get("detail").getAsJsonObject();

        if (!detail.keySet().isEmpty()) {


            // TODO: apply new method
            if (mBeaconUlti.checkTarget(measuredPowerLookup, detail)) {
                try {

                    if(!detail.get("cb_prefix").getAsString().equals(cbPrefix)) {

                        return false;
                    }

                    if(!pjPrefixList.contains(detail.get("pj_prefix"))) {
                        return false;
                    }

                    if(detail.get("cat_prefix").getAsString().equals(categoryPrefix)) {
                        return false;
                    }
//                    Log.e("scanner",detail.toString());
//                JsonArray blackList = mBeaconConfig.get("blackList").getAsJsonArray();
//                Boolean alert = mBeaconUlti.getAlert(detail, whiteList, blackList);

                    boolean whileListCheck = whiteList.contains(detail.get("udid"));
//                    boolean whileListCheck = mBeaconUlti.checkDetailIn(whiteList, detail);

                    int measuredPower = mBeaconUlti.getMeasuredPower(measuredPowerLookup, detail);
                    double distance = mBeaconUlti.getDistance(peripheral.get("rssi").getAsInt(), measuredPower);

                    boolean inRange = mBeaconUlti.getDetailInRange(distance, inRangeDistance);

                    peripheral.addProperty("distance", distance);
                    peripheral.addProperty("inWhiteList", whileListCheck);
                    peripheral.addProperty("inRange", inRange);
                    peripheral.addProperty("measuredPower", measuredPower);
                    peripheral.addProperty("inRangeDistance", inRangeDistance);

                    return true;

                } catch (Exception e) {
//                    makeToast(String.valueOf(e));
                    return false;
                }

            }
        }
        return false;
    }

    private final ScanCallback scanCallback = new ScanCallback() {
        @RequiresApi(api = Build.VERSION_CODES.O)
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
//            super.onScanResult(callbackType, result);
            if(cbPrefix.equals("0000")){
                return;
            }

            JsonObject detail = mBeaconUlti.payloadDecoder(result.getScanRecord().getBytes());

            if (!detail.keySet().isEmpty()) {
//                Log.d("scanner",detail.toString());

                String name = String.valueOf(result.getScanRecord().getDeviceName());
                String id = String.valueOf(result.getDevice());
                int rssi = result.getRssi();

                JsonObject peripheral = new JsonObject();
                peripheral.add("detail", detail);
                peripheral.addProperty("name", name);
                peripheral.addProperty("id", id);
                peripheral.addProperty("rssi", rssi);
                peripheral.addProperty("lastSeen", 0);

                if (parserPeripheral(peripheral)) {
                    peripherals.add(id, peripheral);
                }

//                Log.d("scanner",peripheral.getAsJsonObject("detail").toString());
//                        peripherals.add(id, peripheral);


            }
        }
    };

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

    @SuppressLint("MissingPermission")
    public void startScanner() {
        if (!mScanning) {
            mBluetoothScanner.startScan(Arrays.asList(mScanFilter), mScanSettings, scanCallback);
            mScanning = true;
        }
    }

    @SuppressLint("MissingPermission")
    public void stopScanner() {
        if (mScanning) {
            mBluetoothScanner.stopScan(scanCallback);
            mScanning = false;
        }
    }
}
