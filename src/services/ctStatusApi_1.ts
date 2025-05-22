import axios from 'axios';
import { MARIADB_API_URL } from './api';

// Interfaz para los datos del Carro Transferidor (CT) de MariaDB
export interface CTStatusData {
  id: number;
  timestamp: string;
  ct_conectado: number;
  ct_defecto: number;
  ct_automatico: number;
  ct_semiautomatico: number;
  ct_manual: number;
  ct_emergencia_puerta_armario: number;
  ct_con_datos: number;
  ct_autorizacion_transferencia_tc26: number;
  ct_fin_transferencia_tc26: number;
  ct_peticion_transferencia_tc30: number;
  ct_acuse_orden_recibida: number;
  ct_matricula_paleta_entrada: number;
  ct_matricula_paleta_salida: number;
  ct_pasillo_destino: number;
  ct_ciclo_trabajo: number;
  ct_numero_pasillo_actual: number;
  ct_estado_carro: number;
  ct_defecto_comunicacion: number;
  ct_defecto_emergencia_armario: number;
  ct_defecto_variador: number;
  ct_defecto_motor_traslacion: number;
  ct_defecto_motor_entrada: number;
  ct_defecto_motor_salida: number;
  ct_defecto_final_carrera_pasillo1: number;
  ct_defecto_final_carrera_pasillo12: number;
  ct_defecto_paleta_descentrada_entrada: number;
  ct_defecto_paleta_descentrada_salida: number;
  ct_vis_centraje_traslacion_adelante: number;
  ct_vis_centraje_traslacion_atras: number;
  ct_vis_presencia_delantera_paleta_entrada: number;
  ct_vis_presencia_trasera_paleta_entrada: number;
  ct_vis_presencia_delantera_paleta_salida: number;
  ct_vis_presencia_trasera_paleta_salida: number;
}

// Función para obtener los datos del Carro Transferidor (CT) desde MariaDB
export const getCTStatusFromMariaDB = async (): Promise<CTStatusData> => {
  try {
    // Ruta para obtener los datos del CT
    const response = await axios.get(`${MARIADB_API_URL}/db112/status`);
    
    // Verificar si la respuesta tiene el formato esperado
    if (response.data && response.data.success && response.data.data) {
      console.log('Datos del Carro Transferidor (CT) desde MariaDB:', response.data.data);
      
      // Los datos vienen en formato StConectado, PasActual, etc.
      // Necesitamos convertirlos al formato ct_conectado, ct_numero_pasillo_actual, etc.
      const apiData = response.data.data;
      
      // Convertir los datos al formato esperado por la interfaz CTStatusData
      const convertedData: CTStatusData = {
        id: apiData.id,
        timestamp: apiData.timestamp,
        ct_conectado: apiData.StConectado,
        ct_defecto: apiData.StDefecto,
        ct_automatico: apiData.St_Auto,
        ct_semiautomatico: apiData.St_Semi,
        ct_manual: apiData.St_Manual,
        ct_emergencia_puerta_armario: apiData.St_Puerta,
        ct_con_datos: apiData.St_Datos,
        ct_matricula_paleta_entrada: apiData.MatEntrada,
        ct_matricula_paleta_salida: apiData.MatSalida,
        ct_pasillo_destino: apiData.PasDestino,
        ct_ciclo_trabajo: apiData.CicloTrabajo,
        ct_numero_pasillo_actual: apiData.PasActual,
        ct_estado_carro: apiData.St_Carro,
        // Inicializar los campos restantes con 0 ya que no están en la respuesta de la API
        ct_autorizacion_transferencia_tc26: 0,
        ct_fin_transferencia_tc26: 0,
        ct_peticion_transferencia_tc30: 0,
        ct_acuse_orden_recibida: 0,
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
      
      console.log('Datos convertidos del CT:', convertedData);
      return convertedData;
    } else {
      console.error('Formato de respuesta incorrecto para el CT:', response.data);
      throw new Error('Formato de respuesta incorrecto para el CT');
    }
  } catch (error) {
    console.error('Error al obtener datos del Carro Transferidor (CT) desde MariaDB:', error);
    throw error;
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

// Función para sincronizar los datos del CT desde el PLC
export const syncCTFromPLC = async (): Promise<void> => {
  try {
    const response = await axios.post(`${MARIADB_API_URL}/ct/status/sync`);
    
    if (response.data && response.data.success) {
      console.log('Sincronización del CT exitosa:', response.data);
      return;
    } else {
      console.error('Error en la sincronización del CT:', response.data);
      throw new Error('Error en la sincronización del CT');
    }
  } catch (error) {
    console.error('Error al sincronizar datos del CT desde el PLC:', error);
    throw error;
  }
};
