import React, { useState, useEffect } from 'react';
import { getTranselevadorData, getTranselevadorAlarmas, getTLV1StatusFromMariaDB, TranselevadorData, Alarma, TLV1StatusData } from '../services/api';
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

  // Cargar datos del transelevador al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Obtener datos del transelevador T1
        const data = await getTranselevadorData('TRANS-001');
        setTranselevadorData(data);
        
        // Obtener alarmas del transelevador T1
        const alarmasData = await getTranselevadorAlarmas('TRANS-001');
        setAlarmas(alarmasData);
        
        // Obtener datos de TLV1 desde MariaDB
        try {
          const tlv1MariaDBData = await getTLV1StatusFromMariaDB();
          setTLV1Data(tlv1MariaDBData);
          setMariaDBError(null);
        } catch (mariaDBErr) {
          console.error('Error al cargar datos de TLV1 desde MariaDB:', mariaDBErr);
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
            {tlv1Data && <p className="text-green-500 mt-1">Última actualización desde MariaDB: {new Date(tlv1Data.timestamp).toLocaleString()}</p>}
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
                    {/* Sensores - Círculos indicadores */}
                    {/* Sensor superior izquierdo */}
                    <div className="absolute top-[120px] left-[220px] w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md z-10"></div>
                    
                    {/* Sensor superior derecho */}
                    <div className="absolute top-[120px] right-[220px] w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md z-10"></div>
                    
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
                              <div className="font-medium">5</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">X</div>
                              <div className="font-medium">{tlv1Data ? tlv1Data.x_actual : 7}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Y</div>
                              <div className="font-medium">5</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Z</div>
                              <div className="font-medium">{tlv1Data ? tlv1Data.z_actual : 1}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">Destino:</h4>
                          <div className="grid grid-cols-4 gap-2 pl-2">
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Pasillo</div>
                              <div className="font-medium">8</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">X</div>
                              <div className="font-medium">12</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Y</div>
                              <div className="font-medium">3</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-blue-600">Z</div>
                              <div className="font-medium">2</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nº Tarea:</span>
                          <span className="font-medium">{tlv1Data ? `TRK-${tlv1Data.id}-${tlv1Data.matricula}` : 'TRK-2025-0458'}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">UMA:</span>
                          <span className="font-medium">{tlv1Data ? `PALET-EU-${tlv1Data.matricula}` : 'PALET-EU-0012458'}</span>
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

            {/* Alarmas Actuales */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    Alarmas Actuales <span className="text-gray-500 ml-2 font-normal">(2 sin reconocer)</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <span className="text-red-500 text-sm">Críticas: 1</span>
                    <span className="text-amber-500 text-sm">Advertencias: 1</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alarmas.map(alarma => {
                    let bgColor = "bg-white";
                    
                    if (alarma.tipo === 'error') {
                      bgColor = "bg-red-50";
                    } else if (alarma.tipo === 'warning') {
                      bgColor = "bg-amber-50";
                    } else if (alarma.tipo === 'success') {
                      bgColor = "bg-green-50";
                    }
                    
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium text-sm text-gray-500">ID del Equipo</h3>
                          <p>{transelevadorData?.id || 'TRANS-001'}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-gray-500">Estado Actual</h3>
                          <p className={transelevadorData?.status === 'active' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                            {transelevadorData?.status === 'active' ? 'Activo' : 'Inactivo'}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-gray-500">Posición</h3>
                          <p>
                            Pasillo 5, X: {transelevadorData?.position_x || 0}, 
                            Y: {transelevadorData?.position_y || 0}, 
                            Z: {transelevadorData?.position_z || 0}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-gray-500">Última Actividad</h3>
                          <p>
                            {transelevadorData?.last_activity 
                              ? new Date(transelevadorData.last_activity).toLocaleTimeString() 
                              : 'Desconocido'}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-gray-500">Ciclos Hoy</h3>
                          <p>{transelevadorData?.cycles_today || 0}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-gray-500">Eficiencia</h3>
                          <p>{transelevadorData?.efficiency || 0}%</p>
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
