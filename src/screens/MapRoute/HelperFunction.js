export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function radians_to_degrees(radians) {
  return radians * (180 / Math.PI);
}

function get_bearing_deg(lat1, lng1, lat2, lng2) {
  const y = Math.sin(lng2 - lng1) * Math.cos(lng2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lat2 - lat1);

  return radians_to_degrees(Math.atan2(y, x))
}


export function get_shortest_distance(LatA, LngA, LatB, LngB, LatC, LngC) {
  const radius = 6371; // earth radius in km

  let bearing1 = get_bearing_deg(LatA, LngA, LatC, LngC)
  bearing1 = 360 - ((bearing1 + 360) % 360);

  let bearing2 = get_bearing_deg(LatA, LngA, LatB, LngB)
  bearing2 = 360 - ((bearing2 + 360) % 360);

  const lat1Rads = toRadians(LatA);
  const lat3Rads = toRadians(LatC);
  const dLon = toRadians(LngC - LngA);

  const distanceAC = Math.acos(Math.sin(lat1Rads) * Math.sin(lat3Rads)+Math.cos(lat1Rads)*Math.cos(lat3Rads)*Math.cos(dLon)) * radius;
  const min_distance = Math.abs(Math.asin(Math.sin(distanceAC/6371)*Math.sin(toRadians(bearing1)-toRadians(bearing2))) * radius);

  return min_distance

}

export function get_simple_min_distance(p1, p2, p) {
  const ch = (p1.lng - p2.lng) * p.lat + (p2.lat - p1.lat) * p.lng + (p1.lat * p2.lng - p2.lat * p1.lng);
  const del = Math.sqrt(Math.pow(p2.lat - p1.lat, 2) + Math.pow(p2.lng - p1.lng, 2));
  const d = ch / del;
  return d
}


export function haversine_distance(origin, destination) {
  const [lat1, lon1] = origin;
  const [lat2, lon2] = destination;
  const radius = 6371; // earth radius in km

  const dlat = toRadians(lat2 - lat1);
  const dlon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dlon / 2) *
    Math.sin(dlon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = radius * c;

  return d;
}

export const getClosestArray = (arr, goal) => {
  return arr.reduce((prev, curr, index) => (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev))
}

export const getClosestIndexLatLng = (arr, latLng) => {
  return arr.reduce((prev, curr, index) => {
    const currDist = haversine_distance([curr.lat, curr.lng], [latLng.lat, latLng.lng])
    const prevDist = haversine_distance([prev.lat, prev.lng], [latLng.lat, latLng.lng])
    return (currDist < prevDist ? {...curr, index: index, distance: parseInt(currDist * 1000)} : prev)
  }, {index: 0, distance: haversine_distance([arr[0].lat, arr[0].lng], [latLng.lat, latLng.lng]) * 1000});
}

export const clamp = (curr, upper, lower) => Math.min(Math.max(curr, lower), upper)