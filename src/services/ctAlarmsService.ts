import axios from 'axios';
import { CT_ALARMS_URL } from './api';

/**
 * Servicio para obtener las alarmas activas del Carro Transferidor (CT)
 */
export const fetchCTActiveAlarms = async () => {
  try {
    console.log('Obteniendo alarmas activas del CT desde:', `${CT_ALARMS_URL}/active`);
    const response = await axios.get(`${CT_ALARMS_URL}/active`);
    
    console.log('Respuesta de alarmas CT:', response.data);
    
    // Si la respuesta es exitosa y contiene datos
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return { success: true, data: response.data.data }; // Devolver solo el array de datos
    }
    
    console.warn('Formato de respuesta incorrecto o no hay alarmas activas');
    return { success: true, data: [] }; // Devolver un array vacío si no hay alarmas activas
  } catch (error) {
    console.error('Error al obtener alarmas activas del CT:', error);
    return { success: false, data: [], error: error };
  }
};

/**
 * Servicio para forzar la sincronización de alarmas del CT
 */
export const syncCTAlarms = async (): Promise<boolean> => {
  try {
    console.log('Sincronizando alarmas del CT desde:', `${CT_ALARMS_URL}/sync`);
    const response = await axios.post(`${CT_ALARMS_URL}/sync`);
    console.log('Respuesta de sincronización:', response.data);
    
    // Esperar un momento para que se actualice la base de datos
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return response.data.success || false;
  } catch (error) {
    console.error('Error al sincronizar alarmas del CT:', error);
    return false;
  }
};
