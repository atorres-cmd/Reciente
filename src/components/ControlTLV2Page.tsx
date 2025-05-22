import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import SidebarOperator from "./SidebarOperator";
import HeaderOperator from "./HeaderOperator";
import { Home, Eye, AlertTriangle, Clock, Settings, ArrowRightLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomSvgIcon from './CustomSvgIcon';
import { getTLV2StatusFromMariaDB, TLV2StatusData } from '../services/api';

// Tipo para los modos de operación
type OperationMode = 'manual' | 'automatico';

// Tipo para el estado de ocupación
type OccupationStatus = 'libre' | 'ocupado';

// Tipo para el estado de avería
type FaultStatus = 'ok' | 'averia';

const ControlTLV2Page = () => {
  // Estado para los datos del TLV2 desde MariaDB
  const [tlv2Data, setTLV2Data] = useState<TLV2StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Estado para la posición actual
  const [currentPosition, setCurrentPosition] = useState({ x: 30, y: 8, z: 2 });
  const [currentAisle, setCurrentAisle] = useState(4); // Pasillo actual
  
  // Estado para la orden de transbordo
  const [sourceAisle, setSourceAisle] = useState(currentAisle.toString());
  const [targetAisle, setTargetAisle] = useState('');
  
  // Estado del transelevador
  const [operationMode, setOperationMode] = useState<OperationMode>('automatico');
  const [occupationStatus, setOccupationStatus] = useState<OccupationStatus>('libre');
  const [faultStatus, setFaultStatus] = useState<FaultStatus>('ok');
  
  const navigate = useNavigate();

  // Cargar datos de TLV2 desde MariaDB
  useEffect(() => {
    const fetchTLV2Data = async () => {
      try {
        setLoading(true);
        const data = await getTLV2StatusFromMariaDB();
        setTLV2Data(data);
        setError(null);
        setLastUpdated(new Date());

        // Actualizar los estados con los datos del PLC
        setCurrentPosition({
          x: data.x_actual,
          y: data.y_actual,
          z: data.z_actual
        });
        setCurrentAisle(data.pasillo_actual);
        setOperationMode(data.modo === 1 ? 'automatico' : 'manual');
        setOccupationStatus(data.ocupacion === 1 ? 'ocupado' : 'libre');
        setFaultStatus(data.averia === 1 ? 'averia' : 'ok');
      } catch (err) {
        console.error('Error al cargar datos de TLV2:', err);
        setError('Error al cargar datos del transelevador T2');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTLV2Data();
    
    // Configurar intervalo para actualizar los datos cada 5 segundos
    const intervalId = setInterval(fetchTLV2Data, 5000);
    
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
    
    // En una implementación real, aquí se enviaría la orden al PLC
    // Por ahora, simulamos el cambio de posición después de un tiempo
    setTimeout(() => {
      // Actualizar el pasillo actual
      setCurrentAisle(parseInt(targetAisle) || currentAisle);
      setOccupationStatus('libre');
    }, 3000);
  };
  
  // Función para actualizar manualmente los datos
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await getTLV2StatusFromMariaDB();
      setTLV2Data(data);
      setError(null);
      setLastUpdated(new Date());

      // Actualizar los estados con los datos del PLC
      setCurrentPosition({
        x: data.x_actual,
        y: data.y_actual,
        z: data.z_actual
      });
      setCurrentAisle(data.pasillo_actual);
      setOperationMode(data.modo === 1 ? 'automatico' : 'manual');
      setOccupationStatus(data.ocupacion === 1 ? 'ocupado' : 'libre');
      setFaultStatus(data.averia === 1 ? 'averia' : 'ok');
    } catch (err) {
      console.error('Error al cargar datos de TLV2:', err);
      setError('Error al cargar datos del transelevador T2');
    } finally {
      setLoading(false);
    }
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
            onClick={() => navigate('/transelevador/t2')}
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
            <h1 className="text-2xl font-semibold text-gray-800">Control Transelevador T2</h1>
            <p className="text-gray-600 mt-1">Panel de control y configuración para el transelevador T2</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tarjeta de Posición Actual */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Posición Actual</CardTitle>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefresh} 
                  disabled={loading}
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CustomSvgIcon 
                    name="T2" 
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
                    {lastUpdated && (
                      <div className="mt-3 text-xs text-gray-500 text-right">
                        Última actualización: {lastUpdated.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
                {error && (
                  <div className="mt-3 p-2 bg-red-50 text-red-600 rounded text-sm">
                    {error}
                  </div>
                )}
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
                      <p className="font-semibold">{tlv2Data?.matricula || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Estado fin orden</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{tlv2Data?.estadoFinOrden || 0}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Resultado fin orden</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{tlv2Data?.resultadoFinOrden || 0}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setOperationMode(operationMode === 'automatico' ? 'manual' : 'automatico')}
                    disabled={loading}
                  >
                    Cambiar a modo {operationMode === 'automatico' ? 'Manual' : 'Automático'}
                  </Button>
                  
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default ControlTLV2Page;
