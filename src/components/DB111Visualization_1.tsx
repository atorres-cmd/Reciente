import React, { useEffect, useState } from 'react';
import { DB111Data, getDB111Data } from '@/services/db111Api';

const DB111Visualization = () => {
  const [db111Data, setDB111Data] = useState<DB111Data | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Direcciones de los words que queremos mostrar
  const wordAddresses = ['DB111,W40', 'DB111,W42', 'DB111,W44', 'DB111,W46'];

  // Función para cargar los datos del DB111
  const loadDB111Data = async () => {
    try {
      setLoading(true);
      const data = await getDB111Data();
      setDB111Data(data);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos del DB111:', err);
      setError('Error al cargar datos del DB111');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales y configurar actualización periódica
  useEffect(() => {
    loadDB111Data();

    // Actualizar cada 5 segundos
    const intervalId = setInterval(loadDB111Data, 5000);

    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  // Renderizar un bit individual
  const renderBit = (wordAddress: string, bitIndex: number) => {
    if (!db111Data || !db111Data.bits[wordAddress]) return null;

    const bit = db111Data.bits[wordAddress][`bit${bitIndex}`];
    if (!bit) return null;

    // Determinar la clase CSS según el estado del bit
    const bitClass = bit.value === 1 
      ? 'bg-red-500 animate-pulse' // Bit activo (alarma)
      : 'bg-green-200'; // Bit inactivo

    return (
      <div key={`${wordAddress}-bit${bitIndex}`} className="mb-2 p-2 rounded-md">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${bitClass}`} />
          <div className="text-sm">
            <div className="font-medium">{bit.description}</div>
            <div className="text-xs text-gray-500">
              {bit.state} (Bit {bitIndex})
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar un word completo con todos sus bits
  const renderWord = (wordAddress: string) => {
    if (!db111Data || !db111Data.words[wordAddress]) return null;

    const word = db111Data.words[wordAddress];
    
    // Contar bits activos en este word
    const activeBitsCount = Object.values(db111Data.bits[wordAddress] || {})
      .filter(bit => bit.value === 1)
      .length;

    return (
      <div key={wordAddress} className="mb-6 border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-operator-blue">
            {word.description}
          </h3>
          <div className="flex items-center">
            <span className="text-sm mr-2">Valor: {word.value}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
              {activeBitsCount} alarmas activas
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: 16 }).map((_, i) => renderBit(wordAddress, i))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-operator-blue">Estado DB111 - Alarmas y Estados</h2>
        <div className="text-sm text-gray-500">
          Última actualización: {lastUpdate}
          <button 
            onClick={loadDB111Data} 
            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded-md text-xs"
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading && !db111Data ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-operator-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {wordAddresses.map(address => renderWord(address))}
        </div>
      )}
    </div>
  );
};

export default DB111Visualization;
