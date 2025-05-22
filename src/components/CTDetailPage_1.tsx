import React, { useState, useEffect } from 'react';
import { getCTStatusFromMariaDB, CTStatusData, syncCTFromPLC } from '../services/api';
import { fetchCTActiveAlarms, syncCTAlarms } from '../services/ctAlarmsService';
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
  deviceId: string;
  deviceName: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: Date;
  acknowledged: boolean;
}

// Función para obtener el texto del estado del carro
const getCarroEstadoText = (estado?: number): string => {
  if (estado === undefined) return 'Desconocido';
  switch (estado) {
    case 0: return 'Libre';
    case 1: return 'Ocupado';
    case 2: return 'Avería';
    default: return 'Desconocido';
  }
};

// Función para obtener el color del estado del carro
const getCarroEstadoColor = (estado?: number): string => {
  if (estado === undefined) return 'gray';
  switch (estado) {
    case 0: return 'green';
    case 1: return 'yellow';
    case 2: return 'red';
    default: return 'gray';
  }
};

const CTDetailPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [ctData, setCTData] = useState<CTStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [alarmas, setAlarmas] = useState<Alarma[]>([]);
  const [loadingAlarmas, setLoadingAlarmas] = useState(true);
  const [errorAlarmas, setErrorAlarmas] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Función para cargar los datos del CT
  const loadCTData = async () => {
    try {
      setLoading(true);
      const data = await getCTStatusFromMariaDB();
      setCTData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos del CT:', err);
      setError('Error al cargar datos del CT. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para sincronizar manualmente los datos del CT
  const handleSyncCT = async () => {
    try {
      setLoading(true);
      const data = await syncCTFromPLC();
      setCTData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error al sincronizar datos del CT:', err);
      setError('Error al sincronizar datos del CT. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar las alarmas activas del CT
  const loadCTAlarms = async () => {
    try {
      setLoadingAlarmas(true);
      const data = await fetchCTActiveAlarms();
      setAlarmas(data);
      setErrorAlarmas(null);
    } catch (err) {
      console.error('Error al cargar alarmas del CT:', err);
      setErrorAlarmas('Error al cargar alarmas del CT. Intente de nuevo.');
    } finally {
      setLoadingAlarmas(false);
    }
  };
  
  // Cargar los datos inicialmente
  useEffect(() => {
    loadCTData();
    loadCTAlarms();
    
    // Configurar actualización automática cada 10 segundos
    const intervalId = setInterval(() => {
      loadCTData();
    }, 10000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex bg-operator-gray-bg min-h-screen font-sans">
      <SidebarOperator />
      <div className="flex-1 flex flex-col">
        <HeaderOperator />
        
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Detalle del Carro Transferidor</h1>
            <Button onClick={() => navigate('/')}>Volver al Panel Principal</Button>
          </div>
          
          <div className="bg-gray-700 px-6 py-3 flex space-x-4 mb-6">
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-gray-600 transition-colors"
              onClick={() => navigate('/')}
            >
              <Home size={18} />
              <span>Inicio</span>
            </button>
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-gray-600 transition-colors"
              onClick={() => setActiveTab('general')}
            >
              <Eye size={18} />
              <span>General</span>
            </button>
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-gray-600 transition-colors"
              onClick={() => setActiveTab('alarmas')}
            >
              <AlertTriangle size={18} />
              <span>Alarmas</span>
            </button>
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-gray-600 transition-colors"
              onClick={() => setActiveTab('historial')}
            >
              <Clock size={18} />
              <span>Historial</span>
            </button>
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-gray-600 transition-colors"
              onClick={() => setActiveTab('configuracion')}
            >
              <Settings size={18} />
              <span>Configuración</span>
            </button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="alarmas">Alarmas</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
              <TabsTrigger value="configuracion">Configuración</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recuadro de Información General */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 relative">
                        <div className="flex items-center justify-center">
                          <div className="w-full h-[300px] relative">
                            <img 
                              src="/icons/CT_T.svg" 
                              alt="Carro de transferencia detallado" 
                              className="absolute inset-0 w-full h-full object-contain"
                            />
                            <div className={`absolute top-2 right-2 ${ctData?.St_Carro === 0 ? 'bg-green-500' : ctData?.St_Carro === 1 ? 'bg-yellow-500' : ctData?.St_Carro === 2 ? 'bg-red-500' : 'bg-gray-500'} text-white text-xs px-2 py-1 rounded-full shadow-md`}>
                              Estado: {getCarroEstadoText(ctData?.St_Carro)}
                            </div>
                            {loading && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md animate-pulse">
                                Actualizando...
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Otras alternativas disponibles: CT.svg, CT_animado.svg */}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Estado Actual</h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSyncCT} 
                            disabled={loading}
                          >
                            {loading ? 'Sincronizando...' : 'Sincronizar'}
                          </Button>
                        </div>
                        
                        {loading ? (
                          <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                          </div>
                        ) : error ? (
                          <div className="text-red-500 p-4">{error}</div>
                        ) : ctData ? (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pasillo actual:</span>
                              <span className="font-medium">{ctData.PasActual}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pasillo destino:</span>
                              <span className="font-medium">{ctData.PasDestino || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ciclo de trabajo:</span>
                              <span className="font-medium">{ctData.CicloTrabajo ? 'Activo' : 'Inactivo'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Modo:</span>
                              <span 
                                className={`font-medium ${
                                  ctData.St_Auto ? 'text-green-600' : 
                                  ctData.St_Semi ? 'text-yellow-600' : 
                                  ctData.St_Manual ? 'text-blue-600' : 'text-gray-600'
                                }`}
                              >
                                {ctData.St_Auto ? 'Auto' : 
                                 ctData.St_Semi ? 'Semi' : 
                                 ctData.St_Manual ? 'Manual' : 'Desconocido'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Conectado:</span>
                              <span className="font-medium">{ctData.StConectado ? 'Sí' : 'No'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Defecto:</span>
                              <span className="font-medium">{ctData.StDefecto ? 'Sí' : 'No'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Puerta armario:</span>
                              <span className="font-medium">{ctData.St_Puerta ? 'Emergencia' : 'Normal'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estado carro:</span>
                              <span className="font-medium">
                                {getCarroEstadoText(ctData.St_Carro)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Material entrada:</span>
                              <span className="font-medium">{ctData.MatEntrada || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Material salida:</span>
                              <span className="font-medium">{ctData.MatSalida || 0}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 p-4">No hay datos disponibles</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recuadro de Alarmas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Alarmas Activas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingAlarmas ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    ) : errorAlarmas ? (
                      <div className="text-red-500 p-4">{errorAlarmas}</div>
                    ) : alarmas.length > 0 ? (
                      <div className="space-y-4">
                        {alarmas.map((alarma) => (
                          <div key={alarma.id} className="border-l-4 border-red-500 pl-4 py-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{alarma.message}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(alarma.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">{alarma.deviceName}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-green-500 p-4">No hay alarmas activas</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="alarmas" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Alarmas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Historial de alarmas en desarrollo...</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="historial" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Operaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Historial de operaciones en desarrollo...</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="configuracion" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">ID</h3>
                      <p>CT-001</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Modelo</h3>
                      <p>Carro Transferidor Estándar</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Fabricante</h3>
                      <p>Mecalux</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Año</h3>
                      <p>2022</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Última revisión</h3>
                      <p>15/04/2023</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Próxima revisión</h3>
                      <p>15/10/2023</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Velocidad máxima</h3>
                      <p>1.2 m/s</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Eficiencia</h3>
                      <p>97.5%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-sm text-gray-500">
            Última actualización: {lastUpdate.toLocaleString()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CTDetailPage;
