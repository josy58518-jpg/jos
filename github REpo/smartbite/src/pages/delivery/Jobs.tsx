import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { ArrowLeft, MapPin, Phone, Clock, DollarSign, Package, CheckCircle, AlertCircle } from 'lucide-react';

export default function DeliveryJobs() {
  const { user } = useAuth();
  const { orders, getAvailableDeliveries, getAgentOrders, updateOrderStatus, acceptDelivery, loading, error } = useOrders();
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    if (user?.role === 'agent') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load agent's orders
      await getAgentOrders();
      
      // Load available deliveries
      const available = await getAvailableDeliveries();
      setAvailableDeliveries(available);
    } catch (error) {
      console.error('Failed to load delivery jobs:', error);
    }
  };

  const handleAcceptDelivery = async (orderId) => {
    try {
      setLoadingAction(orderId);
      await acceptDelivery(orderId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to accept delivery:', error);
      alert('Failed to accept delivery. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCompleteDelivery = async (orderId) => {
    try {
      setLoadingAction(orderId);
      await updateOrderStatus(orderId, 'delivered');
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to complete delivery:', error);
      alert('Failed to complete delivery. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const calculateDeliveryFee = (orderTotal) => {
    // Simplified calculation: 10% of order total with minimum 500 XAF
    return Math.max(orderTotal * 0.1, 500);
  };

  if (loading) {
    return (
      <Layout title="Delivery Jobs">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading delivery jobs...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Delivery Jobs">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Jobs</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Delivery Jobs">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/agent"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to dashboard
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Available Deliveries */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Deliveries</h2>
            <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              {availableDeliveries.length} available
            </div>
          </div>

          {availableDeliveries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No deliveries available</h3>
              <p className="text-gray-600 mb-4">Check back later for new delivery opportunities.</p>
              <button
                onClick={loadData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {availableDeliveries.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                      <p className="text-orange-600 font-medium">{order.restaurant_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Delivery Address</div>
                        <div className="text-sm text-gray-600">{order.delivery_address}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Customer</div>
                        <div className="text-sm text-gray-600">{order.customer_name} • {order.customer_phone}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">Order Summary</div>
                    <div className="space-y-1">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="text-sm text-gray-500">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Order Total:</span> {order.total.toLocaleString()} XAF
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        +{calculateDeliveryFee(order.total).toLocaleString()} XAF
                      </div>
                      <div className="text-sm text-gray-500">Delivery Fee</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptDelivery(order.id)}
                    disabled={loadingAction === order.id}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:transform-none"
                  >
                    {loadingAction === order.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Accepting...</span>
                      </>
                    ) : (
                      <>
                        <Package className="h-5 w-5" />
                        <span>Accept Delivery</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Active Deliveries */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Deliveries</h2>
            <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
              {orders.length} total
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No deliveries yet</h3>
              <p className="text-gray-600 mb-4">Accept your first delivery to get started earning!</p>
              <button
                onClick={loadData}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                      <p className="text-orange-600 font-medium">{order.restaurant_name}</p>
                      <p className="text-sm text-gray-500">
                        Accepted: {new Date(order.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">Delivery to:</div>
                        <div className="text-gray-600">{order.delivery_address}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{order.customer_name}</span>
                        <span className="text-gray-600 ml-2">{order.customer_phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Earning:</span> 
                      <span className="text-green-600 font-bold ml-1">
                        +{calculateDeliveryFee(order.total).toLocaleString()} XAF
                      </span>
                    </div>
                    
                    {order.status === 'in_transit' && (
                      <button
                        onClick={() => handleCompleteDelivery(order.id)}
                        disabled={loadingAction === order.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        {loadingAction === order.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Completing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark Delivered</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={loadData}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2 mx-auto"
        >
          <Clock className="h-5 w-5" />
          <span>Refresh All Data</span>
        </button>
      </div>
    </Layout>
  );
}