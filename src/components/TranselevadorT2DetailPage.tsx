import React, { useState, useEffect } from 'react';
import { getTranselevadorData, getTranselevadorAlarmas, TranselevadorData, TLV2StatusData } from '../services/api';
import { getTLV2StatusFromMariaDB } from '../services/tlv2StatusApi';
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
  const [transelevadorData, setTranselevadorData] = useState<TranselevadorData | null>(null);
  const [alarmas, setAlarmas] = useState<Alarma[]>([]);
  const [tlv2Data, setTLV2Data] = useState<TLV2StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mariaDBError, setMariaDBError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Estado para controlar la primera carga vs actualizaciones
  const [initialLoad, setInitialLoad] = useState(true);

  // Cargar datos del transelevador al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        // Solo mostrar el indicador de carga en la carga inicial
        if (initialLoad) {
          setLoading(true);
        }
        
        // Obtener datos del transelevador T2
        const data = await getTranselevadorData('TRANS-002');
        setTranselevadorData(data);
        
        // Obtener alarmas del transelevador T2
        const alarmasData = await getTranselevadorAlarmas('TRANS-002');
        setAlarmas(alarmasData);
        
        // Obtener datos de TLV2 desde Node-RED
        try {
          const tlv2MariaDBData = await getTLV2StatusFromMariaDB();
          // Actualizar datos sin causar parpadeo
          setTLV2Data(prevData => {
            // Solo registrar en consola en desarrollo
            if (process.env.NODE_ENV !== 'production') {
              console.log('Datos recibidos de TLV2 desde Node-RED:', tlv2MariaDBData);
            }
            return tlv2MariaDBData;
          });
          setMariaDBError(null);
        } catch (mariaDBErr) {
          console.error('Error al cargar datos de TLV2 desde Node-RED:', mariaDBErr);
          setMariaDBError('No se pudieron cargar los datos desde Node-RED');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        if (initialLoad) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };
    
    loadData();
    
    // Actualizar datos cada 5 segundos
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [initialLoad]);

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
                    {/* Sensores eliminados */}
                    
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
                              <div className="font-medium">{tlv2Data?.tlv2_orden_pasillo_origen || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">X</div>
                              <div className="font-medium">{tlv2Data?.tlv2_orden_coord_x_origen || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Y</div>
                              <div className="font-medium">{tlv2Data?.tlv2_orden_coord_y_origen || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Z</div>
                              <div className="font-medium">{tlv2Data?.tlv2_orden_coord_z_origen || '-'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">Destino:</h4>
                          <div className="grid grid-cols-4 gap-2 pl-2">
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Pasillo</div>
                              <div className="font-medium">{tlv2Data?.tlv2_orden_pasillo_destino || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">X</div>
                              <div className="font-medium">{tlv2Data?.tlv2_orden_coord_x_destino || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Y</div>
                              <div className="font-medium">{tlv2Data?.tlv2_orden_coord_y_destino || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Z</div>
                              <div className="font-medium">{tlv2Data?.tlv2_orden_coord_z_destino || '-'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nº Tarea:</span>
                          <span className="font-medium">
                            {tlv2Data?.tlv2_tarea_actual || (tlv2Data as any)?.tarea_actual || `TRK-2-${tlv2Data?.matricula || '15184'}`}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">UMA:</span>
                          <span className="font-medium">
                            {tlv2Data?.tlv2_uma_actual || (tlv2Data as any)?.uma_actual || `PALET-EU-${tlv2Data?.matricula || '15184'}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tarjeta destacada para Tarea y UMA */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-3">Información de Tarea Actual</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-blue-600">N° Tarea</h4>
                          <p className="text-lg font-bold">
                            {tlv2Data?.tlv2_tarea_actual || 
                             (tlv2Data as any)?.tarea_actual || 
                             '-'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-blue-600">UMA</h4>
                          <p className="text-lg font-bold">
                            {tlv2Data?.tlv2_uma_actual || 
                             (tlv2Data as any)?.uma_actual || 
                             '-'}
                          </p>
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
                <TabsTrigger value="orden">Orden Actual</TabsTrigger>
                <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
                <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Información General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="p-4">Cargando información...</div>
                    ) : (
                      <div className="space-y-6">
                        {/* Información básica */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">ID del Equipo</h3>
                            <p>{transelevadorData?.id || 'TRANS-002'}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Estado Actual</h3>
                            <p className={tlv2Data?.tlv2_averia === 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                              {tlv2Data?.tlv2_averia === 0 ? 'Operativo' : 'Con Avería'}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Modo</h3>
                            <p className={tlv2Data?.tlv2_modo === 1 ? 'text-blue-500 font-medium' : 'text-purple-500 font-medium'}>
                              {tlv2Data?.tlv2_modo === 1 ? 'Automático' : 'Manual'}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Ocupación</h3>
                            <p className={tlv2Data?.tlv2_ocupacion === 0 ? 'text-green-500 font-medium' : 'text-yellow-500 font-medium'}>
                              {tlv2Data?.tlv2_ocupacion === 0 ? 'Libre' : 'Ocupado'}
                            </p>
                          </div>
                        </div>

                        {/* Tarjeta destacada para Tarea y UMA */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h3 className="font-semibold text-blue-800 mb-3">Información de Tarea Actual</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm text-blue-600">N° Tarea</h4>
                              <p className="text-lg font-bold">
                                {tlv2Data?.tlv2_tarea_actual || 
                                 (tlv2Data as any)?.tarea_actual || 
                                 '-'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-blue-600">UMA</h4>
                              <p className="text-lg font-bold">
                                {tlv2Data?.tlv2_uma_actual || 
                                 (tlv2Data as any)?.uma_actual || 
                                 '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Posición y Matrícula */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Posición Actual</h3>
                            <p>
                              Pasillo: {tlv2Data?.tlv2_pasillo_actual || '-'}, X: {tlv2Data?.tlv2_coord_x_actual || '-'}, 
                              Y: {tlv2Data?.tlv2_coord_y_actual || '-'}, 
                              Z: {tlv2Data?.tlv2_coord_z_actual || '-'}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Matrícula Actual</h3>
                            <p>{tlv2Data?.tlv2_matricula_actual || '-'}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Última Actualización</h3>
                            <p>
                              {tlv2Data?.timestamp 
                                ? new Date(tlv2Data.timestamp).toLocaleString() 
                                : 'Desconocido'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="orden">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles de la Orden Actual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="p-4">Cargando información...</div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Tipo de Orden</h3>
                            <p className="font-medium">
                              {tlv2Data?.tlv2_orden_tipo === 1 ? 'Almacenamiento' : 
                               tlv2Data?.tlv2_orden_tipo === 2 ? 'Extracción' : 
                               tlv2Data?.tlv2_orden_tipo === 3 ? 'Reubicación' : 'Desconocido'}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Matrícula</h3>
                            <p className="font-medium">{tlv2Data?.tlv2_orden_matricula || '-'}</p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h3 className="font-semibold text-blue-800 mb-3">Origen</h3>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <h4 className="font-medium text-sm text-blue-600">Pasillo</h4>
                              <p className="font-medium">{tlv2Data?.tlv2_orden_pasillo_origen || '-'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-blue-600">X</h4>
                              <p className="font-medium">{tlv2Data?.tlv2_orden_coord_x_origen || '-'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-blue-600">Y</h4>
                              <p className="font-medium">{tlv2Data?.tlv2_orden_coord_y_origen || '-'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-blue-600">Z</h4>
                              <p className="font-medium">{tlv2Data?.tlv2_orden_coord_z_origen || '-'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h3 className="font-semibold text-green-800 mb-3">Destino</h3>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <h4 className="font-medium text-sm text-green-600">Pasillo</h4>
                              <p className="font-medium">{tlv2Data?.tlv2_orden_pasillo_destino || '-'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-green-600">X</h4>
                              <p className="font-medium">{tlv2Data?.tlv2_orden_coord_x_destino || '-'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-green-600">Y</h4>
                              <p className="font-medium">{tlv2Data?.tlv2_orden_coord_y_destino || '-'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-green-600">Z</h4>
                              <p className="font-medium">{tlv2Data?.tlv2_orden_coord_z_destino || '-'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h3 className="font-semibold text-gray-800 mb-3">Estado de Finalización</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm text-gray-600">Estado</h4>
                              <p className="font-medium">
                                {tlv2Data?.tlv2_fin_orden_estado === 0 ? 'No finalizada' : 
                                 tlv2Data?.tlv2_fin_orden_estado === 1 ? 'Finalizada' : 
                                 tlv2Data?.tlv2_fin_orden_estado === 2 ? 'Cancelada' : 'Desconocido'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-gray-600">Resultado</h4>
                              <p className="font-medium">
                                {tlv2Data?.tlv2_fin_orden_resultado === 0 ? 'Sin resultado' : 
                                 tlv2Data?.tlv2_fin_orden_resultado === 1 ? 'Éxito' : 
                                 tlv2Data?.tlv2_fin_orden_resultado === 2 ? 'Error' : 'Desconocido'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
