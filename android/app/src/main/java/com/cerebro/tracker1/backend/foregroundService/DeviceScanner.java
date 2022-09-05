package com.cerebro.tracker1.backend.foregroundService;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.os.Looper;

import androidx.core.app.ActivityCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.gson.JsonObject;

public class DeviceScanner {
    private Context context;

    private static final int TYPE_HEART_RATE_SENSOR = 5;
    int userTemperature = 0;
    int userHeartRate = 0;

    private SensorManager mSensorManager;
    private FusedLocationProviderClient mFusedLocationClient;

    Location mLocation;
    Sensor mTempSensor;
    Sensor mHrSensor;


    public DeviceScanner(Context context) {
        this.context = context;
    }

    public void initSensor() {
        mSensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        mTempSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_TEMPERATURE);
        mSensorManager.registerListener(temperatureListener, mTempSensor, SensorManager.SENSOR_DELAY_NORMAL);

        mHrSensor = mSensorManager.getDefaultSensor(TYPE_HEART_RATE_SENSOR);
        mSensorManager.registerListener(heartRateListener, mHrSensor, SensorManager.SENSOR_DELAY_NORMAL);
    }

    @SuppressLint("MissingPermission")
    public void initGPS() {
//        ---- Google Suggested Method ----

        LocationRequest mLocationRequest = LocationRequest.create();
        mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
        mLocationRequest.setInterval(10000);  // 10 seconds, in milliseconds
        mLocationRequest.setFastestInterval(5000); // 1 second, in milliseconds

        if (mFusedLocationClient == null) {

            mFusedLocationClient = LocationServices.getFusedLocationProviderClient(context);
            mFusedLocationClient.requestLocationUpdates(mLocationRequest,
                    locationCallback,
                    Looper.myLooper());
        }
    }

    private String getBP() {
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

    private final SensorEventListener temperatureListener = new SensorEventListener() {

        @Override
        public void onSensorChanged(SensorEvent event) {
            float temperature = event.values[0];
            if (temperature > 10) {
                userTemperature = Math.round(temperature * 10);
            }
        }

        @Override
        public void onAccuracyChanged(Sensor sensor, int accuracy) {

        }
    };

    private final SensorEventListener heartRateListener = new SensorEventListener() {

        @Override
        public void onSensorChanged(SensorEvent event) {
            float Hr = event.values[0];
            if (Hr > 20) {
                userHeartRate = Math.round(Hr);
            }
        }

        @Override
        public void onAccuracyChanged(Sensor sensor, int accuracy) {

        }
    };

    private void locationMsg(Location location) {
        mLocation = location;
    }

    private final LocationCallback locationCallback = new LocationCallback() {
        @SuppressLint("MissingPermission")
        @Override
        public void onLocationResult(LocationResult locationResult) {
            super.onLocationResult(locationResult);

            if (locationResult != null) {
                Location location = locationResult.getLastLocation();
                locationMsg(location);
            } else {
                if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                        && ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    return;
                }
                mFusedLocationClient.getLastLocation().addOnCompleteListener(task -> {
                    Location location = task.getResult();

                    if (location != null) {
                        locationMsg(location);
                    }
                });
            }
        }
    };

    private void stopFusedLocationClient() {
        if (mFusedLocationClient != null) {
            mFusedLocationClient.removeLocationUpdates(locationCallback);
        }
    }

    private void stopSensorManager() {
        if (mSensorManager != null) {
            mSensorManager.unregisterListener(temperatureListener);
            mSensorManager.unregisterListener(heartRateListener);
        }
    }

    public void start() {
        initSensor();
        initGPS();
    }

    public void stop() {
        stopSensorManager();
        stopFusedLocationClient();
    }

    public JsonObject getData(){
        JsonObject scannerData = new JsonObject();
        scannerData.addProperty("hr", userHeartRate);
        scannerData.addProperty("te", userTemperature);
        scannerData.addProperty("bp", getBP());
        if (mLocation != null) {
            scannerData.addProperty("gp", mLocation.getLongitude() + "," + mLocation.getLatitude());
        }

        return scannerData;
    }

}

