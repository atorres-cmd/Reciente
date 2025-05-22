import { MARIADB_API_URL, TLV1StatusData } from './api';
import axios from 'axios';

// URLs para los endpoints de TLV1 en Node-RED
const TLV1_STATUS_URL = `${MARIADB_API_URL}/tlv1/status`;
const TLV1_STATUS_SYNC_URL = `${MARIADB_API_URL}/tlv1/status/sync`;

// Exportar las URLs para usarlas en otros componentes
export { TLV1_STATUS_URL, TLV1_STATUS_SYNC_URL };

// Función para obtener el estado del TLV1 directamente desde Node-RED
export const getTLV1StatusDirectFromNodeRED = async (): Promise<TLV1StatusData | null> => {
  try {
    console.log('Solicitando datos del TLV1 desde Node-RED:', TLV1_STATUS_URL);
    const response = await axios.get(TLV1_STATUS_URL);
    
    // Manejar diferentes formatos de respuesta posibles de Node-RED
    let apiData;
    
    // Verificar si la respuesta es un array (como parece ser el caso en la consulta manual)
    if (Array.isArray(response.data) && response.data.length > 0) {
      // Si es un array, tomamos el primer elemento
      apiData = response.data[0];
      console.log('Respuesta de Node-RED es un array, tomando el primer elemento:', apiData);
    } else if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      // Formato: { success: true, data: {...} }
      apiData = response.data.data;
    } else if (response.data && typeof response.data === 'object') {
      // Formato: directamente el objeto de datos
      apiData = response.data;
    } else {
      console.error('Formato de respuesta no reconocido para el TLV1:', response.data);
      throw new Error('Formato de respuesta no reconocido para el TLV1');
    }
    
    console.log('Datos del TLV1 desde Node-RED:', apiData);
    
    // Mapear los campos según los nombres exactos que vemos en la tabla
    const convertedData: TLV1StatusData = {
      id: apiData.id ?? 0,
      tlv1_modo: apiData.tlv1_modo ?? 0,
      tlv1_ocupacion: apiData.tlv1_ocupacion ?? 0,
      tlv1_averia: apiData.tlv1_averia ?? 0,
      tlv1_reserva_3: apiData.tlv1_reserva_3 ?? null,
      tlv1_reserva_4: apiData.tlv1_reserva_4 ?? null,
      tlv1_reserva_5: apiData.tlv1_reserva_5 ?? null,
      tlv1_reserva_6: apiData.tlv1_reserva_6 ?? null,
      tlv1_reserva_7: apiData.tlv1_reserva_7 ?? null,
      tlv1_reserva_8: apiData.tlv1_reserva_8 ?? null,
      tlv1_reserva_9: apiData.tlv1_reserva_9 ?? null,
      tlv1_coord_x_actual: apiData.tlv1_coord_x_actual ?? null,
      tlv1_coord_y_actual: apiData.tlv1_coord_y_actual ?? null,
      tlv1_coord_z_actual: apiData.tlv1_coord_z_actual ?? null,
      tlv1_matricula_actual: apiData.tlv1_matricula_actual ?? null,
      tlv1_tarea_actual: apiData.tlv1_tarea_actual ?? null,
      tlv1_uma_actual: apiData.tlv1_uma_actual ?? null,
      tlv1_pasillo_actual: apiData.tlv1_pasillo_actual ?? null,
      tlv1_orden_tipo: apiData.tlv1_orden_tipo ?? 0,
      tlv1_orden_pasillo_origen: apiData.tlv1_orden_pasillo_origen ?? null,
      tlv1_orden_coord_x_origen: apiData.tlv1_orden_coord_x_origen ?? null,
      tlv1_orden_coord_y_origen: apiData.tlv1_orden_coord_y_origen ?? null,
      tlv1_orden_coord_z_origen: apiData.tlv1_orden_coord_z_origen ?? 0,
      tlv1_orden_pasillo_destino: apiData.tlv1_orden_pasillo_destino ?? null,
      tlv1_orden_coord_x_destino: apiData.tlv1_orden_coord_x_destino ?? null,
      tlv1_orden_coord_y_destino: apiData.tlv1_orden_coord_y_destino ?? null,
      tlv1_orden_coord_z_destino: apiData.tlv1_orden_coord_z_destino ?? 0,
      tlv1_orden_matricula: apiData.tlv1_orden_matricula ?? null,
      tlv1_fin_orden_estado: apiData.tlv1_fin_orden_estado ?? 0,
      tlv1_fin_orden_resultado: apiData.tlv1_fin_orden_resultado ?? null,
      tlv1_fin_orden_pasillo_destino: apiData.tlv1_fin_orden_pasillo_destino ?? null,
      tlv1_fin_orden_coord_x_destino: apiData.tlv1_fin_orden_coord_x_destino ?? null,
      tlv1_fin_orden_coord_y_destino: apiData.tlv1_fin_orden_coord_y_destino ?? null,
      tlv1_fin_orden_coord_z_destino: apiData.tlv1_fin_orden_coord_z_destino ?? 0,
      timestamp: apiData.timestamp ?? new Date().toISOString(),
      
      // Campos mapeados para compatibilidad con el código existente
      modo: apiData.tlv1_modo ?? 0,
      ocupacion: apiData.tlv1_ocupacion ?? 0,
      averia: apiData.tlv1_averia ?? 0,
      matricula: apiData.tlv1_matricula_actual ?? 0,
      pasillo_actual: apiData.tlv1_pasillo_actual ?? 0,
      x_actual: apiData.tlv1_coord_x_actual ?? 0,
      y_actual: apiData.tlv1_coord_y_actual ?? 0,
      z_actual: apiData.tlv1_coord_z_actual ?? 0,
      estadoFinOrden: apiData.tlv1_fin_orden_estado ?? 0,
      resultadoFinOrden: apiData.tlv1_fin_orden_resultado ?? 0
    };
    
    return convertedData;
  } catch (error) {
    console.error('Error al obtener datos del TLV1 desde Node-RED:', error);
    return null;
  }
};

// Función para obtener los datos del TLV1 desde MariaDB (en realidad desde Node-RED)
export const getTLV1StatusFromMariaDB = async (): Promise<TLV1StatusData> => {
  try {
    console.log('Obteniendo datos del TLV1 directamente desde Node-RED');
    
    // Usamos la función que ya hemos implementado
    const response = await getTLV1StatusDirectFromNodeRED();
    console.log('Respuesta de Node-RED para TLV1:', response);
    
    if (!response) {
      throw new Error('No se pudo obtener datos del TLV1 desde Node-RED');
    }
    
    return response;
  } catch (error) {
    console.error('Error al obtener datos del TLV1:', error);
    // En caso de error, devolvemos un objeto con valores por defecto
    return {
      id: 0,
      tlv1_modo: 0,
      tlv1_ocupacion: 0,
      tlv1_averia: 0,
      tlv1_reserva_3: null,
      tlv1_reserva_4: null,
      tlv1_reserva_5: null,
      tlv1_reserva_6: null,
      tlv1_reserva_7: null,
      tlv1_reserva_8: null,
      tlv1_reserva_9: null,
      tlv1_coord_x_actual: null,
      tlv1_coord_y_actual: null,
      tlv1_coord_z_actual: null,
      tlv1_matricula_actual: null,
      tlv1_tarea_actual: null,
      tlv1_uma_actual: null,
      tlv1_pasillo_actual: null,
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
      timestamp: new Date().toISOString(),
      
      // Campos mapeados para compatibilidad con el código existente
      modo: 0,
      ocupacion: 0,
      averia: 0,
      matricula: 0,
      pasillo_actual: 0,
      x_actual: 0,
      y_actual: 0,
      z_actual: 0,
      estadoFinOrden: 0,
      resultadoFinOrden: 0
    };
  }
};

// Función para sincronizar el estado del TLV1 en la base de datos a través de Node-RED
export const syncTLV1StatusInDB = async (tlv1Status?: Partial<TLV1StatusData>): Promise<any> => {
  // Lista de rutas posibles a probar, en orden de prioridad
  const possibleRoutes = [
    '/tlv1/status/sync',
    TLV1_STATUS_SYNC_URL
  ];
  
  let lastError: any = null;
  
  // Probar cada ruta hasta encontrar una que funcione
  for (const route of possibleRoutes) {
    try {
      console.log(`Intentando sincronizar estado del TLV1 en Node-RED usando ruta: ${route}`);
      
      // Construir la URL completa
      const fullUrl = route.startsWith('http') ? route : `${MARIADB_API_URL}${route}`;
      console.log('URL completa para sincronización de TLV1:', fullUrl);
      
      // Realizar la petición POST con los datos del TLV1
      const response = await axios.post(fullUrl, tlv1Status || {});
      console.log('Respuesta de sincronización de TLV1:', response.data);
      
      // Guardar la ruta que funcionó para futuras referencias
      localStorage.setItem('workingTLV1SyncRoute', route);
      
      return response.data;
    } catch (error) {
      console.error(`Error al intentar sincronizar TLV1 usando ruta ${route}:`, error);
      lastError = error;
      // Continuar con la siguiente ruta
    }
  }
  
  // Si llegamos aquí, ninguna ruta funcionó
  console.error('Todas las rutas de sincronización de TLV1 fallaron. Último error:', lastError);
  throw new Error('No se pudo sincronizar el estado del TLV1 con ninguna de las rutas disponibles');
};
