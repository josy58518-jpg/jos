import React from 'react';
import { Clock, ChefHat, CheckCircle, Truck, Package } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: 'Pending'
        };
      case 'preparing':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: ChefHat,
          text: 'Preparing'
        };
      case 'ready':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Package,
          text: 'Ready'
        };
      case 'in_transit':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Truck,
          text: 'In Transit'
        };
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'Delivered'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: Clock,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          text: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color} ${className}`}>
      <Icon className="w-4 h-4 mr-1" />
      {config.text}
    </span>
  );
}