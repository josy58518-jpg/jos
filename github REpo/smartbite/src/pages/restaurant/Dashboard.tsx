import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useRestaurants } from '../../contexts/RestaurantContext';
import { useMenu } from '../../contexts/MenuContext';
import { cameroonianTowns } from '../../data/mockData';
import { UtensilsCrossed, ShoppingBag, DollarSign, Clock, TrendingUp, Plus, Eye, MapPin, Phone, X, AlertCircle } from 'lucide-react';

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const { myRestaurant, createRestaurant, fetchMyRestaurant, loading: restaurantLoading, error: restaurantError, clearError } = useRestaurants();
  const { menuItems, fetchMenuItems } = useMenu();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    town: '',
    phone: '',
    address: '',
    delivery_time: '',
    delivery_fee: '',
    min_order: '',
    categories: [] as string[],
    image: ''
  });

  useEffect(() => {
    if (user?.role === 'owner') {
      fetchMyRestaurant();
    }
  }, [user]);

  useEffect(() => {
    if (myRestaurant) {
      fetchMenuItems(myRestaurant.id);
    }
  }, [myRestaurant]);

  const availableCategories = ['Traditional', 'African', 'French', 'Fine Dining', 'Chicken', 'Fast Food', 'Healthy', 'Salads', 'Seafood', 'Vegetarian', 'Beverages', 'Desserts'];

  const validateForm = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push('Restaurant name is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.town) errors.push('Town is required');
    if (!formData.phone.trim()) errors.push('Phone number is required');
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.delivery_time.trim()) errors.push('Delivery time is required');
    if (!formData.delivery_fee || isNaN(Number(formData.delivery_fee)) || Number(formData.delivery_fee) < 0) {
      errors.push('Valid delivery fee is required');
    }
    if (!formData.min_order || isNaN(Number(formData.min_order)) || Number(formData.min_order) < 0) {
      errors.push('Valid minimum order amount is required');
    }
    if (formData.categories.length === 0) errors.push('At least one category must be selected');
    return errors;
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const restaurantData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim() || 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
        town: formData.town,
        delivery_time: formData.delivery_time.trim(),
        delivery_fee: Number(formData.delivery_fee),
        min_order: Number(formData.min_order),
        categories: formData.categories,
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };

      console.log('🔄 Submitting restaurant data:', restaurantData);

      await createRestaurant(restaurantData);
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        town: '',
        phone: '',
        address: '',
        delivery_time: '',
        delivery_fee: '',
        min_order: '',
        categories: [],
        image: ''
      });
      setError('');
    } catch (error: any) {
      console.error('❌ Failed to create restaurant:', error);
      setError(error.message || 'Failed to create restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setError('');
    clearError();
    setFormData({
      name: '',
      description: '',
      town: '',
      phone: '',
      address: '',
      delivery_time: '',
      delivery_fee: '',
      min_order: '',
      categories: [],
      image: ''
    });
  };

  if (restaurantLoading) {
    return (
      <Layout title="Restaurant Dashboard">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading restaurant...</span>
        </div>
      </Layout>
    );
  }

  if (!myRestaurant) {
    return (
      <Layout title="Restaurant Dashboard">
        {restaurantError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{restaurantError}</span>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-orange-100">
          <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Restaurant Profile</h2>
          <p className="text-gray-600 mb-6">
            Set up your restaurant profile to start receiving orders and managing your menu.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-orange-600 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
          >
            Create Restaurant Profile
          </button>
        </div>

        {/* Create Restaurant Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Create Restaurant Profile</h3>
                  <button
                    onClick={closeForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {(error || restaurantError) && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error || restaurantError}
                  </div>
                )}

                <form onSubmit={handleCreateRestaurant} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., Chez Mama Africa"
                        maxLength={255}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Town/City *
                      </label>
                      <select
                        required
                        value={formData.town}
                        onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select your town</option>
                        {cameroonianTowns.map(town => (
                          <option key={town} value={town}>{town}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      rows={3}
                      placeholder="Describe your restaurant and cuisine..."
                      maxLength={1000}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="+237 6XX XXX XXX"
                          maxLength={20}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Restaurant address"
                          maxLength={500}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Time *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.delivery_time}
                        onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., 25-35 min"
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Fee (XAF) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.delivery_fee}
                        onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Order (XAF) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.min_order}
                        onChange={(e) => setFormData({ ...formData, min_order: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="2000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories (Select at least one) *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableCategories.map(category => (
                        <label key={category} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(category)}
                            onChange={() => handleCategoryToggle(category)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                    {formData.categories.length === 0 && (
                      <p className="text-red-500 text-xs mt-1">Please select at least one category</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://example.com/restaurant-image.jpg"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Restaurant'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout title={`${myRestaurant.name} Dashboard`}>
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-600 text-white p-3 rounded-xl">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-orange-600 text-sm font-medium">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
          <div className="text-gray-600 text-sm">Orders Today</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-600 text-white p-3 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="text-green-600 text-sm font-medium">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">0 XAF</div>
          <div className="text-gray-600 text-sm">Revenue Today</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-blue-600 text-sm font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
          <div className="text-gray-600 text-sm">Pending Orders</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-600 text-white p-3 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-purple-600 text-sm font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">0 XAF</div>
          <div className="text-gray-600 text-sm">All Time Revenue</div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-orange-100">
        <div className="relative">
          <img
            src={myRestaurant.image}
            alt={myRestaurant.name}
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <h2 className="text-2xl font-bold">{myRestaurant.name}</h2>
            <p className="text-orange-200">{myRestaurant.description}</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-500 text-sm">Location</span>
              <div className="font-medium">{myRestaurant.town}</div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Rating</span>
              <div className="font-medium">{myRestaurant.rating} ⭐ (500+ reviews)</div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Status</span>
              <div className="font-medium text-green-600">
                {myRestaurant.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <Link
              to="/manage-menu"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-orange-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Manage Menu</div>
                  <div className="text-sm text-gray-600">{menuItems.length} items</div>
                </div>
              </div>
              <div className="text-orange-600">→</div>
            </Link>

            <Link
              to="/restaurant-orders"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">View Orders</div>
                  <div className="text-sm text-gray-600">0 pending</div>
                </div>
              </div>
              <div className="text-green-600">→</div>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            <Link
              to="/restaurant-orders"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}