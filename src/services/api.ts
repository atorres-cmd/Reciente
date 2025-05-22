// API Service para consumir datos de Node-RED
import axios from 'axios';

// Obtener el hostname actual (dominio o IP)
const currentHost = window.location.hostname;

// Determinar las URLs base según el hostname
// Node-RED normalmente se ejecuta en el puerto 1880
let nodeRedApiBaseUrl;

// Configuración más flexible para permitir cualquier IP local
if (currentHost === 'localhost' || 
    currentHost.match(/^192\.168\./)) {
  // Si estamos accediendo desde localhost o una IP en cualquier rango 192.168.xxx.xxx
  nodeRedApiBaseUrl = `http://${currentHost}:1880/api`;
  console.log(`API: Configurando URL para host local: ${nodeRedApiBaseUrl}`);
} else {
  // Fallback a localhost
  nodeRedApiBaseUrl = 'http://localhost:1880/api';
  console.log(`API: Usando URL fallback: ${nodeRedApiBaseUrl}`);
}

// Imprimir información de depuración sobre la URL configurada
console.log(`API: Hostname detectado: ${currentHost}`);

// URL base de la API de Node-RED
const API_URL = nodeRedApiBaseUrl;

// Mantenemos la misma estructura de URLs para compatibilidad con el código existente
const MARIADB_API_URL = nodeRedApiBaseUrl;

// URL base para las alarmas del Carro Transferidor (CT)
const CT_ALARMS_URL = `${nodeRedApiBaseUrl}/ct/alarmas`;
console.log('URL para alarmas CT:', CT_ALARMS_URL);

// Definir rutas para el Puente de Transbordo (PT)
const PT_STATUS_URL = `${nodeRedApiBaseUrl}/pt/status`;
const PT_STATUS_SYNC_URL = `${nodeRedApiBaseUrl}/pt/status/sync`;
console.log('URLs para PT:', { PT_STATUS_URL, PT_STATUS_SYNC_URL });

// Definir rutas para Node-RED
export const NODE_RED_ROUTES = {
  CT_STATUS: '/ct/status',
  CT_SYNC: '/ct/status/sync',
  PT_STATUS: '/pt/status',
  PT_SYNC: '/pt/status/sync'
};

// Exportar las URLs para usarlas en otros componentes
export { API_URL, MARIADB_API_URL, CT_ALARMS_URL, PT_STATUS_URL, PT_STATUS_SYNC_URL };

console.log('API URLs configuradas para Node-RED:', { API_URL, MARIADB_API_URL, CT_ALARMS_URL, PT_STATUS_URL, PT_STATUS_SYNC_URL });

// Interfaz para los datos del Puente de Transbordo (PT)
export interface PTStatusData {
  // Campos básicos
  id?: number;
  timestamp?: string;
  
  // Estados del PT
  pt_ocupacion?: number;  // 1 = ocupado, 0 = libre
  pt_estado?: number;     // Estado del puente de transbordo
  pt_situacion?: number;  // Situación actual
  pt_posicion?: string;   // Identificador de la posición (varchar(10))
}

// Interfaz para los datos del Transelevador
export interface TranselevadorData {
  id: string;
  name: string;
  status: string;
  position_x: number;
  position_y: number;
  position_z: number;
  last_activity: string;
  cycles_today: number;
  efficiency: number;
}

// Interfaz para los datos del Carro Transferidor (CT)
export interface CTStatusData {
  // Campos básicos
  id?: number;
  timestamp?: string;
  
  // Estados principales
  ct_conectado?: number;
  ct_defecto?: number;
  ct_automatico?: number;
  ct_semiautomatico?: number;
  ct_manual?: number;
  ct_emergencia_puerta_armario?: number;
  ct_con_datos?: number;
  
  // Transferencias
  ct_autorizacion_transferencia_tc26?: number;
  ct_fin_transferencia_tc26?: number;
  ct_peticion_transferencia_tc30?: number;
  ct_acuse_orden_recibida?: number;
  
  // Matrículas y pasillos
  ct_matricula_paleta_entrada?: number;
  ct_matricula_paleta_salida?: number;
  ct_pasillo_destino?: number;
  ct_ciclo_trabajo?: number;
  ct_numero_pasillo_actual?: number;
  ct_estado_carro?: number;
  
  // Defectos
  ct_defecto_comunicacion?: number;
  ct_defecto_emergencia_armario?: number;
  ct_defecto_variador?: number;
  ct_defecto_motor_traslacion?: number;
  ct_defecto_motor_entrada?: number;
  ct_defecto_motor_salida?: number;
  ct_defecto_final_carrera_pasillo1?: number;
  ct_defecto_final_carrera_pasillo12?: number;
  ct_defecto_paleta_descentrada_entrada?: number;
  ct_defecto_paleta_descentrada_salida?: number;
  
  // Sensores y visualizaciones existentes
  ct_vis_centraje_traslacion_adelante?: number;
  ct_vis_centraje_traslacion_atras?: number;
  ct_vis_presencia_delantera_paleta_entrada?: number;
  ct_vis_presencia_trasera_paleta_entrada?: number;
  ct_vis_presencia_delantera_paleta_salida?: number;
  ct_vis_presencia_trasera_paleta_salida?: number;
  
  // Campos adicionales que aparecen en la tabla
  ct_vis_marcha_traslacion_adelante?: number;
  ct_vis_marcha_traslacion_atras?: number;
  ct_vis_motor_traslacion_parado?: number;
  ct_vis_centraje_transportador?: number;
  ct_vis_marcha_transportador_entrada?: number;
  ct_vis_marcha_transportador_salida?: number;
  ct_vis_defecto_traslacion?: number;
  ct_vis_defecto_transportador?: number;
  
  // Campos simplificados para la UI
  StConectado?: number;
  StDefecto?: number;
  St_Auto?: number;
  St_Semi?: number;
  St_Manual?: number;
  St_Puerta?: number;
  St_Datos?: number;
  MatEntrada?: number;
  MatSalida?: number;
  PasDestino?: number;
  CicloTrabajo?: number;
  PasActual?: number;
  St_Carro?: number;
}

// Interfaz para las alarmas
export interface Alarma {
  id: string;
  titulo: string;
  descripcion: string;
  timestamp: string;
  tipo: 'error' | 'warning' | 'info' | 'success';
}

// Interfaz para las alarmas del Carro Transferidor (CT)
export interface CTAlarm {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: Date;
  acknowledged: boolean;
}

// Interfaz para los datos de TLV1_Status de MariaDB
export interface TLV1StatusData {
  id: number;
  tlv1_modo: number;
  tlv1_ocupacion: number;
  tlv1_averia: number;
  tlv1_reserva_3: number | null;
  tlv1_reserva_4: number | null;
  tlv1_reserva_5: number | null;
  tlv1_reserva_6: number | null;
  tlv1_reserva_7: number | null;
  tlv1_reserva_8: number | null;
  tlv1_reserva_9: number | null;
  tlv1_coord_x_actual: number | null;
  tlv1_coord_y_actual: number | null;
  tlv1_coord_z_actual: number | null;
  tlv1_matricula_actual: number | null;
  tlv1_tarea_actual: string | null;
  tlv1_uma_actual: string | null;
  tlv1_pasillo_actual: number | null;
  tlv1_orden_tipo: number;
  tlv1_orden_pasillo_origen: number | null;
  tlv1_orden_coord_x_origen: number | null;
  tlv1_orden_coord_y_origen: number | null;
  tlv1_orden_coord_z_origen: number;
  tlv1_orden_pasillo_destino: number | null;
  tlv1_orden_coord_x_destino: number | null;
  tlv1_orden_coord_y_destino: number | null;
  tlv1_orden_coord_z_destino: number;
  tlv1_orden_matricula: number | null;
  tlv1_fin_orden_estado: number;
  tlv1_fin_orden_resultado: number | null;
  tlv1_fin_orden_pasillo_destino: number | null;
  tlv1_fin_orden_coord_x_destino: number | null;
  tlv1_fin_orden_coord_y_destino: number | null;
  tlv1_fin_orden_coord_z_destino: number;
  timestamp: string;
  
  // Campos mapeados para compatibilidad con el código existente
  modo?: number;
  ocupacion?: number;
  averia?: number;
  matricula?: number;
  pasillo_actual?: number;
  x_actual?: number;
  y_actual?: number;
  z_actual?: number;
  estadoFinOrden?: number;
  resultadoFinOrden?: number;
}

// Interfaz para los datos de TLV2_Status de MariaDB
export interface TLV2StatusData {
  id: number;
  tlv2_modo: number;
  tlv2_ocupacion: number;
  tlv2_averia: number;
  tlv2_reserva_3: number | null;
  tlv2_reserva_4: number | null;
  tlv2_reserva_5: number | null;
  tlv2_reserva_6: number | null;
  tlv2_reserva_7: number | null;
  tlv2_reserva_8: number | null;
  tlv2_reserva_9: number | null;
  tlv2_coord_x_actual: number | null;
  tlv2_coord_y_actual: number | null;
  tlv2_coord_z_actual: number | null;
  tlv2_matricula_actual: number | null;
  tlv2_tarea_actual: string | null;
  tlv2_uma_actual: string | null;
  tlv2_pasillo_actual: number | null;
  tlv2_orden_tipo: number;
  tlv2_orden_pasillo_origen: number | null;
  tlv2_orden_coord_x_origen: number | null;
  tlv2_orden_coord_y_origen: number | null;
  tlv2_orden_coord_z_origen: number;
  tlv2_orden_pasillo_destino: number | null;
  tlv2_orden_coord_x_destino: number | null;
  tlv2_orden_coord_y_destino: number | null;
  tlv2_orden_coord_z_destino: number;
  tlv2_orden_matricula: number | null;
  tlv2_fin_orden_estado: number;
  tlv2_fin_orden_resultado: number | null;
  tlv2_fin_orden_pasillo_destino: number | null;
  tlv2_fin_orden_coord_x_destino: number | null;
  tlv2_fin_orden_coord_y_destino: number | null;
  tlv2_fin_orden_coord_z_destino: number;
  timestamp: string;
  
  // Campos mapeados para compatibilidad con el código existente
  modo?: number;
  ocupacion?: number;
  averia?: number;
  matricula?: number;
  pasillo_actual?: number;
  x_actual?: number;
  y_actual?: number;
  z_actual?: number;
  estadoFinOrden?: number;
  resultadoFinOrden?: number;
}

// Esta interfaz ya está definida arriba, eliminamos la duplicación
// Interfaz para los datos de CT_Status de MariaDBen la 
// La interfaz CTStatusData se ha movido arriba para evitar duplicación

// Interfaz para los datos de MesasEntrada_Status (PEPs) de MariaDB
export interface PEPsStatusData {
  id: number;
  mesa_entrada_uno: number | null;
  mesa_entrada_dos: number | null;
  mesa_entrada_tres: number | null;
  mesa_entrada_cuatro: number | null;
  mesa_entrada_cinco: number | null;
  mesa_entrada_seis: number | null;
  mesa_entrada_siete: number | null;
  mesa_entrada_ocho: number | null;
  mesa_entrada_nueve: number | null;
  mesa_entrada_diez: number | null;
  mesa_entrada_once: number | null;
  mesa_entrada_doce: number | null;
  timestamp: string;
}

// Interfaz para la respuesta de la API de PEPs
export interface PEPsApiResponse {
  success: boolean;
  data: PEPsStatusData;
  message?: string;
}

// Interfaz para los datos de MesasSalida_Status (PSPs) de MariaDB
export interface PSPsStatusData {
  id: number;
  mesa_salida_uno: number | null;
  mesa_salida_dos: number | null;
  mesa_salida_tres: number | null;
  mesa_salida_cuatro: number | null;
  mesa_salida_cinco: number | null;
  mesa_salida_seis: number | null;
  mesa_salida_siete: number | null;
  mesa_salida_ocho: number | null;
  mesa_salida_nueve: number | null;
  mesa_salida_diez: number | null;
  mesa_salida_once: number | null;
  mesa_salida_doce: number | null;
  timestamp: string;
}

// Interfaz para la respuesta de la API de PSPs
export interface PSPsApiResponse {
  success: boolean;
  data: PSPsStatusData;
  message?: string;
}

// Función para obtener el estado de las mesas de entrada (PEPs) directamente desde Node-RED
export const getPEPsStatusDirectFromNodeRED = async (): Promise<PEPsApiResponse> => {
  try {
    const response = await axios.get(`${nodeRedApiBaseUrl}/peps/status`);
    console.log('Respuesta completa de la API de PEPs:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estado de PEPs desde Node-RED:', error);
    throw error;
  }
};

// Función para sincronizar el estado de las mesas de entrada (PEPs) en la base de datos
export const syncPEPsStatusInDB = async (): Promise<PEPsApiResponse> => {
  try {
    const response = await axios.get(`${nodeRedApiBaseUrl}/peps/status/sync`);
    console.log('Respuesta completa de sincronización de PEPs:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al sincronizar estado de PEPs en la base de datos:', error);
    throw error;
  }
};

// Función para obtener el estado de las mesas de salida (PSPs) directamente desde Node-RED
export const getPSPsStatusDirectFromNodeRED = async (): Promise<PSPsApiResponse> => {
  try {
    const response = await axios.get(`${nodeRedApiBaseUrl}/psps/status`);
    console.log('Respuesta completa de la API de PSPs:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estado de PSPs desde Node-RED:', error);
    throw error;
  }
};

// Función para sincronizar el estado de las mesas de salida (PSPs) en la base de datos
export const syncPSPsStatusInDB = async (): Promise<PSPsApiResponse> => {
  try {
    const response = await axios.get(`${nodeRedApiBaseUrl}/psps/status/sync`);
    console.log('Respuesta completa de sincronización de PSPs:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al sincronizar estado de PSPs en la base de datos:', error);
    throw error;
  }
};

// Servicio para obtener datos del Transelevador 1
export const getTranselevadorData = async (id: string): Promise<TranselevadorData> => {
  try {
    console.log(`API: Solicitando datos del Transelevador ${id}...`);
    
    // Simulación de respuesta
    return {
      id: id,
      name: `Transelevador ${id}`,
      status: 'online',
      position_x: 5,
      position_y: 12,
      position_z: 3,
      last_activity: new Date().toISOString(),
      cycles_today: 127,
      efficiency: 98.5
    };
  } catch (error) {
    console.error(`API: Error al obtener datos del Transelevador ${id}:`, error);
    throw error;
  }
};

// Servicio para obtener alarmas del Transelevador 1
export const getTranselevadorAlarmas = async (id: string): Promise<Alarma[]> => {
  try {
    console.log(`API: Solicitando alarmas del Transelevador ${id}...`);
    
    // Simulación de respuesta
    return [
      {
        id: '1',
        titulo: 'Alarma de prueba',
        descripcion: 'Esta es una alarma de prueba para el Transelevador ' + id,
        timestamp: new Date().toISOString(),
        tipo: 'warning'
      },
      {
        id: '2',
        titulo: 'Error de comunicación',
        descripcion: 'Error de comunicación con el Transelevador ' + id,
        timestamp: new Date().toISOString(),
        tipo: 'error'
      }
    ];
  } catch (error) {
    console.error(`API: Error al obtener alarmas del Transelevador ${id}:`, error);
    throw error;
  }
};

// Servicio para obtener datos del TLV1 desde MariaDB
export const getTLV1StatusFromMariaDB = async (): Promise<TLV1StatusData> => {
  try {
    console.log('API: Solicitando datos del TLV1 desde MariaDB...');
    
    // Simulación de respuesta con la nueva estructura
    const tlv1Data: TLV1StatusData = {
      id: 1,
      tlv1_modo: 1,
      tlv1_ocupacion: 0,
      tlv1_averia: 0,
      tlv1_reserva_3: null,
      tlv1_reserva_4: null,
      tlv1_reserva_5: null,
      tlv1_reserva_6: null,
      tlv1_reserva_7: null,
      tlv1_reserva_8: null,
      tlv1_reserva_9: null,
      tlv1_coord_x_actual: 5,
      tlv1_coord_y_actual: 10,
      tlv1_coord_z_actual: 2,
      tlv1_matricula_actual: 12345,
      tlv1_tarea_actual: null,
      tlv1_uma_actual: null,
      tlv1_pasillo_actual: 3,
      tlv1_orden_tipo: 0,
      tlv1_orden_pasillo_origen: null,
      tlv1_orden_coord_x_origen: null,
      tlv1_orden_coord_y_origen: null,
      tlv1_orden_coord_z_origen: 1,
      tlv1_orden_pasillo_destino: null,
      tlv1_orden_coord_x_destino: null,
      tlv1_orden_coord_y_destino: null,
      tlv1_orden_coord_z_destino: 1,
      tlv1_orden_matricula: null,
      tlv1_fin_orden_estado: 0,
      tlv1_fin_orden_resultado: null,
      tlv1_fin_orden_pasillo_destino: null,
      tlv1_fin_orden_coord_x_destino: null,
      tlv1_fin_orden_coord_y_destino: null,
      tlv1_fin_orden_coord_z_destino: 1,
      timestamp: new Date().toISOString(),
      
      // Campos mapeados para compatibilidad con el código existente
      modo: 1,
      ocupacion: 0,
      averia: 0,
      matricula: 12345,
      pasillo_actual: 3,
      x_actual: 5,
      y_actual: 10,
      z_actual: 2,
      estadoFinOrden: 0,
      resultadoFinOrden: 0
    };
    
    return tlv1Data;
  } catch (error) {
    console.error('API: Error al obtener datos del TLV1 desde MariaDB:', error);
    throw error;
  }
};

// Servicio para obtener el historial de estados del TLV1 desde MariaDB
export const getTLV1HistoryFromMariaDB = async (limit: number = 10): Promise<TLV1StatusData[]> => {
  try {
    console.log(`API: Solicitando historial del TLV1 desde MariaDB (limit: ${limit})...`);
    
    // Simulación de respuesta
    const history: TLV1StatusData[] = [];
    for (let i = 0; i < limit; i++) {
      history.push({
        id: i + 1,
        tlv1_modo: Math.floor(Math.random() * 3),
        tlv1_ocupacion: Math.floor(Math.random() * 2),
        tlv1_averia: Math.floor(Math.random() * 2),
        tlv1_reserva_3: null,
        tlv1_reserva_4: null,
        tlv1_reserva_5: null,
        tlv1_reserva_6: null,
        tlv1_reserva_7: null,
        tlv1_reserva_8: null,
        tlv1_reserva_9: null,
        tlv1_coord_x_actual: Math.floor(Math.random() * 20),
        tlv1_coord_y_actual: Math.floor(Math.random() * 15),
        tlv1_coord_z_actual: Math.floor(Math.random() * 5),
        tlv1_matricula_actual: 12345 + i,
        tlv1_tarea_actual: null,
        tlv1_uma_actual: null,
        tlv1_pasillo_actual: Math.floor(Math.random() * 12) + 1,
        tlv1_orden_tipo: 0,
        tlv1_orden_pasillo_origen: null,
        tlv1_orden_coord_x_origen: null,
        tlv1_orden_coord_y_origen: null,
        tlv1_orden_coord_z_origen: 0,
        tlv1_orden_pasillo_destino: null,
        tlv1_orden_coord_x_destino: null,
        tlv1_orden_coord_y_destino: null,
        tlv1_orden_coord_z_destino: 0,
        tlv1_orden_matricula: null,
        tlv1_fin_orden_estado: 0,
        tlv1_fin_orden_resultado: null,
        tlv1_fin_orden_pasillo_destino: null,
        tlv1_fin_orden_coord_x_destino: null,
        tlv1_fin_orden_coord_y_destino: null,
        tlv1_fin_orden_coord_z_destino: 0,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        
        // Campos mapeados para compatibilidad con el código existente
        modo: Math.floor(Math.random() * 3),
        ocupacion: Math.floor(Math.random() * 2),
        averia: Math.floor(Math.random() * 2),
        matricula: 12345 + i,
        pasillo_actual: Math.floor(Math.random() * 12) + 1,
        x_actual: Math.floor(Math.random() * 20),
        y_actual: Math.floor(Math.random() * 15),
        z_actual: Math.floor(Math.random() * 5),
        estadoFinOrden: 0,
        resultadoFinOrden: 0
      });
    }
    return history;
  } catch (error) {
    console.error('API: Error al obtener historial del TLV1 desde MariaDB:', error);
    throw error;
  }
};

// Servicio para obtener datos del TLV2 desde MariaDB
export const getTLV2StatusFromMariaDB = async (): Promise<TLV2StatusData> => {
  try {
    console.log('API: Solicitando datos del TLV2 desde MariaDB...');
    
    // Simulación de respuesta con la nueva estructura
    return {
      id: 2,
      tlv2_modo: 1,
      tlv2_ocupacion: 1,
      tlv2_averia: 0,
      tlv2_reserva_3: null,
      tlv2_reserva_4: null,
      tlv2_reserva_5: null,
      tlv2_reserva_6: null,
      tlv2_reserva_7: null,
      tlv2_reserva_8: null,
      tlv2_reserva_9: null,
      tlv2_coord_x_actual: 8,
      tlv2_coord_y_actual: 12,
      tlv2_coord_z_actual: 3,
      tlv2_matricula_actual: 54321,
      tlv2_tarea_actual: null,
      tlv2_uma_actual: null,
      tlv2_pasillo_actual: 7,
      tlv2_orden_tipo: 0,
      tlv2_orden_pasillo_origen: null,
      tlv2_orden_coord_x_origen: null,
      tlv2_orden_coord_y_origen: null,
      tlv2_orden_coord_z_origen: 0,
      tlv2_orden_pasillo_destino: null,
      tlv2_orden_coord_x_destino: null,
      tlv2_orden_coord_y_destino: null,
      tlv2_orden_coord_z_destino: 0,
      tlv2_orden_matricula: null,
      tlv2_fin_orden_estado: 0,
      tlv2_fin_orden_resultado: null,
      tlv2_fin_orden_pasillo_destino: null,
      tlv2_fin_orden_coord_x_destino: null,
      tlv2_fin_orden_coord_y_destino: null,
      tlv2_fin_orden_coord_z_destino: 0,
      timestamp: new Date().toISOString(),
      
      // Campos mapeados para compatibilidad con el código existente
      modo: 1,
      ocupacion: 1,
      averia: 0,
      matricula: 54321,
      pasillo_actual: 7,
      x_actual: 8,
      y_actual: 12,
      z_actual: 3,
      estadoFinOrden: 0,
      resultadoFinOrden: 0
    };
  } catch (error) {
    console.error('API: Error al obtener datos del TLV2 desde MariaDB:', error);
    throw error;
  }
};

// Servicio para obtener el historial de estados del TLV2 desde MariaDB
export const getTLV2HistoryFromMariaDB = async (limit: number = 10): Promise<TLV2StatusData[]> => {
  try {
    console.log(`API: Solicitando historial del TLV2 desde MariaDB (limit: ${limit})...`);
    
    // Simulación de respuesta
    const history: TLV2StatusData[] = [];
    for (let i = 0; i < limit; i++) {
      history.push({
        id: i + 1,
        tlv2_modo: Math.floor(Math.random() * 3),
        tlv2_ocupacion: Math.floor(Math.random() * 2),
        tlv2_averia: Math.floor(Math.random() * 2),
        tlv2_reserva_3: null,
        tlv2_reserva_4: null,
        tlv2_reserva_5: null,
        tlv2_reserva_6: null,
        tlv2_reserva_7: null,
        tlv2_reserva_8: null,
        tlv2_reserva_9: null,
        tlv2_coord_x_actual: Math.floor(Math.random() * 20),
        tlv2_coord_y_actual: Math.floor(Math.random() * 15),
        tlv2_coord_z_actual: Math.floor(Math.random() * 5),
        tlv2_matricula_actual: 54321 + i,
        tlv2_tarea_actual: null,
        tlv2_uma_actual: null,
        tlv2_pasillo_actual: Math.floor(Math.random() * 12) + 1,
        tlv2_orden_tipo: 0,
        tlv2_orden_pasillo_origen: null,
        tlv2_orden_coord_x_origen: null,
        tlv2_orden_coord_y_origen: null,
        tlv2_orden_coord_z_origen: 0,
        tlv2_orden_pasillo_destino: null,
        tlv2_orden_coord_x_destino: null,
        tlv2_orden_coord_y_destino: null,
        tlv2_orden_coord_z_destino: 0,
        tlv2_orden_matricula: null,
        tlv2_fin_orden_estado: 0,
        tlv2_fin_orden_resultado: null,
        tlv2_fin_orden_pasillo_destino: null,
        tlv2_fin_orden_coord_x_destino: null,
        tlv2_fin_orden_coord_y_destino: null,
        tlv2_fin_orden_coord_z_destino: 0,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        
        // Campos mapeados para compatibilidad con el código existente
        modo: Math.floor(Math.random() * 3),
        ocupacion: Math.floor(Math.random() * 2),
        averia: Math.floor(Math.random() * 2),
        matricula: 54321 + i,
        pasillo_actual: Math.floor(Math.random() * 12) + 1,
        x_actual: Math.floor(Math.random() * 20),
        y_actual: Math.floor(Math.random() * 15),
        z_actual: Math.floor(Math.random() * 5),
        estadoFinOrden: 0,
        resultadoFinOrden: 0
      });
    }
    return history;
  } catch (error) {
    console.error('API: Error al obtener historial del TLV2 desde MariaDB:', error);
    throw error;
  }
};

// Función para sincronizar el estado del CT en la base de datos a través de Node-RED
export const syncCTStatusInDB = async (ctStatus?: Partial<CTStatusData>): Promise<any> => {
  // Lista de rutas posibles a probar, en orden de prioridad
  const possibleRoutes = [
    NODE_RED_ROUTES.CT_SYNC,
    '/ct/status/sync',
    '/db112/sync'
  ];
  
  let lastError: any = null;
  
  // Probar cada ruta hasta encontrar una que funcione
  for (const route of possibleRoutes) {
    try {
      console.log(`API: Intentando sincronizar estado del CT en Node-RED usando ruta: ${route}`);
      const url = `${MARIADB_API_URL}${route}`;
      console.log('API: URL de sincronización:', url);
      
      // Añadir un parámetro de timestamp para evitar caché
      const urlWithTimestamp = `${url}?t=${Date.now()}`;
      
      const response = await axios.post(urlWithTimestamp, ctStatus || {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        timeout: 5000
      });
      
      // Si llegamos aquí, la ruta funcionó
      console.log(`API: Ruta ${route} funcionó correctamente para sincronización`);
      // Guardar la ruta que funcionó para futuras referencias
      localStorage.setItem('workingCTSyncRoute', route);
      
      return response.data;
    } catch (error) {
      console.error(`API: Error al intentar sincronizar usando ruta ${route}:`, error);
      lastError = error;
      // Continuar con la siguiente ruta
    }
  }
  
  // Si llegamos aquí, ninguna ruta funcionó
  console.error('API: Todas las rutas de sincronización fallaron. Último error:', lastError);
  throw new Error('No se pudo sincronizar el estado del CT con ninguna de las rutas disponibles');
};

// Servicio para obtener el estado actual del CT directamente de Node-RED
export const getCTStatusDirectFromNodeRED = async (): Promise<CTStatusData> => {
  // Lista de rutas posibles a probar, en orden de prioridad
  const possibleRoutes = [
    NODE_RED_ROUTES.CT_STATUS,
    '/ct/status',
    '/db112/status'
  ];
  
  let lastError: any = null;
  
  // Probar cada ruta hasta encontrar una que funcione
  for (const route of possibleRoutes) {
    try {
      console.log(`API: Intentando obtener estado del CT desde Node-RED usando ruta: ${route}`);
      const url = `${MARIADB_API_URL}${route}`;
      console.log('API: URL de consulta:', url);
      
      // Añadir un parámetro de timestamp para evitar caché
      const urlWithTimestamp = `${url}?t=${Date.now()}`;
      
      const response = await axios.get(urlWithTimestamp, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        timeout: 5000
      });
      
      // Si llegamos aquí, la ruta funcionó
      console.log(`API: Ruta ${route} funcionó correctamente`);
      // Guardar la ruta que funcionó para futuras referencias
      localStorage.setItem('workingCTStatusRoute', route);
      
      // Verificar que tenemos datos
      if (!response.data) {
        throw new Error('No se recibieron datos de Node-RED');
      }
      
      // Procesar la respuesta según su estructura
      let rawData: any;
      
      if (response.data.success === true && response.data.data) {
        // Formato esperado: { success: true, data: {...} }
        rawData = response.data.data;
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        // Si es un array, tomamos el primer elemento
        rawData = response.data[0];
      } else if (typeof response.data === 'object') {
        // Si es un objeto directo, lo usamos tal cual
        rawData = response.data;
      } else {
        throw new Error('Formato de respuesta no reconocido');
      }
      
      // Mapeo de campos para asegurar compatibilidad con la interfaz
      const mappedData: CTStatusData = {
        id: rawData.id || 1,
        timestamp: rawData.timestamp || new Date().toISOString(),
        
        // Estados principales
        ct_conectado: rawData.ct_conectado !== undefined ? rawData.ct_conectado : 0,
        ct_defecto: rawData.ct_defecto !== undefined ? rawData.ct_defecto : 0,
        ct_automatico: rawData.ct_automatico !== undefined ? rawData.ct_automatico : 0,
        ct_semiautomatico: rawData.ct_semiautomatico !== undefined ? rawData.ct_semiautomatico : 0,
        ct_manual: rawData.ct_manual !== undefined ? rawData.ct_manual : 0,
        ct_emergencia_puerta_armario: rawData.ct_emergencia_puerta_armario !== undefined ? rawData.ct_emergencia_puerta_armario : 0,
        ct_con_datos: rawData.ct_con_datos !== undefined ? rawData.ct_con_datos : 0,
        
        // Transferencias
        ct_autorizacion_transferencia_tc26: rawData.ct_autorizacion_transferencia_tc26 !== undefined ? rawData.ct_autorizacion_transferencia_tc26 : 0,
        ct_fin_transferencia_tc26: rawData.ct_fin_transferencia_tc26 !== undefined ? rawData.ct_fin_transferencia_tc26 : 0,
        ct_peticion_transferencia_tc30: rawData.ct_peticion_transferencia_tc30 !== undefined ? rawData.ct_peticion_transferencia_tc30 : 0,
        ct_acuse_orden_recibida: rawData.ct_acuse_orden_recibida !== undefined ? rawData.ct_acuse_orden_recibida : 0,
        
        // Matrículas y pasillos
        ct_matricula_paleta_entrada: rawData.ct_matricula_paleta_entrada !== undefined ? rawData.ct_matricula_paleta_entrada : 0,
        ct_matricula_paleta_salida: rawData.ct_matricula_paleta_salida !== undefined ? rawData.ct_matricula_paleta_salida : 0,
        ct_pasillo_destino: rawData.ct_pasillo_destino !== undefined ? rawData.ct_pasillo_destino : 0,
        ct_ciclo_trabajo: rawData.ct_ciclo_trabajo !== undefined ? rawData.ct_ciclo_trabajo : 0,
        ct_numero_pasillo_actual: rawData.ct_numero_pasillo_actual !== undefined ? rawData.ct_numero_pasillo_actual : 0,
        ct_estado_carro: rawData.ct_estado_carro !== undefined ? rawData.ct_estado_carro : 0,
        
        // Defectos
        ct_defecto_comunicacion: rawData.ct_defecto_comunicacion !== undefined ? rawData.ct_defecto_comunicacion : 0,
        ct_defecto_emergencia_armario: rawData.ct_defecto_emergencia_armario !== undefined ? rawData.ct_defecto_emergencia_armario : 0,
        ct_defecto_variador: rawData.ct_defecto_variador !== undefined ? rawData.ct_defecto_variador : 0,
        ct_defecto_motor_traslacion: rawData.ct_defecto_motor_traslacion !== undefined ? rawData.ct_defecto_motor_traslacion : 0,
        ct_defecto_motor_entrada: rawData.ct_defecto_motor_entrada !== undefined ? rawData.ct_defecto_motor_entrada : 0,
        ct_defecto_motor_salida: rawData.ct_defecto_motor_salida !== undefined ? rawData.ct_defecto_motor_salida : 0,
        ct_defecto_final_carrera_pasillo1: rawData.ct_defecto_final_carrera_pasillo1 !== undefined ? rawData.ct_defecto_final_carrera_pasillo1 : 0,
        ct_defecto_final_carrera_pasillo12: rawData.ct_defecto_final_carrera_pasillo12 !== undefined ? rawData.ct_defecto_final_carrera_pasillo12 : 0,
        ct_defecto_paleta_descentrada_entrada: rawData.ct_defecto_paleta_descentrada_entrada !== undefined ? rawData.ct_defecto_paleta_descentrada_entrada : 0,
        ct_defecto_paleta_descentrada_salida: rawData.ct_defecto_paleta_descentrada_salida !== undefined ? rawData.ct_defecto_paleta_descentrada_salida : 0,
        
        // Sensores y visualizaciones
        ct_vis_centraje_traslacion_adelante: rawData.ct_vis_centraje_traslacion_adelante !== undefined ? rawData.ct_vis_centraje_traslacion_adelante : 0,
        ct_vis_centraje_traslacion_atras: rawData.ct_vis_centraje_traslacion_atras !== undefined ? rawData.ct_vis_centraje_traslacion_atras : 0,
        ct_vis_presencia_delantera_paleta_entrada: rawData.ct_vis_presencia_delantera_paleta_entrada !== undefined ? rawData.ct_vis_presencia_delantera_paleta_entrada : 0,
        ct_vis_presencia_trasera_paleta_entrada: rawData.ct_vis_presencia_trasera_paleta_entrada !== undefined ? rawData.ct_vis_presencia_trasera_paleta_entrada : 0,
        ct_vis_presencia_delantera_paleta_salida: rawData.ct_vis_presencia_delantera_paleta_salida !== undefined ? rawData.ct_vis_presencia_delantera_paleta_salida : 0,
        ct_vis_presencia_trasera_paleta_salida: rawData.ct_vis_presencia_trasera_paleta_salida !== undefined ? rawData.ct_vis_presencia_trasera_paleta_salida : 0,
        
        // Campos adicionales que aparecen en la tabla pero no estaban en el mapeo original
        ct_vis_marcha_traslacion_adelante: rawData.ct_vis_marcha_traslacion_adelante !== undefined ? rawData.ct_vis_marcha_traslacion_adelante : 0,
        ct_vis_marcha_traslacion_atras: rawData.ct_vis_marcha_traslacion_atras !== undefined ? rawData.ct_vis_marcha_traslacion_atras : 0,
        ct_vis_motor_traslacion_parado: rawData.ct_vis_motor_traslacion_parado !== undefined ? rawData.ct_vis_motor_traslacion_parado : 0,
        ct_vis_centraje_transportador: rawData.ct_vis_centraje_transportador !== undefined ? rawData.ct_vis_centraje_transportador : 0,
        ct_vis_marcha_transportador_entrada: rawData.ct_vis_marcha_transportador_entrada !== undefined ? rawData.ct_vis_marcha_transportador_entrada : 0,
        ct_vis_marcha_transportador_salida: rawData.ct_vis_marcha_transportador_salida !== undefined ? rawData.ct_vis_marcha_transportador_salida : 0,
        ct_vis_defecto_traslacion: rawData.ct_vis_defecto_traslacion !== undefined ? rawData.ct_vis_defecto_traslacion : 0,
        ct_vis_defecto_transportador: rawData.ct_vis_defecto_transportador !== undefined ? rawData.ct_vis_defecto_transportador : 0
      };
      
      console.log('API: Datos mapeados para la interfaz:', JSON.stringify(mappedData, null, 2));
      return mappedData;
    } catch (error) {
      console.error(`API: Error al intentar ruta ${route}:`, error);
      lastError = error;
      // Continuar con la siguiente ruta
    }
  }
  
  // Si llegamos aquí, ninguna ruta funcionó
  console.error('API: Todas las rutas fallaron. Último error:', lastError);
  
  // En caso de error, devolver un objeto con datos de ejemplo
  console.error('API: Devolviendo datos de ejemplo debido al error');
  return {
    id: 1,
    timestamp: new Date().toISOString(),
    ct_conectado: 0,
    ct_defecto: 1,  // Indicar defecto ya que hubo un error
    ct_automatico: 0,
    ct_semiautomatico: 0,
    ct_manual: 0,
    ct_emergencia_puerta_armario: 0,
    ct_con_datos: 0,
    ct_estado_carro: 2  // Estado de avería
  } as CTStatusData;
};
