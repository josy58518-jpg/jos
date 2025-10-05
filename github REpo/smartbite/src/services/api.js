import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/servesoft';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartbite_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api_auth.php?action=login', credentials).then(response => {
    if (response.data.success) {
      return {
        data: {
          token: 'session_based',
          user: response.data.user
        }
      };
    }
    throw new Error(response.data.error || 'Login failed');
  }),
  register: (userData) => api.post('/api_auth.php?action=register', {
    name: userData.name,
    phone: userData.phone || '',
    email: userData.email,
    password: userData.password,
    confirm: userData.password
  }).then(response => {
    if (response.data.success) {
      return api.post('/api_auth.php?action=login', {
        email: userData.email,
        password: userData.password
      }).then(loginResponse => ({
        data: {
          token: 'session_based',
          user: loginResponse.data.user
        }
      }));
    }
    throw new Error(response.data.error || 'Registration failed');
  }),
  verify: () => api.get('/api_auth.php?action=check').then(response => {
    if (response.data.authenticated) {
      return {
        data: {
          user: response.data.user
        }
      };
    }
    throw new Error('Not authenticated');
  }),
  logout: () => api.get('/api_auth.php?action=logout'),
  checkAdmin: () => api.get('/api_auth.php?action=checkAdmin'),
};

export const usersAPI = {
  getProfile: () => api.get('/api_auth.php?action=check').then(response => ({
    data: response.data.user
  })),
  updateProfile: (data) => Promise.reject(new Error('Not implemented in ServeSoft')),
  getUsers: (params) => api.get('/api_admin.php?action=get_users&role=ALL'),
  toggleUserStatus: (userId) => Promise.reject(new Error('Not implemented in ServeSoft')),
  deleteUser: (userId) => Promise.reject(new Error('Not implemented in ServeSoft')),
};

export const restaurantsAPI = {
  getRestaurants: (params) => api.get('/bootstrap.php').then(response => ({
    data: response.data.restaurants.map(r => ({
      id: r.id,
      name: r.name,
      status: r.status,
      location: r.location,
      phone: r.phone,
      address: r.address,
      rating: 4.5,
      deliveryTime: '30-45',
      minOrder: 1000
    }))
  })),
  getRestaurant: (id) => api.get('/bootstrap.php').then(response => {
    const restaurant = response.data.restaurants.find(r => r.id === id);
    if (!restaurant) throw new Error('Restaurant not found');
    return {
      data: {
        id: restaurant.id,
        name: restaurant.name,
        status: restaurant.status,
        location: restaurant.location,
        phone: restaurant.phone,
        address: restaurant.address,
        rating: 4.5,
        deliveryTime: '30-45',
        minOrder: 1000
      }
    };
  }),
  createRestaurant: (data) => api.post('/api_admin.php?action=create_restaurant', {
    name: data.name,
    address: data.address,
    phone: data.phone,
    location: data.location || data.address,
    status: 'ACTIVE'
  }),
  updateRestaurant: (id, data) => api.post('/api_admin.php?action=update_restaurant', {
    restaurant_id: id.replace('r', ''),
    name: data.name,
    address: data.address,
    phone: data.phone,
    location: data.location || data.address,
    status: data.status || 'ACTIVE'
  }),
  getMyRestaurant: () => api.get('/api_manager.php?action=get_restaurant_info'),
};

export const menuAPI = {
  getMenuItems: (restaurantId, params) => api.get(`/api_customer.php?action=get_menu&restaurant_id=${restaurantId.toString().replace('r', '')}`).then(response => ({
    data: response.data.menu.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      available: item.available,
      image: '/placeholder-food.jpg'
    }))
  })),
  getMenuItem: (id) => api.get('/api_customer.php?action=get_menu&restaurant_id=1').then(response => {
    const item = response.data.menu.find(m => m.id === parseInt(id));
    if (!item) throw new Error('Menu item not found');
    return { data: item };
  }),
  createMenuItem: (data) => api.post('/api_manager.php?action=add_menu_item', {
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price,
    available: data.available
  }),
  updateMenuItem: (id, data) => api.post('/api_manager.php?action=update_menu_item', {
    menu_id: id,
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price,
    available: data.available
  }),
  deleteMenuItem: (id) => api.post('/api_manager.php?action=delete_menu_item', {
    menu_id: id
  }),
};

export const ordersAPI = {
  getCustomerOrders: () => api.get('/api_customer.php?action=get_orders').then(response => ({
    data: response.data.orders.map(order => ({
      id: order.id,
      restaurant_id: order.restaurantId,
      total_amount: 0,
      status: order.status.toLowerCase(),
      delivery_address: order.deliveryAddress,
      customer_phone: '',
      payment_method: 'cash',
      payment_status: 'pending',
      created_at: order.date,
      updated_at: order.date
    }))
  })),
  getRestaurantOrders: () => api.get('/api_manager.php?action=get_orders&status=ALL&type=ALL').then(response => ({
    data: response.data.orders.map(order => ({
      id: order.id,
      customer_id: order.customerId,
      restaurant_id: order.restaurantId,
      total_amount: order.totalAmount || 0,
      status: order.status.toLowerCase(),
      delivery_address: order.deliveryAddress,
      customer_phone: order.customerPhone || '',
      payment_method: 'cash',
      payment_status: 'pending',
      created_at: order.orderDate,
      updated_at: order.orderDate
    }))
  })),
  getAvailableDeliveries: () => api.get('/api_driver.php?action=get_deliveries&status=ALL').then(response => ({
    data: response.data.deliveries || []
  })),
  getAgentOrders: () => api.get('/api_driver.php?action=get_deliveries&status=ALL').then(response => ({
    data: response.data.deliveries || []
  })),
  createOrder: (data) => api.post('/api_customer.php?action=place_order', {
    restaurant_id: data.restaurant_id.toString().replace('r', ''),
    order_type: data.order_type || 'DELIVERY',
    delivery_address: data.delivery_address
  }),
  updateOrderStatus: (id, data) => api.post('/api_manager.php?action=update_order_status', {
    order_id: id,
    status: data.status.toUpperCase()
  }),
  acceptDelivery: (id) => api.post('/api_driver.php?action=accept_delivery', {
    delivery_id: id
  }),
};

export const paymentAPI = {
  initiatePayment: (data) => Promise.resolve({ data: { success: true } }),
  getPaymentStatus: (orderId) => Promise.resolve({ data: { status: 'pending' } }),
  getPaymentHistory: () => Promise.resolve({ data: [] }),
};

export const locationAPI = {
  updateLocation: (data) => Promise.resolve({ data: { success: true } }),
  trackOrder: (orderId) => Promise.resolve({ data: { latitude: 0, longitude: 0 } }),
  getLocationHistory: (orderId) => Promise.resolve({ data: [] }),
};

export const reviewsAPI = {
  getReviews: () => Promise.resolve({ data: [] }),
  createReview: (data) => Promise.resolve({ data: { success: true } }),
  updateReview: (id, data) => Promise.resolve({ data: { success: true } }),
  deleteReview: (id) => Promise.resolve({ data: { success: true } }),
};

export default api;
