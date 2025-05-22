import { io, Socket } from 'socket.io-client';
import axios from 'axios';

// URL base del backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Servicio para conectarse al backend y recibir datos en tiempo real
 */
export class DatabaseService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnected: boolean = false;
  
  /**
   * Constructor del servicio
   */
  constructor() {
    this.connect();
  }

  /**
   * Conecta con el servidor Socket.IO
   */
  public connect(): void {
    if (this.socket) {
      console.log('Ya existe una conexión Socket.IO');
      return;
    }

    // Conectar al servidor Socket.IO
    this.socket = io(API_BASE_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Manejar evento de conexión
    this.socket.on('connect', () => {
      console.log('Conectado al servidor Socket.IO');
      this.isConnected = true;
      this.notifyListeners('connection', { status: 'connected' });
    });

    // Manejar evento de desconexión
    this.socket.on('disconnect', (reason) => {
      console.log(`Desconectado del servidor Socket.IO: ${reason}`);
      this.isConnected = false;
      this.notifyListeners('connection', { status: 'disconnected', reason });
    });

    // Manejar evento de error
    this.socket.on('error', (error) => {
      console.error('Error en la conexión Socket.IO:', error);
      this.notifyListeners('error', error);
    });

    // Manejar evento de actualización de la base de datos
    this.socket.on('database-update', (data) => {
      this.notifyListeners('database-update', data);
    });

    // Manejar evento de estado de conexión
    this.socket.on('connection-status', (data) => {
      console.log('Estado de conexión:', data);
      this.notifyListeners('connection-status', data);
    });

    // Manejar evento de componentes
    this.socket.on('components', (data) => {
      this.notifyListeners('components', data);
    });

    // Manejar evento de datos de TLV1
    this.socket.on('tlv1-data', (data) => {
      this.notifyListeners('tlv1-data', data);
    });
  }

  /**
   * Desconecta del servidor Socket.IO
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Verifica si está conectado al servidor
   */
  public isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Solicita datos específicos al servidor
   */
  public requestData(id?: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('requestData', { id });
    } else {
      console.warn('No se pueden solicitar datos: no hay conexión con el servidor');
    }
  }

  /**
   * Obtiene los últimos datos de todas las tablas mediante REST API
   */
  public async getLatestData(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/status/latest`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los últimos datos:', error);
      throw error;
    }
  }

  /**
   * Obtiene el último registro de una tabla específica mediante REST API
   */
  public async getLatestTableRecord(tableName: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/status/${tableName}/latest`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el último registro de la tabla ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene los últimos N registros de una tabla específica mediante REST API
   */
  public async getLatestTableRecords(tableName: string, limit: number = 10): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/status/${tableName}/${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener los últimos ${limit} registros de la tabla ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Registra un listener para un evento específico
   */
  public on(event: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(listener);
    
    // Devolver función para eliminar el listener
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(listener);
      }
    };
  }

  /**
   * Notifica a todos los listeners de un evento específico
   */
  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error en listener de evento ${event}:`, error);
        }
      });
    }
  }
}
