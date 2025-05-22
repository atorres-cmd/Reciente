import { getPSPsStatusDirectFromNodeRED, PSPsStatusData } from './api';

// Interfaz para los datos de MesasSalida_Status de MariaDB
export interface MesasSalidaStatusData {
  id: number;
  psp1: number;
  psp2: number;
  psp3: number;
  psp4: number;
  psp5: number;
  psp6: number;
  psp7: number;
  psp8: number;
  psp9: number;
  psp10: number;
  psp11: number;
  psp12: number;
  timestamp: string;
}

// Función para convertir los datos del formato de la API a nuestro formato interno
const convertPSPsData = (data: PSPsStatusData): MesasSalidaStatusData => {
  // Depuración: mostrar los datos recibidos de la API
  console.log('Datos recibidos de la API de PSPs:', data);
  
  // Asegurarse de que todos los valores sean números
  const result = {
    id: Number(data.id),
    psp1: Number(data.mesa_salida_uno || 0),
    psp2: Number(data.mesa_salida_dos || 0),
    psp3: Number(data.mesa_salida_tres || 0),
    psp4: Number(data.mesa_salida_cuatro || 0),
    psp5: Number(data.mesa_salida_cinco || 0),
    psp6: Number(data.mesa_salida_seis || 0),
    psp7: Number(data.mesa_salida_siete || 0),
    psp8: Number(data.mesa_salida_ocho || 0),
    psp9: Number(data.mesa_salida_nueve || 0),
    psp10: Number(data.mesa_salida_diez || 0),
    psp11: Number(data.mesa_salida_once || 0),
    psp12: Number(data.mesa_salida_doce || 0),
    timestamp: data.timestamp
  };
  
  // Depuración: mostrar los datos convertidos
  console.log('Datos convertidos de PSPs:', result);
  
  return result;
}

// Función para obtener los datos de las Mesas de Salida desde Node-RED
export const getMesasSalidaStatusFromMariaDB = async (): Promise<MesasSalidaStatusData> => {
  try {
    // Obtener datos desde el nuevo endpoint de Node-RED
    const response = await getPSPsStatusDirectFromNodeRED();
    console.log('Respuesta completa de las Mesas de Salida desde Node-RED:', response);
    
    // Verificar si la respuesta tiene la estructura esperada
    if (response.success && response.data) {
      console.log('Datos de PSPs extraídos de la respuesta:', response.data);
      
      // Convertir al formato que espera la aplicación
      return convertPSPsData(response.data);
    } else {
      throw new Error('La respuesta de la API no tiene la estructura esperada');
    }
  } catch (error) {
    console.error('Error al obtener datos de las Mesas de Salida desde Node-RED:', error);
    // Datos de ejemplo en caso de error
    return { 
      id: 1, 
      psp1: 0, psp2: 1, psp3: 0, psp4: 2, psp5: 0, psp6: 1, 
      psp7: 0, psp8: 2, psp9: 0, psp10: 1, psp11: 0, psp12: 2, 
      timestamp: new Date().toISOString() 
    };
  }
};
