import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useCart } from '../../contexts/CartContext';
import { useRestaurants } from '../../contexts/RestaurantContext';
import { useMenu } from '../../contexts/MenuContext';
import { Star, Clock, Truck, Plus, Minus, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem, items, updateQuantity, total } = useCart();
  const { restaurants, fetchRestaurants } = useRestaurants();
  const { menuItems, fetchMenuItems, loading } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  // Fetch restaurants and find the current one
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        setLoadingRestaurant(true);
        await fetchRestaurants();
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setLoadingRestaurant(false);
      }
    };
    
    loadRestaurant();
  }, []);

  // Find restaurant from the list
  useEffect(() => {
    if (restaurants.length > 0 && id) {
      const foundRestaurant = restaurants.find(r => r.id === id);
      setRestaurant(foundRestaurant);
    }
  }, [restaurants, id]);

  // Fetch menu items when restaurant is found
  useEffect(() => {
    if (restaurant?.id) {
      console.log('Fetching menu for restaurant:', restaurant.id);
      fetchMenuItems(restaurant.id);
    }
  }, [restaurant]);

  if (loadingRestaurant) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
          <Link to="/customer" className="text-orange-600 hover:text-orange-700">
            ← Back to restaurants
          </Link>
        </div>
      </Layout>
    );
  }

  const availableMenuItems = menuItems.filter(item => item.is_available);
  const categories = [...new Set(availableMenuItems.map(item => item.category))];
  const filteredMenuItems = selectedCategory 
    ? availableMenuItems.filter(item => item.category === selectedCategory)
    : availableMenuItems;

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (menuItem: any) => {
    addItem({
      id: menuItem.id,
      name: menuItem.item_name,
      price: menuItem.item_price,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      image: menuItem.image
    });
  };

  return (
    <Layout>
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/customer"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to restaurants
        </Link>
      </div>

      {/* Restaurant Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-orange-100">
        <div className="relative">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-lg text-gray-200">{restaurant.description}</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="font-semibold">{restaurant.rating}</span>
              <span className="text-gray-500">(500+ reviews)</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-5 w-5" />
              <span>{restaurant.delivery_time}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Truck className="h-5 w-5" />
              <span>{restaurant.delivery_fee} XAF delivery</span>
            </div>
            
            <div className="text-gray-600">
              <span className="font-medium">Min order:</span> {restaurant.min_order?.toLocaleString()} XAF
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {restaurant.categories?.map((category: string) => (
              <span key={category} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Menu Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-orange-100 text-orange-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Items ({availableMenuItems.length})
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category 
                      ? 'bg-orange-100 text-orange-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category} ({availableMenuItems.filter(item => item.category === category).length})
                </button>
              ))}
            </div>

            {/* Cart Summary */}
            {items.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-green-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">Cart Total</span>
                  <span className="font-bold text-orange-600">{total.toLocaleString()} XAF</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {items.length} item{items.length > 1 ? 's' : ''} in cart
                </div>
                <Link
                  to="/my-orders"
                  className="w-full bg-gradient-to-r from-orange-600 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Cart
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory || 'All Items'}
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ShoppingCart className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No items available</h3>
              <p className="text-gray-600">
                {selectedCategory 
                  ? 'No items found in this category. Try selecting a different category.' 
                  : 'This restaurant hasn\'t added any menu items yet.'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredMenuItems.map((item) => {
                const quantity = getItemQuantity(item.id);
                
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.item_name}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                        {item.prep_time} min
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.item_name}</h3>
                      <p className="text-gray-600 mb-3 text-sm line-clamp-2">{item.item_description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold text-orange-600">
                          {item.item_price.toLocaleString()} XAF
                        </span>
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {quantity > 0 ? (
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-semibold text-lg min-w-[2rem] text-center">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              className="bg-orange-600 hover:bg-orange-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add to Cart</span>
                          </button>
                        )}
                        
                        <div className="text-sm text-gray-500">
                          Prep: {item.prep_time}min
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}