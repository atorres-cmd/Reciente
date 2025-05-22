import axios from 'axios';
import { MARIADB_API_URL, getCTStatusDirectFromNodeRED as getCTStatusDirectFromNodeREDOriginal, syncCTStatusInDB as syncCTStatusInNodeRED } from './api';

// Re-exportar la función getCTStatusDirectFromNodeRED para usarla en otros componentes
export const getCTStatusDirectFromNodeRED = getCTStatusDirectFromNodeREDOriginal;

// Interfaz para los datos del Carro Transferidor (CT) de MariaDB
// Hacemos que los campos sean opcionales para compatibilidad con la interfaz de api.ts
export interface CTStatusData {
  id?: number;
  timestamp?: string;
  ct_conectado?: number;
  ct_defecto?: number;
  ct_automatico?: number;
  ct_semiautomatico?: number;
  ct_manual?: number;
  ct_emergencia_puerta_armario?: number;
  ct_con_datos?: number;
  ct_autorizacion_transferencia_tc26?: number;
  ct_fin_transferencia_tc26?: number;
  ct_peticion_transferencia_tc30?: number;
  ct_acuse_orden_recibida?: number;
  ct_matricula_paleta_entrada?: number;
  ct_matricula_paleta_salida?: number;
  ct_pasillo_destino?: number;
  ct_ciclo_trabajo?: number;
  ct_numero_pasillo_actual?: number;
  ct_estado_carro?: number;
  ct_defecto_comunicacion?: number;
  ct_defecto_emergencia_armario?: number;
  ct_defecto_variador?: number;
  ct_defecto_motor_traslacion?: number;
  ct_defecto_motor_entrada?: number;
  ct_defecto_motor_salida?: number;
  ct_defecto_final_carrera_pasillo1?: number;
  ct_defecto_final_carrera_pasillo12?: number;
  ct_defecto_paleta_descentrada_entrada?: number;
  ct_defecto_paleta_descentrada_salida?: number;
  ct_vis_centraje_traslacion_adelante?: number;
  ct_vis_centraje_traslacion_atras?: number;
  ct_vis_presencia_delantera_paleta_entrada?: number;
  ct_vis_presencia_trasera_paleta_entrada?: number;
  ct_vis_presencia_delantera_paleta_salida?: number;
  ct_vis_presencia_trasera_paleta_salida?: number;
}

// Función para obtener los datos del Carro Transferidor (CT) desde Node-RED
export const getCTStatusFromMariaDB = async (): Promise<CTStatusData> => {
  try {
    console.log('Obteniendo datos del CT directamente desde Node-RED');
    
    // Usamos la función que ya hemos probado y sabemos que funciona
    const response = await getCTStatusDirectFromNodeRED();
    console.log('Respuesta de Node-RED para CT:', response);
    
    // Manejar diferentes formatos de respuesta posibles de Node-RED
    let apiData;
    
    // Verificar si la respuesta es un array (como parece ser el caso en la consulta manual)
    if (Array.isArray(response) && response.length > 0) {
      // Si es un array, tomamos el primer elemento
      apiData = response[0];
      console.log('Respuesta de Node-RED es un array, tomando el primer elemento:', apiData);
    } else if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      // Formato: { success: true, data: {...} }
      apiData = (response as any).data;
    } else if (response && typeof response === 'object') {
      // Formato: directamente el objeto de datos
      apiData = response;
    } else {
      console.error('Formato de respuesta no reconocido para el CT:', response);
      throw new Error('Formato de respuesta no reconocido para el CT');
    }
    
    console.log('Datos del Carro Transferidor (CT) desde Node-RED:', apiData);
    
    // Mapear los campos según los nombres exactos que vemos en la tabla
    // Basado en la imagen compartida, los campos tienen nombres como ct_conectado, ct_defecto, etc.
    const convertedData: CTStatusData = {
      id: apiData.id ?? 0,
      timestamp: apiData.timestamp ?? new Date().toISOString(),
      // Usamos directamente los nombres de campos que vemos en la tabla
      ct_conectado: apiData.ct_conectado ?? 0,
      ct_defecto: apiData.ct_defecto ?? 0,
      ct_automatico: apiData.ct_automatico ?? 0,
      ct_semiautomatico: apiData.ct_semiautomatico ?? 0,
      ct_manual: apiData.ct_manual ?? 0,
      ct_emergencia_puerta_armario: apiData.ct_emergencia_puerta_armario ?? 0,
      ct_con_datos: apiData.ct_con_datos ?? 0,
      ct_matricula_paleta_entrada: apiData.ct_matricula_paleta_entrada ?? 0,
      ct_matricula_paleta_salida: apiData.ct_matricula_paleta_salida ?? 0,
      ct_pasillo_destino: apiData.ct_pasillo_destino ?? 0,
      ct_ciclo_trabajo: apiData.ct_ciclo_trabajo ?? 0,
      ct_numero_pasillo_actual: apiData.ct_numero_pasillo_actual ?? 0,
      ct_estado_carro: apiData.ct_estado_carro ?? 0,
      // Campos adicionales con valores por defecto si no están presentes
      ct_autorizacion_transferencia_tc26: apiData.ct_autorizacion_transferencia_tc26 ?? 0,
      ct_fin_transferencia_tc26: apiData.ct_fin_transferencia_tc26 ?? 0,
      ct_peticion_transferencia_tc30: apiData.ct_peticion_transferencia_tc30 ?? 0,
      ct_acuse_orden_recibida: apiData.ct_acuse_orden_recibida ?? 0,
      ct_defecto_comunicacion: apiData.ct_defecto_comunicacion ?? 0,
      ct_defecto_emergencia_armario: apiData.ct_defecto_emergencia_armario ?? 0,
      ct_defecto_variador: apiData.ct_defecto_variador ?? 0,
      ct_defecto_motor_traslacion: apiData.ct_defecto_motor_traslacion ?? 0,
      ct_defecto_motor_entrada: apiData.ct_defecto_motor_entrada ?? 0,
      ct_defecto_motor_salida: apiData.ct_defecto_motor_salida ?? 0,
      ct_defecto_final_carrera_pasillo1: apiData.ct_defecto_final_carrera_pasillo1 ?? 0,
      ct_defecto_final_carrera_pasillo12: apiData.ct_defecto_final_carrera_pasillo12 ?? 0,
      ct_defecto_paleta_descentrada_entrada: apiData.ct_defecto_paleta_descentrada_entrada ?? 0,
      ct_defecto_paleta_descentrada_salida: apiData.ct_defecto_paleta_descentrada_salida ?? 0,
      ct_vis_centraje_traslacion_adelante: apiData.ct_vis_centraje_traslacion_adelante ?? 0,
      ct_vis_centraje_traslacion_atras: apiData.ct_vis_centraje_traslacion_atras ?? 0,
      ct_vis_presencia_delantera_paleta_entrada: apiData.ct_vis_presencia_delantera_paleta_entrada ?? 0,
      ct_vis_presencia_trasera_paleta_entrada: apiData.ct_vis_presencia_trasera_paleta_entrada ?? 0,
      ct_vis_presencia_delantera_paleta_salida: apiData.ct_vis_presencia_delantera_paleta_salida ?? 0,
      ct_vis_presencia_trasera_paleta_salida: apiData.ct_vis_presencia_trasera_paleta_salida ?? 0
    };
    
    console.log('Datos convertidos del CT:', convertedData);
    return convertedData;
  } catch (error) {
    console.error('Error al obtener datos del Carro Transferidor (CT) desde Node-RED:', error);
    // En caso de error, devolvemos un objeto con valores por defecto
    return {
      id: 0,
      timestamp: new Date().toISOString(),
      ct_conectado: 0,
      ct_defecto: 0,
      ct_automatico: 0,
      ct_semiautomatico: 0,
      ct_manual: 0,
      ct_emergencia_puerta_armario: 0,
      ct_con_datos: 0,
      ct_autorizacion_transferencia_tc26: 0,
      ct_fin_transferencia_tc26: 0,
      ct_peticion_transferencia_tc30: 0,
      ct_acuse_orden_recibida: 0,
      ct_matricula_paleta_entrada: 0,
      ct_matricula_paleta_salida: 0,
      ct_pasillo_destino: 0,
      ct_ciclo_trabajo: 0,
      ct_numero_pasillo_actual: 0,
      ct_estado_carro: 0,
      ct_defecto_comunicacion: 0,
      ct_defecto_emergencia_armario: 0,
      ct_defecto_variador: 0,
      ct_defecto_motor_traslacion: 0,
      ct_defecto_motor_entrada: 0,
      ct_defecto_motor_salida: 0,
      ct_defecto_final_carrera_pasillo1: 0,
      ct_defecto_final_carrera_pasillo12: 0,
      ct_defecto_paleta_descentrada_entrada: 0,
      ct_defecto_paleta_descentrada_salida: 0,
      ct_vis_centraje_traslacion_adelante: 0,
      ct_vis_centraje_traslacion_atras: 0,
      ct_vis_presencia_delantera_paleta_entrada: 0,
      ct_vis_presencia_trasera_paleta_entrada: 0,
      ct_vis_presencia_delantera_paleta_salida: 0,
      ct_vis_presencia_trasera_paleta_salida: 0
    };
  }
};

// Función para obtener una descripción textual del estado del carro
export const getCarroEstadoText = (estado: number): string => {
  switch (estado) {
    case 0:
      return 'Libre';
    case 1:
      return 'Ocupado';
    case 2:
      return 'Avería';
    default:
      return 'Desconocido';
  }
};

// Función para obtener el color según el estado del carro
export const getCarroEstadoColor = (estado: number): string => {
  switch (estado) {
    case 0:
      return 'green'; // Libre
    case 1:
      return 'blue'; // Ocupado
    case 2:
      return 'red'; // Avería
    default:
      return 'gray'; // Desconocido
  }
};

// Función para solicitar a Node-RED que sincronice los datos del CT en la base de datos
export const syncCTStatusInDB = async (ctStatus?: Partial<CTStatusData>): Promise<void> => {
  try {
    console.log('ctStatusApi: Solicitando sincronización de datos del CT usando la API configurada');
    console.log('ctStatusApi: Datos a sincronizar:', JSON.stringify(ctStatus || {}, null, 2));
    
        // Verificar que syncCTStatusInNodeRED existe y es una función
    if (typeof syncCTStatusInNodeRED !== 'function') {
      console.error('ctStatusApi: La función syncCTStatusInNodeRED no está disponible o no es una función');
      throw new Error('Función de sincronización no disponible');
    }
    
    // Usamos la función que ya hemos probado y sabemos que funciona
    console.log('ctStatusApi: Llamando a syncCTStatusInNodeRED...');
    const response = await syncCTStatusInNodeRED(ctStatus || {});
    
    console.log('ctStatusApi: Sincronización de datos del CT en la base de datos exitosa');
    console.log('ctStatusApi: Respuesta recibida:', JSON.stringify(response, null, 2));
    return;
  } catch (error) {
    console.error('ctStatusApi: Error al solicitar sincronización de datos del CT:', error);
    
    // Mostrar más detalles sobre el error para facilitar la depuración
    if (axios.isAxiosError(error)) {
      console.error('ctStatusApi: Detalles del error de Axios:');
      console.error('- Mensaje:', error.message);
      console.error('- Código:', error.code);
      console.error('- URL:', error.config?.url);
      console.error('- Método:', error.config?.method);
      
      if (error.response) {
        console.error('- Código de estado:', error.response.status);
        console.error('- Datos de respuesta:', error.response.data);
      }
    }
    
    // No lanzamos error para evitar que la aplicación se rompa
    // simplemente registramos el error
  }
};
