import { useEffect, useState } from 'react';
import { DatabaseService } from '../services/databaseService';

// Inicializar el servicio de base de datos
const databaseService = new DatabaseService();

interface DatabaseMonitorProps {
  tableName?: string;
  refreshInterval?: number;
}

/**
 * Componente para monitorear los datos de la base de datos en tiempo real
 */
export default function DatabaseMonitor({ tableName, refreshInterval = 5000 }: DatabaseMonitorProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Efecto para manejar la conexión y desconexión
  useEffect(() => {
    // Manejar eventos de conexión
    const unsubscribeConnection = databaseService.on('connection', (status) => {
      setIsConnected(status.status === 'connected');
    });

    // Manejar eventos de actualización de la base de datos
    const unsubscribeDatabaseUpdate = databaseService.on('database-update', (newData) => {
      if (tableName && newData[tableName]) {
        setData(newData[tableName]);
      } else if (!tableName) {
        setData(newData);
      }
      setLoading(false);
      setLastUpdate(new Date().toLocaleTimeString());
    });

    // Manejar eventos de error
    const unsubscribeError = databaseService.on('error', (err) => {
      setError(`Error: ${err.message || 'Desconocido'}`);
      setLoading(false);
    });

    // Cargar datos iniciales
    const loadInitialData = async () => {
      try {
        setLoading(true);
        let initialData;
        
        if (tableName) {
          initialData = await databaseService.getLatestTableRecord(tableName);
          if (initialData.data) {
            setData(initialData.data);
          }
        } else {
          initialData = await databaseService.getLatestData();
          if (initialData.data) {
            setData(initialData.data);
          }
        }
        
        setLoading(false);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (err: any) {
        setError(`Error al cargar datos iniciales: ${err.message || 'Desconocido'}`);
        setLoading(false);
      }
    };

    loadInitialData();

    // Configurar intervalo de actualización manual (como respaldo)
    const intervalId = setInterval(() => {
      if (!databaseService.isConnectedToServer()) {
        loadInitialData();
      }
    }, refreshInterval);

    // Limpiar suscripciones y intervalo al desmontar
    return () => {
      unsubscribeConnection();
      unsubscribeDatabaseUpdate();
      unsubscribeError();
      clearInterval(intervalId);
    };
  }, [tableName, refreshInterval]);

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Cargando datos...</span>
        </div>
      </div>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar datos
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {tableName ? `Tabla: ${tableName}` : 'Todas las tablas'}
        </h2>
        <div className="flex items-center">
          <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>
      
      {lastUpdate && (
        <p className="text-sm text-gray-500 mb-4">
          Última actualización: {lastUpdate}
        </p>
      )}
      
      {data ? (
        <div className="overflow-auto max-h-96">
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-gray-500">No hay datos disponibles</p>
      )}
    </div>
  );
}
