package com.cerebro.tracker1.backend;

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
import android.location.Location;
import android.os.AsyncTask;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;

import com.cerebro.tracker1.MainActivity;
import com.cerebro.tracker1.R;
import com.cerebro.tracker1.backend.workers.BluetoothAdvertising;
import com.cerebro.tracker1.backend.workers.DeviceScanner;
import com.cerebro.tracker1.backend.workers.LocationWorker;
import com.cerebro.tracker1.backend.workers.ScannerWorker;
import com.cerebro.tracker1.ulti.BiDirUDP;
import com.google.gson.Gson;

import com.google.gson.JsonObject;


public class ForegroundService extends Service {

    // Basic Setting
    public static String mDeviceIMEI = "00000000";
    private static int IDLE_COUNTER = 0;
    private static int REFRESH_CYCLE = 15;
    private static int LOC_REFRESH_CYCLE = 5;

    public static final String START_COMMAND = "start";
    public static final String SOS_ALERT = "sos";
    public static final String STOP_COMMAND = "stop";
    public static final String INIT_COMMAND = "init";
    public static final String SCHEDULED_UPDATE = "SCHEDULED_UPDATE";
    public static final String UPDATE_CONFIG = "ConfigUpdate";
    public static final String MAKE_REQUEST = "MakerCustomRequest";

    // Broadcast Setting
    public static final String RECEIVE_ACTION = "FOREGROUND_RECEIVE";
    public static final String RECEIVE_STRING = "FOREGROUND_DATA";

    // Foreground Notification Setting
    public static final int Notification_ID = 10000;
    public static final String CHANNEL_ID = "ForegroundServiceChannel";
    public static final String CONTENT = "Click here back to app";

    private static boolean uploadData = false;
    private PowerManager.WakeLock wl;
    private PowerManager.WakeLock wl_cpu;

    // UDP Setting
//    String remoteIp = "34.96.232.107";
    String remoteIp = "35.215.190.47";
    //    String remoteIp = "10.88.88.143";
    int remotePort = 5060;

    boolean sosSignal = true;
    JsonObject mBeaconConfig = new JsonObject();
    MyBroadcast myBroadcast = new MyBroadcast();

    // Helper Init
    static BiDirUDP udpWorker;
    DeviceScanner mDeviceScanner;
    BluetoothAdvertising mBluetoothAdvertising;
    LocationWorker mLocationWorker;
//    ScannerWorker mScannerWorker;

    public void makeToast(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
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
                TelephonyManager mTelephonyManager = (TelephonyManager) this.getSystemService(Context.TELEPHONY_SERVICE);
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

    @RequiresApi(api = Build.VERSION_CODES.P)
    public static void makeUDPRequest(JsonObject msg) {
        msg.addProperty("tm", String.valueOf(System.currentTimeMillis() / 1000));

        JsonObject payload = new JsonObject();
        payload.addProperty("data", "[" + msg.toString() + "]");
        payload.addProperty("imei", String.valueOf(mDeviceIMEI));

        sendUDPMessage(payload.toString());
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    public static void makeUDPRequest(String msg) {
        JsonObject payload = new JsonObject();
        payload.addProperty("data", "[" + msg + "]");
        payload.addProperty("imei", String.valueOf(mDeviceIMEI));

        sendUDPMessage(payload.toString());
    }

    private static void sendUDPMessage(String msg) {
        if (udpWorker != null) {
            udpWorker.setMessage(msg);

            AsyncTask.execute(udpWorker);
        }
    }

    /**
     * Init UDP with backup
     */
    private void setReceiveSwitch() {
        if (udpWorker == null) {
            udpWorker = new BiDirUDP(remoteIp, remotePort, this);
//            udpWorker.setStoreFail();
        }
    }

    private void analysisConfig(JsonObject config) {
        if (config.has("project")) {
            mLocationWorker.updateConfig(config.get("project").getAsJsonObject());
        } else {
            mLocationWorker.updateConfig(config);
        }

//        mScannerWorker.updateConfig(config);
        mBluetoothAdvertising.updateConfig(config);

        if(config.has("rfc")){
            REFRESH_CYCLE = config.get("rfc").getAsInt();
        }
        if(config.has("loc_rfc")){
            LOC_REFRESH_CYCLE = config.get("loc_rfc").getAsInt();
        }

        if (config.has("ip")) {
            String value = config.get("ip").getAsString();
            remoteIp = value.split(":")[0];
            remotePort = Integer.parseInt(value.split(":")[1]);

            udpWorker.setRemoteIp(remoteIp);
            udpWorker.setRemotePort(remotePort);
        }
    }

    private class MyBroadcast extends BroadcastReceiver {
        @RequiresApi(api = Build.VERSION_CODES.P)
        @Override
        public void onReceive(Context context, Intent intent) {
            String mAction = intent.getAction();
            assert mAction != null;

            if (mAction.equals(BiDirUDP.RECEIVE_ACTION)) {
                String msg = intent.getStringExtra(BiDirUDP.RECEIVE_STRING);
                analysisConfig(new Gson().fromJson(msg, JsonObject.class));
            }
        }
    }


    /**
     * helper function
     */
    @RequiresApi(api = Build.VERSION_CODES.P)
    private JsonObject prepareUDPData() {
        JsonObject payload = new JsonObject();
        payload.addProperty("tm", String.valueOf(System.currentTimeMillis() / 1000));
//        payload.addProperty("te", String.valueOf(mScannerWorker.getUserTemperature()));
//        payload.addProperty("hr", mScannerWorker.getUserHeartRate());
//        payload.addProperty("bp", mScannerWorker.getBP());
//        payload.addProperty("bp", mScannerWorker.getUserBloodPressure());
//        payload.addProperty("bo", mScannerWorker.getUserBloodOxygen());

        if (mDeviceScanner != null) {
            payload.addProperty("ba", mDeviceScanner.getBatteryLevel());
            payload.addProperty("sn", mDeviceScanner.getSignalStrength());
        }

        // Generate gp data packet
        Location mLocation = mLocationWorker.getmLocation();
        if (mLocation != null){
            Log.d("locationM",mLocation.toString());
        }

//        if (mLocation != null) {
//            payload.addProperty("gp", mLocation.getLongitude() + "," + mLocation.getLatitude());
//        } else {
//            payload.addProperty("gp", "0,0");
//        }

        return payload;
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    private void putBroadcast(String msg) {
        Intent intent = new Intent();
        intent.setAction(RECEIVE_ACTION);
        intent.putExtra(RECEIVE_STRING, msg);
        this.sendBroadcast(intent);
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
        PowerManager pm = (PowerManager) this.getSystemService(Context.POWER_SERVICE);
//        boolean isScreenOn = pm.isScreenOn();
        wl = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK|PowerManager.ACQUIRE_CAUSES_WAKEUP|PowerManager.ON_AFTER_RELEASE,"myapp:MyWakelock");
        wl_cpu = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "myapp:mywakelocktag");
        wl.acquire();
        wl_cpu.acquire();
    }

    /**
     * Service setting
     */
    @RequiresApi(api = Build.VERSION_CODES.P)
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String command = intent.getStringExtra("cmd");

        switch (command) {
            case START_COMMAND:
                createForegroundNoti();

                try {
                    mLocationWorker.initGPS();
//                    mScannerWorker.initSensor();

                    mDeviceScanner.start();

                    mBluetoothAdvertising.initLocalBeacon();
                    mBluetoothAdvertising.startAdvertising();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                break;

            case STOP_COMMAND:
                mLocationWorker.stop();
//                mScannerWorker.stopSensorManager();
                mBluetoothAdvertising.stopAdvertising();
                break;

            case SCHEDULED_UPDATE:
                JsonObject upStreamData = prepareUDPData();

                if (IDLE_COUNTER % LOC_REFRESH_CYCLE == 0){
                    mLocationWorker.getLocation();
                }

                if (IDLE_COUNTER >= REFRESH_CYCLE) {
                    makeUDPRequest(upStreamData);
                    IDLE_COUNTER = 0;
                }

                putBroadcast(upStreamData.toString());
                IDLE_COUNTER += 1;

                break;

            case INIT_COMMAND:
                this.registerReceiver(myBroadcast, new IntentFilter(BiDirUDP.RECEIVE_ACTION));
                mLocationWorker = new LocationWorker(this, mBeaconConfig);
//                mScannerWorker = new ScannerWorker(this, mBeaconConfig);

                // Device Setting
                getDeviceImei();
                setReceiveSwitch();

                mDeviceScanner = new DeviceScanner(this);
                mBluetoothAdvertising = new BluetoothAdvertising(this, mBeaconConfig);

                this.analysisConfig(mBeaconConfig);

                break;

            case UPDATE_CONFIG:

                String config = intent.getStringExtra("NewConfig");
                if (mLocationWorker == null) {
                    mBeaconConfig = new Gson().fromJson(config, JsonObject.class);
                } else {
                    this.analysisConfig(new Gson().fromJson(config, JsonObject.class));
                }
//
                break;

            case SOS_ALERT:
                checkSOS();
                break;

            case MAKE_REQUEST:
                String value = intent.getStringExtra("value");
                makeUDPRequest(value);
                break;
        }

        return START_STICKY;
    }

    /**
     * Check SOS Signal
     */
    @RequiresApi(api = Build.VERSION_CODES.P)
    private void checkSOS() {
        JsonObject payload = new JsonObject();
        payload.addProperty("wn", getSOS());
        makeUDPRequest(payload);
    }

    private int getSOS() {
        if (sosSignal) {
            makeToast("Alert is sent");
            return 2;
        }
        return -1;
    }


    @Override
    public void onCreate() {
        super.onCreate();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        wl.release();
        wl_cpu.release();
//        mScannerWorker.stopSensorManager();
        mLocationWorker.stop();
        mBluetoothAdvertising.stopAdvertising();

        this.unregisterReceiver(myBroadcast);
        stopSelf();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
