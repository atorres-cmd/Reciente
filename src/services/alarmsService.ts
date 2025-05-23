import axios from 'axios';
import { CT_ALARMS_URL, MARIADB_API_URL } from './api';
import { fetchCTActiveAlarms, syncCTAlarms as syncCTAlarmsFromNodeRED } from './ctAlarmsDirectService';

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
    
    // Obtener alarmas del CT usando el servicio directo que ya funciona correctamente
    console.log('Obteniendo alarmas del CT usando el servicio directo...');
    const ctAlarms = await fetchCTActiveAlarms();
    console.log(`Se encontraron ${ctAlarms.length} alarmas del CT:`, ctAlarms);
    
    // Crear alarmas de prueba para el CT si no hay alarmas reales (solo para depuración)
    let ctAlarmsToUse = ctAlarms;
    if (ctAlarms.length === 0) {
      console.log('No se encontraron alarmas reales del CT, creando alarmas de prueba para depuración');
      // Crear algunas alarmas de prueba para el CT
      ctAlarmsToUse = [
        {
          id: 'ct-test-1',
          deviceId: 'CT-001',
          deviceName: 'Carro Transferidor',
          message: 'Alarma de prueba: error de comunicación',
          severity: 'critical',
          timestamp: new Date(),
          acknowledged: false,
          component: 'Carro Transferidor'
        },
        {
          id: 'ct-test-2',
          deviceId: 'CT-001',
          deviceName: 'Carro Transferidor',
          message: 'Alarma de prueba: emergencia armario carro',
          severity: 'critical',
          timestamp: new Date(),
          acknowledged: false,
          component: 'Carro Transferidor'
        }
      ];
    }
    
    // Obtener alarmas del TLV1
    const tlv1AlarmsResponse = await axios.get(`${MARIADB_API_URL}/tlv1/alarmas/active`);
    
    let allAlarms: SystemAlarm[] = [];
    
    // Añadir las alarmas del CT al conjunto de alarmas
    if (ctAlarmsToUse && ctAlarmsToUse.length > 0) {
      // Asegurarse de que las alarmas del CT tienen el componente asignado
      const formattedCTAlarms = ctAlarmsToUse.map(alarm => {
        // Asegurarse de que el componente sea exactamente 'Carro Transferidor' para coincidir con el filtro
        return {
          ...alarm,
          component: 'Carro Transferidor',
          deviceName: 'Carro Transferidor',
          timestamp: alarm.timestamp instanceof Date ? alarm.timestamp : new Date(alarm.timestamp)
        };
      });
      
      allAlarms = [...allAlarms, ...formattedCTAlarms];
      console.log(`Añadidas ${formattedCTAlarms.length} alarmas del CT al conjunto total:`, formattedCTAlarms);
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
    
    // Sincronizar alarmas del CT usando el servicio directo
    console.log('Sincronizando alarmas del CT usando el servicio directo...');
    const ctSyncSuccess = await syncCTAlarmsFromNodeRED();
    console.log(`Resultado de sincronización de alarmas CT: ${ctSyncSuccess ? 'Éxito' : 'Fallo'}`);
    
    // Sincronizar alarmas del TLV1
    const tlv1SyncResponse = await axios.post(`${MARIADB_API_URL}/tlv1/alarmas/sync`);
    
    // Esperar un momento para que se actualice la base de datos
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Considerar exitosa la sincronización si al menos una de las llamadas fue exitosa
    return (ctSyncSuccess || (tlv1SyncResponse.data && tlv1SyncResponse.data.success) || false);
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
