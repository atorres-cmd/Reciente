import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import SidebarOperator from "./SidebarOperator";
import HeaderOperator from "./HeaderOperator";
import { Home, Eye, AlertTriangle, Clock, Settings, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomSvgIcon from './CustomSvgIcon';
import { getTLV1StatusFromMariaDB, TLV1StatusData } from '../services/api';

// Tipo para los modos de operación
type OperationMode = 'manual' | 'automatico';

// Tipo para el estado de ocupación
type OccupationStatus = 'libre' | 'ocupado';

// Tipo para el estado de avería
type FaultStatus = 'ok' | 'averia';

const ControlTLV1Page = () => {
  // Estado para la posición actual
  const [currentPosition, setCurrentPosition] = useState({ x: 7, y: 5, z: 1 });
  const [currentAisle, setCurrentAisle] = useState(5); // Pasillo actual
  
  // Estado para la orden de transbordo
  const [sourceAisle, setSourceAisle] = useState(currentAisle.toString());
  const [targetAisle, setTargetAisle] = useState('');
  
  // Estado del transelevador
  const [operationMode, setOperationMode] = useState<OperationMode>('automatico');
  const [occupationStatus, setOccupationStatus] = useState<OccupationStatus>('libre');
  const [faultStatus, setFaultStatus] = useState<FaultStatus>('ok');
  
  // Estado para los datos de TLV1 desde MariaDB
  const [tlv1Data, setTLV1Data] = useState<TLV1StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Cargar datos de TLV1 desde Node-RED
  useEffect(() => {
    const fetchTLV1Data = async () => {
      try {
        setLoading(true);
        // Usar la nueva función que obtiene datos de Node-RED
        const data = await getTLV1StatusFromMariaDB();
        console.log('Datos de TLV1 recibidos:', data);
        setTLV1Data(data);
        
        // Actualizar estados con los datos recibidos
        setCurrentPosition({ 
          x: data.x_actual || 0, 
          y: data.y_actual || 0, 
          z: data.z_actual || 0 
        });
        setCurrentAisle(data.pasillo_actual || 0);
        setOperationMode(data.modo === 1 ? 'automatico' : 'manual');
        setOccupationStatus(data.ocupacion === 1 ? 'ocupado' : 'libre');
        setFaultStatus(data.averia === 1 ? 'averia' : 'ok');
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos de TLV1:', err);
        setError('Error al cargar datos del transelevador');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTLV1Data();
    
    // Configurar intervalo para actualizar los datos cada 5 segundos
    const intervalId = setInterval(fetchTLV1Data, 5000);
    
    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);
  
  // Actualizar el pasillo de origen cuando cambia el pasillo actual
  useEffect(() => {
    setSourceAisle(currentAisle.toString());
  }, [currentAisle]);

  // Función para ejecutar la orden de transbordo
  const handleExecuteTransfer = () => {
    if (!sourceAisle || !targetAisle) {
      alert('Por favor, ingrese los pasillos de origen y destino');
      return;
    }
    
    console.log(`Ejecutando transbordo desde pasillo ${sourceAisle} hasta pasillo ${targetAisle}`);
    setOccupationStatus('ocupado');
    
    // Simulación de cambio de posición después de un tiempo
    setTimeout(() => {
      // Actualizar el pasillo actual
      setCurrentAisle(parseInt(targetAisle) || currentAisle);
      setOccupationStatus('libre');
    }, 3000);
  };

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
            className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-gray-600 transition-colors"
            onClick={() => navigate('/transelevador/t1')}
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
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 transition-colors"
          >
            <Settings size={18} />
            <span>Control</span>
          </button>
        </div>
        
        <main className="flex-1 p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Control Transelevador T1</h1>
            <p className="text-gray-600 mt-1">Panel de control y configuración para el transelevador T1</p>
            {loading && <p className="text-blue-500 mt-1">Cargando datos...</p>}
            {error && <p className="text-red-500 mt-1">{error}</p>}
            {tlv1Data && <p className="text-green-500 mt-1">Última actualización: {new Date(tlv1Data.timestamp).toLocaleString()}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tarjeta de Posición Actual */}
            <Card>
              <CardHeader>
                <CardTitle>Posición Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CustomSvgIcon 
                    name="T1" 
                    className={`mr-4 ${occupationStatus === 'ocupado' ? 'animate-pulse' : ''}`}
                    size={60}
                  />
                  <div className="bg-gray-50 p-4 rounded-md flex-1">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Pasillo</p>
                        <p className="text-2xl font-semibold">{currentAisle}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">X</p>
                        <p className="text-2xl font-semibold">{currentPosition.x}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Y</p>
                        <p className="text-2xl font-semibold">{currentPosition.y}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Z</p>
                        <p className="text-2xl font-semibold">{currentPosition.z}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tarjeta de Orden de Transbordo */}
            <Card>
              <CardHeader>
                <CardTitle>Orden de Transbordo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="source-aisle" className="mb-1 block">Pasillo Actual</Label>
                    <Input 
                      id="source-aisle" 
                      type="number" 
                      placeholder="Ingrese el pasillo actual"
                      value={sourceAisle}
                      onChange={(e) => setSourceAisle(e.target.value)}
                      disabled={occupationStatus === 'ocupado'}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="target-aisle" className="mb-1 block">Pasillo Destino</Label>
                    <Input 
                      id="target-aisle" 
                      type="number" 
                      placeholder="Ingrese el pasillo destino"
                      value={targetAisle}
                      onChange={(e) => setTargetAisle(e.target.value)}
                      disabled={occupationStatus === 'ocupado'}
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors" 
                    onClick={handleExecuteTransfer}
                    disabled={occupationStatus === 'ocupado' || !sourceAisle || !targetAisle}
                  >
                    <ArrowRightLeft className="mr-2" size={18} />
                    Ejecutar Transbordo
                  </Button>
                  
                  {occupationStatus === 'ocupado' && (
                    <div className="mt-2 text-center">
                      <Badge className="bg-yellow-500">Operación en curso...</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Tarjeta de Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Modo</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold capitalize">{operationMode}</p>
                      <Badge className={operationMode === 'automatico' ? 'bg-blue-500' : 'bg-purple-500'}>
                        {operationMode === 'automatico' ? 'Automático' : 'Manual'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Ocupación</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold capitalize">{occupationStatus}</p>
                      <Badge className={occupationStatus === 'libre' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {occupationStatus === 'libre' ? 'Libre' : 'Ocupado'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Avería</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold capitalize">{faultStatus}</p>
                      <Badge className={faultStatus === 'ok' ? 'bg-green-500' : 'bg-red-500'}>
                        {faultStatus === 'ok' ? 'Sin averías' : 'Con averías'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Matrícula</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{tlv1Data?.matricula || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Última Actualización</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{tlv1Data?.timestamp ? new Date(tlv1Data.timestamp).toLocaleString() : '-'}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setFaultStatus(faultStatus === 'ok' ? 'averia' : 'ok')}
                  >
                    {faultStatus === 'ok' ? 'Simular avería' : 'Resolver avería'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tarjeta de Fin de Orden */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Fin de Orden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Estado Fin Orden</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_estado || 0}</p>
                      <Badge className={tlv1Data?.tlv1_fin_orden_estado === 0 ? 'bg-gray-500' : 'bg-green-500'}>
                        {tlv1Data?.tlv1_fin_orden_estado === 0 ? 'Sin fin de orden' : 'Orden finalizada'}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Resultado Fin Orden</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_resultado || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">Pasillo Destino Final</p>
                      <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_pasillo_destino || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">X Destino Final</p>
                      <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_coord_x_destino || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">Y Destino Final</p>
                      <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_coord_y_destino || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">Z Destino Final</p>
                      <p className="font-semibold">{tlv1Data?.tlv1_fin_orden_coord_z_destino || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Última Actualización</p>
                    <p className="font-semibold">{tlv1Data?.timestamp ? new Date(tlv1Data.timestamp).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ControlTLV1Page;
