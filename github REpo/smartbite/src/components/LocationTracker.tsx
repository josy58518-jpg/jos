import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import socketService from '../services/socket';
import { locationAPI } from '../services/api';

interface LocationTrackerProps {
  orderId: string;
  isAgent?: boolean;
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
}

export default function LocationTracker({ orderId, isAgent = false, onLocationUpdate }: LocationTrackerProps) {
  const [deliveryLocation, setDeliveryLocation] = useState<{
    latitude: number;
    longitude: number;
    timestamp: Date;
  } | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<any[]>([]);
  const [agentInfo, setAgentInfo] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  const { latitude, longitude, error, getCurrentPosition } = useGeolocation({
    watch: isAgent,
    enableHighAccuracy: true
  });

  // Agent: Send location updates
  useEffect(() => {
    if (isAgent && latitude && longitude && orderId) {
      const locationData = {
        order_id: orderId,
        latitude,
        longitude
      };

      // Send to server
      locationAPI.updateLocation(locationData).catch(console.error);

      // Send via socket for real-time updates
      socketService.updateAgentLocation({
        agentId: 'current-agent', // This would be the actual agent ID
        orderId,
        latitude,
        longitude
      });

      if (onLocationUpdate) {
        onLocationUpdate({ latitude, longitude });
      }
    }
  }, [latitude, longitude, isAgent, orderId, onLocationUpdate]);

  // Customer: Track delivery
  useEffect(() => {
    if (!isAgent && orderId) {
      // Start tracking
      socketService.trackOrder({
        orderId,
        customerId: 'current-customer' // This would be the actual customer ID
      });

      // Listen for location updates
      const handleLocationUpdate = (data: any) => {
        if (data.orderId === orderId) {
          setDeliveryLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: new Date(data.timestamp)
          });
        }
      };

      socketService.onDeliveryLocationUpdate(handleLocationUpdate);

      // Get initial tracking data
      locationAPI.trackOrder(orderId)
        .then(response => {
          const data = response.data;
          setDeliveryLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: new Date(data.timestamp)
          });
          setAgentInfo({
            name: data.agent_name,
            phone: data.agent_phone
          });
        })
        .catch(error => {
          if (error.response?.status !== 404) {
            console.error('Failed to get tracking info:', error);
          }
        });

      // Get location history
      locationAPI.getLocationHistory(orderId)
        .then(response => {
          setTrackingHistory(response.data);
        })
        .catch(console.error);

      return () => {
        socketService.off('delivery-location-update', handleLocationUpdate);
      };
    }
  }, [isAgent, orderId]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openInMaps = () => {
    if (deliveryLocation) {
      const url = `https://www.google.com/maps?q=${deliveryLocation.latitude},${deliveryLocation.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (isAgent) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Navigation className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Location Tracking</h3>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={getCurrentPosition}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Retry Location Access
            </button>
          </div>
        ) : latitude && longitude ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-700">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Location tracking active</span>
              </div>
              <p className="text-green-600 text-xs mt-1">
                Your location is being shared with the customer
              </p>
            </div>
            
            <div className="text-sm text-gray-600">
              <div>Latitude: {latitude.toFixed(6)}</div>
              <div>Longitude: {longitude.toFixed(6)}</div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-600 text-sm">Getting your location...</p>
          </div>
        )}
      </div>
    );
  }

  // Customer view
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-orange-600 text-white p-2 rounded-lg">
          <MapPin className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Track Your Delivery</h3>
      </div>

      {deliveryLocation ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-700 font-medium">Delivery Agent Location</span>
              <span className="text-green-600 text-sm">
                {new Date(deliveryLocation.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            {agentInfo && (
              <div className="flex items-center space-x-4 mb-3">
                <div className="text-sm text-gray-600">
                  <strong>{agentInfo.name}</strong>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{agentInfo.phone}</span>
                </div>
              </div>
            )}

            <button
              onClick={openInMaps}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>View on Maps</span>
            </button>
          </div>

          {trackingHistory.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Delivery Progress</span>
              </h4>
              <div className="space-y-2">
                {trackingHistory.slice(-5).map((location, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {new Date(location.timestamp).toLocaleTimeString()} - Location updated
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600 text-sm">
            Delivery tracking will be available once your order is picked up by a delivery agent.
          </p>
        </div>
      )}
    </div>
  );
}