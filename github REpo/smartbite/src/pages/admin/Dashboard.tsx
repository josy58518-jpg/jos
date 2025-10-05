import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useRestaurants } from '../../contexts/RestaurantContext';
import { useOrders } from '../../contexts/OrderContext';
import { usersAPI } from '../../services/api';
import { Users, Store, ShoppingBag, DollarSign, TrendingUp, AlertCircle, Eye, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { restaurants, fetchRestaurants, loading: restaurantsLoading } = useRestaurants();
  const { orders, getCustomerOrders, loading: ordersLoading } = useOrders();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setError('');
      console.log('🔄 Loading admin dashboard data...');
      
      // Fetch restaurants
      await fetchRestaurants();
      
      // Fetch users
      setLoadingUsers(true);
      const usersResponse = await usersAPI.getUsers();
      setUsers(usersResponse.data || []);
      console.log('✅ Admin data loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load admin data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoadingUsers(false);
    }
  };

  const totalUsers = users.length;
  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.is_active).length;
  const pendingRestaurants = restaurants.filter(r => !r.is_active).length;
  
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.total, 0);

  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.created_at);
    return orderDate.toDateString() === today.toDateString();
  });

  const recentOrders = orders.slice(0, 5);

  if (restaurantsLoading || ordersLoading || loadingUsers) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Admin Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAdminData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-blue-600 text-sm font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalUsers}</div>
          <div className="text-gray-600 text-sm">Registered Users</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-600 text-white p-3 rounded-xl">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-orange-600 text-sm font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{activeRestaurants}</div>
          <div className="text-gray-600 text-sm">Active Restaurants</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-600 text-white p-3 rounded-xl">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-green-600 text-sm font-medium">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{todayOrders.length}</div>
          <div className="text-gray-600 text-sm">Orders Today</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-600 text-white p-3 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="text-purple-600 text-sm font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {totalRevenue.toLocaleString()} XAF
          </div>
          <div className="text-gray-600 text-sm">Platform Revenue</div>
        </div>
      </div>

      {/* Alerts */}
      {pendingRestaurants > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Pending Restaurant Approvals</h3>
              <p className="text-yellow-700 text-sm">
                {pendingRestaurants} restaurant{pendingRestaurants > 1 ? 's' : ''} waiting for approval
              </p>
            </div>
            <Link
              to="/admin/restaurants"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              Review
            </Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Manage Users</div>
                  <div className="text-sm text-gray-600">{totalUsers} registered users</div>
                </div>
              </div>
              <div className="text-blue-600">→</div>
            </Link>

            <Link
              to="/admin/restaurants"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-orange-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Manage Restaurants</div>
                  <div className="text-sm text-gray-600">
                    {pendingRestaurants > 0 && (
                      <span className="text-yellow-600 font-medium">
                        {pendingRestaurants} pending approval
                      </span>
                    )}
                    {pendingRestaurants === 0 && `${totalRestaurants} restaurants`}
                  </div>
                </div>
              </div>
              <div className="text-orange-600">→</div>
            </Link>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 text-white p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Platform Analytics</div>
                  <div className="text-sm text-gray-600">View detailed reports</div>
                </div>
              </div>
              <div className="text-green-600">Coming Soon</div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>View All</span>
            </button>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">#{order.id}</div>
                    <div className="text-sm text-gray-600">
                      {order.customer_name || 'Customer'} • {order.restaurant_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-orange-600">
                      {order.total.toLocaleString()} XAF
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'ready' ? 'bg-green-100 text-green-600' :
                      order.status === 'in_transit' ? 'bg-purple-100 text-purple-600' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Platform Health */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Health</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2.3s</div>
            <div className="text-gray-600">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">4.8/5</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}