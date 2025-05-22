import React from 'react';

const SimpleSiloVisualization = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 my-8">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Estado del Silo (Versión Simple)
      </h2>
      <div className="relative">
        <div className="relative border border-gray-200 rounded-md overflow-hidden" style={{ height: "300px" }}>
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-600">Visualización simplificada del silo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSiloVisualization;
