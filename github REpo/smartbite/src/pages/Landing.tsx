import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Truck, Users, Star, ArrowRight, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { reviewsAPI } from '../services/api';

interface Review {
  id: string;
  user_name: string;
  user_role: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function Landing() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewsAPI.getReviews();
        setReviews(response.data.slice(0, 3)); // Show only 3 reviews
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        // Use fallback reviews if API fails
        setReviews([
          {
            id: '1',
            user_name: 'Aminata K.',
            user_role: 'Customer',
            rating: 5,
            comment: 'SmartBite has revolutionized how I order food. The variety of local restaurants and fast delivery makes it perfect for busy days in Douala.',
            created_at: '2025-01-15'
          },
          {
            id: '2',
            user_name: 'Chef Pierre M.',
            user_role: 'Restaurant Owner',
            rating: 5,
            comment: 'As a restaurant owner, SmartBite has helped me reach more customers. The platform is easy to use and the support team is excellent.',
            created_at: '2025-01-14'
          },
          {
            id: '3',
            user_name: 'Samuel T.',
            user_role: 'Delivery Agent',
            rating: 5,
            comment: 'Working as a delivery agent with SmartBite provides flexible income. The app makes it easy to find deliveries and communicate with customers.',
            created_at: '2025-01-13'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-orange-600 via-green-600 to-amber-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-8">
              <UtensilsCrossed className="h-16 w-16 text-white animate-bounce" />
              <h1 className="text-6xl font-bold text-white">SmartBite</h1>
            </div>
            <p className="text-2xl text-white mb-8 max-w-3xl mx-auto">
              Cameroon's Premier Food Delivery Platform
            </p>
            <p className="text-lg text-orange-100 mb-12 max-w-2xl mx-auto">
              Connect with local restaurants, enjoy authentic Cameroonian cuisine, and get your favorite meals delivered fast to your doorstep across Douala, Yaoundé, and beyond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-600 transform hover:scale-105 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SmartBite?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the best of Cameroonian cuisine with our comprehensive food delivery ecosystem
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <UtensilsCrossed className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Authentic Cuisine</h3>
              <p className="text-gray-600">
                Discover traditional Cameroonian dishes and international favorites from verified local restaurants
              </p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Fast Delivery</h3>
              <p className="text-gray-600">
                Real-time tracking and reliable delivery agents ensure your food arrives hot and fresh
              </p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Driven</h3>
              <p className="text-gray-600">
                Supporting local restaurant owners and creating opportunities for delivery agents across Cameroon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-orange-100 to-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="transform hover:scale-105 transition-transform duration-200">
              <div className="text-4xl font-bold text-orange-600 mb-2">10+</div>
              <div className="text-gray-700 font-medium">Partner Restaurants</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <div className="text-4xl font-bold text-green-600 mb-2">10+</div>
              <div className="text-gray-700 font-medium">Happy Customers</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <div className="text-4xl font-bold text-amber-600 mb-2">3+</div>
              <div className="text-gray-700 font-medium">Cities Covered</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <div className="text-4xl font-bold text-red-600 mb-2">24/7</div>
              <div className="text-gray-700 font-medium">Service Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Join Our Ecosystem</h2>
            <p className="text-xl text-gray-600">Whether you're hungry, own a restaurant, or want to deliver, we have a place for you</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-orange-200 hover:border-orange-300">
              <h3 className="text-xl font-bold text-orange-600 mb-3">Customers</h3>
              <p className="text-gray-700 mb-4">Browse restaurants, order food, track delivery</p>
              <Link to="/register" className="text-orange-600 font-medium hover:text-orange-700">
                Order Now →
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-green-200 hover:border-green-300">
              <h3 className="text-xl font-bold text-green-600 mb-3">Restaurant Owners</h3>
              <p className="text-gray-700 mb-4">Manage your restaurant, menu, and orders</p>
              <Link to="/register" className="text-green-600 font-medium hover:text-green-700">
                Partner With Us →
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-blue-200 hover:border-blue-300">
              <h3 className="text-xl font-bold text-blue-600 mb-3">Delivery Agents</h3>
              <p className="text-gray-700 mb-4">Earn money delivering food in your area</p>
              <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">
                Start Delivering →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <MessageCircle className="h-6 w-6 text-orange-600" />
              <span className="text-gray-600">Real reviews from our community</span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "{review.comment}"
                  </p>
                  <div className="font-semibold text-gray-900">
                    - {review.user_name}, {review.user_role}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/register"
              className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Share Your Experience
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <UtensilsCrossed className="h-8 w-8 text-orange-400" />
                <span className="text-2xl font-bold">SmartBite</span>
              </div>
              <p className="text-gray-400 mb-4">
                Cameroon's leading food delivery platform connecting communities through great food.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>+237 680 938 302</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-orange-400 transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-orange-400 transition-colors">Sign In</Link></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Business</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Partner with us</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Become a Delivery Agent</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Restaurant Solutions</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Service Areas</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Douala</li>
                <li>Yaoundé</li>
                <li>Bafoussam</li>
                <li>Bamenda</li>
                <li>Garoua</li>
                <li>+ More cities</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SmartBite Cameroon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}