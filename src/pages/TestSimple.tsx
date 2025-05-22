import React from 'react';

const TestSimple = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>Página de Prueba Simple</h1>
      <p style={{ marginTop: '10px' }}>Esta es una página de prueba simple para verificar que la aplicación está funcionando correctamente.</p>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Información del Sistema</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Fecha y hora actual:</strong> {new Date().toLocaleString()}
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>URL actual:</strong> {window.location.href}
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Navegador:</strong> {navigator.userAgent}
          </li>
        </ul>
      </div>
      <button 
        style={{ 
          marginTop: '20px', 
          padding: '10px 15px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => alert('¡La aplicación está funcionando correctamente!')}
      >
        Haz clic aquí para probar
      </button>
    </div>
  );
};

export default TestSimple;
