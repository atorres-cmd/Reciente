import axios from 'axios';

// Interfaz para los bits de un word
export interface WordBit {
  value: number;
  description: string;
  state: string;
}

// Interfaz para un word completo
export interface Word {
  value: number;
  description: string;
  address: string;
}

// Interfaz para los datos del DB111
export interface DB111Data {
  timestamp: string;
  words: {
    [key: string]: Word;
  };
  bits: {
    [key: string]: {
      [key: string]: WordBit;
    };
  };
}

// URL del archivo JSON generado por el cliente DB111
const DB111_DATA_URL = '/db111-data.json';

/**
 * Obtiene los datos del DB111 desde el archivo JSON
 * @returns Promesa con los datos del DB111
 */
export const getDB111Data = async (): Promise<DB111Data> => {
  try {
    const response = await axios.get<{
      timestamp: string;
      rawValues: Record<string, number>;
      processedData: DB111Data;
    }>(DB111_DATA_URL);
    
    return response.data.processedData;
  } catch (error) {
    console.error('Error al obtener datos del DB111:', error);
    throw error;
  }
};

/**
 * Obtiene el estado de un bit específico de un word del DB111
 * @param wordAddress Dirección del word (e.g., 'DB111,W40')
 * @param bitIndex Índice del bit (0-15)
 * @returns Promesa con el estado del bit (activado o desactivado)
 */
export const getBitState = async (wordAddress: string, bitIndex: number): Promise<WordBit | null> => {
  try {
    const data = await getDB111Data();
    
    if (data.bits[wordAddress] && data.bits[wordAddress][`bit${bitIndex}`]) {
      return data.bits[wordAddress][`bit${bitIndex}`];
    }
    
    return null;
  } catch (error) {
    console.error(`Error al obtener estado del bit ${bitIndex} del word ${wordAddress}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los bits activos (valor 1) de todos los words
 * @returns Promesa con un array de bits activos
 */
export const getActiveBits = async (): Promise<{wordAddress: string, bitIndex: number, bit: WordBit}[]> => {
  try {
    const data = await getDB111Data();
    const activeBits: {wordAddress: string, bitIndex: number, bit: WordBit}[] = [];
    
    // Recorrer todos los words
    Object.entries(data.bits).forEach(([wordAddress, bits]) => {
      // Recorrer todos los bits del word
      Object.entries(bits).forEach(([bitKey, bit]) => {
        // Si el bit está activo (valor 1), añadirlo al array
        if (bit.value === 1) {
          const bitIndex = parseInt(bitKey.replace('bit', ''));
          activeBits.push({
            wordAddress,
            bitIndex,
            bit
          });
        }
      });
    });
    
    return activeBits;
  } catch (error) {
    console.error('Error al obtener bits activos:', error);
    throw error;
  }
};
