import React, { useState, useEffect } from 'react';
import { getTranselevadorData, getTranselevadorAlarmas, TranselevadorData, Alarma, TLV1StatusData } from '../services/api';
import { getTLV1StatusFromMariaDB } from '../services/tlv1StatusApi';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SidebarOperator from "./SidebarOperator";
import HeaderOperator from "./HeaderOperator";
import { Home, Eye, AlertTriangle, Clock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Utilizamos los tipos y servicios importados desde api.ts

const TranselevadorDetailPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [transelevadorData, setTranselevadorData] = useState<TranselevadorData | null>(null);
  const [alarmas, setAlarmas] = useState<Alarma[]>([]);
  const [loading, setLoading] = useState(true);
  const [tlv1Data, setTLV1Data] = useState<TLV1StatusData | null>(null);
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
        
        // Obtener datos del transelevador T1
        const data = await getTranselevadorData('TRANS-001');
        setTranselevadorData(data);
        
        // Obtener alarmas del transelevador T1
        const alarmasData = await getTranselevadorAlarmas('TRANS-001');
        setAlarmas(alarmasData);
        
        // Obtener datos de TLV1 desde Node-RED
        try {
          const tlv1MariaDBData = await getTLV1StatusFromMariaDB();
          // Actualizar datos sin causar parpadeo
          setTLV1Data(prevData => {
            // Solo registrar en consola en desarrollo
            if (process.env.NODE_ENV !== 'production') {
              console.log('Datos recibidos de TLV1 desde Node-RED:', tlv1MariaDBData);
            }
            return tlv1MariaDBData;
          });
          setMariaDBError(null);
        } catch (mariaDBErr) {
          console.error('Error al cargar datos de TLV1 desde Node-RED:', mariaDBErr);
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
            onClick={() => navigate('/control/tlv1')}
          >
            <Settings size={18} />
            <span>Control</span>
          </button>
        </div>
        
        <main className="flex-1 p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Transelevador T1</h1>
            <p className="text-gray-600 mt-1">Monitor de estado y operaciones en tiempo real</p>
            {loading && <p className="text-blue-500 mt-1">Cargando datos...</p>}
            {mariaDBError && <p className="text-yellow-500 mt-1">{mariaDBError} - Usando datos de respaldo</p>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recuadro grande con el SVG del T1 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visualización del Transelevador T1</CardTitle>
              </CardHeader>
              <CardContent className="p-4 overflow-hidden">
                <div className="flex">
                  <div className="relative flex-1 h-[500px] flex justify-center">
                    {/* Sensores eliminados */}
                    
                    {/* Imagen del transelevador */}
                    <img 
                      src="/icons/T1.svg" 
                      alt="Transelevador T1 detallado" 
                      className="h-full object-contain relative z-0"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      Estado: {tlv1Data ? (tlv1Data.averia === 1 ? 'Avería' : 'Activo') : 'Activo'}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      Coordenadas: {tlv1Data ? `Pasillo: ${tlv1Data.pasillo_actual}, X: ${tlv1Data.x_actual}, Y: ${tlv1Data.y_actual}, Z: ${tlv1Data.z_actual}` : 'No disponibles'}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      Matrícula: {tlv1Data ? tlv1Data.matricula : 'No disponible'}
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col gap-4 w-64">
                    {/* Tarjeta de Tarea Actual */}
                    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Tarea Actual</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {tlv1Data && tlv1Data.modo === 1 ? 'Automático' : 'Extracción'}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">Origen:</h4>
                          <div className="grid grid-cols-4 gap-2 pl-2">
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Pasillo</div>
                              <div className="font-medium">{tlv1Data?.tlv1_orden_pasillo_origen || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">X</div>
                              <div className="font-medium">{tlv1Data?.tlv1_orden_coord_x_origen || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Y</div>
                              <div className="font-medium">{tlv1Data?.tlv1_orden_coord_y_origen || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Z</div>
                              <div className="font-medium">{tlv1Data?.tlv1_orden_coord_z_origen || '-'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">Destino:</h4>
                          <div className="grid grid-cols-4 gap-2 pl-2">
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Pasillo</div>
                              <div className="font-medium">{tlv1Data?.tlv1_orden_pasillo_destino || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">X</div>
                              <div className="font-medium">{tlv1Data?.tlv1_orden_coord_x_destino || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Y</div>
                              <div className="font-medium">{tlv1Data?.tlv1_orden_coord_y_destino || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Z</div>
                              <div className="font-medium">{tlv1Data?.tlv1_orden_coord_z_destino || '-'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nº Tarea:</span>
                          <span className="font-medium">
                            {tlv1Data?.tlv1_tarea_actual || (tlv1Data as any)?.tarea_actual || `TRK-1-${tlv1Data?.matricula || '15184'}`}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">UMA:</span>
                          <span className="font-medium">
                            {tlv1Data?.tlv1_uma_actual || (tlv1Data as any)?.uma_actual || `PALET-EU-${tlv1Data?.matricula || '15184'}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tarjeta de Estado */}
                    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Estado</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Modo:</span>
                          <span className="font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {tlv1Data ? (tlv1Data.modo === 1 ? 'Auto' : 'Manual') : 'Auto'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ocupación:</span>
                          <span className={`font-medium px-2 py-0.5 rounded ${tlv1Data && tlv1Data.ocupacion === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {tlv1Data ? (tlv1Data.ocupacion === 1 ? 'Ocupado' : 'Libre') : 'Libre'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avería:</span>
                          <span className={`font-medium px-2 py-0.5 rounded ${tlv1Data && tlv1Data.averia === 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {tlv1Data ? (tlv1Data.averia === 1 ? 'Sí' : 'No') : 'No'}
                          </span>
                        </div>
                        {tlv1Data && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estado Fin Orden:</span>
                            <span className="font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {tlv1Data.estadoFinOrden}
                            </span>
                          </div>
                        )}
                        {tlv1Data && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Resultado Fin Orden:</span>
                            <span className="font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {tlv1Data.resultadoFinOrden}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* La tarjeta de información del transelevador ha sido eliminada */}

            {/* Panel de alarmas */}
            <Card>
              <CardHeader>
                <CardTitle>Alarmas Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alarmas.map(alarma => {
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

          {/* Tabs para información adicional */}
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
                            <p>{transelevadorData?.id || 'TRANS-001'}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Estado Actual</h3>
                            <p className={tlv1Data?.tlv1_averia === 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                              {tlv1Data?.tlv1_averia === 0 ? 'Operativo' : 'Con Avería'}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Modo</h3>
                            <p className={tlv1Data?.tlv1_modo === 1 ? 'text-blue-500 font-medium' : 'text-purple-500 font-medium'}>
                              {tlv1Data?.tlv1_modo === 1 ? 'Automático' : 'Manual'}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Ocupación</h3>
                            <p className={tlv1Data?.tlv1_ocupacion === 0 ? 'text-green-500 font-medium' : 'text-yellow-500 font-medium'}>
                              {tlv1Data?.tlv1_ocupacion === 0 ? 'Libre' : 'Ocupado'}
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
                                {tlv1Data?.tlv1_tarea_actual || 
                                 (tlv1Data as any)?.tarea_actual || 
                                 '-'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-blue-600">UMA</h4>
                              <p className="text-lg font-bold">
                                {tlv1Data?.tlv1_uma_actual || 
                                 (tlv1Data as any)?.uma_actual || 
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
                              Pasillo: {tlv1Data?.tlv1_pasillo_actual || '-'}, X: {tlv1Data?.tlv1_coord_x_actual || '-'}, 
                              Y: {tlv1Data?.tlv1_coord_y_actual || '-'}, 
                              Z: {tlv1Data?.tlv1_coord_z_actual || '-'}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Matrícula Actual</h3>
                            <p>{tlv1Data?.tlv1_matricula_actual || '-'}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-500">Última Actualización</h3>
                            <p>
                              {tlv1Data?.timestamp 
                                ? new Date(tlv1Data.timestamp).toLocaleString() 
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
                    <CardTitle>Información de Orden Actual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="p-4">Cargando información...</div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Orden Actual</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Tipo de Orden</p>
                              <div className="flex items-center justify-between">
                                <p className="font-semibold">{tlv1Data?.tlv1_orden_tipo || 0}</p>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  tlv1Data?.tlv1_orden_tipo === 0 ? 'bg-gray-200 text-gray-800' :
                                  tlv1Data?.tlv1_orden_tipo === 1 ? 'bg-blue-200 text-blue-800' :
                                  tlv1Data?.tlv1_orden_tipo === 2 ? 'bg-green-200 text-green-800' :
                                  tlv1Data?.tlv1_orden_tipo === 3 ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                                }`}>
                                  {tlv1Data?.tlv1_orden_tipo === 0 ? 'Sin orden' :
                                   tlv1Data?.tlv1_orden_tipo === 1 ? 'Entrada' :
                                   tlv1Data?.tlv1_orden_tipo === 2 ? 'Salida' :
                                   tlv1Data?.tlv1_orden_tipo === 3 ? 'Reubicación' : 'Desconocido'}
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Matrícula de la Orden</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_orden_matricula || '-'}</p>
                            </div>
                          </div>
                          
                          <h4 className="text-md font-semibold mt-4 mb-2">Origen</h4>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Pasillo</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_orden_pasillo_origen || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">X</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_orden_coord_x_origen || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Y</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_orden_coord_y_origen || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Z</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_orden_coord_z_origen || '-'}</p>
                            </div>
                          </div>
                          
                          <h4 className="text-md font-semibold mt-4 mb-2">Destino</h4>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Pasillo</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_orden_pasillo_destino || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">X</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_orden_coord_x_destino || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Y</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_orden_coord_y_destino || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Z</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_orden_coord_z_destino || '-'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Fin de Orden</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Estado Fin Orden</p>
                              <div className="flex items-center justify-between">
                                <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_estado || 0}</p>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  tlv1Data?.tlv1_fin_orden_estado === 0 ? 'bg-gray-200 text-gray-800' : 'bg-green-200 text-green-800'
                                }`}>
                                  {tlv1Data?.tlv1_fin_orden_estado === 0 ? 'Sin fin de orden' : 'Orden finalizada'}
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Resultado Fin Orden</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_resultado || '-'}</p>
                            </div>
                          </div>
                          
                          <h4 className="text-md font-semibold mt-4 mb-2">Destino Final</h4>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Pasillo</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_pasillo_destino || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">X</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_coord_x_destino || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Y</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_coord_y_destino || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-500 mb-1">Z</p>
                              <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_coord_z_destino || '-'}</p>
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
                    <p>Aquí se mostrarían gráficos y estadísticas de operación del transelevador T1.</p>
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

export default TranselevadorDetailPage;
