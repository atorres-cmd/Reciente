import { getPEPsStatusDirectFromNodeRED, syncPEPsStatusInDB, PEPsStatusData, PEPsApiResponse } from './api';

/**
 * Obtiene el estado actual de las mesas de entrada (PEPs) desde Node-RED
 * @returns Datos del estado de las mesas de entrada
 */
export const getPEPsStatusFromNodeRED = async (): Promise<PEPsStatusData> => {
  try {
    const response = await getPEPsStatusDirectFromNodeRED();
    console.log('Respuesta completa de PEPs desde Node-RED:', response);
    
    // Verificar si la respuesta tiene la estructura esperada
    if (response.success && response.data) {
      console.log('Datos de PEPs extraídos de la respuesta:', response.data);
      return response.data;
    } else {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
  } catch (error) {
    console.error('Error al obtener datos de PEPs desde Node-RED:', error);
    // En caso de error, devolvemos un objeto con valores predeterminados
    return {
      id: 1,
      mesa_entrada_uno: 0,
      mesa_entrada_dos: 0,
      mesa_entrada_tres: 0,
      mesa_entrada_cuatro: 0,
      mesa_entrada_cinco: 0,
      mesa_entrada_seis: 0,
      mesa_entrada_siete: 0,
      mesa_entrada_ocho: 0,
      mesa_entrada_nueve: 0,
      mesa_entrada_diez: 0,
      mesa_entrada_once: 0,
      mesa_entrada_doce: 0,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Sincroniza el estado de las mesas de entrada (PEPs) en la base de datos
 * @returns Datos actualizados del estado de las mesas de entrada
 */
export const syncPEPsStatus = async (): Promise<PEPsStatusData> => {
  try {
    const response = await syncPEPsStatusInDB();
    console.log('Respuesta completa de sincronización de PEPs:', response);
    
    // Verificar si la respuesta tiene la estructura esperada
    if (response.success && response.data) {
      console.log('Datos de PEPs sincronizados:', response.data);
      return response.data;
    } else {
      throw new Error('La respuesta de sincronización no tiene la estructura esperada');
    }
  } catch (error) {
    console.error('Error al sincronizar estado de PEPs en la base de datos:', error);
    throw error;
  }
};
