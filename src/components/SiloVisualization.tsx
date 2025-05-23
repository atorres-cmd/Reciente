import { useState, useEffect, useRef } from 'react';
import { Truck } from "lucide-react";
import SiloComponentInfoGroup from "./SiloComponentInfoGroup";
import SiloComponentLegend from "./SiloComponentLegend";
import SiloComponentVisualization from "./SiloComponentVisualization";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { fetchCTActiveAlarms, syncCTAlarms } from '../services/ctAlarmsDirectService';
import AlarmPopup from './AlarmPopup';
import { useNavigate } from "react-router-dom";
import { TLV1StatusData, TLV2StatusData, PTStatusData } from '../services/api';
import { getTLV1StatusFromMariaDB } from '../services/tlv1StatusApi';
import { getTLV2StatusFromMariaDB } from '../services/tlv2StatusApi';
import { getPTStatusDirectFromNodeRED } from '../services/ptStatusApi';
import { getCTStatusFromMariaDB, CTStatusData } from "../services/ctStatusApi";
import { getMesasEntradaStatusFromMariaDB, MesasEntradaStatusData } from '../services/mesasEntradaApi';
import { getMesasSalidaStatusFromMariaDB, MesasSalidaStatusData } from '../services/mesasSalidaApi';
import { getPSPsStatusFromNodeRED } from '../services/pspsStatusApi';
import { MARIADB_API_URL } from '../services/api';
import axios from 'axios';

// Interfaz para las alarmas del TLV1
interface TLV1AlarmasResponse {
  success: boolean;
  data: any[];
}

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

const SILO_PASILLOS = 13; // Aumentado a 13 para incluir el pasillo P13 para el Elevador
const SILO_ALTURAS = 60; // De 0 a 59
const Z_MIN = 1;
const Z_MAX = 2;

// Definición de los pasillos para las etiquetas
const pasillos = Array.from({ length: SILO_PASILLOS - 1 }, (_, i) => `P${i + 1}`).concat(['PEE']);

const SILO_LEGENDS = [
  { color: "bg-green-500", label: "Activo / Mesa Libre" },
  { color: "bg-blue-500", label: "En movimiento / Mesa Ocupada" },
  { color: "bg-gray-400", label: "Inactivo" },
  { color: "bg-red-500", label: "Error / Mesa en Avería" },
];

const SiloVisualization = () => {
  const navigate = useNavigate();
  // Estado para almacenar los datos de los transelevadores, el puente transferidor, las mesas de entrada y las mesas de salida
  const [tlv1Data, setTLV1Data] = useState<TLV1StatusData | null>(null);
  const [tlv2Data, setTLV2Data] = useState<TLV2StatusData | null>(null);
  const [ptData, setPTData] = useState<PTStatusData | null>(null);
  const [ctAlarmas, setCTAlarmas] = useState<AlarmsResponse | null>(null);
  const [tlv1Alarmas, setTLV1Alarmas] = useState<AlarmsResponse | null>(null);
  const [showCTAlarmPopup, setShowCTAlarmPopup] = useState<boolean>(false);
  const [showTLV1AlarmPopup, setShowTLV1AlarmPopup] = useState<boolean>(false);
  const [ctData, setCTData] = useState<CTStatusData | null>(null);
  const [mesasEntradaData, setMesasEntradaData] = useState<MesasEntradaStatusData | null>(null);
  const [mesasSalidaData, setMesasSalidaData] = useState<MesasSalidaStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Referencias para almacenar los últimos valores válidos de T2
  const lastValidT2Position = useRef({ pasillo: 4, altura: 30, pala: 2 });
  const lastT2UpdateTime = useRef(0);
  const t2UpdateInterval = 1000; // Actualizar T2 como máximo una vez por segundo

  // Botón para pruebas - Obtener estado de mesas de entrada
  const testMesasEntrada = async () => {
    try {
      const result = await getMesasEntradaStatusFromMariaDB();
      console.log('Resultado de prueba de mesas de entrada:', result);
      alert(`Datos de mesas de entrada obtenidos. Ver consola para detalles.`);
      setMesasEntradaData(result);
    } catch (error) {
      console.error('Error en prueba de mesas de entrada:', error);
      alert(`Error al obtener datos de mesas de entrada: ${error}`);
    }
  };
  
  // Botón para pruebas - Obtener estado de mesas de salida
  const testMesasSalida = async () => {
    try {
      const result = await getPSPsStatusFromNodeRED();
      console.log('Resultado de prueba de mesas de salida:', result);
      alert(`Datos de mesas de salida obtenidos. Ver consola para detalles.`);
      
      // Convertir de PSPsStatusData a MesasSalidaStatusData
      const convertedData: MesasSalidaStatusData = {
        id: result.id || 1,
        psp1: Number(result.mesa_salida_uno || 0),
        psp2: Number(result.mesa_salida_dos || 0),
        psp3: Number(result.mesa_salida_tres || 0),
        psp4: Number(result.mesa_salida_cuatro || 0),
        psp5: Number(result.mesa_salida_cinco || 0),
        psp6: Number(result.mesa_salida_seis || 0),
        psp7: Number(result.mesa_salida_siete || 0),
        psp8: Number(result.mesa_salida_ocho || 0),
        psp9: Number(result.mesa_salida_nueve || 0),
        psp10: Number(result.mesa_salida_diez || 0),
        psp11: Number(result.mesa_salida_once || 0),
        psp12: Number(result.mesa_salida_doce || 0),
        timestamp: result.timestamp || new Date().toISOString()
      };
      
      setMesasSalidaData(convertedData);
    } catch (error) {
      console.error('Error en prueba de mesas de salida:', error);
      alert(`Error al obtener datos de mesas de salida: ${error}`);
    }
  };

  // Función segura para obtener datos que maneja errores individualmente
  const safeDataFetch = async (fetchFunction, errorMessage, defaultValue) => {
    try {
      return await fetchFunction();
    } catch (error) {
      console.error(errorMessage, error);
      return defaultValue;
    }
  };

  // Cargar datos de TLV1, TLV2, PT, Mesas de Entrada y Mesas de Salida desde MariaDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos de manera segura, manejando errores individualmente
        const tlv1Result = await safeDataFetch(
          getTLV1StatusFromMariaDB, 
          'Error al obtener datos del TLV1:', 
          null
        );
        
        const tlv2Result = await safeDataFetch(
          getTLV2StatusFromMariaDB, 
          'Error al obtener datos del TLV2:', 
          null
        );
        
        const ptResult = await safeDataFetch(
          getPTStatusDirectFromNodeRED, 
          'Error al obtener datos del PT desde Node-RED:', 
          null
        );
        
        const ctResult = await safeDataFetch(
          getCTStatusFromMariaDB, 
          'Error al obtener datos del CT:', 
          null
        );
        
        // Depuración: ver la estructura real de los datos del CT
        console.log('Datos del CT recibidos en SiloVisualization:', ctResult);
        
        // Depuración: ver la estructura detallada de los datos del CT
        if (ctResult && ctResult.success && ctResult.data) {
          console.log('Estructura detallada del CT:', {
            success: ctResult.success,
            data: {
              id: ctResult.data.id,
              timestamp: ctResult.data.timestamp,
              StConectado: ctResult.data.StConectado,
              StDefecto: ctResult.data.StDefecto,
              St_Auto: ctResult.data.St_Auto,
              St_Semi: ctResult.data.St_Semi,
              St_Manual: ctResult.data.St_Manual,
              PasActual: ctResult.data.PasActual,
              PasDestino: ctResult.data.PasDestino,
              CicloTrabajo: ctResult.data.CicloTrabajo,
              St_Carro: ctResult.data.St_Carro
            },
            timestamp: ctResult.timestamp
          });
        }
        
        const mesasEntradaResult = await safeDataFetch(
          getMesasEntradaStatusFromMariaDB, 
          'Error al obtener datos de mesas de entrada:', 
          null
        );
        
        // Depuración: ver la estructura real de los datos de mesas de entrada
        console.log('Datos de mesas de entrada recibidos en SiloVisualization:', mesasEntradaResult);
        
        // Obtener datos de mesas de salida desde Node-RED
        const pspsResult = await safeDataFetch(
          getPSPsStatusFromNodeRED, 
          'Error al obtener datos de mesas de salida desde Node-RED:', 
          null
        );
        
        // Depuración: ver la estructura real de los datos de mesas de salida
        console.log('Datos de mesas de salida recibidos en SiloVisualization:', pspsResult);
        
        // Convertir de PSPsStatusData a MesasSalidaStatusData
        let mesasSalidaResult = null;
        if (pspsResult) {
          mesasSalidaResult = {
            id: pspsResult.id || 1,
            psp1: Number(pspsResult.mesa_salida_uno || 0),
            psp2: Number(pspsResult.mesa_salida_dos || 0),
            psp3: Number(pspsResult.mesa_salida_tres || 0),
            psp4: Number(pspsResult.mesa_salida_cuatro || 0),
            psp5: Number(pspsResult.mesa_salida_cinco || 0),
            psp6: Number(pspsResult.mesa_salida_seis || 0),
            psp7: Number(pspsResult.mesa_salida_siete || 0),
            psp8: Number(pspsResult.mesa_salida_ocho || 0),
            psp9: Number(pspsResult.mesa_salida_nueve || 0),
            psp10: Number(pspsResult.mesa_salida_diez || 0),
            psp11: Number(pspsResult.mesa_salida_once || 0),
            psp12: Number(pspsResult.mesa_salida_doce || 0),
            timestamp: pspsResult.timestamp || new Date().toISOString()
          };
          console.log('Datos convertidos de mesas de salida:', mesasSalidaResult);
        }
        
        // Obtener alarmas del CT usando el servicio directo
        console.log('Obteniendo alarmas del CT usando el servicio directo...');
        let ctAlarmasResult = { success: false, data: [] };
        try {
          const ctAlarms = await fetchCTActiveAlarms();
          console.log(`Se encontraron ${ctAlarms.length} alarmas del CT:`, ctAlarms);
          
          // Formatear las alarmas para asegurar que los timestamps son objetos Date
          const formattedAlarms = ctAlarms.map(alarm => ({
            ...alarm,
            timestamp: alarm.timestamp instanceof Date ? alarm.timestamp : new Date(alarm.timestamp)
          }));
          
          ctAlarmasResult = { success: true, data: formattedAlarms };
        } catch (error) {
          console.error('Error al obtener alarmas del CT desde Node-RED:', error);
        }
        
        const tlv1AlarmasResult = await safeDataFetch(
          getTLV1AlarmasFromMariaDB, 
          'Error al obtener alarmas del TLV1:', 
          { success: false, data: [] }
        );
        
        // Actualizar estados solo si los componentes están montados
        if (tlv1Result) setTLV1Data(tlv1Result);
        if (tlv2Result) setTLV2Data(tlv2Result);
        if (ptResult) setPTData(ptResult);
        if (ctResult) setCTData(ctResult);
        if (mesasEntradaResult) {
          console.log('Actualizando estado de mesas de entrada:', mesasEntradaResult);
          setMesasEntradaData(mesasEntradaResult);
        }
        if (mesasSalidaResult) setMesasSalidaData(mesasSalidaResult);
        if (ctAlarmasResult) setCTAlarmas(ctAlarmasResult);
        if (tlv1AlarmasResult) setTLV1Alarmas(tlv1AlarmasResult);
        
        setLoading(false);
        setError(null);
        
        // Mostrar el popup de alarmas del CT si hay alarmas activas
        if (ctAlarmasResult && ctAlarmasResult.success && ctAlarmasResult.data.length > 0) {
          setShowCTAlarmPopup(true);
        } else {
          setShowCTAlarmPopup(false);
        }
        
        // Mostrar el popup de alarmas del TLV1 si hay alarmas activas
        if (tlv1AlarmasResult && tlv1AlarmasResult.success && tlv1AlarmasResult.data.length > 0) {
          setShowTLV1AlarmPopup(true);
        } else {
          setShowTLV1AlarmPopup(false);
        }
        
        console.log('Datos del Puente Transferidor:', ptResult);
        console.log('Datos del Carro Transferidor:', ctResult);
        console.log('Datos de las Mesas de Entrada:', mesasEntradaResult);
        console.log('Datos de las Mesas de Salida:', mesasSalidaResult);

        // Procesar los datos de los transelevadores y del puente transferidor
        
        // Actualizar la posición de los componentes con los datos de MariaDB
        setComponents(prev => prev.map(comp => {
          if (comp.id === "trans1" && tlv1Result) {
            // Limitar los valores a rangos válidos para T1
            const pasillo = Math.max(1, Math.min(12, tlv1Result.pasillo_actual));
            const altura = Math.max(0, Math.min(60, tlv1Result.x_actual)); // Limitamos a 60 como máximo
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
            const altura = Math.max(0, Math.min(60, tlv2Result.x_actual)); // Limitamos a 60 como máximo
            const pala = Math.max(1, Math.min(2, tlv2Result.z_actual));
            
            // Para T2, usamos directamente los valores de MariaDB, ignorando la simulación
            // Esto asegura que los valores mostrados coincidan con los de la tabla
            console.log(`Actualizando T2 desde MariaDB: P${pasillo}, X=${altura}, Z=${pala}`);
            
            return {
              ...comp,
              status: tlv2Result.averia === 1 ? "error" : (tlv2Result.ocupacion === 1 ? "moving" : "active"),
              position: {
                y: pasillo,
                x: altura,
                z: pala
              }
            };
          } else if (comp.id === "puente" && ptData) {
            // Tomar el valor directamente de la tabla PT_Status, del campo pt_posicion
            // Exactamente como lo hacen T1 y T2
            // Convertir a número si es necesario
            const pasilloStr = ptData.pt_posicion || '1';
            const pasillo = Math.max(1, Math.min(12, parseInt(pasilloStr, 10) || 1));
            
            console.log(`Actualizando Puente desde MariaDB: Pasillo ${pasillo}`);
            
            return {
              ...comp,
              status: ptData.pt_estado === 1 ? "error" : 
                     ptData.pt_situacion === 1 ? "moving" : 
                     ptData.pt_ocupacion === 1 ? "active" : "active",
              position: {
                x: 0, // El puente siempre está en x=0
                y: pasillo // Usar el valor de posicion de la tabla PT_Status
              }
            };
          } else if (comp.id === "transferidor" && ctResult) {
            // Tomar el valor directamente de la tabla CT_Status, del campo PasActual
            // Permitimos hasta la posición 13 (elevador)
            const pasillo = Math.max(1, Math.min(13, ctResult.PasActual));
            
            console.log(`Actualizando Carro Transferidor desde MariaDB: Pasillo ${pasillo}`);
            
            return {
              ...comp,
              status: ctResult.StDefecto === 1 ? "error" : 
                     ctResult.StConectado === 1 ? "active" : "inactive",
              position: {
                x: 0, // El carro siempre está en x=0 en la visualización
                y: pasillo // Usar el valor de PasActual de la tabla CT_Status
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
  }, [ptData]); // Incluimos ptData como dependencia para actualizar los componentes cuando cambie
  
  // Referencia para almacenar la última posición válida del puente
  const lastValidPuentePosition = useRef(1); // Inicializamos con 1 como valor por defecto

  // Función auxiliar para obtener los valores del CT independientemente de la estructura
  const getCTValue = (data: any, legacyKey: string, newKey: string, defaultValue: any = 0): number => {
    if (!data) return defaultValue;
    
    // Intentar con la estructura de api.ts primero
    if (typeof data === 'object' && legacyKey in data) {
      return data[legacyKey];
    }
    
    // Intentar con la estructura de ctStatusApi.ts
    if (typeof data === 'object' && newKey in data) {
      return data[newKey];
    }
    
    return defaultValue;
  };
  
  // Este useEffect se ejecuta cuando cambian los datos de los transelevadores, del puente o del carro transferidor
  useEffect(() => {
    if (tlv1Data || tlv2Data || ptData || ctData) {
      console.log('Datos del PT recibidos:', ptData);
      console.log('Datos del CT recibidos:', ctData);
      setComponents(prev => prev.map(comp => {
        // Actualizar el puente transferidor con los datos de PT_Status
        if (comp.id === "puente" && ptData) {
          // Si la posición es '0', significa que está en movimiento, mantenemos la última posición válida
          // Si no es '0', actualizamos la última posición válida
          if (ptData.pt_posicion !== '0') {
            // Convertir a número si es necesario
            const posicionNum = parseInt(ptData.pt_posicion, 10);
            if (!isNaN(posicionNum)) {
              lastValidPuentePosition.current = posicionNum;
            }
          }
          
          // Usamos la última posición válida conocida, limitada entre 1 y 12
          const pasillo = Math.max(1, Math.min(12, lastValidPuentePosition.current));
          console.log(`Actualizando Puente desde useEffect: Valor en DB=${ptData.pt_posicion}, Última posición válida=${lastValidPuentePosition.current}, Pasillo mostrado=${pasillo}`);
          
          return {
            ...comp,
            status: ptData.pt_estado === 1 ? "error" : 
                   ptData.pt_situacion === 1 || ptData.pt_posicion === '0' ? "moving" : 
                   ptData.pt_ocupacion === 1 ? "active" : "active",
            position: {
              x: 0, // El puente siempre está en x=0
              y: pasillo // Usar la última posición válida conocida
            }
          };
        }
        
        // Actualizar el carro transferidor con los datos de CT_Status
        if (comp.id === "transferidor" && ctData) {
          console.log(`Actualizando Carro Transferidor desde useEffect: PasActual=${ctData.ct_numero_pasillo_actual}, Estado=${ctData.ct_estado_carro}`);
          
          // Determinar el estado del CT basado en los datos recibidos
          let ctStatus: ComponentStatus = "active";
          if (ctData.ct_defecto === 1) {
            ctStatus = "error";
          } else if (ctData.ct_estado_carro === 1) {
            ctStatus = "moving"; // Ocupado = en movimiento
          } else if (ctData.ct_estado_carro === 2) {
            ctStatus = "error"; // Avería
          }
          
          return {
            ...comp,
            status: ctStatus,
            position: {
              x: 0,
              y: ctData.ct_numero_pasillo_actual || comp.position.y // Usar el pasillo actual del CT, o mantener el valor actual si no hay datos
            }
          };
        }
        
        return comp;
      }));
    }
  }, [tlv1Data, tlv2Data, ptData, ctData]);

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
      position: { x: 0, y: 5 }, // Posicionado en el pasillo 5 (valor inicial)
    },
    {
      id: "puente",
      name: "Puente",
      type: "puente",
      status: "active",
      position: { x: 0, y: 1 }, // x siempre es 0, y es el pasillo (1-12) - Inicializado con 1 como valor por defecto
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

  // Simulación de cambios de estado (pausable) - Solo para componentes que no son los Transelevadores
  useEffect(() => {
    if (simulationPaused) {
      if (simulationRef.current) clearInterval(simulationRef.current);
      return;
    }
    simulationRef.current = setInterval(() => {
      setComponents((prev) =>
        prev.map((comp) => {
          // No simulamos los Transelevadores, ya que sus datos vienen de MariaDB
          if (comp.id === "trans1" || comp.id === "trans2") {
            return comp;
          }
          // Desactivamos la simulación aleatoria para el carro transferidor
          // El carro transferidor solo debe actualizarse con los datos reales de la tabla CT_Status
          if (comp.type === "transferidor") {
            // No modificar la posición del carro transferidor en la simulación
            return comp;
          }
          
          // Desactivamos la simulación aleatoria para el puente
          // El puente solo debe actualizarse con los datos reales de la tabla PT_Status
          if (comp.type === "puente") {
            // No modificar la posición del puente en la simulación
            return comp;
          }
          
          // Elevador se mueve verticalmente (simulación)
          if (comp.type === "elevador" && Math.random() > 0.9) {
            return {
              ...comp,
              status: "moving"
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
  
  // Función para determinar el color de fondo de la mesa de entrada según su estado
  const getMesaEntradaStatusColor = (pasillo: string) => {
    if (!mesasEntradaData) return "bg-gray-400"; // Si no hay datos, mostrar en gris
    
    // IMPORTANTE: Acceder directamente a los datos de la mesa de entrada
    // sin mapear a través del número de pasillo
    const pasilloNum = parseInt(pasillo.substring(1));
    const mesaKey = getMesaKeyFromPasillo(pasilloNum);
    const estado = mesasEntradaData[mesaKey];
    
    // Depuración: mostrar los datos de la mesa
    console.log(`Mesa ${pasillo}, key: ${mesaKey}, estado: ${estado}, tipo: ${typeof estado}`);
    
    // Estado 0: Libre (verde), Estado 1: Ocupado (azul), Estado 2: Avería (rojo)
    switch (Number(estado)) {
      case 0:
        return "bg-green-500"; // Libre
      case 1:
        return "bg-blue-500";  // Ocupado
      case 2:
        return "bg-red-500";   // Avería
      default:
        console.log(`Estado no reconocido para ${pasillo}: ${estado}`);
        return "bg-gray-400";  // Estado desconocido
    }
  };
  
  // Función para obtener el color basado en el valor numérico
  const getColorBasedOnValue = (value: any): string => {
    // Asegurarse de que el valor sea un número
    const numValue = Number(value);
    console.log(`Valor recibido: ${value}, convertido a número: ${numValue}, tipo: ${typeof numValue}`);
    
    // Asignar color según el valor
    switch (numValue) {
      case 0:
        return "bg-green-500"; // Libre
      case 1:
        return "bg-blue-500";  // Ocupado
      case 2:
        return "bg-red-500";   // Avería
      default:
        console.log(`Valor no reconocido: ${numValue}`);
        return "bg-gray-400";  // Estado desconocido
    }
  };
  
  // Función auxiliar para obtener la clave de la mesa de entrada según el número de pasillo
  const getMesaKeyFromPasillo = (pasilloNum: number): keyof MesasEntradaStatusData => {
    // Depuración: mostrar el número de pasillo que se está mapeando
    console.log(`Mapeando pasillo ${pasilloNum} a clave de mesa de entrada`);
    
    let key: keyof MesasEntradaStatusData;
    
    // Mapeo directo de número de pasillo a nombre de campo en la base de datos
    switch (pasilloNum) {
      case 1: key = "mesa_entrada_uno"; break;
      case 2: key = "mesa_entrada_dos"; break;
      case 3: key = "mesa_entrada_tres"; break;
      case 4: key = "mesa_entrada_cuatro"; break;
      case 5: key = "mesa_entrada_cinco"; break;
      case 6: key = "mesa_entrada_seis"; break;
      case 7: key = "mesa_entrada_siete"; break;
      case 8: key = "mesa_entrada_ocho"; break;
      case 9: key = "mesa_entrada_nueve"; break;
      case 10: key = "mesa_entrada_diez"; break;
      case 11: key = "mesa_entrada_once"; break;
      case 12: key = "mesa_entrada_doce"; break;
      default: key = "mesa_entrada_uno"; break; // Valor por defecto
    }
    
    // Depuración: mostrar la clave resultante
    console.log(`Pasillo ${pasilloNum} mapeado a clave: ${key}`);
    
    return key;
  };
  
  // Función para obtener el texto descriptivo del estado de la mesa de entrada
  const getMesaEntradaStatusText = (pasillo: string) => {
    if (!mesasEntradaData) return "Estado desconocido";
    
    const pasilloNum = parseInt(pasillo.substring(1));
    const mesaKey = getMesaKeyFromPasillo(pasilloNum);
    const estado = mesasEntradaData[mesaKey];
    
    switch (Number(estado)) {
      case 0:
        return "Libre - Mesa de entrada disponible";
      case 1:
        return "Ocupado - Mesa de entrada en uso";
      case 2:
        return "Avería - Mesa de entrada no disponible";
      default:
        return "Estado desconocido";
    }
  };
  
  // Función para obtener las alarmas del TLV1
  const getTLV1AlarmasFromMariaDB = async (): Promise<TLV1AlarmasResponse> => {
    try {
      const response = await axios.get(`${MARIADB_API_URL}/tlv1/alarmas/active`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener alarmas del TLV1:', error);
      return { success: false, data: [] };
    }
  };
  
  // Función auxiliar para obtener la clave de la mesa de salida según el número de pasillo
  const getMesaSalidaKeyFromPasillo = (pasilloNum: number): keyof MesasSalidaStatusData => {
    // Depuración: mostrar el número de pasillo que se está mapeando
    console.log(`Mapeando pasillo ${pasilloNum} a clave de mesa de salida`);
    
    let key: keyof MesasSalidaStatusData;
    
    // Mapeo directo de número de pasillo a nombre de campo en el formato interno
    switch (pasilloNum) {
      case 1: key = "psp1"; break;
      case 2: key = "psp2"; break;
      case 3: key = "psp3"; break;
      case 4: key = "psp4"; break;
      case 5: key = "psp5"; break;
      case 6: key = "psp6"; break;
      case 7: key = "psp7"; break;
      case 8: key = "psp8"; break;
      case 9: key = "psp9"; break;
      case 10: key = "psp10"; break;
      case 11: key = "psp11"; break;
      case 12: key = "psp12"; break;
      default: key = "psp1"; break; // Valor por defecto
    }
    
    // Depuración: mostrar la clave resultante
    console.log(`Pasillo ${pasilloNum} mapeado a clave de mesa de salida: ${key}`);
    
    return key;
  };
  
  // Función para determinar el color de fondo de la mesa de salida según su estado
  const getMesaSalidaStatusColor = (pasillo: string) => {
    if (!mesasSalidaData) return "bg-gray-400"; // Si no hay datos, mostrar en gris
    
    const pasilloNum = parseInt(pasillo.substring(1));
    const mesaKey = getMesaSalidaKeyFromPasillo(pasilloNum);
    const estado = mesasSalidaData[mesaKey];
    
    // Depuración: mostrar los datos de la mesa
    console.log(`Mesa Salida ${pasillo}, key: ${mesaKey}, estado: ${estado}, tipo: ${typeof estado}`);
    
    // Estado 0: Libre (verde), Estado 1: Ocupado (azul), Estado 2: Avería (rojo)
    return getColorBasedOnValue(estado);
  };
  
  // Función para obtener el texto descriptivo del estado de la mesa de salida
  const getMesaSalidaStatusText = (pasillo: string) => {
    if (!mesasSalidaData) return "Estado desconocido";
    
    const pasilloNum = parseInt(pasillo.substring(1));
    const mesaKey = getMesaSalidaKeyFromPasillo(pasilloNum);
    const estado = mesasSalidaData[mesaKey];
    
    switch (Number(estado)) {
      case 0:
        return "Libre - Mesa de salida disponible";
      case 1:
        return "Ocupado - Mesa de salida en uso";
      case 2:
        return "Avería - Mesa de salida no disponible";
      default:
        return "Estado desconocido";
    }
  };
  
  // Función para determinar el color de fondo del transportador según su estado (para compatibilidad)
  const getTransportadorStatusColor = (pasillo: string, index: number) => {
    // Si es un índice impar (1, 3, 5...), es una mesa de entrada
    if (index % 2 === 1) {
      return getMesaEntradaStatusColor(pasillo);
    }
    // Si es un índice par (2, 4, 6...), es una mesa de salida
    return getMesaSalidaStatusColor(pasillo);
  };
  
  // Función para obtener el texto descriptivo del estado del transportador (para compatibilidad)
  const getTransportadorStatusText = (pasillo: string, index: number) => {
    // Si es un índice impar (1, 3, 5...), es una mesa de entrada
    if (index % 2 === 1) {
      return getMesaEntradaStatusText(pasillo);
    }
    // Si es un índice par (2, 4, 6...), es una mesa de salida
    return getMesaSalidaStatusText(pasillo);
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

  // Función de prueba para verificar los datos de las mesas de entrada
  const testMesasEntradaData = () => {
    console.log('%c DATOS ACTUALES DE MESAS DE ENTRADA ', 'background: #3498db; color: white; font-size: 12px; font-weight: bold; padding: 4px;', mesasEntradaData);
    
    if (mesasEntradaData) {
      // Verificar cada mesa individualmente con su nombre real
      console.log('%c VALORES POR MESA ', 'background: #2ecc71; color: white; font-size: 12px; font-weight: bold; padding: 4px;');
      console.log('Mesa 1:', mesasEntradaData.mesa_entrada_uno, typeof mesasEntradaData.mesa_entrada_uno);
      console.log('Mesa 2:', mesasEntradaData.mesa_entrada_dos, typeof mesasEntradaData.mesa_entrada_dos);
      console.log('Mesa 3:', mesasEntradaData.mesa_entrada_tres, typeof mesasEntradaData.mesa_entrada_tres);
      
      // Mostrar todos los campos disponibles
      console.log('%c TODOS LOS CAMPOS ', 'background: #e74c3c; color: white; font-size: 12px; font-weight: bold; padding: 4px;');
      Object.entries(mesasEntradaData).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'timestamp') {
          console.log(`Campo: ${key}, Valor: ${value}, Tipo: ${typeof value}`);
          
          // Probar la conversión a número
          const numValue = Number(value);
          console.log(`  -> Convertido a número: ${numValue}, Tipo: ${typeof numValue}, Es NaN: ${isNaN(numValue)}`);
          
          // Probar el color que se asignaría
          console.log(`  -> Color asignado: ${getColorBasedOnValue(value)}`);
        }
      });
      
      // Probar el mapeo para cada pasillo
      console.log('%c MAPEO DE PASILLOS A MESAS ', 'background: #9b59b6; color: white; font-size: 12px; font-weight: bold; padding: 4px;');
      for (let i = 1; i <= 12; i++) {
        const key = getMesaKeyFromPasillo(i);
        const valor = mesasEntradaData[key];
        console.log(`Pasillo ${i} -> ${key} = ${valor} (${typeof valor})`);
        console.log(`  -> Color asignado: ${getColorBasedOnValue(valor)}`);
      }
      
      // Forzar actualización de la interfaz
      console.log('%c FORZANDO ACTUALIZACIÓN DE LA INTERFAZ ', 'background: #f39c12; color: white; font-size: 12px; font-weight: bold; padding: 4px;');
      setMesasEntradaData({...mesasEntradaData});
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-operator p-4 my-8">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-800">
          Estado del Silo
        </h2>
        <button 
          onClick={testMesasEntradaData}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Test Mesas
        </button>
      </div>
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
            tlv1Data={tlv1Data}
            tlv2Data={tlv2Data}
            ptData={ptData}
            tlv1Alarmas={tlv1Alarmas}
            showTLV1AlarmPopup={showTLV1AlarmPopup}
            setShowTLV1AlarmPopup={setShowTLV1AlarmPopup}
          />
          
          {/* Área inferior con etiquetas de pasillos, transportadores y carro transferidor */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col">
            {/* Etiquetas de los pasillos (primera fila) */}
            <div className="h-6 flex border-t border-operator-border">
              {pasillos.map((pasillo) => (
                <div
                  key={`pasillo-${pasillo}`}
                  className="flex-1 flex items-center justify-center text-xs font-bold text-operator-blue relative"
                >
                  {/* Círculo indicador de estado del pasillo */}
                  <div 
                    className="absolute top-1 right-[10px] w-1.5 h-1.5 rounded-full border border-white bg-green-500"
                    title="En servicio"
                  />
                  {pasillo}
                </div>
              ))}
            </div>
            
            {/* Transportadores - 2 por pasillo (segunda fila) */}
            <div className="h-6 flex justify-between px-2 border-t border-operator-border">
              {pasillos.map((pasillo) => (
                <div key={`transportadores-${pasillo}`} className="flex-1 flex items-center justify-center relative">
                  {pasillo === "PEE" ? (
                    <div className="flex justify-center">
                      <Tooltip>
                        <TooltipTrigger>
                          <div 
                            className="w-3 h-3 rounded-full flex items-center justify-center bg-blue-500 transition-all duration-300 ease-in-out animate-pulse"
                          >
                            <span className="text-[5px] font-bold text-white">61</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div className="font-semibold">Transportador Elevador</div>
                            <div>Transportador en funcionamiento</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      {/* Mesa de entrada (izquierda) - con colores según estado: verde(0), azul(1), rojo(2) */}
                      <Tooltip>
                        <TooltipTrigger>
                          <div 
                            className={`w-3 h-3 rounded-full flex items-center justify-center ${mesasEntradaData ? getColorBasedOnValue(mesasEntradaData[getMesaKeyFromPasillo(parseInt(pasillo.substring(1)))]) : 'bg-gray-400'} transition-all duration-300 ease-in-out ${mesasEntradaData && Number(mesasEntradaData[getMesaKeyFromPasillo(parseInt(pasillo.substring(1)))]) === 1 ? 'animate-pulse' : mesasEntradaData && Number(mesasEntradaData[getMesaKeyFromPasillo(parseInt(pasillo.substring(1)))]) === 2 ? 'animate-bounce' : ''}`}
                          >
                            <span className="text-[5px] font-bold text-white">{37 + (parseInt(pasillo.substring(1)) - 1) * 2}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div className="font-semibold">Mesa de Entrada P{parseInt(pasillo.substring(1))}</div>
                            <div>{getMesaEntradaStatusText(pasillo)}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      
                      {/* Mesa de salida (derecha) - con colores según estado: verde(0), azul(1), rojo(2) */}
                      <Tooltip>
                        <TooltipTrigger>
                          <div 
                            className={`w-3 h-3 rounded-full flex items-center justify-center ${getMesaSalidaStatusColor(pasillo)} transition-all duration-300 ease-in-out ${mesasSalidaData && Number(mesasSalidaData[getMesaSalidaKeyFromPasillo(parseInt(pasillo.substring(1)))]) === 1 ? 'animate-pulse' : mesasSalidaData && Number(mesasSalidaData[getMesaSalidaKeyFromPasillo(parseInt(pasillo.substring(1)))]) === 2 ? 'animate-bounce' : ''}`}
                          >
                            <span className="text-[5px] font-bold text-white">{38 + (parseInt(pasillo.substring(1)) - 1) * 2}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div className="font-semibold">Mesa de Salida P{parseInt(pasillo.substring(1))}</div>
                            <div>{getMesaSalidaStatusText(pasillo)}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
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
                  // Usamos component.position.y para posicionar el CT según el pasillo
                  const xPerc = ((component.position.y - 0.5) * (100 / SILO_PASILLOS)) - 2.5;
                  const statusColor = getStatusColor(component.status, component.type);
                  
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="cursor-pointer hover:scale-110 transition-transform" 
                          style={{ 
                            position: 'absolute', 
                            left: `${xPerc}%`, 
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 20
                          }}
                          onClick={() => navigate('/ct')}
                          onMouseEnter={() => ctAlarmas && ctAlarmas.data.length > 0 && setShowCTAlarmPopup(true)}
                          onMouseLeave={() => setShowCTAlarmPopup(false)}
                        >
                          <div className="relative">
                            <div className={`relative ${statusColor}`} style={{ width: '45px', height: '45px' }}>
                              <svg 
                                width="45" 
                                height="45" 
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
                            {/* Indicador de estado */}
                            <span className="absolute top-2 -right-3 w-3 h-3 rounded-full border border-white shadow-sm bg-green-500" />
                            
                            {/* Indicador de alarmas */}
                            {ctAlarmas && ctAlarmas.data.length > 0 && (
                              <span 
                                className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse"
                                title={`${ctAlarmas.data.length} alarmas activas`}
                              >
                                {ctAlarmas.data.length}
                              </span>
                            )}
                            
                            {/* Ventana emergente de alarmas */}
                            {showCTAlarmPopup && ctAlarmas && ctAlarmas.data.length > 0 && (
                              <AlarmPopup 
                                alarms={ctAlarmas.data} 
                                position="top" 
                                maxAlarms={3} 
                                onClose={() => setShowCTAlarmPopup(false)}
                              />
                            )}
                          </div>
                          <span className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white/80 rounded px-1 shadow-sm hover:bg-gray-200">CT</span>
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
        <div className="mt-2 text-xs text-gray-600">
          <p><span className="font-semibold">Mesas de Entrada:</span> Los círculos de la izquierda debajo de cada pasillo muestran el estado de las mesas de entrada.</p>
          <p><span className="font-semibold">Mesas de Salida:</span> Los círculos de la derecha debajo de cada pasillo muestran el estado de las mesas de salida.</p>
          <p>Verde = Libre (0), Azul = Ocupada (1), Rojo = Avería (2)</p>
        </div>
      </div>
      <div className="mt-6">
        <SiloComponentInfoGroup
          components={components}
          getStatusColor={getStatusColor}
          tlv1Data={tlv1Data}
          tlv2Data={tlv2Data}
          ctData={ctData}
          ptData={ptData}
        />
      </div>
    </div>
  );
};

export default SiloVisualization;
