import { useState, useEffect, useRef } from "react";
import { Truck } from "lucide-react";
import SiloComponentInfoGroup from "./SiloComponentInfoGroup";
import SiloComponentLegend from "./SiloComponentLegend";
import SiloComponentVisualization from "./SiloComponentVisualization";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useNavigate } from "react-router-dom";
import { getTLV1StatusFromMariaDB, getTLV2StatusFromMariaDB, TLV1StatusData, TLV2StatusData } from '../services/api';

// Tipos para los componentes del silo
type ComponentStatus = "active" | "inactive" | "error" | "moving";

interface SiloComponent {
  id: string;
  name: string;
  type: "transelevador" | "transferidor" | "puente" | "elevador";
  status: ComponentStatus;
  position: {
    x: number;           // Altura (1 a 59 para traslo)
    y: number;           // Pasillo (1 a 12 para traslo)
    z?: number;          // Palas (1 o 2 solo para traslo)
    pasillo?: number;    // solo transferidor
  };
}

const SILO_PASILLOS = 13; // Aumentado a 13 para incluir el pasillo P13 para el Elevador
const SILO_ALTURAS = 60; // De 0 a 59
const Z_MIN = 1;
const Z_MAX = 2;

// Definición de los pasillos para las etiquetas
const pasillos = Array.from({ length: SILO_PASILLOS - 1 }, (_, i) => `P${i + 1}`).concat(['EL1']);

const SILO_LEGENDS = [
  { color: "bg-green-500", label: "Activo" },
  { color: "bg-blue-500", label: "En movimiento" },
  { color: "bg-gray-400", label: "Inactivo" },
  { color: "bg-red-500", label: "Error" },
];

const SiloVisualization = () => {
  const navigate = useNavigate();
  // Estado para almacenar los datos de los transelevadores
  const [tlv1Data, setTLV1Data] = useState<TLV1StatusData | null>(null);
  const [tlv2Data, setTLV2Data] = useState<TLV2StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de TLV1 y TLV2 desde MariaDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener datos de TLV1 y TLV2 en paralelo
        const [tlv1Result, tlv2Result] = await Promise.all([
          getTLV1StatusFromMariaDB(),
          getTLV2StatusFromMariaDB()
        ]);
        
        setTLV1Data(tlv1Result);
        setTLV2Data(tlv2Result);
        setError(null);

        // Procesar los datos de los transelevadores
        
        // Actualizar la posición de ambos transelevadores con los datos de MariaDB
        setComponents(prev => prev.map(comp => {
          if (comp.id === "trans1" && tlv1Result) {
            // Limitar los valores a rangos válidos para T1
            const pasillo = Math.max(1, Math.min(12, tlv1Result.pasillo_actual));
            const altura = Math.max(0, Math.min(50, tlv1Result.x_actual)); // Limitamos a 50 como máximo
            const pala = Math.max(1, Math.min(2, tlv1Result.z_actual));
            
            return {
              ...comp,
              status: tlv1Result.averia === 1 ? "error" : (tlv1Result.ocupacion === 1 ? "moving" : "active"),
              position: {
                y: pasillo,
                x: altura,
                z: pala
              }
            };
          } else if (comp.id === "trans2" && tlv2Result) {
            // Limitar los valores a rangos válidos para T2
            const pasillo = Math.max(1, Math.min(12, tlv2Result.pasillo_actual));
            const altura = Math.max(0, Math.min(50, tlv2Result.x_actual)); // Limitamos a 50 como máximo
            const pala = Math.max(1, Math.min(2, tlv2Result.z_actual));
            
            return {
              ...comp,
              status: tlv2Result.averia === 1 ? "error" : (tlv2Result.ocupacion === 1 ? "moving" : "active"),
              position: {
                y: pasillo,
                x: altura,
                z: pala
              }
            };
          }
          return comp;
        }));
      } catch (err) {
        console.error('Error al cargar datos de los transelevadores:', err);
        setError('Error al cargar datos de los transelevadores');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Configurar intervalo para actualizar los datos cada 5 segundos
    const intervalId = setInterval(fetchData, 5000);
    
    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  const [components, setComponents] = useState<SiloComponent[]>([
    {
      id: "trans1",
      name: "Transelevador 1",
      type: "transelevador",
      status: "active",
      position: { y: 5, x: 7, z: 1 }, // x entre 0 y 50, y entre 1 y 12 (pasillo 5)
    },
    {
      id: "trans2",
      name: "Transelevador 2",
      type: "transelevador",
      status: "active",
      position: { y: 4, x: 59, z: 2 }, // Posicionado en la cota 59 (la más alta) en el pasillo 4
    },
    {
      id: "transferidor",
      name: "Carro Transferidor",
      type: "transferidor",
      status: "active",
      position: { x: 6, y: 0 }, // Posicionado en el pasillo 6
    },
    {
      id: "puente",
      name: "Puente",
      type: "puente",
      status: "active",
      position: { x: 0, y: 1 }, // x siempre es 0 (parte superior), y es el pasillo (1-13)
    },
    {
      id: "elevador",
      name: "Elevador",
      type: "elevador",
      status: "active",
      position: { x: 0, y: 13 }, // Posicionado encima del pasillo P13
    },
  ]);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // Simulación de cambios de estado (pausable) - Solo para componentes que no son el Transelevador 1
  useEffect(() => {
    if (simulationPaused) {
      if (simulationRef.current) clearInterval(simulationRef.current);
      return;
    }
    simulationRef.current = setInterval(() => {
      setComponents((prev) =>
        prev.map((comp) => {
          // No simulamos el Transelevador 1, ya que sus datos vienen de MariaDB
          if (comp.id === "trans1") {
            return comp;
          }
          
          // Transelevador 2 puede moverse en x, y, z
          if (comp.type === "transelevador" && comp.id === "trans2") {
            const newPos = { ...comp.position };
            let updated = false;

            // Simular cambio en pasillo (Y: 1 a 12)
            if (Math.random() > 0.85) {
              newPos.y = Math.max(
                1,
                Math.min(
                  12, // Limitamos a 12 pasillos como máximo
                  newPos.y + (Math.random() > 0.5 ? 1 : -1)
                )
              );
              updated = true;
            }
            // Simular cambio en altura (X: 0 a 60)
            if (Math.random() > 0.85) {
              newPos.x = Math.max(
                0,
                Math.min(
                  60, // Permitimos hasta 60 para que pueda posicionarse en el PT
                  newPos.x + (Math.random() > 0.5 ? 1 : -1)
                )
              );
              updated = true;
            }
            // Simular movimiento de las palas Z (1 o 2)
            if (Math.random() > 0.93) {
              newPos.z = newPos.z === Z_MIN ? Z_MAX : Z_MIN;
              updated = true;
            }

            // Si hubo movimiento, poner status a "moving"
            if (updated) {
              return { ...comp, status: "moving", position: newPos };
            }
            // Si estaba en movimiento, volver a activo
            if (comp.status === "moving" && Math.random() > 0.6) {
              return { ...comp, status: "active" };
            }
            return comp;
          }
          // Carro transferidor sigue igual que antes
          if (comp.type === "transferidor" && Math.random() > 0.8) {
            const newX = Math.max(
              1,
              Math.min(12, comp.position.x + (Math.random() > 0.5 ? 1 : -1))
            );
            return {
              ...comp,
              status: "moving",
              position: { ...comp.position, x: newX },
            };
          }
          
          // Puente se mueve horizontalmente entre pasillos
          if (comp.type === "puente" && Math.random() > 0.8) {
            const newY = Math.max(
              1,
              Math.min(SILO_PASILLOS, comp.position.y + (Math.random() > 0.5 ? 1 : -1))
            );
            return {
              ...comp,
              status: "moving",
              position: { ...comp.position, y: newY },
            };
          }
          // Restaurar estado después de movimiento
          if (comp.status === "moving" && Math.random() > 0.7) {
            return { ...comp, status: "active" };
          }
          return comp;
        })
      );
    }, 3000);

    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [simulationPaused]);

  // Función para determinar el color del componente según su estado
  const getStatusColor = (status: ComponentStatus, componentType?: string) => {
    // Si el componente es CT, PT o EL, siempre devolver amarillo
    if (componentType === "transferidor" || componentType === "puente" || componentType === "elevador") {
      return "text-yellow-500";
    }
    
    // Para otros componentes, usar los colores según el estado
    switch (status) {
      case "active":
        return "text-green-500";
      case "inactive":
        return "text-gray-400";
      case "error":
        return "text-red-500";
      case "moving":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };
  
  // Función para determinar el color de fondo del transportador según su estado
  const getTransportadorStatusColor = (pasillo: string, index: number) => {
    // Usamos una combinación de pasillo e índice para generar un estado pseudo-aleatorio pero consistente
    const pasilloNum = parseInt(pasillo.substring(1));
    const seed = pasilloNum * 10 + index;
    
    // Distribuimos los estados: 60% OK (verde), 30% lleno (azul), 10% error (rojo)
    const rand = (seed * 13) % 100;
    
    if (rand < 10) {
      return "bg-red-500"; // Error
    } else if (rand < 40) {
      return "bg-blue-500"; // Lleno
    } else {
      return "bg-green-500"; // OK
    }
  };
  
  // Función para obtener el texto descriptivo del estado del transportador
  const getTransportadorStatusText = (pasillo: string, index: number) => {
    const color = getTransportadorStatusColor(pasillo, index);
    
    if (color === "bg-red-500") {
      return "Error - Transportador no disponible";
    } else if (color === "bg-blue-500") {
      return "Lleno - Transportador a máxima capacidad";
    } else {
      return "OK - Transportador operativo";
    }
  };

  // Permite actualizar la posición arrastrando el componente
  const handleUpdatePosition = (id: string, newPosition: { x: number; y: number; }) => {
    setComponents((prev) =>
      prev.map((comp) =>
        comp.id === id
          ? {
              ...comp,
              position: {
                ...comp.position,
                x: newPosition.x,
                y: newPosition.y,
              },
              status: "active", // Cambiado manualmente pasa a activo
            }
          : comp
      )
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-operator p-4 my-8">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        Estado del Silo
      </h2>
      <div className="relative">
        {/* Contenedor principal con todos los componentes */}
        <div className="relative border border-operator-border rounded-md overflow-hidden" style={{ height: "500px" }}>
          {/* Visualización de transelevadores, puente y elevador */}
          <SiloComponentVisualization
            components={components.filter(c => c.type !== "transferidor")}
            getStatusColor={getStatusColor}
            onUpdatePosition={handleUpdatePosition}
            pauseSimulation={() => setSimulationPaused(true)}
            resumeSimulation={() => setSimulationPaused(false)}
          />
          
          {/* Área inferior con etiquetas de pasillos, transportadores y carro transferidor */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col">
            {/* Etiquetas de los pasillos (primera fila) */}
            <div className="h-6 flex border-t border-operator-border">
              {pasillos.map((pasillo) => (
                <div
                  key={`pasillo-${pasillo}`}
                  className="flex-1 flex items-center justify-center text-xs font-medium text-operator-blue"
                >
                  {pasillo}
                </div>
              ))}
            </div>
            
            {/* Transportadores - 2 por pasillo (segunda fila) */}
            <div className="h-6 flex justify-between px-2 border-t border-operator-border">
              {pasillos.map((pasillo) => (
                <div key={`transportadores-${pasillo}`} className="flex-1 flex items-center justify-center relative">
                  {pasillo !== "EL1" && (
                    <div className="flex space-x-2">
                      {/* Primer transportador - numerado secuencialmente desde 37 */}
                      <div 
                        className={`w-3 h-3 rounded-full flex items-center justify-center ${getTransportadorStatusColor(pasillo, 1)}`}
                        title={getTransportadorStatusText(pasillo, 1)}
                      >
                        <span className="text-[5px] font-bold text-white">{37 + (parseInt(pasillo.substring(1)) - 1) * 2}</span>
                      </div>
                      {/* Segundo transportador - numerado secuencialmente desde 38 */}
                      <div 
                        className={`w-3 h-3 rounded-full flex items-center justify-center ${getTransportadorStatusColor(pasillo, 2)}`}
                        title={getTransportadorStatusText(pasillo, 2)}
                      >
                        <span className="text-[5px] font-bold text-white">{38 + (parseInt(pasillo.substring(1)) - 1) * 2}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Espacio para el carro transferidor (tercera fila) */}
            <div className="h-10 border-t border-gray-200 relative overflow-visible">
              {/* Usamos exactamente la misma fórmula que en SiloComponentVisualization.tsx para el CT */}
              {components
                .filter(c => c.type === "transferidor")
                .map(component => {
                  // Ajustamos manualmente con un desplazamiento adicional hacia la izquierda
                  // Aumentamos el desplazamiento de -1.5 a -2.5 para centrar mejor
                  const xPerc = ((component.position.x - 0.5) * (100 / SILO_PASILLOS)) - 2.5;
                  const statusColor = getStatusColor(component.status, component.type);
                  
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="absolute cursor-pointer hover:scale-110 transition-transform" 
                          style={{ 
                            position: 'absolute', 
                            left: `${xPerc}%`, 
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 20
                          }}
                          onClick={() => navigate('/ct')}
                        >
                          <div className="relative">
                            <div className={`relative ${statusColor}`} style={{ width: '30px', height: '30px' }}>
                              <svg 
                                width="30" 
                                height="30" 
                                viewBox="0 0 100 70" 
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-full h-full"
                              >
                                {/* Plataforma principal */}
                                <rect x="5" y="25" width="90" height="20" fill="currentColor" stroke="#000000" strokeWidth="1" />
                                
                                {/* Ruedas */}
                                <circle cx="20" cy="50" r="8" fill="#333333" stroke="#000000" strokeWidth="1" />
                                <circle cx="80" cy="50" r="8" fill="#333333" stroke="#000000" strokeWidth="1" />
                                
                                {/* Detalles de la plataforma */}
                                <rect x="15" y="20" width="70" height="5" fill="currentColor" stroke="#000000" strokeWidth="1" />
                                <rect x="15" y="45" width="70" height="5" fill="currentColor" stroke="#000000" strokeWidth="1" />
                                
                                {/* Cabina de control */}
                                <rect x="65" y="15" width="20" height="10" fill="#555555" stroke="#000000" strokeWidth="1" />
                                <rect x="70" y="17" width="10" height="6" fill="#88CCFF" stroke="#000000" strokeWidth="0.5" /> {/* Ventana */}
                              </svg>
                            </div>
                            <span className="absolute -top-2 -right-3 w-3 h-3 rounded-full border border-white shadow-sm bg-green-500" />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 bg-white/80 rounded px-1 mt-1 shadow-sm hover:bg-gray-200">CT</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div>
                          <div className="font-semibold">Carro Transferidor</div>
                          <div>
                            Estado: <span className="capitalize">{component.status}</span>
                          </div>
                          <div className="space-y-1 mt-1">
                            <div>Posición: Pasillo {component.position.x}</div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
            </div>
            
            {/* Línea adicional por debajo del carro transferidor con transportador especial en pasillo 4 */}
            <div className="h-8 border-t border-gray-200 relative flex">
              {pasillos.map((pasillo, idx) => (
                <div 
                  key={`linea-adicional-${pasillo}`} 
                  className="flex-1 flex items-center justify-center relative"
                >
                  {pasillo === "P4" && (
                    <div className="flex space-x-2">
                      {/* Transportador especial para el pasillo 4 con número 26 */}
                      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-white border-2 border-purple-500">
                        <span className="text-[6px] font-bold">26</span>
                      </div>
                    </div>
                  )}
                  {pasillo === "P9" && (
                    <div className="flex space-x-2">
                      {/* Transportador especial para el pasillo 9 con número 36 */}
                      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-white border-2 border-purple-500">
                        <span className="text-[6px] font-bold">36</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Etiqueta de Interior del Silo eliminada */}
      </div>
      <div className="mt-4">
        <SiloComponentLegend legends={SILO_LEGENDS} />
      </div>
      <div className="mt-6">
        <SiloComponentInfoGroup
          components={components}
          getStatusColor={getStatusColor}
          tlv1Data={tlv1Data}
        />
      </div>
    </div>
  );
};

export default SiloVisualization;
