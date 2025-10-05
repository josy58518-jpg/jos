import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { UtensilsCrossed, User, Mail, Lock, Phone, MapPin, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cameroonianTowns } from '../../data/mockData';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'owner' | 'agent' | 'admin',
    phone: '',
    town: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(true); // Default to true to hide admin option initially
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Check if admin already exists on component mount
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        setCheckingAdmin(true);
        const response = await authAPI.checkAdmin();
        setAdminExists(response.data.adminExists);
        console.log('Admin exists:', response.data.adminExists);
      } catch (error) {
        console.error('Failed to check admin status:', error);
        // If check fails, assume admin exists to be safe (hide admin option)
        setAdminExists(true);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminExists();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Additional check for admin role
    if (formData.role === 'admin' && adminExists) {
      setError('Admin account already exists. Only one admin account is allowed per system.');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const success = await register(registrationData);
      
      if (success) {
        navigate('/');
      } else {
        setError('Registration failed. Email may already be in use.');
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRoles = () => {
    const baseRoles = {
      customer: 'Order food from your favorite restaurants',
      owner: 'Manage your restaurant and menu',
      agent: 'Deliver food and earn money'
    };

    // Only include admin role if no admin exists yet
    if (!adminExists) {
      return {
        ...baseRoles,
        admin: 'Manage the platform (first admin only)'
      };
    }

    return baseRoles;
  };

  const roleDescriptions = getAvailableRoles();

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-green-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="text-gray-600">Loading registration form...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Info */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-orange-600 via-green-600 to-amber-600 p-8 items-center">
        <div className="max-w-md mx-auto text-white">
          <div className="flex items-center space-x-2 mb-8">
            <UtensilsCrossed className="h-12 w-12" />
            <span className="text-4xl font-bold">SmartBite</span>
          </div>
          
          <h2 className="text-3xl font-bold mb-6">Join Cameroon's Food Revolution</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">For Food Lovers</h3>
                <p className="text-orange-100 text-sm">
                  Discover authentic Cameroonian cuisine and international favorites from local restaurants
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">For Restaurant Owners</h3>
                <p className="text-orange-100 text-sm">
                  Expand your reach and grow your business with our comprehensive management tools
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">For Delivery Partners</h3>
                <p className="text-orange-100 text-sm">
                  Earn flexible income by delivering great food to happy customers in your area
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg border border-white border-opacity-20">
            <p className="text-sm text-orange-100">
              <strong>📞 Contact:</strong> +237 680 938 302<br />
              <strong>🗓️ Year:</strong> 2025 - Leading Cameroon's food revolution
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4 lg:hidden">
              <UtensilsCrossed className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                SmartBite
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-600">Join the SmartBite community today</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-pulse">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(roleDescriptions).map(([role, description]) => (
                  <label
                    key={role}
                    className={`relative flex cursor-pointer rounded-lg p-3 border-2 transition-all duration-200 ${
                      formData.role === role
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {role === 'owner' ? 'Restaurant Owner' : role}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone (for agents and owners) */}
            {(formData.role === 'agent' || formData.role === 'owner') && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required={formData.role === 'agent'}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
              </div>
            )}

            {/* Town */}
            <div>
              <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-1">
                Town/City
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="town"
                  name="town"
                  value={formData.town}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                >
                  <option value="">Select your town</option>
                  {cameroonianTowns.map(town => (
                    <option key={town} value={town}>{town}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-green-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}