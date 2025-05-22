import React from 'react';

const TestPage = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Página de Prueba</h1>
        <p className="text-gray-600">Esta es una página de prueba simple para verificar si el enrutamiento funciona correctamente.</p>
      </div>
    </div>
  );
};

export default TestPage;
