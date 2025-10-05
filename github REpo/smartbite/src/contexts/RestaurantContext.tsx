import React, { createContext, useContext, useState, useEffect } from 'react';
import { restaurantsAPI } from '../services/api';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  town: string;
  rating: number;
  delivery_time: string;
  delivery_fee: number;
  min_order: number;
  categories: string[];
  is_active: boolean;
  user_id: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

interface RestaurantContextType {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  createRestaurant: (restaurantData: any) => Promise<string>;
  updateRestaurant: (restaurantId: string, updates: Partial<Restaurant>) => Promise<void>;
  fetchRestaurants: () => Promise<void>;
  myRestaurant: Restaurant | null;
  fetchMyRestaurant: () => Promise<void>;
  clearError: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [myRestaurant, setMyRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching restaurants...');
      
      const response = await restaurantsAPI.getRestaurants();
      const restaurantData = response.data || [];
      
      console.log(`✅ Fetched ${restaurantData.length} restaurants`);
      setRestaurants(restaurantData);
    } catch (error: any) {
      console.error('❌ Failed to fetch restaurants:', error);
      setError('Failed to load restaurants');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRestaurant = async () => {
    try {
      setError(null);
      console.log('🔄 Fetching my restaurant...');
      
      const response = await restaurantsAPI.getMyRestaurant();
      setMyRestaurant(response.data);
      console.log('✅ My restaurant loaded');
    } catch (error: any) {
      console.error('❌ Failed to fetch my restaurant:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load restaurant');
      }
      setMyRestaurant(null);
    }
  };

  const createRestaurant = async (restaurantData: any): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Creating restaurant...', restaurantData);
      
      // Frontend validation
      const requiredFields = ['name', 'description', 'town', 'address', 'phone', 'delivery_time', 'delivery_fee', 'min_order', 'categories'];
      for (const field of requiredFields) {
        if (!restaurantData[field] || (Array.isArray(restaurantData[field]) && restaurantData[field].length === 0)) {
          throw new Error(`${field.replace('_', ' ')} is required`);
        }
      }

      // Validate numeric fields
      if (isNaN(Number(restaurantData.delivery_fee)) || Number(restaurantData.delivery_fee) < 0) {
        throw new Error('Valid delivery fee is required');
      }
      if (isNaN(Number(restaurantData.min_order)) || Number(restaurantData.min_order) < 0) {
        throw new Error('Valid minimum order amount is required');
      }

      const response = await restaurantsAPI.createRestaurant(restaurantData);
      
      // Refresh data
      await Promise.all([fetchMyRestaurant(), fetchRestaurants()]);
      
      console.log('✅ Restaurant created successfully');
      return response.data.restaurantId;
    } catch (error: any) {
      console.error('❌ Failed to create restaurant:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create restaurant';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (restaurantId: string, updates: Partial<Restaurant>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Updating restaurant...', restaurantId);
      
      await restaurantsAPI.updateRestaurant(restaurantId, updates);
      
      // Refresh data
      await Promise.all([fetchMyRestaurant(), fetchRestaurants()]);
      
      console.log('✅ Restaurant updated successfully');
    } catch (error: any) {
      console.error('❌ Failed to update restaurant:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update restaurant';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <RestaurantContext.Provider value={{
      restaurants,
      loading,
      error,
      createRestaurant,
      updateRestaurant,
      fetchRestaurants,
      myRestaurant,
      fetchMyRestaurant,
      clearError
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurants must be used within a RestaurantProvider');
  }
  return context;
}