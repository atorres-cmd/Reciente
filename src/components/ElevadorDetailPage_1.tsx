import React, { useState } from 'react';
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
    descripcion: 'El elevador ha reportado un error en el posicionamiento vertical.',
    timestamp: '2025-05-03T14:35:23',
    tipo: 'error'
  },
  {
    id: 'alm-002',
    titulo: 'Mantenimiento preventivo',
    descripcion: 'Se requiere mantenimiento preventivo del sistema de elevación.',
    timestamp: '2025-05-03T13:50:10',
    tipo: 'warning'
  },
  {
    id: 'alm-003',
    titulo: 'Ciclo completado',
    descripcion: 'El elevador ha completado el ciclo de elevación #1245.',
    timestamp: '2025-05-03T13:15:45',
    tipo: 'success'
  },
  {
    id: 'alm-004',
    titulo: 'Actualización de firmware',
    descripcion: 'Nueva actualización de firmware disponible para el controlador del elevador.',
    timestamp: '2025-05-03T12:40:32',
    tipo: 'info'
  }
];

const ElevadorDetailPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const navigate = useNavigate();

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
            <h1 className="text-2xl font-semibold text-gray-800">Elevador</h1>
            <p className="text-gray-600 mt-1">Monitor de estado y operaciones en tiempo real</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recuadro grande con el SVG del Elevador */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visualización del Elevador</CardTitle>
              </CardHeader>
              <CardContent className="p-4 overflow-hidden">
                <div className="flex">
                  <div className="relative flex-1 h-[500px] flex justify-center">
                    {/* Sensores - Círculos indicadores */}
                    {/* Sensor superior */}
                    <div className="absolute top-[150px] left-[200px] w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md z-10"></div>
                    
                    {/* Sensor inferior */}
                    <div className="absolute top-[350px] left-[200px] w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md z-10"></div>
                    
                    {/* Imagen del elevador */}
                    <img 
                      src="/icons/ELT.svg" 
                      alt="Elevador detallado" 
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
                          <span className="text-gray-600">Nivel actual:</span>
                          <span className="font-medium">2</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Nivel origen:</span>
                          <span className="font-medium">1</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Nivel destino:</span>
                          <span className="font-medium">3</span>
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
                          <span className="text-gray-600">Velocidad:</span>
                          <span className="font-medium">0.8 m/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Carga:</span>
                          <span className="font-medium">Sí</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dirección:</span>
                          <span className="font-medium">Subiendo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recuadro de Alarmas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Alarmas</CardTitle>
                <Button variant="outline" size="sm">Ver todas</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alarmasEjemplo.map(alarma => {
                    let bgColor = 'bg-white border-gray-200';
                    if (alarma.tipo === 'error') bgColor = 'bg-red-50 border-red-200';
                    else if (alarma.tipo === 'warning') bgColor = 'bg-yellow-50 border-yellow-200';
                    else if (alarma.tipo === 'info') bgColor = 'bg-blue-50 border-blue-200';
                    else if (alarma.tipo === 'success') bgColor = 'bg-green-50 border-green-200';
                    
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
                        <p>EL-001</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Estado Actual</h3>
                        <p className="text-green-500 font-medium">Activo</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Posición</h3>
                        <p>Nivel 2</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Última Actividad</h3>
                        <p>Hace 3 minutos</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Ciclos Hoy</h3>
                        <p>58</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Eficiencia</h3>
                        <p>98.2%</p>
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
                    <p>Aquí se mostrarían gráficos y estadísticas de operación del elevador.</p>
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

export default ElevadorDetailPage;
