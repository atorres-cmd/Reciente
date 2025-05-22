import axios from 'axios';
import { MARIADB_API_URL, PTStatusData } from './api';

// Definir las rutas de Node-RED para el PT (Puente de Transbordo)
export const PT_NODE_RED_ROUTES = {
  PT_STATUS: '/pt/status',
  PT_STATUS_SYNC: '/pt/status/sync'
};

// Servicio para obtener el estado actual del PT (Puente de Transbordo) directamente de Node-RED
export const getPTStatusDirectFromNodeRED = async (): Promise<PTStatusData> => {
  // Lista de rutas posibles a probar, en orden de prioridad
  const possibleRoutes = [
    PT_NODE_RED_ROUTES.PT_STATUS, // Ruta configurada en PT_NODE_RED_ROUTES
    '/pt/status',                  // Ruta sin el prefijo /api
  ];
  
  let lastError: any = null;
  
  // Probar cada ruta hasta encontrar una que funcione
  for (const route of possibleRoutes) {
    try {
      console.log(`PTStatusApi: Intentando obtener estado del PT desde Node-RED usando ruta: ${route}`);
      const url = `${MARIADB_API_URL}${route}`;
      console.log('PTStatusApi: URL de consulta:', url);
      
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
      console.log(`PTStatusApi: Ruta ${route} funcionó correctamente`);
      // Guardar la ruta que funcionó para futuras referencias
      localStorage.setItem('workingPTStatusRoute', route);
      
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
      const mappedData: PTStatusData = {
        id: rawData.id || 1,
        timestamp: rawData.timestamp || new Date().toISOString(),
        pt_ocupacion: rawData.pt_ocupacion !== undefined ? rawData.pt_ocupacion : 0,
        pt_estado: rawData.pt_estado !== undefined ? rawData.pt_estado : 0,
        pt_situacion: rawData.pt_situacion !== undefined ? rawData.pt_situacion : 0,
        pt_posicion: rawData.pt_posicion !== undefined ? rawData.pt_posicion : ''
      };
      
      console.log('PTStatusApi: Datos mapeados para la interfaz:', JSON.stringify(mappedData, null, 2));
      return mappedData;
    } catch (error) {
      console.error(`PTStatusApi: Error al intentar ruta ${route}:`, error);
      lastError = error;
      // Continuar con la siguiente ruta
    }
  }
  
  // Si llegamos aquí, ninguna ruta funcionó
  console.error('PTStatusApi: Todas las rutas fallaron. Último error:', lastError);
  
  // En caso de error, devolver un objeto con datos de ejemplo
  console.error('PTStatusApi: Devolviendo datos de ejemplo debido al error');
  return {
    id: 1,
    timestamp: new Date().toISOString(),
    pt_ocupacion: 0,
    pt_estado: 0,
    pt_situacion: 0,
    pt_posicion: 'ERROR'
  };
};

// Servicio para sincronizar el estado del PT (Puente de Transbordo) directamente en la base de datos
export const syncPTStatusInDB = async (ptStatus: Partial<PTStatusData> = {}): Promise<void> => {
  try {
    console.log('PTStatusApi: Solicitando sincronización de datos del PT...');
    
    // Construir la URL para la sincronización
    const syncUrl = `${MARIADB_API_URL}${PT_NODE_RED_ROUTES.PT_STATUS_SYNC}`;
    console.log('PTStatusApi: URL para sincronización del PT:', syncUrl);
    
    // Enviar la solicitud POST con los datos a sincronizar
    const response = await axios.post(syncUrl, ptStatus, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 5000
    });
    
    console.log('PTStatusApi: Respuesta de sincronización del PT:', response.status, response.statusText);
    console.log('PTStatusApi: Datos de respuesta:', response.data);
    
    // No devolvemos nada, solo verificamos que la operación fue exitosa
    if (response.status !== 200) {
      throw new Error(`Error en la sincronización: ${response.status} ${response.statusText}`);
    }
    
    return;
  } catch (error) {
    console.error('PTStatusApi: Error al sincronizar datos del PT:', error);
    
    // Mostrar más detalles sobre el error para facilitar la depuración
    if (axios.isAxiosError(error)) {
      console.error('PTStatusApi: Detalles del error de Axios:');
      console.error('- Mensaje:', error.message);
      console.error('- Código:', error.code);
      console.error('- URL:', error.config?.url);
      
      if (error.response) {
        console.error('- Código de estado:', error.response.status);
        console.error('- Datos de respuesta:', error.response.data);
      }
    }
    
    throw error;
  }
};

// Función para obtener una descripción textual del estado del PT (Puente de Transbordo)
export const getPTEstadoText = (estado?: number): string => {
  if (estado === undefined) return 'Desconocido';
  switch (estado) {
    case 0: return 'Normal';
    case 1: return 'Alarma';
    case 2: return 'Error';
    default: return 'Desconocido';
  }
};

// Función para obtener el color según el estado del PT (Puente de Transbordo)
export const getPTEstadoColor = (estado?: number): string => {
  if (estado === undefined) return 'gray';
  switch (estado) {
    case 0: return 'green';
    case 1: return 'yellow';
    case 2: return 'red';
    default: return 'gray';
  }
};

// Función para obtener una descripción textual de la ocupación del PT (Puente de Transbordo)
export const getPTOcupacionText = (ocupacion?: number): string => {
  if (ocupacion === undefined) return 'Desconocido';
  switch (ocupacion) {
    case 0: return 'Libre';
    case 1: return 'Ocupado';
    default: return 'Desconocido';
  }
};

// Función para obtener el color según la ocupación del PT (Puente de Transbordo)
export const getPTOcupacionColor = (ocupacion?: number): string => {
  if (ocupacion === undefined) return 'gray';
  switch (ocupacion) {
    case 0: return 'green';
    case 1: return 'blue';
    default: return 'gray';
  }
};

// Función para obtener una descripción textual de la situación del PT (Puente de Transbordo)
export const getPTSituacionText = (situacion?: number): string => {
  if (situacion === undefined) return 'Desconocido';
  switch (situacion) {
    case 0: return 'Reposo';
    case 1: return 'En operación';
    case 2: return 'Esperando';
    default: return 'Desconocido';
  }
};
