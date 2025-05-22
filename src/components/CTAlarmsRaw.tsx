import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Componente que solo muestra los datos crudos de las alarmas del CT
const CTAlarmsRaw: React.FC = () => {
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    <Card>
      <CardHeader>
        <CardTitle>Alarmas del Carro Transferidor (Datos Crudos)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-center py-4">Cargando datos...</div>}
        
        {error && <div className="text-center py-4 text-red-500">{error}</div>}
        
        {!loading && !error && rawData && (
          <div>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CTAlarmsRaw;
