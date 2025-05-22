import { getPEPsStatusDirectFromNodeRED, PEPsStatusData, PEPsApiResponse } from './api';

// Interfaz para los datos de MesasEntrada_Status de MariaDB
export interface MesasEntradaStatusData {
  id: number;
  mesa_entrada_uno: number;
  mesa_entrada_dos: number;
  mesa_entrada_tres: number;
  mesa_entrada_cuatro: number;
  mesa_entrada_cinco: number;
  mesa_entrada_seis: number;
  mesa_entrada_siete: number;
  mesa_entrada_ocho: number;
  mesa_entrada_nueve: number;
  mesa_entrada_diez: number;
  mesa_entrada_once: number;
  mesa_entrada_doce: number;
  timestamp: string;
}

// Función para convertir los datos del formato de la API a nuestro formato interno
const convertPEPsData = (data: PEPsStatusData): MesasEntradaStatusData => {
  // Depuración: mostrar los datos recibidos de la API
  console.log('Datos recibidos de la API:', data);
  
  // Asegurarse de que todos los valores sean números
  const result = {
    id: Number(data.id),
    mesa_entrada_uno: Number(data.mesa_entrada_uno || 0),
    mesa_entrada_dos: Number(data.mesa_entrada_dos || 0),
    mesa_entrada_tres: Number(data.mesa_entrada_tres || 0),
    mesa_entrada_cuatro: Number(data.mesa_entrada_cuatro || 0),
    mesa_entrada_cinco: Number(data.mesa_entrada_cinco || 0),
    mesa_entrada_seis: Number(data.mesa_entrada_seis || 0),
    mesa_entrada_siete: Number(data.mesa_entrada_siete || 0),
    mesa_entrada_ocho: Number(data.mesa_entrada_ocho || 0),
    mesa_entrada_nueve: Number(data.mesa_entrada_nueve || 0),
    mesa_entrada_diez: Number(data.mesa_entrada_diez || 0),
    mesa_entrada_once: Number(data.mesa_entrada_once || 0),
    mesa_entrada_doce: Number(data.mesa_entrada_doce || 0),
    timestamp: data.timestamp
  };
  
  // Depuración: mostrar los datos convertidos
  console.log('Datos convertidos:', result);
  
  return result;
};

// Función para obtener los datos de las Mesas de Entrada desde Node-RED
export const getMesasEntradaStatusFromMariaDB = async (): Promise<MesasEntradaStatusData> => {
  try {
    // Obtener datos desde el nuevo endpoint de Node-RED
    const response = await getPEPsStatusDirectFromNodeRED();
    console.log('Respuesta completa de las Mesas de Entrada desde Node-RED:', response);
    
    // Verificar si la respuesta tiene la estructura esperada
    if (response.success && response.data) {
      console.log('Datos de PEPs extraídos de la respuesta:', response.data);
      
      // Convertir al formato que espera la aplicación
      return convertPEPsData(response.data);
    } else {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
  } catch (error) {
    console.error('Error al obtener datos de las Mesas de Entrada desde Node-RED:', error);
    // Datos de ejemplo en caso de error
    return { 
      id: 1, 
      mesa_entrada_uno: 0, mesa_entrada_dos: 1, mesa_entrada_tres: 2, mesa_entrada_cuatro: 0, 
      mesa_entrada_cinco: 1, mesa_entrada_seis: 0, mesa_entrada_siete: 1, mesa_entrada_ocho: 0, 
      mesa_entrada_nueve: 2, mesa_entrada_diez: 0, mesa_entrada_once: 1, mesa_entrada_doce: 0, 
      timestamp: new Date().toISOString() 
    };
  }
};
