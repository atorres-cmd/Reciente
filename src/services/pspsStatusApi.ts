import { getPSPsStatusDirectFromNodeRED, syncPSPsStatusInDB, PSPsStatusData, PSPsApiResponse } from './api';

/**
 * Obtiene el estado actual de las mesas de salida (PSPs) desde Node-RED
 * @returns Datos del estado de las mesas de salida
 */
export const getPSPsStatusFromNodeRED = async (): Promise<PSPsStatusData> => {
  try {
    const response = await getPSPsStatusDirectFromNodeRED();
    console.log('Respuesta completa de PSPs desde Node-RED:', response);
    
    // Verificar si la respuesta tiene la estructura esperada
    if (response.success && response.data) {
      console.log('Datos de PSPs extraídos de la respuesta:', response.data);
      return response.data;
    } else {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
  } catch (error) {
    console.error('Error al obtener datos de PSPs desde Node-RED:', error);
    // En caso de error, devolvemos un objeto con valores predeterminados
    return {
      id: 1,
      mesa_salida_uno: 0,
      mesa_salida_dos: 0,
      mesa_salida_tres: 0,
      mesa_salida_cuatro: 0,
      mesa_salida_cinco: 0,
      mesa_salida_seis: 0,
      mesa_salida_siete: 0,
      mesa_salida_ocho: 0,
      mesa_salida_nueve: 0,
      mesa_salida_diez: 0,
      mesa_salida_once: 0,
      mesa_salida_doce: 0,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Sincroniza el estado de las mesas de salida (PSPs) en la base de datos
 * @returns Datos actualizados del estado de las mesas de salida
 */
export const syncPSPsStatus = async (): Promise<PSPsStatusData> => {
  try {
    const response = await syncPSPsStatusInDB();
    console.log('Respuesta completa de sincronización de PSPs:', response);
    
    // Verificar si la respuesta tiene la estructura esperada
    if (response.success && response.data) {
      console.log('Datos de PSPs sincronizados:', response.data);
      return response.data;
    } else {
      throw new Error('La respuesta de sincronización no tiene la estructura esperada');
    }
  } catch (error) {
    console.error('Error al sincronizar estado de PSPs en la base de datos:', error);
    throw error;
  }
};
