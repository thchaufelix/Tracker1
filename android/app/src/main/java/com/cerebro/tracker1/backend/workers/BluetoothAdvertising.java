package com.cerebro.tracker1.backend.workers;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.le.AdvertiseSettings;
import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Callback;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import org.altbeacon.beacon.Beacon;
import org.altbeacon.beacon.BeaconParser;
import org.altbeacon.beacon.BeaconTransmitter;

import java.util.Arrays;

public class BluetoothAdvertising {
    private Context context;

    String TAG = "BluetoothAdvertising";
    BeaconTransmitter beaconTransmitter;

    String uuid = "00000000-0000-0000-0000-000000000000";
    int major = 10100;
    int minor = 11111;

    public BluetoothAdvertising(Context context, JsonObject config) {
        this.context = context;
        this.updateConfig(config);
    }

    public void updateConfig(JsonObject config){
        boolean updated = false;
        try {
            if (config.has("uuid")) {
                String uuid= config.get("uuid").getAsString();
                if (!this.uuid.equals(uuid)){
                    this.uuid = uuid;
                    updated = true;
                }
            }
            if (config.has("major")) {
                int major = config.get("major").getAsInt();
                if (this.major != major){
                    this.major = major;
                    updated = true;
                }
            }
            if (config.has("minor")) {
                int minor = config.get("minor").getAsInt();
                if (this.minor != minor){
                    this.minor = minor;
                    updated = true;
                }
            }
        } catch (Exception ignored){

        }

        if (updated) {
            Toast.makeText(this.context, "updating", Toast.LENGTH_SHORT).show();
            stopAdvertising();
            startAdvertising();
        }
    }


    @SuppressLint("MissingPermission")
    public void initLocalBeacon() throws InterruptedException {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (!bluetoothAdapter.isEnabled()) {
            bluetoothAdapter.enable();
            Toast.makeText(context, "Beacon Starting", Toast.LENGTH_SHORT).show();
        }
    }

    public void startAdvertising(){

        if (beaconTransmitter == null) {

            try {
                Beacon beacon = new Beacon.Builder()
                        .setId1(uuid)
                        .setId2(String.valueOf(major))
                        .setId3(String.valueOf(minor))
                        .setManufacturer(0x004c)
                        .setTxPower(-79)
                        .build();

                BeaconParser beaconParser = new BeaconParser()
                        .setBeaconLayout("m:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24");
                beaconTransmitter = new BeaconTransmitter(context, beaconParser);
                beaconTransmitter.setAdvertiseTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM);
//                beaconTransmitter.setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED);
                beaconTransmitter.setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY);
                beaconTransmitter.startAdvertising(beacon);

            } catch (Exception e) {
                Toast.makeText(context, uuid + " cannot started", Toast.LENGTH_SHORT).show();
            }

        } else {

        }
    }

    public void stopAdvertising(){
        if (beaconTransmitter != null) {
            beaconTransmitter.stopAdvertising();
        }
        beaconTransmitter = null;
    }

}
