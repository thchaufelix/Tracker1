package com.cerebro.tracker1.backend.workers;

import static com.cerebro.tracker1.backend.ForegroundService.makeUDPRequest;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.os.Build;

import androidx.annotation.RequiresApi;

import com.cerebro.tracker1.ulti.Alert;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.gson.JsonObject;

public class ScannerWorker {
    //     X300 setting
//    private static final int TYPE_HEART_RATE_SENSOR = 0x10001;

    // x89 setting
    private static final int TYPE_HEART_RATE_SENSOR = 5;

    // Variables Init
    int userTemperature = 0;
    int userHeartRate = 0;
    int userBloodOxygen = 0;
    int userSystolic = 0;
    int userDiastolic = 0;

    Context context;

    // Alert Trigger Setting
    int ALERT_HEART_RATE = 999;
    int ALERT_HEART_RATE_LOW = 0;

    int ALERT_TEMPERATURE = 999;
    int ALERT_TEMPERATURE_LOW = 0;

    int ALERT_BLOOD_OXYGEN = 0;
    int ALERT_BLOOD_OXYGEN_LOW = 0;

    int ALERT_SYSTOLIC = 999;
    int ALERT_SYSTOLIC_LOW = 0;
    int ALERT_DIASTOLIC = 999;
    int ALERT_DIASTOLIC_LOW = 0;

    Sensor mTempSensor;
    Sensor mHrSensor;

    private SensorManager mSensorManager;

    public ScannerWorker(Context context, JsonObject mBeaconConfig) {
        this.context = context;
        updateConfig(mBeaconConfig);
        initSensor();
    }

    public int getUserTemperature() {
        return userTemperature;
    }

    public int getUserHeartRate() {
        return userHeartRate;
    }

    public int getUserBloodOxygen() {
        return userBloodOxygen;
    }

    public String getUserBloodPressure() {
        return userSystolic + "," + userDiastolic;
    }

    public void updateConfig(JsonObject config) {
        if (config.has("hw")) {

            String[] hw_settings = config.get("hw").getAsString().split(";");
            for (String setting : hw_settings) {
                String[] row = setting.split(",");
                String type = row[0];

                if (row.length == 5) {

                    switch (type) {
                        case Alert.TYPE_HEARTBEAT:
                            ALERT_HEART_RATE = Integer.parseInt(row[3]);
                            ALERT_HEART_RATE_LOW = Integer.parseInt(row[4]);
                            break;
                        case Alert.TYPE_TEMPERATURE:
                            ALERT_TEMPERATURE = Integer.parseInt(row[3]);
                            ALERT_TEMPERATURE_LOW = Integer.parseInt(row[4]);
                            break;
                        case Alert.TYPE_BLOODOXYGEN:
                            ALERT_BLOOD_OXYGEN = Integer.parseInt(row[3]);
                            ALERT_BLOOD_OXYGEN_LOW = Integer.parseInt(row[4]);
                            break;
                        case Alert.TYPE_SYSTOLIC:
                            ALERT_SYSTOLIC = Integer.parseInt(row[3]);
                            ALERT_SYSTOLIC_LOW = Integer.parseInt(row[4]);
                            break;
                        case Alert.TYPE_DIASTOLIC:
                            ALERT_DIASTOLIC = Integer.parseInt(row[3]);
                            ALERT_DIASTOLIC_LOW = Integer.parseInt(row[4]);
                            break;
                    }

                }
            }
        }
    }

    public void initSensor() {
        if (mSensorManager == null) {
            mSensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
            mTempSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_TEMPERATURE);
            mSensorManager.registerListener(temperatureListener, mTempSensor, 5 * 1000 * 1000);

            mHrSensor = mSensorManager.getDefaultSensor(TYPE_HEART_RATE_SENSOR);
            mSensorManager.registerListener(heartRateListener, mHrSensor, 2 * 1000 * 1000);
        }
    }

    public void stopSensorManager() {
        if (mSensorManager != null) {
            mSensorManager.unregisterListener(temperatureListener);
            mSensorManager.unregisterListener(heartRateListener);
        }
    }

    private final SensorEventListener temperatureListener = new SensorEventListener() {
        @RequiresApi(api = Build.VERSION_CODES.P)
        @Override
        public void onSensorChanged(SensorEvent event) {
            float temperature = event.values[0];
            if (temperature > 0) {
                userTemperature = Math.round(temperature * 10);
//                temperatureCheck();
            }
        }

        @Override
        public void onAccuracyChanged(Sensor sensor, int accuracy) {

        }
    };

    private void x300HeathScannerHandler(SensorEvent event) {
        int uhr = Math.round(event.values[0]);
        int ubo = Math.round(event.values[1]);
        int wearIndicator = Math.round(event.values[2]);
        int us = Math.round(event.values[3]);
        int ud = Math.round(event.values[4]);

        if (wearIndicator == 1) {
            userHeartRate = uhr;
            userBloodOxygen = ubo;
            userSystolic = us;
            userDiastolic = ud;

//                heartRateCheck();
//                bloodPressureCheck();
        }
//            else {
//                userHeartRate = 0;
//                userBloodOxygen = 0;
//                userSystolic = 0;
//                userDiastolic = 0;
//            }
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    private void x89HeathScannerHandler(SensorEvent event) {
        int uhr = Math.round(event.values[0]);

        if (uhr > 0) {
            userHeartRate = uhr;
//            heartRateCheck();
        }
    }

    private final SensorEventListener heartRateListener = new SensorEventListener() {

        @RequiresApi(api = Build.VERSION_CODES.P)
        @Override
        public void onSensorChanged(SensorEvent event) {
//            x300HeathScannerHandler(event);
            x89HeathScannerHandler(event);

        }

        @Override
        public void onAccuracyChanged(Sensor sensor, int accuracy) {

        }
    };

    @RequiresApi(api = Build.VERSION_CODES.P)
    private void temperatureCheck() {
        if (userTemperature > ALERT_TEMPERATURE) {
            JsonObject payload = new JsonObject();
            payload.addProperty("wn", 21);
            payload.addProperty("hw", Alert.TYPE_TEMPERATURE + "," + userTemperature);
            makeUDPRequest(payload);
        } else if (userTemperature < ALERT_TEMPERATURE_LOW) {
            JsonObject payload = new JsonObject();
            payload.addProperty("wn", 21);
            payload.addProperty("hw", Alert.TYPE_TEMPERATURE + "," + userTemperature);
            makeUDPRequest(payload);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    private void heartRateCheck() {
        if (userHeartRate > ALERT_HEART_RATE) {
            JsonObject payload = new JsonObject();
            payload.addProperty("wn", 20);
            payload.addProperty("hw", Alert.TYPE_HEARTBEAT + "," + userHeartRate);
            makeUDPRequest(payload);
        } else if (userHeartRate < ALERT_HEART_RATE_LOW) {
            JsonObject payload = new JsonObject();
            payload.addProperty("wn", 20);
            payload.addProperty("hw", Alert.TYPE_HEARTBEAT + "," + userHeartRate);
            makeUDPRequest(payload);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    private void bloodPressureCheck() {

        if (userSystolic > ALERT_SYSTOLIC) {
            JsonObject payload = new JsonObject();
            payload.addProperty("wn", 23);
            payload.addProperty("hw", Alert.TYPE_SYSTOLIC + "," + userSystolic);
            makeUDPRequest(payload);
        } else if (userSystolic < ALERT_SYSTOLIC_LOW) {
            JsonObject payload = new JsonObject();
            payload.addProperty("wn", 23);
            payload.addProperty("hw", Alert.TYPE_SYSTOLIC + "," + userSystolic);
            makeUDPRequest(payload);
        }


        if (userDiastolic > ALERT_DIASTOLIC) {
            JsonObject payload = new JsonObject();
            payload.addProperty("wn", 23);
            payload.addProperty("hw", Alert.TYPE_DIASTOLIC + "," + userSystolic + "," + userDiastolic);
            makeUDPRequest(payload);
        } else if (userDiastolic < ALERT_DIASTOLIC_LOW) {
            JsonObject payload = new JsonObject();
            payload.addProperty("wn", 23);
            payload.addProperty("hw", Alert.TYPE_DIASTOLIC + "," + userSystolic + "," + userDiastolic);
            makeUDPRequest(payload);
        }
    }

    public String getBP() {
        int systolic = 0;
        if (userHeartRate >= 51 && userHeartRate <= 67) {
            systolic = (int) (108 + Math.random() * 20);
        }
        if (userHeartRate >= 64 && userHeartRate <= 88) {
            if (systolic > 0) {
                systolic = (systolic + (int) (122 + Math.random() * 24)) / 2;
            } else {
                systolic = (int) (122 + Math.random() * 24);
            }
        }
        if (userHeartRate >= 70 && userHeartRate <= 94) {
            if (systolic > 0) {
                systolic = (systolic + (int) (134 + Math.random() * 28)) / 2;
            } else {
                systolic = (int) (134 + Math.random() * 28);
            }
        }

        int map = 0;
        if (userHeartRate >= 51 && userHeartRate <= 67) {
            map = (int) (83 + Math.random() * 14);
        }
        if (userHeartRate >= 64 && userHeartRate <= 88) {
            if (map > 0) {
                map = (map + (int) (91 + Math.random() * 22)) / 2;
            } else {
                map = (int) (91 + Math.random() * 22);
            }
        }
        if (userHeartRate >= 70 && userHeartRate <= 94) {
            if (map > 0) {
                map = (map + (int) (100 + Math.random() * 28)) / 2;
            } else {
                map = (int) (100 + Math.random() * 28);
            }
        }

        return "" + systolic + "," + ((3 * map - systolic) / 2);
    }


}
