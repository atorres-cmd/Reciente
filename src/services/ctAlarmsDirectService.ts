import axios from 'axios';

// Interfaz para las alarmas del sistema
export interface SystemAlarm {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: Date;
  acknowledged: boolean;
  component?: string;
}

/**
 * Obtiene todas las alarmas activas del CT directamente desde Node-RED
 * Utiliza la misma lógica que el componente CTAlarmsSimple que funciona correctamente
 */
export const fetchCTActiveAlarms = async (): Promise<SystemAlarm[]> => {
  try {
    console.log('Obteniendo alarmas activas del CT directamente');
    
    // URL directa al endpoint de alarmas del CT (misma que usa CTAlarmsSimple)
    const currentHost = window.location.hostname;
    const apiBaseUrl = currentHost === 'localhost' || currentHost.match(/^192\.168\./) 
      ? `http://${currentHost}:1880/api` 
      : 'http://localhost:1880/api';
    const url = `${apiBaseUrl}/ct/alarmas`;
    
    console.log('Realizando petición directa a:', url);
    const response = await axios.get(url);
    
    console.log('Respuesta completa de alarmas CT:', response.data);
    
    // Verificar si la respuesta es válida
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('No se recibieron datos válidos de alarmas del CT');
      return [];
    }
    
    // Procesar las alarmas del CT
    const alarmData = response.data.data;
    const alarms: SystemAlarm[] = [];
    
    // Función para verificar si una alarma está activa (misma que CTAlarmsSimple)
    const isAlarmActive = (value: any) => {
      return value === 1 || value === true || value === '1' || value === 'true';
    };
    
    // Lista exacta de campos de alarma basada en la estructura de la tabla
    const alarmFields = [
      'ct_defecto_error_comunicacion',
      'ct_defecto_emergencia_armario_carro',
      'ct_defecto_anomalia_variador',
      'ct_defecto_anomalia_motor_traslacion',
      'ct_defecto_anomalia_motor_entrada',
      'ct_defecto_anomalia_motor_salida',
      'ct_defecto_final_carrera_pasillo1',
      'ct_defecto_final_carrera_pasillo12',
      'ct_defecto_paleta_descentrada_entrada',
      'ct_defecto_paleta_descentrada_salida',
      'ct_defecto_limite_superior_lectura_encoder',
      'ct_defecto_limite_inferior_lectura_encoder',
      'ct_defecto_tiempo_transferencia_mesa_salida',
      'ct_defecto_telemetro',
      'ct_defecto_tiempo_entrada',
      'ct_defecto_tiempo_salida',
      'ct_defecto_paleta_entrada_sin_codigo',
      'ct_defecto_paleta_salida_sin_codigo'
    ];
    
    // Verificar cada campo de alarma
    for (const field of alarmFields) {
      const fieldValue = alarmData[field];
      console.log(`Verificando campo ${field}: valor = ${fieldValue}, tipo = ${typeof fieldValue}`);
      
      if (field in alarmData && isAlarmActive(fieldValue)) {
        // Crear un nombre legible para la alarma
        const readableName = field.replace('ct_defecto_', '').replace(/_/g, ' ');
        console.log(`Alarma activa encontrada: ${field} - ${readableName}`);
        
        // Crear un objeto de alarma para este campo
        alarms.push({
          id: `ct-${field}`,
          deviceId: 'CT-001',
          deviceName: 'Carro Transferidor',
          message: `Alarma: ${readableName}`,
          severity: 'critical',
          timestamp: new Date(),
          acknowledged: false,
          component: 'Carro Transferidor'
        });
      }
    }
    
    console.log(`Total de alarmas del CT procesadas: ${alarms.length}`);
    return alarms;
  } catch (error) {
    console.error('Error al obtener alarmas del CT directamente:', error);
    return [];
  }
};

/**
 * Sincroniza las alarmas del CT con la base de datos
 */
export const syncCTAlarms = async (): Promise<boolean> => {
  try {
    // URL directa al endpoint de sincronización de alarmas del CT
    const currentHost = window.location.hostname;
    const apiBaseUrl = currentHost === 'localhost' || currentHost.match(/^192\.168\./) 
      ? `http://${currentHost}:1880/api` 
      : 'http://localhost:1880/api';
    const url = `${apiBaseUrl}/ct/alarmas/sync`;
    
    console.log('Sincronizando alarmas del CT:', url);
    const response = await axios.get(url);
    
    return response.data && response.data.success;
  } catch (error) {
    console.error('Error al sincronizar alarmas del CT:', error);
    return false;
  }
};
