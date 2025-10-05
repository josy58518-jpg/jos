import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useCart } from '../../contexts/CartContext';
import { useRestaurants } from '../../contexts/RestaurantContext';
import { useMenu } from '../../contexts/MenuContext';
import { cameroonianTowns } from '../../data/mockData';
import { Search, Filter, Star, Clock, Truck, ShoppingCart, AlertCircle } from 'lucide-react';

export default function CustomerDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { items, total } = useCart();
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants();
  const { getMenuByRestaurant } = useMenu();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTown = !selectedTown || restaurant.town === selectedTown;
    const matchesCategory = !selectedCategory || (restaurant.categories && restaurant.categories.includes(selectedCategory));
    
    return matchesSearch && matchesTown && matchesCategory && restaurant.is_active;
  });

  const allCategories = [...new Set(restaurants.flatMap(r => r.categories || []))];

  if (loading) {
    return (
      <Layout title="Browse Restaurants">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading restaurants...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Browse Restaurants">
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
    <Layout title="Browse Restaurants">
      {/* Cart Summary */}
      {items.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-gradient-to-r from-orange-600 to-green-600 text-white p-4 rounded-2xl shadow-2xl animate-bounce">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6" />
              <div>
                <div className="font-semibold">{items.length} items</div>
                <div className="text-sm">{total.toLocaleString()} XAF</div>
              </div>
              <Link
                to="/my-orders"
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-orange-100">
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
            {cameroonianTowns.map(town => (
              <option key={town} value={town}>{town}</option>
            ))}
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="">All Categories</option>
            {allCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <div className="flex items-center justify-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600 font-medium">
              {filteredRestaurants.length} restaurants
            </span>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      {filteredRestaurants.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔥 Popular This Week</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {filteredRestaurants.slice(0, 3).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Restaurants */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Restaurants</h2>
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later for new restaurants.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function RestaurantCard({ restaurant, featured = false }: { restaurant: any; featured?: boolean }) {
  const [menuCount, setMenuCount] = useState(0);
  const { getMenuByRestaurant } = useMenu();

  useEffect(() => {
    const fetchMenuCount = async () => {
      try {
        const menuItems = await getMenuByRestaurant(restaurant.id);
        setMenuCount(menuItems.filter(item => item.is_available).length);
      } catch (error) {
        console.error('Failed to fetch menu count:', error);
        setMenuCount(0);
      }
    };
    
    if (restaurant.id) {
      fetchMenuCount();
    }
  }, [restaurant.id, getMenuByRestaurant]);

  const cardClass = featured 
    ? "bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100"
    : "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100";

  const imageHeight = featured ? "h-48" : "h-40";

  return (
    <div className={cardClass}>
      <div className="relative">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className={`w-full ${imageHeight} object-cover`}
        />
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
          <Star className="h-3 w-3 text-yellow-400 fill-current" />
          <span className="text-xs font-medium">{restaurant.rating}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className={`${featured ? 'text-xl' : 'text-lg'} font-bold text-gray-900 mb-1`}>
          {restaurant.name}
        </h3>
        <p className="text-gray-600 mb-3 text-sm line-clamp-2">{restaurant.description}</p>
        
        <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {restaurant.delivery_time}
          </div>
          <div className="flex items-center">
            <Truck className="h-3 w-3 mr-1" />
            {restaurant.delivery_fee} XAF
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {restaurant.categories?.slice(0, 2).map((category: string) => (
            <span key={category} className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
              {category}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {menuCount} dishes • {restaurant.town}
          </div>
          <Link
            to={`/restaurant/${restaurant.id}`}
            className={`${featured 
              ? 'bg-gradient-to-r from-orange-600 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105'
              : 'bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors'
            }`}
          >
            {featured ? 'Order Now' : 'View Menu'}
          </Link>
        </div>
      </div>
    </div>
  );
}