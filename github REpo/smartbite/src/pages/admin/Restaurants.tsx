import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useRestaurants } from '../../contexts/RestaurantContext';
import { useMenu } from '../../contexts/MenuContext';
import { ArrowLeft, Search, Filter, Eye, Check, X, Star, MapPin, AlertCircle, Clock, Truck, Phone, DollarSign } from 'lucide-react';

export default function AdminRestaurants() {
  const { restaurants, fetchRestaurants, updateRestaurant, loading, error } = useRestaurants();
  const { getMenuByRestaurant } = useMenu();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTowns = !selectedTown || restaurant.town === selectedTown;
    const matchesStatus = selectedStatus === '' || 
                         (selectedStatus === 'active' && restaurant.is_active) ||
                         (selectedStatus === 'inactive' && !restaurant.is_active);
    
    return matchesSearch && matchesTowns && matchesStatus;
  });

  const handleApproveRestaurant = async (restaurantId: string) => {
    try {
      console.log('🔄 Approving restaurant:', restaurantId);
      await updateRestaurant(restaurantId, { is_active: true });
      console.log('✅ Restaurant approved successfully');
    } catch (error) {
      console.error('❌ Failed to approve restaurant:', error);
      alert('Failed to approve restaurant. Please try again.');
    }
  };

  const handleRejectRestaurant = async (restaurantId: string) => {
    if (confirm('Are you sure you want to reject/suspend this restaurant?')) {
      try {
        console.log('🔄 Rejecting restaurant:', restaurantId);
        await updateRestaurant(restaurantId, { is_active: false });
        console.log('✅ Restaurant rejected successfully');
      } catch (error) {
        console.error('❌ Failed to reject restaurant:', error);
        alert('Failed to reject restaurant. Please try again.');
      }
    }
  };

  const handleViewDetails = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDetailsModal(true);
    setLoadingMenu(true);
    
    try {
      const menu = await getMenuByRestaurant(restaurant.id);
      setMenuItems(menu);
    } catch (error) {
      console.error('Failed to load menu:', error);
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  const getRestaurantStats = () => {
    return {
      total: restaurants.length,
      active: restaurants.filter(r => r.is_active).length,
      pending: restaurants.filter(r => !r.is_active).length,
      towns: [...new Set(restaurants.map(r => r.town))].length
    };
  };

  const stats = getRestaurantStats();
  const towns = [...new Set(restaurants.map(r => r.town))];

  if (loading) {
    return (
      <Layout title="Restaurant Management">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading restaurants...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Restaurant Management">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Restaurants</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRestaurants}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Restaurant Management">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to dashboard
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-gray-600 text-sm">Total Restaurants</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-gray-600 text-sm">Active Restaurants</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-gray-600 text-sm">Pending Approval</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{stats.towns}</div>
          <div className="text-gray-600 text-sm">Cities Covered</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-100">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          
          <select
            value={selectedTown}
            onChange={(e) => setSelectedTown(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="">All Towns</option>
            {towns.map(town => (
              <option key={town} value={town}>{town}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Pending/Inactive</option>
          </select>
          
          <div className="flex items-center justify-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600 font-medium">
              {filteredRestaurants.length} restaurants
            </span>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No restaurants found</h3>
          <p className="text-gray-600">
            {restaurants.length === 0 
              ? 'No restaurants have been registered yet.' 
              : 'Try adjusting your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.is_active 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {restaurant.is_active ? 'Active' : 'Pending'}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs font-medium">{restaurant.rating}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">{restaurant.description}</p>
                
                <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.town}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {restaurant.categories?.slice(0, 2).map(category => (
                    <span key={category} className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Delivery:</span> {restaurant.delivery_time}
                  </div>
                  <div>
                    <span className="font-medium">Fee:</span> {restaurant.delivery_fee} XAF
                  </div>
                  <div>
                    <span className="font-medium">Min Order:</span> {restaurant.min_order?.toLocaleString()} XAF
                  </div>
                  <div>
                    <span className="font-medium">Owner ID:</span> {restaurant.user_id}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewDetails(restaurant)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  
                  {!restaurant.is_active ? (
                    <>
                      <button
                        onClick={() => handleApproveRestaurant(restaurant.id)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectRestaurant(restaurant.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRejectRestaurant(restaurant.id)}
                      className="flex-1 border border-red-300 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Suspend</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restaurant Details Modal */}
      {showDetailsModal && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Restaurant Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Restaurant Header */}
              <div className="relative mb-6">
                <img
                  src={selectedRestaurant.image}
                  alt={selectedRestaurant.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-bold">{selectedRestaurant.name}</h2>
                  <p className="text-orange-200">{selectedRestaurant.description}</p>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Location</div>
                      <div className="text-gray-600">{selectedRestaurant.address}, {selectedRestaurant.town}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Phone</div>
                      <div className="text-gray-600">{selectedRestaurant.phone}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Delivery Time</div>
                      <div className="text-gray-600">{selectedRestaurant.delivery_time}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Delivery Fee</div>
                      <div className="text-gray-600">{selectedRestaurant.delivery_fee} XAF</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Minimum Order</div>
                      <div className="text-gray-600">{selectedRestaurant.min_order?.toLocaleString()} XAF</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <div>
                      <div className="font-medium text-gray-900">Rating</div>
                      <div className="text-gray-600">{selectedRestaurant.rating}/5</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRestaurant.categories?.map(category => (
                    <span key={category} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Menu Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Menu Items ({menuItems.length})</h4>
                {loadingMenu ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : menuItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No menu items found</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                    {menuItems.map(item => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.item_name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.item_name}</div>
                          <div className="text-sm text-gray-600">{item.item_price.toLocaleString()} XAF</div>
                          <div className="text-xs text-gray-500">{item.category}</div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          item.is_available 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}