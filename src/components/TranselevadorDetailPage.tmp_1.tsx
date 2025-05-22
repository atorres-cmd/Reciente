import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import SidebarOperator from "./SidebarOperator";
import HeaderOperator from "./HeaderOperator";

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
    descripcion: 'El transelevador T1 ha reportado un error en el posicionamiento vertical.',
    timestamp: '2025-05-03T13:05:23',
    tipo: 'error'
  },
  {
    id: 'alm-002',
    titulo: 'Mantenimiento preventivo',
    descripcion: 'Se requiere mantenimiento preventivo del sistema hidráulico.',
    timestamp: '2025-05-03T12:45:10',
    tipo: 'warning'
  },
  {
    id: 'alm-003',
    titulo: 'Ciclo completado',
    descripcion: 'El transelevador T1 ha completado el ciclo de almacenamiento #4532.',
    timestamp: '2025-05-03T12:30:45',
    tipo: 'success'
  },
  {
    id: 'alm-004',
    titulo: 'Actualización de firmware',
    descripcion: 'Nueva actualización de firmware disponible para el controlador.',
    timestamp: '2025-05-03T11:15:32',
    tipo: 'info'
  }
];

const TranselevadorDetailPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex bg-operator-gray-bg min-h-screen font-sans">
      <SidebarOperator />
      <div className="flex-1 flex flex-col">
        <HeaderOperator />
        <main className="flex-1 p-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Transelevador T1</h1>
              <p className="text-gray-600 mt-1">Monitor de estado y operaciones en tiempo real</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">Estado</Button>
              <Button variant="outline">Histórico</Button>
              <Button variant="outline">Mantenimiento</Button>
              <Button variant="outline">Configuración</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recuadro grande con el SVG del T1 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visualización del Transelevador T1</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center p-8">
                <svg 
                  width="300" 
                  height="300" 
                  viewBox="0 0 100 100" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-green-500"
                >
                  {/* Base del transelevador */}
                  <rect x="20" y="70" width="60" height="10" fill="currentColor" stroke="#000000" strokeWidth="1" />
                  
                  {/* Columna vertical */}
                  <rect x="45" y="20" width="10" height="50" fill="currentColor" stroke="#000000" strokeWidth="1" />
                  
                  {/* Horquillas */}
                  <rect x="55" y="40" width="25" height="5" fill="#555555" stroke="#000000" strokeWidth="1" />
                  <rect x="55" y="50" width="25" height="5" fill="#555555" stroke="#000000" strokeWidth="1" />
                  
                  {/* Ruedas */}
                  <circle cx="30" cy="80" r="5" fill="#333333" stroke="#000000" strokeWidth="1" />
                  <circle cx="70" cy="80" r="5" fill="#333333" stroke="#000000" strokeWidth="1" />
                  
                  {/* Cabina */}
                  <rect x="25" y="50" width="20" height="20" fill="#444444" stroke="#000000" strokeWidth="1" />
                  <rect x="30" y="55" width="10" height="10" fill="#88CCFF" stroke="#000000" strokeWidth="0.5" /> {/* Ventana */}
                </svg>
              </CardContent>
            </Card>

            {/* Tarjeta de información del transelevador */}
            <Card>
              <CardHeader>
                <CardTitle>Transelevador 1</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p>Estado: Active</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Coordenadas:</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <p className="text-blue-500 text-sm">Pasillo</p>
                      <p className="text-lg font-medium">5</p>
                    </div>
                    <div>
                      <p className="text-blue-500 text-sm">X</p>
                      <p className="text-lg font-medium">7</p>
                    </div>
                    <div>
                      <p className="text-blue-500 text-sm">Y</p>
                      <p className="text-lg font-medium">5</p>
                    </div>
                    <div>
                      <p className="text-blue-500 text-sm">Z</p>
                      <p className="text-lg font-medium">1</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  {alarmasEjemplo.map((alarma) => {
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">ID del Equipo</h3>
                        <p>TRANS-001</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Estado Actual</h3>
                        <p className="text-green-500 font-medium">Activo</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Posición</h3>
                        <p>Pasillo 5, X: 7, Y: 5, Z: 1</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Última Actividad</h3>
                        <p>Hace 5 minutos</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Ciclos Hoy</h3>
                        <p>127</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Eficiencia</h3>
                        <p>98.5%</p>
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
