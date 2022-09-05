package com.cerebro.tracker1.backend.workers;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.cerebro.tracker1.MainActivity;
import com.cerebro.tracker1.R;
import com.cerebro.tracker1.ulti.BiDirUDP;
import com.cerebro.tracker1.ulti.ProfileCheck;
import com.cerebro.tracker1.ulti.StorageFunction;
import com.google.gson.Gson;
import com.google.gson.JsonObject;


public class BeaconScanner extends Service {

    //    public static final String TAG = "BeaconScanner";
    public static final String RECEIVE_ACTION = "SCANNER_RECEIVE";
    public static final String CONFIG_UPDATE = "CONFIG_UPDATED";

    public static final String RECEIVE_STRING = "SCANNER_DATA";

    public static final int Notification_ID = 100;
    public static final String CHANNEL_ID = "ForegroundServiceChannel";
    public static final String CONTENT = "Click here back to app";

    public static final String START_SCANNER = "ScannerStart";
    public static final String STOP_SCANNER = "ScannerStop";
    public static final String INIT_SCANNER = "ScannerInit";
    public static final String UPDATE_CONFIG = "ConfigUpdate";
    public static final String SCHEDULED_UPDATE = "SCHEDULED_UPDATE";

    private static boolean uploadData = false;

    private static boolean mAlerting;
    JsonObject mBeaconConfig = new JsonObject();

    public static String mDeviceIMEI = "00000000";

    private TelephonyManager mTelephonyManager;
    private Vibrator mVibrator;
    BLEScannerWorker mBLEScannerWorker;

    MyBroadcast myBroadcast = new MyBroadcast();

    private Handler processHandler;
    boolean alertSet = true;

    BiDirUDP udpWorker;
    //    String remoteIp = "34.96.232.107";
    String remoteIp = "35.215.190.47";
    //    String remoteIp = "10.88.88.143";
    int remotePort = 5060;


    public void makeToast(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
    }

    /**
     * Alert Condition
     */
    @SuppressLint("MissingPermission")
    private void checkAlert(JsonObject peripherals) {

        int devices = 0;
        for (String key : peripherals.keySet()) {
            JsonObject p = peripherals.get(key).getAsJsonObject();
            if (!p.get("inWhiteList").getAsBoolean()) {
                if (p.get("inRange").getAsBoolean()) {
                    devices++;
                }
            }
        }
        if (devices > 0) {
            makeAlert();
        }
    }

    @SuppressLint("MissingPermission")
    private void makeAlert() {
        if (!mAlerting) {
//            makeToast("vibrating");
            mAlerting = true;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                mVibrator.vibrate(VibrationEffect.createOneShot(500, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                //deprecated in API 26
                mVibrator.vibrate(500);
            }
            processHandler.postDelayed(() -> mAlerting = false, 1000);
        }
    }

    /**
     * udp setup
     */
    @SuppressLint({"MissingPermission", "HardwareIds"})
    public void getDeviceImei() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                mDeviceIMEI = Settings.Secure.getString(this.getContentResolver(), Settings.Secure.ANDROID_ID);
            } else {
                mTelephonyManager = (TelephonyManager) this.getSystemService(Context.TELEPHONY_SERVICE);
                if (mTelephonyManager.getDeviceId() != null) {
                    mDeviceIMEI = mTelephonyManager.getDeviceId();
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        mTelephonyManager.getImei(1);
                    }
                } else {
                    mDeviceIMEI = Settings.Secure.getString(
                            this.getContentResolver(),
                            Settings.Secure.ANDROID_ID);
                }
            }
        } catch (Exception e) {
            Log.d("IBeaconModule", "SecurityException" + e);
        }
    }

    private JsonObject prepareUDPData(JsonObject peripherals) {
        JsonObject payload = new JsonObject();
        payload.addProperty("tm", String.valueOf(System.currentTimeMillis() / 1000));

        // Generate il data packet
        StringBuilder il = new StringBuilder();
        for (String key : peripherals.keySet()) {
            JsonObject peripheral = peripherals.getAsJsonObject(key);
            JsonObject peripheral_detail = peripheral.getAsJsonObject("detail");

            if (peripheral_detail.has("device_id")) {
                il.append(peripheral_detail.get("device_id").getAsString());
                il.append(",");
                il.append(peripheral.get("rssi").getAsString());
                il.append(";");
            }
            if (peripheral_detail.has("UUID")) {
                il.append(peripheral_detail.get("UUID").getAsString());
                il.append(",");
                il.append(peripheral_detail.get("major").getAsString());
                il.append(",");
                il.append(peripheral_detail.get("minor").getAsString());
                il.append(",");
                il.append(peripheral.get("rssi").getAsString());
                il.append(";");
            }
        }
        payload.addProperty("il", il.toString());

        return payload;
    }

    private void makeUDPRequest(JsonObject peripherals) {
        JsonObject payload = new JsonObject();
        payload.addProperty("data", "[" + prepareUDPData(peripherals).toString() + "]");
        payload.addProperty("imei", String.valueOf(mDeviceIMEI));

        sendUDPMessage(payload.toString());
    }

    private void sendUDPMessage(String msg) {
        udpWorker.setMessage(msg);
        AsyncTask.execute(udpWorker);
    }

    private void setReceiveSwitch() {
        //初始化UDP伺服器
        //注意：此處有調用CommendFun.java的內容以取得本機IP
        udpWorker = new BiDirUDP(remoteIp, remotePort, this);
    }

    private void analysisConfig(JsonObject config) {
        mBLEScannerWorker.updateConfig(config);

        if (config.has("ip")) {
            String value = config.get("ip").getAsString();
            remoteIp = value.split(":")[0];
            remotePort = Integer.parseInt(value.split(":")[1]);

            udpWorker.setRemoteIp(remoteIp);
            udpWorker.setRemotePort(remotePort);
        }

        if (config.has("as")) {
            alertSet = config.get("as").getAsString().equals("1");
        }

//        if (updateJson.keySet().size() > 0){
//            StorageFunction.saveConfigurations(this, updateJson);
//            putBroadcastConfigData(updateJson);
//        }
    }

    private void initBroadcastReceiver() {
        IntentFilter intentFilter = new IntentFilter(BiDirUDP.RECEIVE_ACTION);
        this.registerReceiver(myBroadcast, intentFilter);
    }

    private class MyBroadcast extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            String mAction = intent.getAction();
            assert mAction != null;
            switch (mAction) {
                /**接收來自UDP回傳之訊息*/
                case BiDirUDP.RECEIVE_ACTION:
                    String msg = intent.getStringExtra(BiDirUDP.RECEIVE_STRING);
                    analysisConfig(new Gson().fromJson(msg, JsonObject.class));

//                    JsonObject tmp = new JsonObject();
//                    tmp.add("data", new Gson().fromJson(msg, JsonObject.class));
//                    putBroadcast(tmp.toString());
//                    setConfig(mBeaconConfig);
                    break;
            }
        }
    }

    /**
     * foreground setting
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Foreground Service Channel",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }

    private void createForegroundNoti() {
        // Life Long Notification
        createNotificationChannel();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, 0);
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Foreground Service")
                .setContentText(CONTENT)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .build();
        startForeground(Notification_ID, notification);
    }

    private void putBroadcastConfigData(JsonObject config) {
        Intent intent = new Intent();
        intent.setAction(CONFIG_UPDATE);
        intent.putExtra(RECEIVE_STRING, config.toString());
        this.sendBroadcast(intent);
    }

    private void putBroadcast() {

        Log.e(RECEIVE_STRING, mBLEScannerWorker.getPeripherals().toString());
        Intent intent = new Intent();
        intent.setAction(RECEIVE_ACTION);
        intent.putExtra(RECEIVE_STRING, mBLEScannerWorker.getPeripherals().toString());
        this.sendBroadcast(intent);
    }

    private void putBroadcast(String msg) {

        Intent intent = new Intent();
        intent.setAction(RECEIVE_ACTION);
        intent.putExtra(RECEIVE_STRING, msg);
        this.sendBroadcast(intent);
    }


    private void scheduledUpdate() {
        JsonObject peripherals = mBLEScannerWorker.getPeripherals();

        mBLEScannerWorker.updateAge();
        checkAlert(peripherals);
        if (uploadData) {
            makeUDPRequest(peripherals);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String command = intent.getStringExtra("cmd");

        switch (command) {
            case START_SCANNER:
                mBLEScannerWorker.startScanner();
                break;
            case STOP_SCANNER:
                mBLEScannerWorker.stopScanner();
                mBLEScannerWorker.resetPeripherals();
                break;
            case SCHEDULED_UPDATE:
                Log.d("update","running");

                if (mBLEScannerWorker.isRunning()) {
                    scheduledUpdate();
                    uploadData = !uploadData;
                    putBroadcast();
                }

                break;
            case INIT_SCANNER:
                mVibrator = (Vibrator) this.getSystemService(Context.VIBRATOR_SERVICE);
                mBLEScannerWorker = new BLEScannerWorker(this, mBeaconConfig);

                processHandler = new Handler();

                getDeviceImei();
                initBroadcastReceiver();
                setReceiveSwitch();
                createForegroundNoti();

                break;
            case UPDATE_CONFIG:
                String config = intent.getStringExtra("NewConfig");
                if (mBLEScannerWorker == null) {
                    mBeaconConfig = new Gson().fromJson(config, JsonObject.class);
                } else {
                    this.analysisConfig(new Gson().fromJson(config, JsonObject.class));
                }
                break;
        }

        return START_NOT_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mBLEScannerWorker.stopScanner();
        this.unregisterReceiver(myBroadcast);
        stopSelf();
    }

    public BeaconScanner() {
    }

}
