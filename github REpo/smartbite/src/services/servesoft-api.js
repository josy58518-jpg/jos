const SERVESOFT_API_URL = import.meta.env.VITE_SERVESOFT_API_URL || 'http://localhost';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return { data };
};

const serveSoftAPI = {
  request: async (url, options = {}) => {
    const response = await fetch(`${SERVESOFT_API_URL}/${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return handleResponse(response);
  }
};

export const authAPI = {
  login: async (credentials) => {
    const response = await serveSoftAPI.request('api_auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    return {
      data: {
        user: response.data.user,
        token: 'session'
      }
    };
  },

  register: async (userData) => {
    const response = await serveSoftAPI.request('api_auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        password: userData.password,
        confirm: userData.password
      }),
    });

    const loginResponse = await authAPI.login({
      email: userData.email,
      password: userData.password
    });

    return loginResponse;
  },

  verify: async () => {
    const response = await serveSoftAPI.request('api_auth.php?action=check');

    if (!response.data.authenticated) {
      throw new Error('Not authenticated');
    }

    return {
      data: {
        user: response.data.user
      }
    };
  },

  logout: async () => {
    return serveSoftAPI.request('api_auth.php?action=logout', {
      method: 'POST',
    });
  }
};

export const restaurantsAPI = {
  getRestaurants: async () => {
    const response = await serveSoftAPI.request('bootstrap.php');

    return {
      data: response.data.restaurants.map(r => ({
        id: parseInt(r.id.replace('r', '')),
        name: r.name,
        address: r.address,
        location: r.location,
        phone: r.phone,
        status: r.status,
        image_url: '/restaurant-placeholder.jpg',
        cuisine_type: 'Mixed',
        rating: 4.5,
        delivery_time: '30-45 min',
        is_approved: r.status === 'ACTIVE'
      }))
    };
  },

  getRestaurant: async (id) => {
    const response = await serveSoftAPI.request('bootstrap.php');
    const restaurant = response.data.restaurants.find(r => r.id === `r${id}`);

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    return {
      data: {
        id: parseInt(restaurant.id.replace('r', '')),
        name: restaurant.name,
        address: restaurant.address,
        location: restaurant.location,
        phone: restaurant.phone,
        status: restaurant.status,
        image_url: '/restaurant-placeholder.jpg',
        cuisine_type: 'Mixed',
        rating: 4.5,
        delivery_time: '30-45 min',
        is_approved: restaurant.status === 'ACTIVE'
      }
    };
  },

  getMyRestaurant: async () => {
    const response = await serveSoftAPI.request('api_manager.php?action=get_menu');

    if (response.data.restaurant) {
      return {
        data: {
          id: response.data.restaurant.id,
          name: response.data.restaurant.name,
          status: 'ACTIVE',
          is_approved: true
        }
      };
    }

    throw new Error('No restaurant found for this manager');
  }
};

export const menuAPI = {
  getMenuItems: async (restaurantId) => {
    const response = await serveSoftAPI.request(`api_customer.php?action=get_menu&restaurant_id=${restaurantId}`);

    return {
      data: response.data.menu.map(item => ({
        id: parseInt(item.id.replace('m', '')),
        restaurant_id: parseInt(item.restaurantId.replace('r', '')),
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        is_available: item.available,
        image_url: '/food-placeholder.jpg'
      }))
    };
  },

  createMenuItem: async (data) => {
    return serveSoftAPI.request('api_manager.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'add_menu_item',
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        available: data.is_available !== false
      })
    });
  },

  updateMenuItem: async (id, data) => {
    return serveSoftAPI.request('api_manager.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_menu_item',
        menu_id: id,
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        available: data.is_available !== false
      })
    });
  },

  deleteMenuItem: async (id) => {
    return serveSoftAPI.request('api_manager.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete_menu_item',
        menu_id: id
      })
    });
  }
};

export const ordersAPI = {
  getCustomerOrders: async () => {
    const response = await serveSoftAPI.request('api_customer.php?action=get_orders');

    return {
      data: response.data.orders.map(order => ({
        id: order.id,
        restaurant_id: order.restaurantId,
        restaurant_name: order.restaurantName,
        status: order.status.toLowerCase(),
        order_type: order.orderType,
        total_amount: order.totalAmount,
        created_at: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          menu_item_id: item.menuItemId,
          name: item.itemName,
          quantity: item.quantity,
          price: item.price
        }))
      }))
    };
  },

  getRestaurantOrders: async () => {
    const response = await serveSoftAPI.request('api_manager.php?action=get_orders&status=ALL&type=ALL');

    return {
      data: response.data.orders.map(order => ({
        id: order.id,
        customer_name: order.customerName,
        status: order.status.toLowerCase(),
        order_type: order.orderType,
        total_amount: order.totalAmount,
        created_at: order.createdAt,
        items: order.items.map(item => ({
          name: item.itemName,
          quantity: item.quantity,
          price: item.price
        }))
      }))
    };
  },

  getAvailableDeliveries: async () => {
    const response = await serveSoftAPI.request('api_driver.php?action=get_deliveries&status=PENDING');

    return {
      data: response.data.deliveries.map(delivery => ({
        id: delivery.deliveryId,
        order_id: delivery.orderId,
        restaurant_name: delivery.restaurantName,
        delivery_address: delivery.deliveryAddress,
        customer_name: delivery.customerName,
        customer_phone: delivery.customerPhone,
        status: 'pending',
        order_total: delivery.orderTotal
      }))
    };
  },

  getAgentOrders: async () => {
    const response = await serveSoftAPI.request('api_driver.php?action=get_deliveries&status=ALL');

    return {
      data: response.data.deliveries.map(delivery => ({
        id: delivery.orderId,
        delivery_id: delivery.deliveryId,
        restaurant_name: delivery.restaurantName,
        delivery_address: delivery.deliveryAddress,
        customer_name: delivery.customerName,
        customer_phone: delivery.customerPhone,
        status: delivery.deliveryStatus.toLowerCase(),
        total_amount: delivery.orderTotal,
        created_at: delivery.createdAt
      }))
    };
  },

  createOrder: async (data) => {
    return serveSoftAPI.request('api_customer.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'place_order',
        restaurant_id: data.restaurant_id,
        order_type: data.delivery_address ? 'DELIVERY' : 'DINE_IN',
        delivery_address: data.delivery_address || null
      })
    });
  },

  updateOrderStatus: async (id, data) => {
    const statusMap = {
      'preparing': 'IN_PREP',
      'ready': 'READY',
      'in_transit': 'COMPLETED',
      'delivered': 'COMPLETED',
      'cancelled': 'CANCELLED'
    };

    return serveSoftAPI.request('api_manager.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_order_status',
        order_id: id,
        status: statusMap[data.status] || data.status.toUpperCase()
      })
    });
  },

  acceptDelivery: async (orderId) => {
    const response = await serveSoftAPI.request('api_driver.php?action=get_deliveries&status=ALL');
    const delivery = response.data.deliveries.find(d => d.orderId === orderId);

    if (!delivery) {
      throw new Error('Delivery not found');
    }

    return serveSoftAPI.request('api_driver.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'accept_delivery',
        delivery_id: delivery.deliveryId
      })
    });
  }
};

export const cartAPI = {
  getCart: async () => {
    const response = await serveSoftAPI.request('api_customer.php?action=get_cart');

    return {
      data: {
        items: response.data.cart.items.map(item => ({
          id: item.cartItemId,
          menu_item_id: parseInt(item.menuItemId.replace('m', '')),
          name: item.itemName,
          price: item.price,
          quantity: item.quantity,
          restaurant_id: parseInt(item.restaurantId.replace('r', ''))
        })),
        total: response.data.cart.total
      }
    };
  },

  addToCart: async (menuItemId, quantity = 1) => {
    return serveSoftAPI.request('api_customer.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'add_to_cart',
        menu_id: menuItemId,
        quantity: quantity
      })
    });
  },

  removeFromCart: async (cartItemId) => {
    return serveSoftAPI.request('api_customer.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'remove_from_cart',
        cart_item_id: cartItemId
      })
    });
  },

  clearCart: async () => {
    const cart = await cartAPI.getCart();

    for (const item of cart.data.items) {
      await cartAPI.removeFromCart(item.id);
    }

    return { data: { success: true } };
  }
};

export const usersAPI = {
  getUsers: async () => {
    return serveSoftAPI.request('api_admin.php?action=get_users&role=ALL');
  },

  toggleUserStatus: async (userId) => {
    return { data: { success: true } };
  },

  deleteUser: async (userId) => {
    return { data: { success: true } };
  }
};

export const paymentAPI = {
  initiatePayment: async (data) => {
    return { data: { success: true, paymentId: 'cash_' + Date.now() } };
  },

  getPaymentStatus: async (orderId) => {
    return { data: { status: 'completed' } };
  }
};

export const locationAPI = {
  updateLocation: async (data) => {
    return { data: { success: true } };
  },

  trackOrder: async (orderId) => {
    return { data: { location: null } };
  }
};

export const reviewsAPI = {
  getReviews: async () => {
    return { data: [] };
  },

  createReview: async (data) => {
    return { data: { success: true } };
  }
};

export default serveSoftAPI;
