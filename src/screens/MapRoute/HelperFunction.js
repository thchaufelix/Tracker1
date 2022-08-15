export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
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
    return (currDist < prevDist ? {...curr, index: index, distance: parseInt(currDist*1000)} : prev)
  });
}

export const clamp = (curr, upper, lower) => Math.min(Math.max(curr, lower), upper)