import { FC, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { Forklift, Truck, Warehouse, Layers } from "lucide-react";
import CustomSvgIcon from "./CustomSvgIcon";
import { Link } from "react-router-dom";
import { TLV1StatusData, TLV2StatusData, PTStatusData } from "../services/api";

interface Alarm {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: Date;
  acknowledged: boolean;
}

interface AlarmsResponse {
  success: boolean;
  data: Alarm[];
  message?: string;
}
import AlarmPopup from "./AlarmPopup";

type ComponentStatus = "active" | "inactive" | "error" | "moving";

interface SiloComponent {
  id: string;
  name: string;
  type: "transelevador" | "transferidor" | "puente" | "elevador";
  status: ComponentStatus;
  position: {
    x: number;
    y: number;
    z?: number;
    pasillo?: number;
  };
}

interface SiloComponentVisualizationProps {
  components: SiloComponent[];
  getStatusColor: (status: ComponentStatus, componentType?: string) => string;
  onUpdatePosition: (id: string, newPosition: { x: number; y: number }) => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  tlv1Data?: TLV1StatusData | null;
  tlv2Data?: TLV2StatusData | null;
  ptData?: PTStatusData | null;
  tlv1Alarmas?: AlarmsResponse;
  showTLV1AlarmPopup?: boolean;
  setShowTLV1AlarmPopup?: (show: boolean) => void;
}

const PASILLOS = 13; // Aumentado a 13 para incluir el pasillo P13 para el Elevador
const ALTURAS = 60; // De 0 a 59, según la escala ajustada

const SiloComponentVisualization: FC<SiloComponentVisualizationProps> = ({
  components,
  getStatusColor,
  onUpdatePosition,
  pauseSimulation,
  resumeSimulation,
  tlv1Data,
  tlv2Data,
  ptData,
  tlv1Alarmas,
  showTLV1AlarmPopup,
  setShowTLV1AlarmPopup,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const getComponentIcon = (type: SiloComponent["type"], color: string, status?: ComponentStatus, componentId?: string) => {
    // Variables para los componentes animados
    let componentColor = color;
    let animationClass = "";
    let iconName = "";
    
    if (status) {
      // Aplicamos colores amarillos para CT, PT y EL, independientemente de su estado
      if (type === "puente" || type === "elevador" || type === "transferidor") {
        // Siempre usar amarillo para estos componentes
        componentColor = "text-yellow-500";
        
        // Mantener la animación para el estado "moving"
        animationClass = status === "moving" ? "animate-pulse" : "";
      }
    }
    
    switch (type) {
      case "transelevador":
        // Usar el componente CustomSvgIcon para el transelevador
        iconName = componentId === "trans1" ? "T1" : "T2";
        return (
          <div 
            className={`relative ${animationClass}`} 
            style={{ width: '60px', height: '60px' }}
            onClick={() => componentId === "trans1" ? window.location.href = '/tlv1' : window.location.href = '/tlv2'}
            onMouseEnter={() => componentId === "trans1" && tlv1Alarmas && tlv1Alarmas.data && tlv1Alarmas.data.length > 0 && setShowTLV1AlarmPopup && setShowTLV1AlarmPopup(true)}
            onMouseLeave={() => componentId === "trans1" && setShowTLV1AlarmPopup && setShowTLV1AlarmPopup(false)}
          >
            <div className="relative">
              <CustomSvgIcon 
                name={iconName}
                className={`${status === "moving" ? "animate-pulse" : ""}`}
                size={60}
                color={status === "error" ? "red" : undefined}
              />
              
              {/* Indicador de alarmas para TLV1 */}
              {componentId === "trans1" && tlv1Alarmas && tlv1Alarmas.data && tlv1Alarmas.data.length > 0 && (
                <span 
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse"
                  title={`${tlv1Alarmas.data.length} alarmas activas`}
                >
                  {tlv1Alarmas.data.length}
                </span>
              )}
              
              {/* Ventana emergente de alarmas para TLV1 */}
              {componentId === "trans1" && showTLV1AlarmPopup && tlv1Alarmas && tlv1Alarmas.data && tlv1Alarmas.data.length > 0 && (
                <AlarmPopup 
                  alarms={tlv1Alarmas.data} 
                  position="top" 
                  maxAlarms={3} 
                  onClose={() => setShowTLV1AlarmPopup && setShowTLV1AlarmPopup(false)}
                />
              )}
            </div>
          </div>
        );
      case "transferidor":
        return (
          <div className={`relative ${componentColor} ${animationClass}`} style={{ width: '30px', height: '30px' }}>
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
        );
      case "elevador":
        return (
          <div 
            className={`relative ${componentColor} ${animationClass} cursor-pointer hover:scale-110 transition-transform`} 
            style={{ width: '30px', height: '30px' }}
            onClick={() => window.location.href = '/elevador'}
          >
            <svg 
              width="30" 
              height="30" 
              viewBox="0 0 100 100" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Estructura principal del elevador */}
              <rect x="30" y="10" width="40" height="80" fill="currentColor" stroke="#000000" strokeWidth="1" />
              
              {/* Plataforma elevadora */}
              <rect x="20" y="60" width="60" height="10" fill="currentColor" stroke="#000000" strokeWidth="1" />
              
              {/* Cables de elevación */}
              <line x1="35" y1="10" x2="35" y2="60" stroke="#333333" strokeWidth="2" />
              <line x1="65" y1="10" x2="65" y2="60" stroke="#333333" strokeWidth="2" />
              
              {/* Detalles de la estructura */}
              <rect x="25" y="10" width="50" height="5" fill="#555555" stroke="#000000" strokeWidth="1" />
              <rect x="25" y="85" width="50" height="5" fill="#555555" stroke="#000000" strokeWidth="1" />
              
              {/* Ventanas/indicadores */}
              <rect x="40" y="20" width="20" height="5" fill="#88CCFF" stroke="#000000" strokeWidth="0.5" />
              <rect x="40" y="30" width="20" height="5" fill="#88CCFF" stroke="#000000" strokeWidth="0.5" />
              <rect x="40" y="40" width="20" height="5" fill="#88CCFF" stroke="#000000" strokeWidth="0.5" />
            </svg>
          </div>
        );
      case "puente":
        return (
          <div 
            className={`relative ${componentColor} ${animationClass}`} 
            style={{ width: '30px', height: '30px' }}
          >
            <svg 
              width="30" 
              height="30" 
              viewBox="0 0 100 70" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Vigas horizontales principales */}
              <rect x="5" y="15" width="90" height="10" fill="currentColor" stroke="#000000" strokeWidth="1" />
              <rect x="5" y="45" width="90" height="10" fill="currentColor" stroke="#000000" strokeWidth="1" />
              
              {/* Soportes verticales */}
              <rect x="15" y="25" width="5" height="20" fill="#333333" stroke="#000000" strokeWidth="1" />
              <rect x="80" y="25" width="5" height="20" fill="#333333" stroke="#000000" strokeWidth="1" />
              
              {/* Vigas cruzadas */}
              <line x1="15" y1="25" x2="25" y2="45" stroke="currentColor" strokeWidth="3" />
              <line x1="80" y1="25" x2="70" y2="45" stroke="currentColor" strokeWidth="3" />
              
              {/* Detalles adicionales */}
              <rect x="10" y="10" width="15" height="5" fill="currentColor" stroke="#000000" strokeWidth="1" />
              <rect x="75" y="10" width="15" height="5" fill="currentColor" stroke="#000000" strokeWidth="1" />
              <rect x="10" y="55" width="15" height="5" fill="currentColor" stroke="#000000" strokeWidth="1" />
              <rect x="75" y="55" width="15" height="5" fill="currentColor" stroke="#000000" strokeWidth="1" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getAbsolutePosition = (component: SiloComponent) => {
    if (component.type === "transelevador") {
      
      // Comportamiento normal para otras posiciones
      // Obtener el pasillo (P1-P12) que corresponde al valor Y en los datos de MariaDB
      // Los pasillos van de 1 a 12
      const pasillo = Math.min(12, Math.max(1, component.position.y));
      
      // Calcular la posición horizontal (left) basada en el pasillo
      // Cada pasillo ocupa 100/PASILLOS % del ancho total
      const xPerc = ((pasillo - 0.5) * (100 / PASILLOS));
      
      // La coordenada X en los datos de MariaDB va de 0 (abajo) a 59 (arriba)
      // Necesitamos invertir la escala para que coincida con la visualización
      const MAX_ALTURA = 60;
      
      // Asegurarse de que la altura esté dentro del rango válido
      const altura = Math.min(MAX_ALTURA, Math.max(0, component.position.x));
      
      // Calcular la posición vertical (top)
      // El espacio vertical útil es del 65% (entre el 10% superior y el 25% inferior)
      // 0 comienza bastante más arriba de las etiquetas de los pasillos (75%)
      // 59 está cerca de la parte superior (10%)
      const yPerc = 75 - (altura * (65 / MAX_ALTURA));
      
      return {
        left: `${xPerc}%`,
        top: `${yPerc}%`,
      };
    }
    if (component.type === "transferidor") {
      // El carro transferidor se muestra en su propia fila dedicada
      // y se mueve horizontalmente según el pasillo (x)
      const xPerc = ((component.position.x - 0.5) * (100 / PASILLOS));
      return {
        left: `${xPerc}%`,
        top: `95%`,  // Posicionado en la parte inferior, justo encima de las etiquetas
        transform: `translateY(-50%)`,  // Ajuste para centrado perfecto
        zIndex: 20,  // Mayor z-index para asegurar visibilidad
        width: "auto", // Ancho automático para evitar líneas verticales
        height: "auto", // Alto automático para evitar líneas verticales
      };
    }
    if (component.type === "elevador") {
      // Si está en modo externo (fuera del grid)
      if (component.position.x === -1) {
        return {
          left: `115%`,  // Posicionado más a la derecha para mayor visibilidad
          top: `50%`,    // Centrado verticalmente
        };
      }
      // Posicionarlo en la parte superior de la columna P13 (donde está marcado en rojo)
      const pasilloIndex = PASILLOS - 1; // Índice del pasillo P13 (0-indexed)
      const xPerc = ((pasilloIndex + 0.5) * (100 / PASILLOS));
      
      return {
        left: `${xPerc}%`,     // Centrado en el pasillo EL1
        top: `82%`,           // Posicionado en un punto intermedio
        transform: 'translate(-50%, -50%)', // Centrar horizontal y verticalmente
        zIndex: 20,           // Asegurar que esté por encima de otros elementos
      };
    }
    if (component.type === "puente") {
      // El puente siempre está en la posición x = 0 (parte superior)
      // y se mueve horizontalmente según el pasillo (y)
      // Si la posición es 0, significa que está en movimiento y lo colocamos en el pasillo 1
      const pasillo = component.position.y === 0 ? 1 : component.position.y;
      const xPerc = ((pasillo - 0.5) * (100 / PASILLOS));
      console.log(`Visualizando Puente: Posición=${component.position.y}, Pasillo visualizado=${pasillo}, xPerc=${xPerc}%`);
      return {
        left: `${xPerc}%`,
        top: `3%`, // Ajustado para estar más arriba y ser más visible
        transform: 'translate(-50%, -20%)', // Centrar horizontalmente y ajustar verticalmente
        zIndex: 30,
      };
    }
    return {
      left: `50%`, top: `50%`,
    };
  };

  const getGridFromPos = (
    absX: number,
    absY: number,
    type: SiloComponent["type"]
  ): { x: number; y: number } => {
    if (!containerRef.current) return { x: 1, y: 1 };

    const rect = containerRef.current.getBoundingClientRect();
    const relX = absX - rect.left;
    const relY = absY - rect.top;

    if (type === "transelevador") {
      const pasillo = Math.round(relX / rect.width * PASILLOS + 0.5);
      let altura = Math.round((rect.height - relY) / rect.height * ALTURAS);
      altura = Math.max(1, Math.min(ALTURAS, altura));
      return {
        x: altura,
        y: Math.max(1, Math.min(PASILLOS, pasillo)),
      };
    }
    let xStanding = Math.round(relX / rect.width * PASILLOS + 0.5);
    xStanding = Math.max(1, Math.min(PASILLOS, xStanding));
    const yStanding = type === "puente"
      ? 1
      : PASILLOS;
    return {
      x: xStanding,
      y: yStanding,
    };
  };

  const handleDragStart = (e: React.DragEvent, comp: SiloComponent) => {
    setDraggingId(comp.id);
    pauseSimulation();
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: React.DragEvent, comp: SiloComponent) => {
    setDraggingId(null);
    resumeSimulation();
    if (!containerRef.current) return;
    const newPos = getGridFromPos(e.clientX, e.clientY, comp.type);
    onUpdatePosition(comp.id, newPos);
  };

  return (
    <div
      className="relative h-[500px] border border-operator-border rounded-lg bg-slate-50 overflow-visible"
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0 z-0 flex flex-col">
        {/* Área principal del silo con pasillos */}
        <div className="flex-1 flex">
          {Array.from({ length: PASILLOS }).map((_, idx) => (
            <div
              key={`pasillo-${idx + 1}`}
              className="flex-1 border-r last:border-r-0 border-dashed border-blue-200 flex flex-col items-center relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white opacity-30" />
              <div className="absolute left-0 right-0 bottom-0 top-0 flex flex-col pointer-events-none">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="border-t border-dotted border-slate-300 flex-1"></div>
                ))}
              </div>
              {/* Etiquetas de pasillo eliminadas para evitar duplicación */}
            </div>
          ))}
        </div>
        
        {/* Área reservada para el carro transferidor por debajo de los pasillos */}
        <div className="h-8 flex relative border-t border-blue-200">
          {Array.from({ length: PASILLOS }).map((_, idx) => (
            <div key={`carril-${idx + 1}`} className="flex-1 border-r last:border-r-0 border-dashed border-blue-200"></div>
          ))}
        </div>
      </div>
      {components.map((component) => {
        // Si es un transelevador en posición x=60, no lo mostramos
        if (component.type === "transelevador" && component.position.x === 60) {
          return null;
        }
        
        // Usar la función getStatusColor pasando el tipo de componente
        const color = getStatusColor(component.status, component.type);

        // Usar color amarillo para CT, PT y EL
        const statusColor = 
          component.type === "transferidor" || component.type === "puente" || component.type === "elevador"
            ? "bg-yellow-500" + (component.status === "moving" ? " animate-pulse" : "")
            : component.status === "error"
              ? "bg-red-500"
              : component.status === "active"
                ? "bg-green-500"
                : component.status === "moving"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-gray-400";

        const absolutePosition = getAbsolutePosition(component);

        // Identificar componentes externos
        // Ya no hay componentes externos, todos están dentro del recuadro
        const isExternalComponent = false;
        return (
          <Tooltip key={component.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute cursor-pointer hover:scale-110 transition-transform"
                style={{
                  left: absolutePosition.left,
                  top: absolutePosition.top,
                  transform: absolutePosition.transform || "translate(-50%, -50%)",
                  zIndex: component.type === "puente" || component.type === "transferidor" ? 30 : 10,
                  height: component.type === "puente" ? "22px" : "auto"
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, component)}
                onDragEnd={(e) => handleDragEnd(e, component)}
                title="Arrastra para mover"
              >
                <div className="relative">
                  {getComponentIcon(component.type, color, component.status, component.id)}
                  <span
                    className={
                      `absolute -top-2 -right-3 w-3 h-3 rounded-full border border-white shadow-sm ${statusColor}`
                    }
                  />
                  
                  {/* Mostrar etiquetas para transelevadores a la izquierda del icono */}
                  {component.type === "transelevador" && (
                    <Link 
                      to={component.id === "trans1" ? "/transelevador/t1" : "/transelevador/t2"}
                      className="no-underline absolute"
                      style={{ left: '-15px', top: '50%', transform: 'translateY(-50%)' }}
                    >
                      <span className="text-xs font-semibold text-gray-700 bg-white/80 rounded px-1 shadow-sm hover:bg-gray-200 cursor-pointer">
                        {component.id === "trans1" ? "T1" : "T2"}
                      </span>
                    </Link>
                  )}
                </div>
                
                {/* Mostrar etiquetas para carro transferidor, puente y elevador debajo */}
                {(component.type === "transferidor" || component.type === "puente" || component.type === "elevador") && (
                  <Link 
                    to={
                      component.id === "puente" ? "/puente" :
                      component.id === "transferidor" ? "/ct" :
                      component.id === "elevador" ? "/elevador" :
                      "#"
                    } 
                    className="no-underline"
                  >
                    <span className="text-xs font-semibold text-gray-700 bg-white/80 rounded px-1 mt-1 shadow-sm hover:bg-gray-200 cursor-pointer">
                      {component.type === "transferidor"
                        ? "CT"
                        : component.type === "elevador"
                        ? "EL"
                        : "PT"}
                    </span>
                  </Link>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <div className="font-semibold">{component.name}</div>
                <div>
                  Estado:{" "}
                  <span className="capitalize">
                    {component.status}
                  </span>
                </div>
                {component.type === "transelevador" && (
                  <div className="space-y-1 mt-1">
                    <div>Pasillo: <span className="font-mono">
                      {component.id === "trans1" && tlv1Data 
                        ? tlv1Data.pasillo_actual 
                        : component.id === "trans2" && tlv2Data 
                          ? tlv2Data.pasillo_actual 
                          : component.position.y}
                    </span></div>
                    <div>X: <span className="font-mono">
                      {component.id === "trans1" && tlv1Data 
                        ? tlv1Data.x_actual 
                        : component.id === "trans2" && tlv2Data 
                          ? tlv2Data.x_actual 
                          : component.position.x}
                    </span></div>
                    <div>Y: <span className="font-mono">
                      {component.id === "trans1" && tlv1Data 
                        ? tlv1Data.y_actual 
                        : component.id === "trans2" && tlv2Data 
                          ? tlv2Data.y_actual 
                          : component.position.y}
                    </span></div>
                    <div>Z: <span className="font-mono">
                      {component.id === "trans1" && tlv1Data 
                        ? tlv1Data.z_actual 
                        : component.id === "trans2" && tlv2Data 
                          ? tlv2Data.z_actual 
                          : component.position.z}
                    </span></div>
                  </div>
                )}
                {component.type === "puente" && ptData && (
                  <div className="space-y-1 mt-1">
                    <div>Estado: <span className="font-mono">{ptData.estado}</span></div>
                    <div>Ocupación: <span className="font-mono">{ptData.ocupacion}</span></div>
                    <div>Situación: <span className="font-mono">{ptData.situacion}</span></div>
                    <div>Posición: <span className="font-mono">{ptData.posicion}</span></div>
                  </div>
                )}
                {component.type !== "transelevador" && component.type !== "puente" && (
                  <div className="space-y-1 mt-1">
                    <div>X: <span className="font-mono">{component.position.x}</span></div>
                    <div>Y: <span className="font-mono">{component.position.y}</span></div>
                    {"pasillo" in component.position && component.position.pasillo && (
                      <div>Pasillo: <span className="font-mono">{component.position.pasillo}</span></div>
                    )}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
      {/* Borde del contenedor */}
      <div className="absolute inset-0 border border-gray-200 rounded-lg pointer-events-none z-[1]" />
    </div>
  );
};

export default SiloComponentVisualization;
