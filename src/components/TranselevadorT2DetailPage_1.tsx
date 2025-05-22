import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SidebarOperator from "./SidebarOperator";
import HeaderOperator from "./HeaderOperator";
import { Home, Eye, AlertTriangle, Clock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTLV2StatusFromMariaDB, TLV2StatusData } from '../services/api';

// Tipo para las alarmas
interface Alarma {
  id: string;
  titulo: string;
  descripcion: string;
  timestamp: string;
  tipo: 'error' | 'warning' | 'info' | 'success';
}

// Datos de ejemplo para las alarmas
const alarmasEjemplo: Alarma[] = [
  {
    id: 'alm-001',
    titulo: 'Error de comunicación',
    descripcion: 'El transelevador T2 ha reportado un error en la comunicación con el PLC.',
    timestamp: '2025-05-03T14:15:23',
    tipo: 'error'
  },
  {
    id: 'alm-002',
    titulo: 'Mantenimiento programado',
    descripcion: 'Se requiere mantenimiento programado del sistema de posicionamiento.',
    timestamp: '2025-05-03T13:30:10',
    tipo: 'warning'
  },
  {
    id: 'alm-003',
    titulo: 'Ciclo completado',
    descripcion: 'El transelevador T2 ha completado el ciclo de almacenamiento #3721.',
    timestamp: '2025-05-03T12:45:45',
    tipo: 'success'
  },
  {
    id: 'alm-004',
    titulo: 'Actualización de parámetros',
    descripcion: 'Se han actualizado los parámetros de velocidad del transelevador T2.',
    timestamp: '2025-05-03T11:50:32',
    tipo: 'info'
  }
];

const TranselevadorT2DetailPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [tlv2Data, setTLV2Data] = useState<TLV2StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mariaDBError, setMariaDBError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Cargar datos del transelevador al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos de TLV2 desde MariaDB
        try {
          const tlv2MariaDBData = await getTLV2StatusFromMariaDB();
          setTLV2Data(tlv2MariaDBData);
          setMariaDBError(null);
        } catch (mariaDBErr) {
          console.error('Error al cargar datos de TLV2 desde MariaDB:', mariaDBErr);
          setMariaDBError('No se pudieron cargar los datos desde MariaDB');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Actualizar datos cada 5 segundos
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex bg-operator-gray-bg min-h-screen font-sans">
      <SidebarOperator />
      <div className="flex-1 flex flex-col">
        <HeaderOperator />
        
        {/* Navegación superior con botones grises y letras blancas */}
        <div className="bg-gray-700 px-6 py-3 flex space-x-4">
          <button 
            className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-gray-600 transition-colors"
            onClick={() => navigate('/')}
          >
            <Home size={18} />
            <span>Inicio</span>
          </button>
          <button 
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 transition-colors"
          >
            <Eye size={18} />
            <span>Visualización</span>
          </button>
          <button 
            className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-gray-600 transition-colors"
            onClick={() => navigate('/alarmas')}
          >
            <AlertTriangle size={18} />
            <span>Alarmas</span>
          </button>
          <button 
            className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-gray-600 transition-colors"
          >
            <Clock size={18} />
            <span>Históricos</span>
          </button>
          <button 
            className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-gray-600 transition-colors"
            onClick={() => navigate('/control/tlv2')}
          >
            <Settings size={18} />
            <span>Control</span>
          </button>
        </div>
        
        <main className="flex-1 p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Transelevador T2</h1>
            <p className="text-gray-600 mt-1">Monitor de estado y operaciones en tiempo real</p>
            {loading && <p className="text-blue-500 mt-1">Cargando datos...</p>}
            {mariaDBError && <p className="text-yellow-500 mt-1">{mariaDBError} - Usando datos de respaldo</p>}
            {tlv2Data && <p className="text-green-500 mt-1">Última actualización desde MariaDB: {new Date(tlv2Data.timestamp).toLocaleString()}</p>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recuadro grande con el SVG del T2 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visualización del Transelevador T2</CardTitle>
              </CardHeader>
              <CardContent className="p-4 overflow-hidden">
                <div className="flex">
                  <div className="relative flex-1 h-[500px] flex justify-center">
                    {/* Sensores - Círculos indicadores */}
                    {/* Sensor superior izquierdo */}
                    <div className="absolute top-[120px] left-[220px] w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md z-10"></div>
                    
                    {/* Sensor superior derecho */}
                    <div className="absolute top-[120px] right-[220px] w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md z-10"></div>
                    
                    {/* Imagen del transelevador */}
                    <img 
                      src="/icons/T2.svg" 
                      alt="Transelevador T2 detallado" 
                      className="h-full object-contain relative z-0"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      Estado: {tlv2Data ? (tlv2Data.averia === 1 ? 'Avería' : 'Activo') : 'Activo'}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      Coordenadas: {tlv2Data ? `Pasillo: ${tlv2Data.pasillo_actual}, X: ${tlv2Data.x_actual}, Y: ${tlv2Data.y_actual}, Z: ${tlv2Data.z_actual}` : 'No disponibles'}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      Matrícula: {tlv2Data ? tlv2Data.matricula : 'No disponible'}
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col gap-4 w-64">
                    {/* Tarjeta de Tarea Actual */}
                    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Tarea Actual</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Almacenamiento</span>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">Origen:</h4>
                          <div className="grid grid-cols-4 gap-2 pl-2">
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Pasillo</div>
                              <div className="font-medium">4</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">X</div>
                              <div className="font-medium">30</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Y</div>
                              <div className="font-medium">4</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Z</div>
                              <div className="font-medium">2</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">Destino:</h4>
                          <div className="grid grid-cols-4 gap-2 pl-2">
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Pasillo</div>
                              <div className="font-medium">9</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">X</div>
                              <div className="font-medium">45</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Y</div>
                              <div className="font-medium">9</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Z</div>
                              <div className="font-medium">1</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nº Tarea:</span>
                          <span className="font-medium">TRK-2025-0512</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">UMA:</span>
                          <span className="font-medium">PALET-EU-0013245</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tarjeta de Estado */}
                    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Estado</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Modo:</span>
                          <span className="font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Auto</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ocupación:</span>
                          <span className="font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Ocupado</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avería:</span>
                          <span className="font-medium bg-gray-100 text-gray-800 px-2 py-0.5 rounded">No</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Panel de alarmas */}
            <Card>
              <CardHeader>
                <CardTitle>Alarmas Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alarmasEjemplo.map(alarma => {
                    const bgColor = 
                      alarma.tipo === 'error' ? 'bg-red-50 border-red-200' :
                      alarma.tipo === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      alarma.tipo === 'info' ? 'bg-blue-50 border-blue-200' :
                      'bg-green-50 border-green-200';
                    
                    return (
                      <div key={alarma.id} className={`p-4 border rounded-md ${bgColor}`}>
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{alarma.titulo}</div>
                            <div className="text-gray-600">{alarma.descripcion}</div>
                            <div className="text-gray-500 text-sm mt-1">
                              {new Date(alarma.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </div>
                          </div>
                          <button className="px-3 py-1 border rounded-md text-blue-500 hover:bg-blue-50 text-sm">
                            Reconocer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
                <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Información General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">ID del Equipo</h3>
                        <p>TRANS-002</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Estado Actual</h3>
                        <p className={`font-medium ${tlv2Data && tlv2Data.averia === 1 ? 'text-red-500' : 'text-green-500'}`}>
                          {tlv2Data ? (tlv2Data.averia === 1 ? 'Avería' : 'Activo') : 'Activo'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Posición</h3>
                        <p>Pasillo {tlv2Data ? tlv2Data.pasillo_actual : 4}, X: {tlv2Data ? tlv2Data.x_actual : 30}, Y: {tlv2Data ? tlv2Data.y_actual : 4}, Z: {tlv2Data ? tlv2Data.z_actual : 2}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Última Actividad</h3>
                        <p>Hace 3 minutos</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Ciclos Hoy</h3>
                        <p>143</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Eficiencia</h3>
                        <p>97.2%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="estadisticas">
                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas de Operación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Aquí se mostrarían gráficos y estadísticas de operación del transelevador T2.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="mantenimiento">
                <Card>
                  <CardHeader>
                    <CardTitle>Registro de Mantenimiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Aquí se mostraría el historial de mantenimiento y próximas tareas programadas.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TranselevadorT2DetailPage;
