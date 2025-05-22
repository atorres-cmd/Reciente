import axios from 'axios';
import { CT_ALARMS_URL } from './api';

// Interfaz para las alarmas del Carro Transferidor (CT)
export interface CTAlarm {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: Date;
  acknowledged: boolean;
}

export interface CTAlarmasData {
  success: boolean;
  data: CTAlarm[];
}

/**
 * Función para obtener las alarmas activas del Carro Transferidor (CT)
 */
export const getCTAlarmasFromMariaDB = async (): Promise<CTAlarmasData> => {
  try {
    console.log('Obteniendo alarmas del CT desde:', `${CT_ALARMS_URL}/active`);
    const response = await axios.get(`${CT_ALARMS_URL}/active`);
    
    console.log('Respuesta de alarmas CT:', response.data);
    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      // Convertir las fechas de string a objetos Date
      const alarmsWithDates = response.data.data.map((alarm: any) => ({
        ...alarm,
        timestamp: new Date(alarm.timestamp)
      }));
      
      return {
        success: true,
        data: alarmsWithDates
      };
    }
    
    console.warn('Formato de respuesta incorrecto o no hay alarmas activas');
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error al obtener alarmas activas del CT:', error);
    return { success: false, data: [] };
  }
};
