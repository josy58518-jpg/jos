import React, { createContext, useContext, useState } from 'react';
import { ordersAPI } from '../services/api';
import { useAuth } from './AuthContext';

export interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_image?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  delivery_address: string;
  payment_method: string;
  payment_status: string;
  agent_id?: string;
  agent_name?: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  createOrder: (orderData: any) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status'], agentId?: string) => Promise<void>;
  getCustomerOrders: () => Promise<void>;
  getRestaurantOrders: () => Promise<void>;
  getAvailableDeliveries: () => Promise<Order[]>;
  getAgentOrders: () => Promise<void>;
  acceptDelivery: (orderId: string) => Promise<void>;
  clearError: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const clearError = () => setError(null);

  const createOrder = async (orderData: any): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Creating order...', orderData);
      
      // Frontend validation
      const errors = [];
      if (!orderData.restaurant_id) errors.push('Restaurant is required');
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        errors.push('Order items are required');
      }
      if (!orderData.delivery_address?.trim()) errors.push('Delivery address is required');
      if (!orderData.customer_phone?.trim()) errors.push('Phone number is required');

      // Validate items
      if (orderData.items && Array.isArray(orderData.items)) {
        for (let i = 0; i < orderData.items.length; i++) {
          const item = orderData.items[i];
          if (!item.menu_item_id) {
            errors.push(`Item ${i + 1}: Menu item ID is required`);
          }
          if (!item.quantity || item.quantity <= 0) {
            errors.push(`Item ${i + 1}: Valid quantity is required`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Ensure numeric values
      const processedOrderData = {
        ...orderData,
        restaurant_id: Number(orderData.restaurant_id),
        items: orderData.items.map((item: any) => ({
          menu_item_id: Number(item.menu_item_id),
          quantity: Number(item.quantity)
        }))
      };

      console.log('📤 Sending processed order data:', processedOrderData);
      
      const response = await ordersAPI.createOrder(processedOrderData);
      
      // Refresh orders after creation
      if (user?.role === 'customer') {
        await getCustomerOrders();
      }
      
      console.log('✅ Order created successfully');
      return response.data.orderId;
    } catch (error: any) {
      console.error('❌ Failed to create order:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], agentId?: string): Promise<void> => {
    try {
      setError(null);
      console.log(`🔄 Updating order ${orderId} status to ${status}...`);
      
      await ordersAPI.updateOrderStatus(orderId, { status, agent_id: agentId });
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status, updated_at: new Date().toISOString(), ...(agentId && { agent_id: agentId }) }
          : order
      ));
      
      console.log('✅ Order status updated successfully');
    } catch (error: any) {
      console.error('❌ Failed to update order status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getCustomerOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching customer orders...');
      
      const response = await ordersAPI.getCustomerOrders();
      const orderData = response.data || [];
      
      console.log(`✅ Fetched ${orderData.length} customer orders`);
      setOrders(orderData);
    } catch (error: any) {
      console.error('❌ Failed to fetch customer orders:', error);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching restaurant orders...');
      
      const response = await ordersAPI.getRestaurantOrders();
      const orderData = response.data || [];
      
      console.log(`✅ Fetched ${orderData.length} restaurant orders`);
      setOrders(orderData);
    } catch (error: any) {
      console.error('❌ Failed to fetch restaurant orders:', error);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDeliveries = async (): Promise<Order[]> => {
    try {
      console.log('🔄 Fetching available deliveries...');
      const response = await ordersAPI.getAvailableDeliveries();
      const deliveries = response.data || [];
      console.log(`✅ Fetched ${deliveries.length} available deliveries`);
      return deliveries;
    } catch (error: any) {
      console.error('❌ Failed to fetch available deliveries:', error);
      setError('Failed to load available deliveries');
      return [];
    }
  };

  const getAgentOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching agent orders...');
      
      const response = await ordersAPI.getAgentOrders();
      const orderData = response.data || [];
      
      console.log(`✅ Fetched ${orderData.length} agent orders`);
      setOrders(orderData);
    } catch (error: any) {
      console.error('❌ Failed to fetch agent orders:', error);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const acceptDelivery = async (orderId: string): Promise<void> => {
    try {
      setError(null);
      console.log(`🔄 Accepting delivery for order ${orderId}...`);
      
      await ordersAPI.acceptDelivery(orderId);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'in_transit', agent_id: user?.id, updated_at: new Date().toISOString() }
          : order
      ));
      
      console.log('✅ Delivery accepted successfully');
    } catch (error: any) {
      console.error('❌ Failed to accept delivery:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to accept delivery';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      error,
      createOrder,
      updateOrderStatus,
      getCustomerOrders,
      getRestaurantOrders,
      getAvailableDeliveries,
      getAgentOrders,
      acceptDelivery,
      clearError
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}