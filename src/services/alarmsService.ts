import axios from 'axios';
import { CT_ALARMS_URL, MARIADB_API_URL } from './api';

// Interfaz para los datos de alarma recibidos de la API
interface AlarmApiData {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  acknowledged: boolean;
  // Campos adicionales con tipos específicos para evitar 'any'
  [key: string]: string | number | boolean | null | undefined;
}

// Interfaz para las alarmas del sistema
export interface SystemAlarm {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: Date;
  acknowledged: boolean;
  component?: string; // Componente al que pertenece la alarma (CT, TLV1, TLV2, etc.)
}

// Mapeo de componentes a nombres más amigables que coinciden con los filtros
const componentNames: Record<string, string> = {
  'CT-001': 'Carro Transferidor',
  'CT': 'Carro Transferidor',
  'TLV1': 'Transelevador T1',
  'TLV2': 'Transelevador T2',
  'PT': 'Puente',
  'EL': 'Elevador',
  'SYS': 'Sistema'
};

/**
 * Obtiene todas las alarmas activas del sistema
 * Obtiene las alarmas del CT y TLV1, y puede expandirse para incluir otros componentes
 */
export const fetchAllActiveAlarms = async (): Promise<SystemAlarm[]> => {
  try {
    console.log('Obteniendo todas las alarmas activas del sistema');
    
    // Obtener alarmas del CT
    const ctAlarmsResponse = await axios.get(`${CT_ALARMS_URL}/active`);
    
    // Obtener alarmas del TLV1
    const tlv1AlarmsResponse = await axios.get(`${MARIADB_API_URL}/tlv1/alarmas/active`);
    
    let allAlarms: SystemAlarm[] = [];
    
    // Procesar alarmas del CT si la respuesta es exitosa
    if (ctAlarmsResponse.data && ctAlarmsResponse.data.success && Array.isArray(ctAlarmsResponse.data.data)) {
      const ctAlarms = ctAlarmsResponse.data.data.map((alarm: AlarmApiData) => ({
        ...alarm,
        component: componentNames[alarm.deviceId] || 'Carro Transferidor',
        timestamp: new Date(alarm.timestamp)
      }));
      
      allAlarms = [...allAlarms, ...ctAlarms];
    }
    
    // Procesar alarmas del TLV1 si la respuesta es exitosa
    if (tlv1AlarmsResponse.data && tlv1AlarmsResponse.data.success && Array.isArray(tlv1AlarmsResponse.data.data)) {
      const tlv1Alarms = tlv1AlarmsResponse.data.data.map((alarm: AlarmApiData) => ({
        ...alarm,
        component: componentNames[alarm.deviceId] || 'Transelevador T1',
        timestamp: new Date(alarm.timestamp)
      }));
      
      allAlarms = [...allAlarms, ...tlv1Alarms];
    }
    
    // Aquí se pueden agregar más llamadas para obtener alarmas de otros componentes
    
    console.log('Total de alarmas activas obtenidas:', allAlarms.length);
    return allAlarms;
  } catch (error) {
    console.error('Error al obtener todas las alarmas activas:', error);
    return [];
  }
};

/**
 * Obtiene el historial de alarmas del sistema
 */
export const fetchAlarmsHistory = async (): Promise<SystemAlarm[]> => {
  try {
    console.log('Obteniendo historial de alarmas del sistema');
    
    // Obtener historial de alarmas del CT
    const ctAlarmsHistoryResponse = await axios.get(`${CT_ALARMS_URL}/history`);
    
    // Obtener historial de alarmas del TLV1
    const tlv1AlarmsHistoryResponse = await axios.get(`${MARIADB_API_URL}/tlv1/alarmas/history`);
    
    let alarmsHistory: SystemAlarm[] = [];
    
    // Procesar historial de alarmas del CT si la respuesta es exitosa
    if (ctAlarmsHistoryResponse.data && ctAlarmsHistoryResponse.data.success && Array.isArray(ctAlarmsHistoryResponse.data.data)) {
      const ctAlarmsHistory = ctAlarmsHistoryResponse.data.data.map((alarm: AlarmApiData) => ({
        ...alarm,
        component: componentNames[alarm.deviceId] || 'Carro Transferidor',
        timestamp: new Date(alarm.timestamp)
      }));
      
      alarmsHistory = [...alarmsHistory, ...ctAlarmsHistory];
    }
    
    // Procesar historial de alarmas del TLV1 si la respuesta es exitosa
    if (tlv1AlarmsHistoryResponse.data && tlv1AlarmsHistoryResponse.data.success && Array.isArray(tlv1AlarmsHistoryResponse.data.data)) {
      const tlv1AlarmsHistory = tlv1AlarmsHistoryResponse.data.data.map((alarm: AlarmApiData) => ({
        ...alarm,
        component: componentNames[alarm.deviceId] || 'Transelevador T1',
        timestamp: new Date(alarm.timestamp)
      }));
      
      alarmsHistory = [...alarmsHistory, ...tlv1AlarmsHistory];
    }
    
    // Aquí se pueden agregar más llamadas para obtener historial de alarmas de otros componentes
    
    console.log('Total de alarmas en historial obtenidas:', alarmsHistory.length);
    return alarmsHistory;
  } catch (error) {
    console.error('Error al obtener historial de alarmas:', error);
    return [];
  }
};

/**
 * Sincroniza todas las alarmas del sistema
 */
export const syncAllAlarms = async (): Promise<boolean> => {
  try {
    console.log('Sincronizando todas las alarmas del sistema');
    
    // Sincronizar alarmas del CT
    const ctSyncResponse = await axios.post(`${CT_ALARMS_URL}/sync`);
    
    // Sincronizar alarmas del TLV1
    const tlv1SyncResponse = await axios.post(`${MARIADB_API_URL}/tlv1/alarmas/sync`);
    
    // Esperar un momento para que se actualice la base de datos
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Considerar exitosa la sincronización si al menos una de las llamadas fue exitosa
    return (ctSyncResponse.data.success || tlv1SyncResponse.data.success || false);
  } catch (error) {
    console.error('Error al sincronizar todas las alarmas:', error);
    return false;
  }
};

/**
 * Reconoce una alarma específica
 */
export const acknowledgeAlarm = async (alarmId: string): Promise<boolean> => {
  try {
    // Esta es una implementación simulada, ya que aún no tenemos un endpoint real para reconocer alarmas
    console.log(`Reconociendo alarma con ID: ${alarmId}`);
    
    // Aquí iría la llamada real al endpoint para reconocer la alarma
    // const response = await axios.post(`${API_URL}/alarms/${alarmId}/acknowledge`);
    
    // Simulamos una respuesta exitosa
    return true;
  } catch (error) {
    console.error(`Error al reconocer alarma ${alarmId}:`, error);
    return false;
  }
};

/**
 * Resuelve una alarma específica
 */
export const resolveAlarm = async (alarmId: string): Promise<boolean> => {
  try {
    // Esta es una implementación simulada, ya que aún no tenemos un endpoint real para resolver alarmas
    console.log(`Resolviendo alarma con ID: ${alarmId}`);
    
    // Aquí iría la llamada real al endpoint para resolver la alarma
    // const response = await axios.post(`${API_URL}/alarms/${alarmId}/resolve`);
    
    // Simulamos una respuesta exitosa
    return true;
  } catch (error) {
    console.error(`Error al resolver alarma ${alarmId}:`, error);
    return false;
  }
};
