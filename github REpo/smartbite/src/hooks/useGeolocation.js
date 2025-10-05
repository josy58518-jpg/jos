import { useState, useEffect } from 'react';

export function useGeolocation(options = {}) {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true
  });

  const [watchId, setWatchId] = useState(null);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    ...options
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false
      }));
      return;
    }

    const handleSuccess = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false
      });
    };

    const handleError = (error) => {
      let errorMessage = 'Unknown error occurred';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }

      setLocation(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
    };

    // Get current position
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      defaultOptions
    );

    // Watch position changes if requested
    if (options.watch) {
      const id = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        defaultOptions
      );
      setWatchId(id);
    }

    // Cleanup
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [options.watch]);

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation(prev => ({ ...prev, ...coords, error: null }));
          resolve(coords);
        },
        (error) => {
          reject(error);
        },
        defaultOptions
      );
    });
  };

  return {
    ...location,
    getCurrentPosition,
    isSupported: !!navigator.geolocation
  };
}