package com.cerebro.tracker1.ulti;

import android.content.Context;
import android.widget.Toast;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Properties;

public class StorageFunction {

    private static final String offlineFolder = "offline";
    private static final String offlineFile = "offlineBackup.txt";

    private static final String configFolder = "config";
    private static final String configFile = "config.txt";



    public StorageFunction() {

    }

    public static void clearOfflineData(Context mcoContext){
        File file = new File(mcoContext.getFilesDir(), offlineFolder);
        try {
            File gpxfile = new File(file, offlineFile);
            BufferedWriter out = new BufferedWriter(new FileWriter(gpxfile));
            out.close();

        } catch (Exception e) {
            Toast.makeText(mcoContext, String.valueOf(e), Toast.LENGTH_SHORT).show();
        }
        
    }

    /**
     * Storage Functions
     */
    public static void writeFileOnInternalStorage(Context mcoContext, String sBody, boolean append) {
        File file = new File(mcoContext.getFilesDir(), offlineFolder);
        if (!file.exists()) {
            file.mkdir();
        }

        try {
            File gpxfile = new File(file, offlineFile);
            BufferedWriter out = new BufferedWriter(new FileWriter(gpxfile, append));

            out.write(sBody);
            out.write("\n");
            out.close();

        } catch (Exception e) {
            Toast.makeText(mcoContext, String.valueOf(e), Toast.LENGTH_SHORT).show();
        }
    }

    public static String readFileOnInternalStorage(Context mcoContext) {
        StringBuilder text = new StringBuilder();

        try {
            File file = new File(mcoContext.getFilesDir(), offlineFolder);
            File gpxfile = new File(file, offlineFile);

            BufferedReader br = new BufferedReader(new FileReader(gpxfile));
            String line;

            while ((line = br.readLine()) != null) {
                text.append(line);
                text.append("\n");
            }
            br.close();
        } catch (IOException e) {
            //You'll need to add proper error handling here
        }

        return text.toString();

    }

    /**
     * Config Functions
     */
    public static void saveConfigurations(Context mContext, JsonObject config) {
//        Toast.makeText(mContext, String.valueOf(mContext.getFilesDir()), Toast.LENGTH_SHORT).show();

        File file = new File(mContext.getFilesDir(), configFolder);
        if (!file.exists()) {
            file.mkdir();
        }
        File gpxfile = new File(file, configFile);

        try {
            BufferedWriter out = new BufferedWriter(new FileWriter(gpxfile,false));

            out.write(config.toString());
            out.close();

        } catch (Exception e) {
            Toast.makeText(mContext, String.valueOf(e), Toast.LENGTH_SHORT).show();
        }
    }

    public static JsonObject readConfigurations(Context mContext, JsonObject config) {
        File file = new File(mContext.getFilesDir(), configFolder);
        File gpxfile = new File(file, configFile);

        String text = "{}";

        try {
            BufferedReader br = new BufferedReader(new FileReader(gpxfile));
            String line;

            while ((line = br.readLine()) != null) {
                text = line;
            }
            br.close();
        } catch (IOException e) {
            //You'll need to add proper error handling here
            Toast.makeText(mContext, String.valueOf(e), Toast.LENGTH_SHORT).show();
        }

        JsonObject savedConfig = new Gson().fromJson(text, JsonObject.class);
        for (String key : savedConfig.keySet()) {
            config.add(key, savedConfig.get(key));
        }

        return config;
    }

}
