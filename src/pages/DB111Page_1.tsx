import React from 'react';
import DB111Visualization from '@/components/DB111Visualization';
import HeaderOperator from '@/components/HeaderOperator';
import { Link } from 'react-router-dom';

const DB111Page = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderOperator />
      
      <div className="bg-white shadow-sm">
        <div className="container mx-auto py-2 px-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-operator-blue hover:text-blue-700">
              Inicio
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 font-medium">DB111 - Alarmas y Estados</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        <DB111Visualization />
      </div>
    </div>
  );
};

export default DB111Page;
