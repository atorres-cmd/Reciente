import axios from 'axios';

// URL de la API de MariaDB
const MARIADB_API_URL = 'http://localhost:3003/api/mariadb';

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

// Función para obtener los datos de las Mesas de Salida desde MariaDB
export const getMesasSalidaStatusFromMariaDB = async (): Promise<MesasSalidaStatusData> => {
  try {
    // Ruta actualizada para obtener los datos de las mesas de salida
    const response = await axios.get(`${MARIADB_API_URL}/db110/mesasSalida/status`);
    console.log('Datos de las Mesas de Salida desde MariaDB:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de las Mesas de Salida desde MariaDB:', error);
    // Datos de ejemplo en caso de error
    return { 
      id: 1, 
      psp1: 0, psp2: 1, psp3: 0, psp4: 2, psp5: 0, psp6: 1, 
      psp7: 0, psp8: 2, psp9: 0, psp10: 1, psp11: 0, psp12: 2, 
      timestamp: new Date().toISOString() 
    };
  }
};
