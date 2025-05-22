import axios from 'axios';

// URL de la API de MariaDB
const MARIADB_API_URL = 'http://localhost:3003/api/mariadb';

// Interfaz para los datos de MesasEntrada_Status de MariaDB
export interface MesasEntradaStatusData {
  id: number;
  pep1: number;
  pep2: number;
  pep3: number;
  pep4: number;
  pep5: number;
  pep6: number;
  pep7: number;
  pep8: number;
  pep9: number;
  pep10: number;
  pep11: number;
  pep12: number;
  timestamp: string;
}

// Función para obtener los datos de las Mesas de Entrada desde MariaDB
export const getMesasEntradaStatusFromMariaDB = async (): Promise<MesasEntradaStatusData> => {
  try {
    // Ruta actualizada para obtener los datos de las mesas de entrada
    const response = await axios.get(`${MARIADB_API_URL}/db110/mesasEntrada/status`);
    console.log('Datos de las Mesas de Entrada desde MariaDB:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de las Mesas de Entrada desde MariaDB:', error);
    // Datos de ejemplo en caso de error
    return { 
      id: 1, 
      pep1: 0, pep2: 1, pep3: 2, pep4: 0, pep5: 1, pep6: 0, 
      pep7: 1, pep8: 0, pep9: 2, pep10: 0, pep11: 1, pep12: 0, 
      timestamp: new Date().toISOString() 
    };
  }
};
