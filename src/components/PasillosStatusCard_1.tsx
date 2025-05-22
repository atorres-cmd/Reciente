import { useEffect, useState } from "react";
import axios from "axios";

// Interfaz para los datos de Pas_Status de MariaDB
interface PasStatusData {
  id: number;
  pas1: number;
  pas2: number;
  pas3: number;
  pas4: number;
  pas5: number;
  pas6: number;
  pas7: number;
  pas8: number;
  pas9: number;
  pas10: number;
  pas11: number;
  pas12: number;
  timestamp: string;
}

// URL de la API de MariaDB
const MARIADB_API_URL = 'http://localhost:3003/api';

// Función para obtener los datos de los Pasillos desde MariaDB
const getPasStatusFromMariaDB = async (): Promise<PasStatusData> => {
  try {
    const response = await axios.get(`${MARIADB_API_URL}/pasillos/status`);
    console.log('Datos de los Pasillos desde MariaDB:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de los Pasillos desde MariaDB:', error);
    // Datos de ejemplo en caso de error
    return { 
      id: 1, 
      pas1: 0, pas2: 0, pas3: 0, pas4: 0, pas5: 0, pas6: 0, 
      pas7: 0, pas8: 0, pas9: 0, pas10: 0, pas11: 0, pas12: 0, 
      timestamp: new Date().toISOString() 
    };
  }
};

const PasillosStatusCard = () => {
  const [pasData, setPasData] = useState<PasStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Definición de los pasillos para las etiquetas
  const pasillos = Array.from({ length: 12 }, (_, i) => `P${i + 1}`);

  // Cargar datos de los pasillos desde MariaDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const pasResult = await getPasStatusFromMariaDB();
        setPasData(pasResult);
        setLoading(false);
        setError(null);
        console.log('Datos de los Pasillos:', pasResult);
      } catch (error) {
        console.error('Error al obtener datos de pasillos:', error);
        setError('Error al cargar datos de pasillos');
        setLoading(false);
      }
    };

    // Cargar datos inicialmente
    fetchData();
    
    // Configurar intervalo para actualizar los datos cada 10 segundos
    const intervalId = setInterval(fetchData, 10000);
    
    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-operator p-4 my-4">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Estado de los Pasillos
      </h2>
      
      {loading && <div className="text-center py-4">Cargando datos de pasillos...</div>}
      
      {error && (
        <div className="text-center py-4 text-red-600">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <div className="grid grid-cols-6 gap-4">
          {pasillos.map((pasillo) => {
            // Obtener el estado del pasillo desde los datos de MariaDB
            const pasilloNum = parseInt(pasillo.substring(1));
            const pasilloKey = `pas${pasilloNum}` as keyof PasStatusData;
            const pasilloEstado = pasData ? pasData[pasilloKey] : null;
            
            // Determinar el color según el estado (0 = en servicio/verde, 1 = fuera de servicio/rojo)
            const bgColor = pasilloEstado === 0 ? 'bg-green-100' : pasilloEstado === 1 ? 'bg-red-100' : 'bg-gray-100';
            const textColor = pasilloEstado === 0 ? 'text-green-600' : pasilloEstado === 1 ? 'text-red-600' : 'text-gray-600';
            const borderColor = pasilloEstado === 0 ? 'border-green-300' : pasilloEstado === 1 ? 'border-red-300' : 'border-gray-300';
            const statusText = pasilloEstado === 0 ? 'En servicio' : pasilloEstado === 1 ? 'Fuera de servicio' : 'Estado desconocido';
            
            return (
              <div
                key={`pasillo-${pasillo}`}
                className={`p-4 rounded-lg border ${borderColor} ${bgColor} flex flex-col items-center justify-center`}
                title={statusText}
              >
                <div className={`text-xl font-bold ${textColor}`}>
                  {pasillo}
                </div>
                <div className={`text-xs ${textColor}`}>
                  {statusText}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PasillosStatusCard;
