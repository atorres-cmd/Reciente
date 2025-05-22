import React, { useState, useEffect } from 'react';
import { getCTStatusFromMariaDB, getCTStatusDirectFromNodeRED, CTStatusData, syncCTStatusInDB } from '../services/ctStatusApi';
import { getCTAlarmasFromMariaDB, syncCTAlarmasInDB, CTAlarmasData, CTAlarm } from '../services/ctAlarmasApi';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SidebarOperator from "./SidebarOperator";
import HeaderOperator from "./HeaderOperator";
import { Home, Eye, AlertTriangle, Clock, Settings, Bug } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Importaciones de componentes de alarmas
import CTAlarmsDebug from "./CTAlarmsDebug";
import CTAlarmsTest from "./CTAlarmsTest";
import CTAlarmsSimple from "./CTAlarmsSimple";

// Importación dinámica para evitar problemas de referencia circular
// @ts-ignore - Ignoramos temporalmente el error de importación
const CTAlarmsPanel = React.lazy(() => import('./CTAlarmsPanel'));

// Tipo para las alarmas
interface Alarma {
  field: string;
  message: string;
  severity: string;
  active: boolean;
  timestamp?: Date;
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
  const loadCTData = async (forceLoading = false) => {
    try {
      // Solo mostramos el indicador de carga si es una actualización manual o si se especifica
      if (forceLoading) {
        setLoading(true);
      }
      
      // Verificar que la función existe antes de llamarla
      if (typeof getCTStatusDirectFromNodeRED !== 'function') {
        console.error('CTDetailPage: La función getCTStatusDirectFromNodeRED no está disponible');
        setError('Error: Función de obtención de datos no disponible');
        return;
      }
      
      // Usar la función que obtiene datos directamente de Node-RED
      const data = await getCTStatusDirectFromNodeRED();
      
      // Verificar que los datos sean válidos antes de actualizar el estado
      if (data && typeof data === 'object') {
        // Comparar con los datos actuales para evitar actualizaciones innecesarias
        const currentDataStr = JSON.stringify(ctData);
        const newDataStr = JSON.stringify(data);
        
        // Solo actualizar si los datos son diferentes
        if (currentDataStr !== newDataStr) {
          setCTData(data);
          setLastUpdate(new Date());
        }
        
        // Siempre limpiar el error si la operación fue exitosa
        if (error) {
          setError(null);
        }
        console.log('CTDetailPage: Estado actualizado con nuevos datos');
      } else {
        console.error('CTDetailPage: Datos recibidos inválidos:', data);
        setError('Datos del CT inválidos. Intente de nuevo.');
      }
    } catch (err: any) {
      console.error('CTDetailPage: Error al cargar datos del CT:', err);
      
      // Mostrar más detalles sobre el error
      let errorMessage = 'Error al cargar datos del CT. ';
      
      if (err.message) {
        console.error('CTDetailPage: Mensaje de error:', err.message);
        errorMessage += err.message;
      }
      
      if (err.response) {
        console.error('CTDetailPage: Respuesta de error:', err.response);
        errorMessage += ` (Estado: ${err.response.status})`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para sincronizar manualmente los datos del CT
  const handleSyncCT = async () => {
    try {
      // Para la sincronización manual sí mostramos el estado de carga inmediatamente
      setLoading(true);
      
      // Verificar que la función existe antes de llamarla
      if (typeof syncCTStatusInDB !== 'function') {
        setError('Error: Función de sincronización no disponible');
        return;
      }
      
      // syncCTStatusInDB no devuelve datos, solo solicita la sincronización en la BD
      await syncCTStatusInDB();
      
      // Después de sincronizar, cargamos los datos actualizados directamente de Node-RED
      const data = await getCTStatusDirectFromNodeRED();
      
      // Actualizar los datos
      setCTData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      console.error('CTDetailPage: Error al sincronizar datos del CT:', err);
      
      // Mostrar más detalles sobre el error
      let errorMessage = 'Error al sincronizar datos del CT. ';
      
      if (err.message) {
        console.error('CTDetailPage: Mensaje de error:', err.message);
        errorMessage += err.message;
      }
      
      if (err.response) {
        console.error('CTDetailPage: Respuesta de error:', err.response);
        errorMessage += ` (Estado: ${err.response.status})`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar las alarmas activas del CT
  const loadCTAlarms = async () => {
    try {
      setLoadingAlarmas(true);
      setErrorAlarmas(null);
      
      // Primero sincronizamos para asegurarnos de tener los datos más recientes
      console.log('Sincronizando alarmas del CT...');
      await syncCTAlarmasInDB();
      
      // Luego obtenemos las alarmas actuales
      console.log('Obteniendo alarmas del CT...');
      const response = await getCTAlarmasFromMariaDB();
      
      console.log('Respuesta de alarmas CT desde Node-RED:', response);
      
      if (response.success && response.data) {
        // Convertir las fechas de string a Date si es necesario
        const alarmasWithDates = response.data.map(alarma => ({
          ...alarma,
          timestamp: alarma.timestamp instanceof Date ? alarma.timestamp : new Date(alarma.timestamp)
        }));
        
        console.log('Alarmas procesadas:', alarmasWithDates);
        console.log('Alarmas activas:', alarmasWithDates.filter(a => a.active));
        
        setAlarmas(alarmasWithDates);
      } else {
        console.warn('No se pudieron cargar las alarmas:', response);
        setErrorAlarmas('No se pudieron cargar las alarmas');
      }
    } catch (error) {
      console.error('Error al cargar alarmas del CT:', error);
      setErrorAlarmas('Error al cargar las alarmas');
    } finally {
      setLoadingAlarmas(false);
    }
  };
  
  // Cargar los datos inicialmente
  useEffect(() => {
    // Cargar datos iniciales con indicador de carga
    loadCTData(true);
    loadCTAlarms();
    
    // Configurar actualización automática cada 15 segundos sin mostrar indicador de carga
    const intervalId = setInterval(() => {
      // Pasar false para no mostrar el indicador de carga en actualizaciones automáticas
      loadCTData(false);
    }, 15000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);
  
  // Comentamos este efecto ya que causa renderizaciones adicionales innecesarias
  // La actualización de lastUpdate ya se hace en loadCTData
  /*
  useEffect(() => {
    if (ctData) {
      console.log('CTDetailPage: Datos del CT actualizados');
      // No es necesario forzar una actualización adicional
    }
  }, [ctData]);
  */
  
  // Función para forzar la actualización manual
  const handleForceRefresh = () => {
    // Pasar true para mostrar el indicador de carga ya que es una acción manual
    loadCTData(true);
    loadCTAlarms();
  };
  


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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Estado
              </TabsTrigger>
              <TabsTrigger value="alarmas" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alarmas
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="configuracion" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </TabsTrigger>
              <TabsTrigger value="debug" className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Depuración
              </TabsTrigger>
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
                            <div className={`absolute top-2 right-2 ${ctData?.ct_estado_carro === 0 ? 'bg-green-500' : ctData?.ct_estado_carro === 1 ? 'bg-yellow-500' : ctData?.ct_estado_carro === 2 ? 'bg-red-500' : 'bg-gray-500'} text-white text-xs px-2 py-1 rounded-full shadow-md`}>
                              Estado: {getCarroEstadoText(ctData?.ct_estado_carro)}
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
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleForceRefresh} 
                              disabled={loading}
                            >
                              {loading ? 'Actualizando...' : 'Actualizar'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleSyncCT} 
                              disabled={loading}
                            >
                              {loading ? 'Sincronizando...' : 'Sincronizar'}
                            </Button>

                          </div>
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
                              <span className="font-medium">{ctData.ct_numero_pasillo_actual}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pasillo destino:</span>
                              <span className="font-medium">{ctData.ct_pasillo_destino || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ciclo de trabajo:</span>
                              <span className="font-medium">{ctData.ct_ciclo_trabajo ? 'Activo' : 'Inactivo'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Modo:</span>
                              <span 
                                className={`font-medium ${
                                  ctData.ct_automatico ? 'text-green-600' : 
                                  ctData.ct_semiautomatico ? 'text-yellow-600' : 
                                  ctData.ct_manual ? 'text-blue-600' : 'text-gray-600'
                                }`}
                              >
                                {ctData.ct_automatico ? 'Auto' : 
                                 ctData.ct_semiautomatico ? 'Semi' : 
                                 ctData.ct_manual ? 'Manual' : 'Desconocido'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Conectado:</span>
                              <span className="font-medium">{ctData.ct_conectado ? 'Sí' : 'No'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Defecto:</span>
                              <span className="font-medium">{ctData.ct_defecto ? 'Sí' : 'No'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Puerta armario:</span>
                              <span className="font-medium">{ctData.ct_emergencia_puerta_armario ? 'Emergencia' : 'Normal'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estado carro:</span>
                              <span className="font-medium">
                                {getCarroEstadoText(ctData.ct_estado_carro)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Material entrada:</span>
                              <span className="font-medium">{ctData.ct_matricula_paleta_entrada || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Material salida:</span>
                              <span className="font-medium">{ctData.ct_matricula_paleta_salida || 0}</span>
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
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                    Alarmas Activas
                  </h3>
                  <CTAlarmsSimple />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="alarmas" className="mt-6">
              <div className="space-y-6">
                {/* Componente simple de alarmas */}
                <CTAlarmsSimple />
                
                {/* Componente de prueba para alarmas sin procesar */}
                <CTAlarmsTest />
                
                {/* Historial de alarmas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Alarmas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Historial de alarmas en desarrollo...</p>
                  </CardContent>
                </Card>
              </div>
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
            
            <TabsContent value="debug" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Depuración de Comunicación con Node-RED</CardTitle>
                </CardHeader>
                <CardContent>
                  <CTAlarmsDebug />
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
