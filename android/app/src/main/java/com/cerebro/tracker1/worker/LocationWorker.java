package com.cerebro.tracker1.worker;

import android.annotation.SuppressLint;
import android.content.Context;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.cerebro.tracker1.backend.ForegroundService;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.CancellationToken;
import com.google.android.gms.tasks.OnTokenCanceledListener;
import com.google.gson.JsonObject;

import java.sql.Timestamp;
import java.util.List;

public class LocationWorker {
    ReactApplicationContext context;
//    Location mLocation;

    boolean playServiceAvailable = false;
    private FusedLocationProviderClient mFusedLocationClient;

    @RequiresApi(api = Build.VERSION_CODES.P)
    public LocationWorker(ReactApplicationContext context) {
        this.context = context;
        if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context) == ConnectionResult.SUCCESS) {
            playServiceAvailable = true;
        } else {
            Log.d("Location", "Play Store is not available");
            playServiceAvailable = false;
        }

        initGPS();
    }

//    public Location getmLocation() {
//        return mLocation;
//    }

    private String getJsonString(Location location){
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
        JsonObject payload = new JsonObject();

        payload.addProperty("latitude", location.getLatitude());
        payload.addProperty("longitude", location.getLongitude());
        payload.addProperty("speed", location.getSpeed());
        payload.addProperty("altitude", location.getAltitude());
        payload.addProperty("heading", location.getBearing());
        payload.addProperty("accuracy", location.getAccuracy());
        payload.addProperty("timestamp", timestamp.getTime());
        return payload.toString();
    }

    private final LocationCallback locationCallback = new LocationCallback() {
        @RequiresApi(api = Build.VERSION_CODES.P)
        @SuppressLint("MissingPermission")
        @Override
        public void onLocationResult(LocationResult locationResult) {
//            super.onLocationResult(locationResult);
//            Log.d("location", locationResult.getLastLocation().toString());

            if (locationResult != null) {
                String locationString = getJsonString(locationResult.getLastLocation());
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("location_data", locationString);
            } else {
                mFusedLocationClient.getLastLocation().addOnCompleteListener(task -> {
                    String locationString = getJsonString(task.getResult());
                    context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("location_data", locationString);
                });
            }
        }
    };

    @RequiresApi(api = Build.VERSION_CODES.P)
    @SuppressLint("MissingPermission")
    private void getLastLocation() {
        mFusedLocationClient.getLastLocation().addOnCompleteListener(task -> {
            String locationString = getJsonString(task.getResult());
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("location_data", locationString);
        });
    }

    private class MyLocationListener implements LocationListener {
        @RequiresApi(api = Build.VERSION_CODES.P)
        public void onLocationChanged(Location location) {
            // Called when a new location is found by the network location provider.
            Log.e("Location Scanner", location.toString());
            if (location != null) {
                String locationString = getJsonString(location);
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("location_data", locationString);
            }
        }

        public void onStatusChanged(String provider, int status, Bundle extras) {
            Log.e("Location Scanner", provider + " STATE CHANGE");
        }

        public void onProviderEnabled(String provider) {
            Log.e("Location Scanner", provider + " Enable");
        }

        public void onProviderDisabled(String provider) {
            Log.e("Location Scanner", provider + " Disabled");
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    @SuppressLint("MissingPermission")
    public void getLocation() {
        if (mFusedLocationClient == null){
            return ;
        }
        mFusedLocationClient
                .getCurrentLocation(LocationRequest.PRIORITY_HIGH_ACCURACY, new CancellationToken() {

                    @Override
                    public boolean isCancellationRequested() {
                        return false;
                    }

                    @NonNull
                    @Override
                    public CancellationToken onCanceledRequested(@NonNull OnTokenCanceledListener onTokenCanceledListener) {
                        return null;
                    }
                })
                .addOnCompleteListener(location -> {
                    Location locationInfo = location.getResult();
                    if (locationInfo != null) {
                        String locationString = getJsonString(locationInfo);
                        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("location_data", locationString);
                    } else {
                        getLastLocation();
                    }
                });
    }

    private LocationRequest createLocationRequest() {
//        LocationRequest mLocationRequest = LocationRequest.create();
        LocationRequest mLocationRequest = LocationRequest.create();

        mLocationRequest.setInterval(1000);  // 10 seconds, in milliseconds
        mLocationRequest.setFastestInterval(500); // 5 second, in milliseconds
        mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
        mLocationRequest.setMaxWaitTime(1500);

        return mLocationRequest;
    }

    @SuppressLint("MissingPermission")
    public void initGPS() {
        if (playServiceAvailable) {
            LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
            locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);

            mFusedLocationClient = LocationServices.getFusedLocationProviderClient(context);
            mFusedLocationClient.getLastLocation().addOnCompleteListener(task -> {
                Location location = task.getResult();
                if (location != null) {
                    String locationString = getJsonString(location);
                    context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("location_data", locationString);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    }
                }
            });

            mFusedLocationClient.requestLocationUpdates(createLocationRequest(), locationCallback, Looper.myLooper());
        } else {
//            LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
//
//            Criteria criteria = new Criteria();
//            criteria.setAccuracy(Criteria.ACCURACY_FINE);
//            criteria.setPowerRequirement(Criteria.NO_REQUIREMENT);
//            String provider = locationManager.getBestProvider(criteria, true);
//
//            List<String> lProviders = locationManager.getProviders(false);
//            for (int i = 0; i < lProviders.size(); i++) {
//                Log.d("LocationActivity", lProviders.get(i));
//            }
//
//            locationManager.requestLocationUpdates(provider, 15000, 500, new MyLocationListener());
        }
    }

    public void stop() {
        if (playServiceAvailable) {
            if (mFusedLocationClient != null) {
                mFusedLocationClient.removeLocationUpdates(locationCallback);
            }
        } else {
//            locationManager
        }
    }
}
