package com.cerebro.tracker1.backend.workers;

import static com.cerebro.tracker1.backend.ForegroundService.makeUDPRequest;

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

import com.cerebro.tracker1.ulti.MathUlti;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.CancellationToken;
import com.google.android.gms.tasks.OnTokenCanceledListener;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.util.List;

public class LocationWorker {
    Context context;
    Location mLocation;
    JsonArray restrictedArea;

    boolean playServiceAvailable = false;

    private FusedLocationProviderClient mFusedLocationClient;

    @RequiresApi(api = Build.VERSION_CODES.P)
    public LocationWorker(Context context, JsonObject mBeaconConfig) {
        this.context = context;
        updateConfig(mBeaconConfig);
        if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context) == ConnectionResult.SUCCESS) {
            //Google Play services are available

            playServiceAvailable = true;
        } else {
            //Google Play services are not available on this device
            Log.d("Location", "Play Store is not available");
//            initGPS2();
            playServiceAvailable = false;
        }

        initGPS();
    }

    public void updateConfig(JsonObject config){
        try {
            if (config.has("pj_rta")) {
                restrictedArea = config.get("pj_rta").getAsJsonArray();
            }
        } catch (Exception ignored) {

        }
    }

    public Location getmLocation() {
        return mLocation;
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    private void checkRestrictedArea() {

        if (mLocation == null || restrictedArea == null) {
            return;
        }

        String json = String.format("[%s,%s]", mLocation.getLatitude(), mLocation.getLongitude());
        JsonArray currentLocation = new Gson().fromJson(json, JsonArray.class);
        for (int idx = 0; idx < restrictedArea.size(); idx++) {
            JsonObject rta = restrictedArea.get(idx).getAsJsonObject();

            int areaId = rta.get("id").getAsInt();
            JsonArray polygon = rta.get("pts").getAsJsonArray();

            boolean inside = MathUlti.insidePolygon(currentLocation, polygon);
            if (inside) {
                JsonObject payload = new JsonObject();
                payload.addProperty("wn", 24);
                payload.addProperty("rtaw", areaId);
                makeUDPRequest(payload);
            }
        }

//
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    private void updateLocation(Location location) {
        mLocation = location;
        if (location != null) {

            StringBuilder sBuffer = new StringBuilder();
            sBuffer.append(mLocation.getLongitude()).append(",");
            sBuffer.append(mLocation.getLatitude()).append(",");
            sBuffer.append(mLocation.getSpeed()).append(",");
            sBuffer.append(mLocation.getAltitude()).append(",");
            sBuffer.append(mLocation.getBearing()).append(",");
            sBuffer.append(mLocation.getAccuracy());

            JsonObject payload = new JsonObject();
            payload.addProperty("gp", String.valueOf(sBuffer));
            makeUDPRequest(payload);

            checkRestrictedArea();
        }
    }

    private final LocationCallback locationCallback = new LocationCallback() {
        @RequiresApi(api = Build.VERSION_CODES.P)
        @SuppressLint("MissingPermission")
        @Override
        public void onLocationResult(LocationResult locationResult) {
//            super.onLocationResult(locationResult);
            Log.d("location",locationResult.getLastLocation().toString());
            if (locationResult != null) {
                Location location = locationResult.getLastLocation();
                updateLocation(location);
            } else {
                mFusedLocationClient.getLastLocation().addOnCompleteListener(task -> {
                    Location location = task.getResult();
                    updateLocation(location);
                });
            }
        }
    };


    @RequiresApi(api = Build.VERSION_CODES.P)
    @SuppressLint("MissingPermission")
    private void getLastLocation(){
        mFusedLocationClient.getLastLocation().addOnCompleteListener(task -> {
            Location locationInfo = task.getResult();
            updateLocation(locationInfo);
        });
    }


    @RequiresApi(api = Build.VERSION_CODES.P)
    @SuppressLint("MissingPermission")
    public void getLocation() {
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
                    Log.e("GPS CALL", "location updated");
                    Location locationInfo = location.getResult();
                    if (locationInfo != null) {
                        updateLocation(locationInfo);
                    } else {
                        getLastLocation();
                    }
                });
    }



    private LocationRequest createLocationRequest(){
        LocationRequest mLocationRequest = LocationRequest.create();

        mLocationRequest.setInterval(10 * 1000);  // 10 seconds, in milliseconds
        mLocationRequest.setFastestInterval(5 * 1000); // 5 second, in milliseconds
        mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

        return mLocationRequest;
    }

    private class MyLocationListener implements LocationListener {
        @RequiresApi(api = Build.VERSION_CODES.P)
        public void onLocationChanged(Location location) {
            // Called when a new location is found by the network location provider.
            updateLocation(location);
            Log.e("Location Scanner", location.toString());
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

    @SuppressLint("MissingPermission")
    public void initGPS() {
        if (playServiceAvailable) {
            LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
            locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);

            mFusedLocationClient = LocationServices.getFusedLocationProviderClient(context);
            mFusedLocationClient.getLastLocation().addOnCompleteListener(task -> {
                Location location = task.getResult();
                if (location != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        updateLocation(location);
                    }
                }
            });
//            mFusedLocationClient.requestLocationUpdates(createLocationRequest(), locationCallback, Looper.myLooper());
        } else {
            LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);

            Criteria criteria = new Criteria();
            criteria.setAccuracy(Criteria.ACCURACY_FINE);
            criteria.setPowerRequirement(Criteria.NO_REQUIREMENT);
            String provider = locationManager.getBestProvider(criteria, true);

            List<String> lProviders = locationManager.getProviders(false);
            for (int i = 0; i < lProviders.size(); i++) {
                Log.d("LocationActivity", lProviders.get(i));
            }

            locationManager.requestLocationUpdates(provider, 15000, 500, new MyLocationListener());

            // Register the listener with the Location Manager to receive location updates
//            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
//                locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 4 * 60 * 1000, 10, locationListener);
//            } else if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
//                locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 4 * 60 * 1000, 10, locationListener);
//            };
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

    @RequiresApi(api = Build.VERSION_CODES.P)
    @SuppressLint("MissingPermission")
    public void initGPS2() {
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        // Define a listener that responds to location updates
        LocationListener locationListener = new LocationListener() {
            @RequiresApi(api = Build.VERSION_CODES.P)
            public void onLocationChanged(Location location) {
                // Called when a new location is found by the network location provider.
                updateLocation(location);
            }

            public void onStatusChanged(String provider, int status, Bundle extras) {
            }

            public void onProviderEnabled(String provider) {
            }

            public void onProviderDisabled(String provider) {
            }
        };

        // Register the listener with the Location Manager to receive location updates
        if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
            locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 4 * 60 * 1000, 10, new MyLocationListener());
        } else if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 4 * 60 * 1000, 10, new MyLocationListener());
        }
        ;

    }
}
