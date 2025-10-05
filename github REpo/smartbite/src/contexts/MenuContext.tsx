import React, { createContext, useContext, useState } from 'react';
import { menuAPI } from '../services/api';

export interface MenuItem {
  id: string;
  restaurant_id: string;
  item_name: string;
  item_description: string;
  item_price: number;
  image: string;
  category: string;
  is_available: boolean;
  prep_time: number;
  created_at: string;
  updated_at: string;
}

interface MenuContextType {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  addMenuItem: (item: any) => Promise<string>;
  updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
  toggleAvailability: (itemId: string) => Promise<void>;
  getMenuByRestaurant: (restaurantId: string) => Promise<MenuItem[]>;
  fetchMenuItems: (restaurantId: string) => Promise<void>;
  clearError: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Fetching menu for restaurant ${restaurantId}...`);
      
      const response = await menuAPI.getMenuItems(restaurantId);
      const items = response.data || [];
      
      console.log(`✅ Fetched ${items.length} menu items`);
      setMenuItems(items);
    } catch (error: any) {
      console.error('❌ Failed to fetch menu items:', error);
      setError('Failed to load menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (itemData: any): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Adding menu item...', itemData);
      
      // Frontend validation
      const requiredFields = ['restaurant_id', 'item_name', 'item_description', 'item_price', 'category'];
      for (const field of requiredFields) {
        if (!itemData[field] || (typeof itemData[field] === 'string' && !itemData[field].trim())) {
          throw new Error(`${field.replace('_', ' ')} is required`);
        }
      }

      if (isNaN(Number(itemData.item_price)) || Number(itemData.item_price) <= 0) {
        throw new Error('Valid item price is required');
      }

      const response = await menuAPI.createMenuItem(itemData);
      
      // Refresh menu items
      await fetchMenuItems(itemData.restaurant_id);
      
      console.log('✅ Menu item added successfully');
      return response.data.itemId;
    } catch (error: any) {
      console.error('❌ Failed to add menu item:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>): Promise<void> => {
    try {
      setError(null);
      console.log(`🔄 Updating menu item ${itemId}...`);
      
      await menuAPI.updateMenuItem(itemId, updates);
      
      // Refresh menu items for the restaurant
      const item = menuItems.find(item => item.id === itemId);
      if (item) {
        await fetchMenuItems(item.restaurant_id);
      }
      
      console.log('✅ Menu item updated successfully');
    } catch (error: any) {
      console.error('❌ Failed to update menu item:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteMenuItem = async (itemId: string): Promise<void> => {
    try {
      setError(null);
      console.log(`🔄 Deleting menu item ${itemId}...`);
      
      const item = menuItems.find(item => item.id === itemId);
      await menuAPI.deleteMenuItem(itemId);
      
      if (item) {
        await fetchMenuItems(item.restaurant_id);
      }
      
      console.log('✅ Menu item deleted successfully');
    } catch (error: any) {
      console.error('❌ Failed to delete menu item:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const toggleAvailability = async (itemId: string): Promise<void> => {
    try {
      const item = menuItems.find(item => item.id === itemId);
      if (item) {
        await updateMenuItem(itemId, { is_available: !item.is_available });
      }
    } catch (error: any) {
      console.error('❌ Failed to toggle availability:', error);
      throw error;
    }
  };

  const getMenuByRestaurant = async (restaurantId: string): Promise<MenuItem[]> => {
    try {
      console.log(`🔄 Getting menu for restaurant ${restaurantId}...`);
      const response = await menuAPI.getMenuItems(restaurantId);
      const items = response.data || [];
      console.log(`✅ Retrieved ${items.length} menu items`);
      return items;
    } catch (error: any) {
      console.error('❌ Failed to get menu by restaurant:', error);
      return [];
    }
  };

  return (
    <MenuContext.Provider value={{
      menuItems,
      loading,
      error,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      toggleAvailability,
      getMenuByRestaurant,
      fetchMenuItems,
      clearError
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}