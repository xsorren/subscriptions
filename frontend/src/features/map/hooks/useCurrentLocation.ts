import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

type Coordinates = {
  lat: number;
  lng: number;
};

const DEFAULT_COORDS: Coordinates = { lat: -34.6037, lng: -58.3816 };

export function useCurrentLocation() {
  const [coords, setCoords] = useState<Coordinates>(DEFAULT_COORDS);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setPermissionDenied(false);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoords({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch {
      setError('No pudimos obtener tu ubicación actual.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { coords, loading, permissionDenied, error, refresh };
}
