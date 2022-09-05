package com.cerebro.tracker1.ulti;

import android.os.Build;

import androidx.annotation.RequiresApi;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;


import java.nio.charset.StandardCharsets;

interface device {
    int undefine = 0;
    int iBeacon = 1;
    int tracker = 2;
}

public class BeaconUlti {

    public BeaconUlti() { }

    private static final byte[] HEX_ARRAY = "0123456789ABCDEF".getBytes(StandardCharsets.US_ASCII);

    private int getType(JsonObject detail) {
        int type;
        if (detail.has("device_id")) {
            type = device.tracker;
        } else if (detail.has("UUID") || detail.has("uuid") || detail.has("major") || detail.has("minor")) {
            type = device.iBeacon;
        } else {
            type = device.undefine;
        }

        return type;
    }

    public int getMeasuredPower(JsonObject measuredPowerLookup, JsonObject detail) {
        int type = getType(detail);
        String deviceID = "";

        switch (type) {
            case device.iBeacon:
                deviceID = detail.get("UUID").getAsString().split("-")[0];
                break;
            case device.tracker:
                deviceID = detail.get("device_id").getAsString();
                break;
            default:
                return -68;
        }

        if (measuredPowerLookup.has(deviceID)) {
            return measuredPowerLookup.get(deviceID).getAsInt();
        }

        if (measuredPowerLookup.has("default")) {
            return measuredPowerLookup.get("default").getAsInt();
        }

        return -75;
    }

    public double getDistance(int rssi, int measuredPower) {
        return Math.round(Math.pow(10, (measuredPower - rssi) / (10 * 2.25)) * 100) / 100.0;
    }

    private boolean compareId(String id1, String id2) {
        return id1.equals(id2);
    }

    private String[] parserId(String id) {
        String[] buff_tmp = id.split("-");

        if (buff_tmp.length > 5) {

            StringBuilder buff = new StringBuilder();
            for (int i = 4; i < buff_tmp.length; i++) {
                buff.append(buff_tmp[i]);
            }

            return new String[]{buff_tmp[0], buff_tmp[1], buff_tmp[2], buff_tmp[3], buff.toString()};
//            return new String[]{buff_tmp[0], buff_tmp[1], buff_tmp[2],  buff.toString()};
        }
        return buff_tmp;
    }

    private boolean checkUUID(String whiteListId, String id2) {
        String[] buff_wli = parserId(whiteListId);
        String[] buff_id2 = parserId(id2);

        if (buff_wli[0].equals("00000000") || buff_wli[0].equals(buff_id2[0])) {
            if (buff_wli[1].equals("0000") || buff_wli[1].equals(buff_id2[1])) {
                if (buff_wli[2].equals("0000") || buff_wli[2].equals(buff_id2[2])) {
                    if (buff_wli[3].equals("0000") || buff_wli[3].equals(buff_id2[3])) {
                        if (buff_wli[4].equals("000000000000") || buff_wli[4].equals(buff_id2[4])) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    public Boolean checkDetailIn(JsonArray detailList, JsonObject detail) {
        int type = getType(detail);

        switch (type) {
            case device.iBeacon:
                String beaconUUID = detail.get("UUID").getAsString();
                String beaconMajor = detail.get("major").getAsString();
                String beaconMinor = detail.get("minor").getAsString();

                for (int i = 0; i < detailList.size(); i++) {
                    JsonObject item = detailList.get(i).getAsJsonObject();

                    if (getType(item) != device.iBeacon) {
                        continue;
                    }

                    boolean UUIDCheck = true;
                    boolean majorCheck = true;
                    boolean minorCheck = true;

                    if (item.has("UUID")) {
                        UUIDCheck = checkUUID(item.get("UUID").getAsString(), beaconUUID);
                    }
                    if (item.has("uuid")) {
                        UUIDCheck = checkUUID(item.get("uuid").getAsString(), beaconUUID);
                    }
                    if (item.has("major")) {
                        majorCheck = beaconMajor.equals(item.get("major").getAsString());
                    }
                    if (item.has("minor")) {
                        minorCheck = beaconMinor.equals(item.get("minor").getAsString());
                    }

                    if (UUIDCheck && majorCheck && minorCheck) {
                        return true;
                    }
                }
                break;
            case device.tracker:
                String tracker_id = detail.get("device_id").getAsString();

                for (int i = 0; i < detailList.size(); i++) {
                    JsonObject item = detailList.get(i).getAsJsonObject();

                    if (getType(item) != device.tracker) {
                        continue;
                    }

                    if (tracker_id.equals(item.get("device_id").getAsString())) {
                        return true;
                    }
                }
                break;
            default:
        }
        return false;
    }

    public Boolean getAlert(JsonObject detail, JsonArray whiteList, JsonArray blackList) {
        Boolean whileListCheck = checkDetailIn(whiteList, detail);
        if (whileListCheck) {
            return false;
        }
        return checkDetailIn(blackList, detail);
    }

    public boolean getDetailInRange(double distance, double inRangeDistance) {
        return distance < inRangeDistance;
    }

    private String bytesToHex(byte[] bytes) {
        byte[] hexChars = new byte[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return new String(hexChars, StandardCharsets.UTF_8);
    }

    private void trackerParser(JsonObject detail, String beaconPayload) {
        detail.addProperty("device_id", beaconPayload.substring(44, 59));
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void iBeaconParser(JsonObject detail, String beaconPayload) {

        String UUID = beaconPayload.substring(18, 50);

        String device_type = UUID.substring(0, 8);
        String cat_prefix = UUID.substring(8, 12);
        String pj_prefix = UUID.substring(12, 16);
        String cb_prefix = UUID.substring(16, 20);
        String udid = UUID.substring(20, 32);


        detail.addProperty("UUID", String.join("-", device_type, cat_prefix, pj_prefix, cb_prefix, udid));
        detail.addProperty("major", Integer.parseInt(beaconPayload.substring(50, 54), 16));
        detail.addProperty("minor", Integer.parseInt(beaconPayload.substring(54, 58), 16));

        detail.addProperty("device_type", device_type);
        detail.addProperty("cat_prefix", cat_prefix);
        detail.addProperty("pj_prefix", pj_prefix);
        detail.addProperty("cb_prefix", cb_prefix);
        detail.addProperty("udid", udid);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    public JsonObject payloadDecoder(byte[] BytesData) {

        String rawData = bytesToHex(BytesData).toUpperCase();
        if (!rawData.startsWith("02")) {
            rawData = "000000" + rawData;
        }

        String header = rawData.substring(0, 10);
        String iBeaconSign = rawData.substring(10, 18);

        JsonObject beaconDetail = new JsonObject();
        if (header.equals("0201060E09")) {
            trackerParser(beaconDetail, rawData);
        } else if (iBeaconSign.equals("4C000215")) {
            iBeaconParser(beaconDetail, rawData);
        }

        return beaconDetail;
    }

    public boolean checkTarget(JsonObject mpl, JsonObject detail) {
        int type = getType(detail);
        switch (type) {
            case device.iBeacon:
                String beaconDTID = detail.get("UUID").getAsString().split("-")[0];
                return mpl.has(beaconDTID);
            case device.tracker:
                return true;
        }
        return false;
    }

}
