import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useRestaurants } from '../../contexts/RestaurantContext';
import { useMenu } from '../../contexts/MenuContext';
import { Plus, Edit, Trash2, ArrowLeft, Clock, DollarSign, Eye, EyeOff, X } from 'lucide-react';

export default function ManageMenu() {
  const { user } = useAuth();
  const { myRestaurant, fetchMyRestaurant } = useRestaurants();
  const { menuItems, fetchMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability, loading } = useMenu();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    item_description: '',
    item_price: '',
    category: '',
    prep_time: '',
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

  const categories = ['Main Course', 'Appetizer', 'Dessert', 'Beverages', 'Seafood', 'Vegetarian', 'Chicken', 'Healthy', 'Wings', 'Salads'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myRestaurant) return;

    try {
      const itemData = {
        restaurant_id: myRestaurant.id,
        item_name: formData.item_name,
        item_description: formData.item_description,
        item_price: parseInt(formData.item_price),
        category: formData.category,
        prep_time: parseInt(formData.prep_time),
        image: formData.image || 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg'
      };

      if (editingItem) {
        await updateMenuItem(editingItem, itemData);
      } else {
        await addMenuItem(itemData);
      }
      
      // Reset form
      setFormData({
        item_name: '',
        item_description: '',
        item_price: '',
        category: '',
        prep_time: '',
        image: ''
      });
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save menu item:', error);
      alert('Failed to save menu item. Please try again.');
    }
  };

  const handleEdit = (item: typeof menuItems[0]) => {
    setFormData({
      item_name: item.item_name,
      item_description: item.item_description,
      item_price: item.item_price.toString(),
      category: item.category,
      prep_time: item.prep_time.toString(),
      image: item.image
    });
    setEditingItem(item.id);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(itemId);
      } catch (error) {
        console.error('Failed to delete menu item:', error);
        alert('Failed to delete menu item. Please try again.');
      }
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      await toggleAvailability(itemId);
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  if (!myRestaurant) {
    return (
      <Layout title="Manage Menu">
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

  if (loading) {
    return (
      <Layout title="Manage Menu">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Menu">
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

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{myRestaurant.name} Menu</h1>
          <p className="text-gray-600 mt-1">{menuItems.length} items in your menu</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-orange-600 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="relative">
              <img
                src={item.image}
                alt={item.item_name}
                className="w-full h-40 object-cover"
              />
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={() => handleToggleAvailability(item.id)}
                  className={`p-2 rounded-full ${
                    item.is_available 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  } text-white transition-colors`}
                  title={item.is_available ? 'Mark as unavailable' : 'Mark as available'}
                >
                  {item.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                {item.prep_time} min
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">{item.item_name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.is_available 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-3 text-sm line-clamp-2">{item.item_description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-orange-600">
                  {item.item_price.toLocaleString()} XAF
                </span>
                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-300 mb-4">
            <Plus className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No menu items yet</h3>
          <p className="text-gray-600 mb-6">Start building your menu by adding your first dish.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                    setFormData({
                      item_name: '',
                      item_description: '',
                      item_price: '',
                      category: '',
                      prep_time: '',
                      image: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Ndolé with Plantains"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.item_description}
                    onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    rows={3}
                    placeholder="Describe your dish..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (XAF) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.item_price}
                        onChange={(e) => setFormData({ ...formData, item_price: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="2500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prep Time (min) *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.prep_time}
                        onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="25"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                      setFormData({
                        item_name: '',
                        item_description: '',
                        item_price: '',
                        category: '',
                        prep_time: '',
                        image: ''
                      });
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-600 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-green-700 transition-all duration-200"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
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