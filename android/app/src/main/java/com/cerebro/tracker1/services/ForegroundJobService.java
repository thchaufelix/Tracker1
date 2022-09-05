package com.cerebro.tracker1.services;

import android.annotation.SuppressLint;
import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.Intent;
import android.os.Build;

import androidx.annotation.RequiresApi;

//import com.cerebro.tracker1.IBeaconPlaygroundModule;
import com.cerebro.tracker1.backend.ForegroundService;

@SuppressLint("SpecifyJobSchedulerIdRange")
public class ForegroundJobService extends JobService {

    @RequiresApi(api = Build.VERSION_CODES.O)
    @SuppressLint("SpecifyJobSchedulerIdRange")
    @Override
    public boolean onStartJob(JobParameters jobParameters) {
        Intent serviceIntent = new Intent(getApplicationContext(), ForegroundService.class);
        serviceIntent.putExtra("cmd", "SCHEDULED_UPDATE");
        startForegroundService(serviceIntent);

//        IBeaconPlaygroundModule.startForegroundPeriod();
//        ForegroundService.startForegroundPeriod();

        return true;
    }

    @Override
    public boolean onStopJob(JobParameters jobParameters) {
//        stopForeground(true);
        return true;
    }
}
