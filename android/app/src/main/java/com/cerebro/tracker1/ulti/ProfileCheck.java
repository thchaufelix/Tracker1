package com.cerebro.tracker1.ulti;

import android.content.Context;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;


public class ProfileCheck {
    Context context;

    String mCompany = "";
    String mCategory = "";
    String mDeviceType = "";
    JsonArray mProject = new JsonArray();

    public ProfileCheck(Context context, JsonObject config){
        this.context = context;
        updateConfig(config);
    };

    public void updateConfig(JsonObject config){

        try {
            if (config.has("project_prefix")) {
                mProject = config.get("project_prefix").getAsJsonArray();
            }
            if (config.has("cerebro_prefix")) {
                mCompany = config.get("cerebro_prefix").getAsString();
            }
            if (config.has("category")) {
                mCategory = config.get("category").getAsString();
            }
            if (config.has("device_type")) {
                mDeviceType = config.get("device_type").getAsString();
            }
        } catch (Exception ignored){

        }
    }

    public boolean company(String value){
        return mCompany.equals(value);
    }

    public boolean project(String value){
        return mProject.contains(new JsonPrimitive(value));
    }

    public boolean category(String value){
        return mCategory.equals(value);
    }

    public boolean device(String value){
        return mCategory.equals(value);
    }

    public boolean checkDevice(String uuid){
        String[] buffer = uuid.split("-");
        return company(buffer[3]) && category(buffer[1]) && device(buffer[0]);
    }

}
