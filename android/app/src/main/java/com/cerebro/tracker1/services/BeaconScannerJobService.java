package com.cerebro.tracker1.services;

import android.annotation.SuppressLint;
import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;
import com.cerebro.tracker1.IBeaconPlaygroundModule;
import com.cerebro.tracker1.backend.ForegroundService;
import com.cerebro.tracker1.backend.workers.BeaconScanner;

@SuppressLint("SpecifyJobSchedulerIdRange")
public class BeaconScannerJobService extends JobService {
    @RequiresApi(api = Build.VERSION_CODES.O)
    @Override
    public boolean onStartJob(JobParameters jobParameters) {

        Log.d("loop","starting");
        Intent serviceIntent = new Intent(getApplicationContext(), BeaconScanner.class);
        serviceIntent.putExtra("cmd", "SCHEDULED_UPDATE");
        startForegroundService(serviceIntent);

        Intent serviceIntent2 = new Intent(getApplicationContext(), ForegroundService.class);
        serviceIntent2.putExtra("cmd", "SCHEDULED_UPDATE");
        startForegroundService(serviceIntent2);

        IBeaconPlaygroundModule.startScannerPeriod();

        return true;
    }

    @Override
    public boolean onStopJob(JobParameters jobParameters) {
//        IBeaconPlaygroundModule.scannerSendData();
        return false;
    }
}
