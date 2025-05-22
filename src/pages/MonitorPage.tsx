import { useState } from 'react';
import DatabaseMonitor from '../components/DatabaseMonitor';

const TABLES = [
  'pt_status',
  'ct_status',
  'tlv1_status',
  'tlv2_status',
  'pasillos_status',
  'mesasentrada_status',
  'mesassalida_status',
  'ct_alarmas',
  'tlv1_alarmas',
  'tlv2_alarmas',
  'elv1_alarmas'
];

export default function MonitorPage() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Monitor de Base de Datos AppSilo</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Seleccionar Tabla</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded ${!selectedTable ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => setSelectedTable(null)}
          >
            Todas
          </button>
          
          {TABLES.map(table => (
            <button
              key={table}
              className={`px-3 py-1 rounded ${selectedTable === table ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setSelectedTable(table)}
            >
              {table}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <DatabaseMonitor tableName={selectedTable || undefined} />
      </div>
      
      {!selectedTable && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Todas las Tablas Individuales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TABLES.map(table => (
              <div key={table} className="col-span-1">
                <h3 className="text-lg font-medium mb-2">{table}</h3>
                <DatabaseMonitor tableName={table} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
