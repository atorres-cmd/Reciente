import axios from 'axios';

// URL base para las alarmas del CT
// Obtener el hostname actual (dominio o IP)
const currentHost = window.location.hostname;

// Determinar la URL base según el hostname
let apiBaseUrl;
if (currentHost === 'localhost' || currentHost.match(/^192\.168\./)) {
  apiBaseUrl = `http://${currentHost}:1880/api`;
} else {
  apiBaseUrl = 'http://localhost:1880/api';
}

// URL para las alarmas del CT
const CT_ALARMS_URL = `${apiBaseUrl}/ct/alarmas`;
console.log('URL configurada para alarmas CT:', CT_ALARMS_URL);

// Interfaz para los datos de alarmas del CT
export interface CTAlarmasData {
  success: boolean;
  data: any[];
}

// Interfaz para las alarmas del Carro Transferidor (CT)
export interface CTAlarm {
  id?: number;
  timestamp?: Date;
  field: string;
  message: string;
  severity: string;
  active: boolean;
}

/**
 * Función para obtener las alarmas activas del Carro Transferidor (CT)
 */
export const getCTAlarmasFromMariaDB = async (): Promise<CTAlarmasData> => {
  try {
    // URL directa al endpoint de alarmas del CT
    const url = CT_ALARMS_URL;
    console.log('Obteniendo alarmas del CT desde:', url);
    
    // Realizar la petición a Node-RED
    const response = await axios.get(url, {
      // Evitar caché del navegador
      params: {
        _t: new Date().getTime()
      }
    });
    
    console.log('Respuesta completa de alarmas CT:', response);
    console.log('Datos de alarmas CT:', response.data);
    
    // Procesar alarmas activas (siguiendo el enfoque de CTAlarmsTest)
    if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
      const alarmData = response.data.data[0];
      const alarms: CTAlarm[] = [];
      
      // Buscar campos que comiencen con ct_defecto_
      for (const [field, value] of Object.entries(alarmData)) {
        if (field.startsWith('ct_defecto_')) {
          // Determinar si la alarma está activa
          const isActive = value === 1 || value === true || value === '1' || value === 'true';
          
          // Crear un nombre legible para la alarma
          const readableName = field.replace('ct_defecto_', '').replace(/_/g, ' ');
          
          // Añadir la alarma a la lista (activa o no)
          alarms.push({
            field,
            message: `Alarma: ${readableName}`,
            severity: 'warning',
            active: isActive,
            timestamp: new Date()
          });
          
          // Registrar las alarmas activas para depuración
          if (isActive) {
            console.log(`Alarma ACTIVA detectada: ${field} = ${value}`);
          }
        }
      }
      
      console.log(`Alarmas procesadas: ${alarms.length} total, ${alarms.filter(a => a.active).length} activas`);
      return {
        success: true,
        data: alarms
      };
    }
    
    console.warn('Formato de respuesta incorrecto o no hay alarmas activas');
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error al obtener alarmas activas del CT:', error);
    return { success: false, data: [] };
  }
};

/**
 * Función para sincronizar las alarmas del Carro Transferidor (CT) con la base de datos
 */
export const syncCTAlarmasInDB = async (): Promise<CTAlarmasData> => {
  try {
    // URL directa al endpoint de sincronización de alarmas del CT
    const url = `${CT_ALARMS_URL}/sync`;
    console.log('Sincronizando alarmas del CT con la base de datos:', url);
    
    // Realizar la petición a Node-RED
    const response = await axios.get(url, {
      // Evitar caché del navegador
      params: {
        _t: new Date().getTime()
      }
    });
    
    console.log('Respuesta completa de sincronización de alarmas CT:', response);
    console.log('Datos de sincronización de alarmas CT:', response.data);
    
    // Simplemente devolvemos éxito si la sincronización fue exitosa
    if (response.data && response.data.success) {
      console.log('Sincronización de alarmas CT completada con éxito');
      return { 
        success: true, 
        data: [] // No necesitamos devolver datos específicos para la sincronización
      };
    }
    
    console.warn('Error en la sincronización de alarmas CT');
    return { success: false, data: [] };
  } catch (error) {
    console.error('Error al sincronizar alarmas del CT con la base de datos:', error);
    return { success: false, data: [] };
  }
};
