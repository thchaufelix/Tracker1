package com.cerebro.tracker1.ulti;

import com.google.gson.JsonArray;

public class MathUlti {

    public static boolean insidePolygon(JsonArray point, JsonArray polygon){

        double x = point.get(0).getAsDouble(), y = point.get(1).getAsDouble();

        boolean inside = false;
        for (int i = 0, j = polygon.size() - 1; i < polygon.size(); j = i++) {
            double xi = polygon.get(i).getAsJsonArray().get(0).getAsDouble();
            double yi = polygon.get(i).getAsJsonArray().get(1).getAsDouble();

            double xj = polygon.get(j).getAsJsonArray().get(0).getAsDouble();
            double yj = polygon.get(j).getAsJsonArray().get(1).getAsDouble();

            boolean intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };
}
