import { getCTStatusFromMariaDB } from './api';

/**
 * Servicio para simular alarmas del Carro Transferidor (CT) basándose en los datos de CT_Status
 */
export const simulateCTAlarms = async () => {
  try {
    // Obtener el estado actual del CT desde MariaDB
    const ctStatus = await getCTStatusFromMariaDB();
    console.log('Estado del CT obtenido para simular alarmas:', ctStatus);
    
    // Array para almacenar las alarmas activas
    const activeAlarms = [];
    
    // Verificar si hay un defecto general (StDefecto = 1)
    if (ctStatus.StDefecto === 1) {
      // Simular algunas alarmas basadas en el estado del CT
      
      // Alarma de error de comunicación (si StConectado = 0)
      if (ctStatus.StConectado === 0) {
        activeAlarms.push({
          id: `ct-error-comunicacion-${Date.now()}`,
          deviceId: 'CT-001',
          deviceName: 'Carro Transferidor',
          message: 'Error de comunicación con el Carro Transferidor',
          severity: 'critical',
          timestamp: new Date(),
          acknowledged: false
        });
      }
      
      // Alarma de anomalía variador (siempre que haya defecto)
      activeAlarms.push({
        id: `ct-anomalia-variador-${Date.now()}`,
        deviceId: 'CT-001',
        deviceName: 'Carro Transferidor',
        message: 'Anomalía en el variador',
        severity: 'warning',
        timestamp: new Date(),
        acknowledged: false
      });
      
      // Alarma de final de carrera (si PasActual = 1)
      if (ctStatus.PasActual === 1) {
        activeAlarms.push({
          id: `ct-final-carrera-pasillo-1-${Date.now()}`,
          deviceId: 'CT-001',
          deviceName: 'Carro Transferidor',
          message: 'Final de carrera pasillo 1',
          severity: 'warning',
          timestamp: new Date(),
          acknowledged: false
        });
      }
    }
    
    console.log('Alarmas simuladas del CT:', activeAlarms);
    return {
      success: true,
      data: activeAlarms
    };
  } catch (error) {
    console.error('Error al simular alarmas del CT:', error);
    return {
      success: false,
      data: [],
      error: error
    };
  }
};
