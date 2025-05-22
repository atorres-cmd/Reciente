import React from 'react';
import { BellRing, Bell } from 'lucide-react';

interface Alarm {
  id: string | number;
  deviceId?: string;
  deviceName?: string;
  message?: string;
  severity?: "critical" | "warning" | "info";
  timestamp?: Date | string;
  acknowledged?: boolean;
  // Campos adicionales para las alarmas del TLV1
  [key: string]: any;
}

interface AlarmPopupProps {
  alarms: Alarm[];
  position: 'top' | 'bottom' | 'left' | 'right';
  maxAlarms?: number;
  onClose?: () => void;
}

const AlarmPopup: React.FC<AlarmPopupProps> = ({ 
  alarms, 
  position = 'top',
  maxAlarms = 3,
  onClose 
}) => {
  if (!alarms || alarms.length === 0) return null;

  // Limitar el número de alarmas mostradas
  const alarmsToShow = alarms.slice(0, maxAlarms);
  const hasMoreAlarms = alarms.length > maxAlarms;

  // Determinar la posición de la ventana emergente
  let positionClasses = '';
  switch (position) {
    case 'top':
      positionClasses = 'bottom-full mb-2';
      break;
    case 'bottom':
      positionClasses = 'top-full mt-2';
      break;
    case 'left':
      positionClasses = 'right-full mr-2';
      break;
    case 'right':
      positionClasses = 'left-full ml-2';
      break;
  }

  // Obtener el color según la severidad más alta o por defecto rojo para alarmas del TLV1
  const getHighestSeverityColor = () => {
    // Si alguna alarma tiene severidad definida, usarla
    if (alarms.some(a => a.severity === 'critical')) return 'border-red-500';
    if (alarms.some(a => a.severity === 'warning')) return 'border-amber-500';
    if (alarms.some(a => a.severity === 'info')) return 'border-blue-500';
    
    // Para alarmas del TLV1 que no tienen severidad definida, usar rojo por defecto
    return 'border-red-500';
  };

  // Obtener el icono según la severidad más alta o por defecto para alarmas del TLV1
  const getHighestSeverityIcon = () => {
    if (alarms.some(a => a.severity === 'critical')) {
      return <BellRing className="h-4 w-4 text-red-600 animate-pulse" />;
    }
    if (alarms.some(a => a.severity === 'warning')) {
      return <Bell className="h-4 w-4 text-amber-600" />;
    }
    if (alarms.some(a => a.severity === 'info')) {
      return <Bell className="h-4 w-4 text-blue-600" />;
    }
    
    // Para alarmas del TLV1 que no tienen severidad definida, usar icono de alarma crítica
    return <BellRing className="h-4 w-4 text-red-600 animate-pulse" />;
  };

  // Obtener el color de fondo según la severidad
  const getSeverityBgColor = (severity?: string) => {
    if (!severity) return 'bg-red-50'; // Por defecto para alarmas del TLV1
    
    switch (severity) {
      case 'critical':
        return 'bg-red-50';
      case 'warning':
        return 'bg-amber-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-red-50';
    }
  };
  
  // Función para formatear el mensaje de la alarma
  const getAlarmMessage = (alarm: Alarm) => {
    // Si tiene un mensaje definido, usarlo
    if (alarm.message) return alarm.message;
    
    // Para alarmas del TLV1, buscar la primera propiedad que sea TRUE
    for (const key in alarm) {
      if (alarm[key] === 1 || alarm[key] === true) {
        // Formatear el nombre de la alarma para hacerlo más legible
        return key.replace(/_/g, ' ').toLowerCase();
      }
    }
    
    return 'Alarma desconocida';
  };
  
  // Función para formatear el timestamp
  const formatTimestamp = (timestamp?: Date | string) => {
    if (!timestamp) return '';
    
    try {
      if (timestamp instanceof Date) {
        return timestamp.toLocaleTimeString();
      } else if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleTimeString();
      }
    } catch (error) {
      console.error('Error al formatear timestamp:', error);
    }
    
    return '';
  };

  return (
    <div className={`absolute z-50 ${positionClasses} w-64 bg-white rounded-md shadow-lg border-l-4 ${getHighestSeverityColor()}`}>
      <div className="p-2 flex justify-between items-center border-b">
        <div className="flex items-center space-x-1">
          {getHighestSeverityIcon()}
          <span className="text-sm font-medium">
            {alarms.length} {alarms.length === 1 ? 'alarma' : 'alarmas'}
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
      <div className="max-h-40 overflow-y-auto">
        {alarmsToShow.map((alarm) => (
          <div 
            key={alarm.id} 
            className={`p-2 border-b text-xs ${getSeverityBgColor(alarm.severity)}`}
          >
            <div className="font-medium">{getAlarmMessage(alarm)}</div>
            <div className="text-gray-500 text-xs mt-1">
              {formatTimestamp(alarm.timestamp)}
            </div>
          </div>
        ))}
        {hasMoreAlarms && (
          <div className="p-2 text-xs text-center text-gray-500">
            + {alarms.length - maxAlarms} alarmas más...
          </div>
        )}
      </div>
    </div>
  );
};

export default AlarmPopup;
