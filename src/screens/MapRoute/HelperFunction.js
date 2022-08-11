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