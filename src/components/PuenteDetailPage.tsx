import React, { useState, useEffect } from 'react';
import { PTStatusData } from '../services/api';
import { getPTStatusDirectFromNodeRED, syncPTStatusInDB, getPTEstadoText, getPTEstadoColor } from '../services/ptStatusApi';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SidebarOperator from "./SidebarOperator";
import HeaderOperator from "./HeaderOperator";
import { Home, Eye, AlertTriangle, Clock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    titulo: 'Error de posicionamiento',
    descripcion: 'El puente ha reportado un error en el posicionamiento horizontal.',
    timestamp: '2025-05-03T14:35:23',
    tipo: 'error'
  },
  {
    id: 'alm-002',
    titulo: 'Mantenimiento preventivo',
    descripcion: 'Se requiere mantenimiento preventivo del sistema de tracción.',
    timestamp: '2025-05-03T13:50:10',
    tipo: 'warning'
  },
  {
    id: 'alm-003',
    titulo: 'Ciclo completado',
    descripcion: 'El puente ha completado el ciclo de transporte #2145.',
    timestamp: '2025-05-03T13:15:45',
    tipo: 'success'
  },
  {
    id: 'alm-004',
    titulo: 'Actualización de firmware',
    descripcion: 'Nueva actualización de firmware disponible para el controlador del puente.',
    timestamp: '2025-05-03T12:40:32',
    tipo: 'info'
  }
];

const PuenteDetailPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [ptData, setPTData] = useState<PTStatusData | null>(null);
  const [lastValidPosition, setLastValidPosition] = useState<number>(1); // Inicializamos con 1 como valor por defecto
  const navigate = useNavigate();
  
  // Función para obtener los datos del PT desde Node-RED
  const fetchPTData = async () => {
    try {
      const data = await getPTStatusDirectFromNodeRED();
      setPTData(data);
      
      // Si la posición es diferente de 0, la guardamos como la última posición válida
      if (data && data.pt_posicion && data.pt_posicion !== '0') {
        // Convertir a número si es necesario
        const posicionNum = parseInt(data.pt_posicion, 10);
        if (!isNaN(posicionNum)) {
          setLastValidPosition(posicionNum);
        }
      }
      
      console.log('Datos del PT obtenidos desde Node-RED:', data, 'Última posición válida:', lastValidPosition);
    } catch (error) {
      console.error('Error al obtener datos del PT desde Node-RED:', error);
    }
  };

  // Función para sincronizar los datos del PT en la base de datos
  const handleSyncPT = async () => {
    try {
      await syncPTStatusInDB(ptData || {});
      console.log('Datos del PT sincronizados correctamente');
      // Actualizar los datos después de sincronizar
      fetchPTData();
    } catch (error) {
      console.error('Error al sincronizar datos del PT:', error);
    }
  };
  
  // Efecto para cargar los datos del PT al montar el componente y cada 5 segundos
  useEffect(() => {
    // Cargar datos iniciales
    fetchPTData();
    
    // Configurar intervalo para actualizar los datos cada 5 segundos
    const intervalId = setInterval(fetchPTData, 5000);
    
    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(intervalId);
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
          >
            <Settings size={18} />
            <span>Control</span>
          </button>
        </div>
        
        <main className="flex-1 p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Puente</h1>
            <p className="text-gray-600 mt-1">Monitor de estado y operaciones en tiempo real</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recuadro grande con el SVG del Puente */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visualización del Puente</CardTitle>
              </CardHeader>
              <CardContent className="p-4 overflow-hidden">
                <div className="flex">
                  <div className="relative flex-1 h-[500px] flex justify-center">
                    {/* Sensores - Círculos indicadores */}
                    {/* Sensor izquierdo */}
                    <div className="absolute top-[250px] left-[150px] w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md z-10"></div>
                    
                    {/* Sensor derecho */}
                    <div className="absolute top-[250px] right-[150px] w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md z-10"></div>
                    
                    {/* Imagen del puente */}
                    <img 
                      src="/icons/PT1T_amarillo_opaco.svg" 
                      alt="Puente detallado en color amarillo opaco" 
                      className="h-full object-contain relative z-0"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      Estado: Activo
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col gap-4 w-64">
                    {/* Tarjeta de Posición Actual */}
                    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Posición Actual</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Pasillo:</span>
                          <span className="font-medium">{ptData?.pt_posicion === '0' ? lastValidPosition : ptData?.pt_posicion || lastValidPosition}</span>
                        </div>
                        {ptData?.pt_posicion === '0' && (
                          <div className="mt-2 bg-blue-100 text-blue-700 p-2 rounded-md text-sm flex items-center justify-center">
                            <span className="animate-pulse">En movimiento...</span>
                          </div>
                        )}
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
                          <span className="font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded">Libre</span>
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
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Información General</CardTitle>
                    <Button onClick={handleSyncPT} variant="outline" size="sm">
                      Sincronizar datos
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">ID del Equipo</h3>
                        <p>{ptData?.id || 'No disponible'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Estado</h3>
                        <p className={`font-medium ${getPTEstadoColor(ptData?.pt_estado)}`}>
                          {getPTEstadoText(ptData?.pt_estado)}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Posición</h3>
                        <p>Pasillo {ptData?.pt_posicion || 'No disponible'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Ocupación</h3>
                        <p className={ptData?.pt_ocupacion === 1 ? 'text-blue-500' : 'text-gray-500'}>
                          {ptData?.pt_ocupacion === 1 ? 'Ocupado' : 'Libre'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Situación</h3>
                        <p>{ptData?.pt_situacion !== undefined ? ptData.pt_situacion : 'No disponible'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Última Actualización</h3>
                        <p>{ptData?.timestamp ? new Date(ptData.timestamp).toLocaleTimeString() : 'No disponible'}</p>
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
                    <p>Aquí se mostrarían gráficos y estadísticas de operación del puente.</p>
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

export default PuenteDetailPage;
