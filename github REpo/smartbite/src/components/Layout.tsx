import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { LogOut, User, ShoppingCart, UtensilsCrossed } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'SmartBite' }: LayoutProps) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600';
      case 'owner': return 'text-green-600';
      case 'agent': return 'text-blue-600';
      default: return 'text-orange-600';
    }
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin': return '/admin';
      case 'owner': return '/owner';
      case 'agent': return '/agent';
      default: return '/customer';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={getDashboardLink()} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <UtensilsCrossed className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                SmartBite
              </span>
            </Link>

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-4">
                {user.role === 'customer' && (
                  <Link 
                    to="/customer" 
                    className="relative p-2 text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                )}
                
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-100 to-green-100 rounded-lg">
                  <User className="h-5 w-5 text-gray-600" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className={`text-xs capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}