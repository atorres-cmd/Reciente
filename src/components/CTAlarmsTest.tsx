import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CTAlarmsTest: React.FC = () => {
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAlarms, setActiveAlarms] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // URL directa al endpoint de alarmas del CT
        const currentHost = window.location.hostname;
        const apiBaseUrl = currentHost === 'localhost' || currentHost.match(/^192\.168\./) 
          ? `http://${currentHost}:1880/api` 
          : 'http://localhost:1880/api';
        const url = `${apiBaseUrl}/ct/alarmas`;
        
        console.log('Realizando petición directa a:', url);
        const response = await axios.get(url);
        
        console.log('Respuesta completa:', response);
        setRawData(response.data);
        
        // Procesar alarmas activas
        if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const alarmData = response.data.data[0];
          const active = [];
          
          // Buscar campos que comiencen con ct_defecto_ y tengan valor 1
          for (const [key, value] of Object.entries(alarmData)) {
            if (key.startsWith('ct_defecto_') && (value === 1 || value === true || value === '1' || value === 'true')) {
              active.push({
                field: key,
                value: value
              });
            }
          }
          
          setActiveAlarms(active);
        }
      } catch (err) {
        console.error('Error al obtener datos:', err);
        setError('Error al comunicarse con Node-RED');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Actualizar cada 10 segundos
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Prueba de Alarmas CT (Sin Procesar)</h2>
      
      {loading && <p className="text-gray-500">Cargando datos...</p>}
      
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Alarmas Activas Detectadas:</h3>
          {activeAlarms.length === 0 ? (
            <p className="text-green-500 p-2 bg-green-50 rounded">No se detectaron alarmas activas</p>
          ) : (
            <div className="space-y-2">
              {activeAlarms.map((alarm, index) => (
                <div key={index} className="p-2 bg-red-50 text-red-700 rounded">
                  <strong>{alarm.field}</strong>: {String(alarm.value)}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Datos Completos:</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTAlarmsTest;
