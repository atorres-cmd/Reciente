import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Componente de depuración para verificar la comunicación con Node-RED
const CTAlarmsDebug: React.FC = () => {
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener el hostname actual (dominio o IP)
  const currentHost = window.location.hostname;
  
  // Determinar la URL base según el hostname
  const apiBaseUrl = currentHost === 'localhost' || currentHost.match(/^192\.168\./) 
    ? `http://${currentHost}:1880/api` 
    : 'http://localhost:1880/api';
  
  // URL para las alarmas del CT
  const ctAlarmsUrl = `${apiBaseUrl}/ct/alarmas`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Realizar petición directa a Node-RED sin procesar los datos
        console.log('Realizando petición directa a:', ctAlarmsUrl);
        const response = await axios.get(ctAlarmsUrl, {
          params: { _t: new Date().getTime() } // Evitar caché
        });
        
        console.log('Respuesta completa:', response);
        setRawData(response.data);
      } catch (err) {
        console.error('Error al obtener datos de Node-RED:', err);
        setError('Error al comunicarse con Node-RED');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Actualizar cada 10 segundos
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [ctAlarmsUrl]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Depuración de Comunicación con Node-RED</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">URL de la API: <code>{ctAlarmsUrl}</code></p>
      </div>
      
      {loading && <p className="text-gray-500">Cargando datos desde Node-RED...</p>}
      
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && rawData && (
        <div>
          <h3 className="text-lg font-medium mb-2">Datos Recibidos:</h3>
          
          <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
            <pre className="text-xs">{JSON.stringify(rawData, null, 2)}</pre>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Análisis de Datos:</h3>
            
            <div className="space-y-2">
              <p>Tipo de datos recibidos: <code>{typeof rawData}</code></p>
              
              {typeof rawData === 'object' && (
                <>
                  <p>Propiedades principales:</p>
                  <ul className="list-disc pl-5">
                    {Object.keys(rawData).map(key => (
                      <li key={key}>
                        <code>{key}</code>: {typeof rawData[key]} 
                        {typeof rawData[key] === 'object' && Array.isArray(rawData[key]) 
                          ? ` (Array con ${rawData[key].length} elementos)` 
                          : ''}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              {rawData && rawData.success && Array.isArray(rawData.data) && rawData.data.length > 0 && (
                <div>
                  <p>Primer elemento de datos:</p>
                  <div className="bg-gray-100 p-2 rounded-md overflow-auto">
                    <pre className="text-xs">{JSON.stringify(rawData.data[0], null, 2)}</pre>
                  </div>
                  
                  <p className="mt-2">Campos de alarma encontrados:</p>
                  <ul className="list-disc pl-5">
                    {Object.entries(rawData.data[0])
                      .filter(([key]) => key.startsWith('ct_defecto_') || key === 'id' || key === 'timestamp')
                      .map(([key, value]) => (
                        <li key={key}>
                          <code>{key}</code>: <code>{JSON.stringify(value)}</code> 
                          {key.startsWith('ct_defecto_') && Number(value) === 1 && (
                            <span className="text-red-500 ml-2">⚠️ ALARMA ACTIVA</span>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTAlarmsDebug;
