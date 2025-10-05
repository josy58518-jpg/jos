import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { usersAPI } from '../../services/api';
import { ArrowLeft, Search, Filter, Edit, Trash2, UserCheck, UserX, AlertCircle } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching users...');
      const response = await usersAPI.getUsers();
      console.log('✅ Users fetched:', response.data);
      setUsers(response.data || []);
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      setError('Failed to load users. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesStatus = selectedStatus === '' || 
                         (selectedStatus === 'active' && user.is_active) ||
                         (selectedStatus === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = async (userId: string) => {
    try {
      console.log('🔄 Toggling user status for:', userId);
      await usersAPI.toggleUserStatus(userId);
      await fetchUsers(); // Refresh the list
      console.log('✅ User status toggled successfully');
    } catch (error) {
      console.error('❌ Failed to toggle user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        console.log('🔄 Deleting user:', userId);
        await usersAPI.deleteUser(userId);
        await fetchUsers(); // Refresh the list
        console.log('✅ User deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-600';
      case 'owner': return 'bg-green-100 text-green-600';
      case 'agent': return 'bg-blue-100 text-blue-600';
      default: return 'bg-orange-100 text-orange-600';
    }
  };

  const getRoleStats = () => {
    return {
      total: users.length,
      customers: users.filter(u => u.role === 'customer').length,
      owners: users.filter(u => u.role === 'owner').length,
      agents: users.filter(u => u.role === 'agent').length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length
    };
  };

  const stats = getRoleStats();

  if (loading) {
    return (
      <Layout title="User Management">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading users...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="User Management">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Users</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
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
      <div className="grid md:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{stats.customers}</div>
          <div className="text-sm text-gray-600">Customers</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{stats.owners}</div>
          <div className="text-sm text-gray-600">Owners</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{stats.agents}</div>
          <div className="text-sm text-gray-600">Agents</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-100">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="">All Roles</option>
            <option value="customer">Customers</option>
            <option value="owner">Restaurant Owners</option>
            <option value="agent">Delivery Agents</option>
            <option value="admin">Administrators</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <div className="flex items-center justify-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600 font-medium">
              {filteredUsers.length} users
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Role</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Location</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Joined</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id || user.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{user.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user.phone_number || user.phone || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleColor(user.role)}`}>
                      {user.role === 'owner' ? 'Restaurant Owner' : user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-900">{user.town || 'N/A'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.is_active 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(user.id || user.user_id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_active
                            ? 'text-red-600 hover:bg-red-100'
                            : 'text-green-600 hover:bg-green-100'
                        }`}
                        title={user.is_active ? 'Deactivate user' : 'Activate user'}
                      >
                        {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id || user.user_id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {users.length === 0 
                ? 'No users have registered yet.' 
                : 'Try adjusting your search criteria.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}