import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { useRestaurants } from '../../contexts/RestaurantContext';
import { ArrowLeft, Clock, Phone, MapPin, ChefHat, Package } from 'lucide-react';

export default function RestaurantOrders() {
  const { user } = useAuth();
  const { getOrdersByRestaurant, updateOrderStatus } = useOrders();
  const { getRestaurantByOwner } = useRestaurants();
  const [selectedStatus, setSelectedStatus] = useState('all');

  const restaurant = user ? getRestaurantByOwner(user.id) : undefined;
  const allOrders = restaurant ? getOrdersByRestaurant(restaurant.id) : [];

  const filteredOrders = selectedStatus === 'all' 
    ? allOrders 
    : allOrders.filter(order => order.status === selectedStatus);

  const statusCounts = {
    all: allOrders.length,
    pending: allOrders.filter(o => o.status === 'pending').length,
    preparing: allOrders.filter(o => o.status === 'preparing').length,
    ready: allOrders.filter(o => o.status === 'ready').length,
    in_transit: allOrders.filter(o => o.status === 'in_transit').length,
    delivered: allOrders.filter(o => o.status === 'delivered').length
  };

  const handleStatusUpdate = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus);
  };

  if (!restaurant) {
    return (
      <Layout title="Restaurant Orders">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
          <p className="text-gray-600 mb-6">Please create your restaurant profile first.</p>
          <Link to="/owner" className="text-orange-600 hover:text-orange-700">
            ← Back to dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Restaurant Orders">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/owner"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to dashboard
        </Link>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Filter Orders</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'All Orders', color: 'bg-gray-100 text-gray-700' },
            { key: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
            { key: 'preparing', label: 'Preparing', color: 'bg-blue-100 text-blue-700' },
            { key: 'ready', label: 'Ready', color: 'bg-green-100 text-green-700' },
            { key: 'in_transit', label: 'In Transit', color: 'bg-purple-100 text-purple-700' },
            { key: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' }
          ].map(status => (
            <button
              key={status.key}
              onClick={() => setSelectedStatus(status.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedStatus === status.key
                  ? 'bg-orange-600 text-white transform scale-105'
                  : status.color + ' hover:scale-105'
              }`}
            >
              {status.label} ({statusCounts[status.key as keyof typeof statusCounts]})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {selectedStatus === 'all' 
              ? 'You haven\'t received any orders yet.' 
              : `No ${selectedStatus} orders at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                  <p className="text-gray-600">{order.customerName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString()} XAF
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-3 flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">{order.total.toLocaleString()} XAF</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Delivery Address</div>
                    <div className="text-sm text-gray-600">{order.deliveryAddress}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Phone</div>
                    <div className="text-sm text-gray-600">{order.phone}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <ChefHat className="h-4 w-4" />
                    <span>Start Preparing</span>
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'ready')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>Mark as Ready</span>
                  </button>
                )}

                {(order.status === 'pending' || order.status === 'preparing') && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                    className="border border-red-300 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              {order.agentName && order.status === 'in_transit' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Delivery Agent:</strong> {order.agentName}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}