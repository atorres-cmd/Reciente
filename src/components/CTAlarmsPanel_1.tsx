import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bell, BellRing, CheckCircle2 } from "lucide-react";
import axios from 'axios';

// Definición del tipo para las alarmas del CT
interface CTAlarm {
  field: string;
  message: string;
  severity: "critical" | "warning" | "info";
  active: boolean;
}

const CTAlarmsPanel = () => {
  const [alarms, setAlarms] = useState<CTAlarm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mapeo de nombres de campo a mensajes de alarma más descriptivos
  const alarmMessages: Record<string, {message: string, severity: "critical" | "warning" | "info"}> = {
    error_comunicacion: { message: "Error de comunicación con el Carro Transferidor", severity: "critical" },
    emergencia_armario_carro: { message: "Emergencia en armario del carro", severity: "critical" },
    anomalia_variador: { message: "Anomalía en el variador", severity: "warning" },
    anomalia_motor_traslacion: { message: "Anomalía en motor de traslación", severity: "warning" },
    anomalia_motor_entrada: { message: "Anomalía en motor de entrada", severity: "warning" },
    anomalia_motor_salida: { message: "Anomalía en motor de salida", severity: "warning" },
    final_carrera_pasillo_1: { message: "Final de carrera pasillo 1", severity: "warning" },
    final_carrera_pasillo_12: { message: "Final de carrera pasillo 12", severity: "warning" },
    paleta_descentrada_transfer_entrada: { message: "Paleta descentrada en transfer de entrada", severity: "warning" },
    paleta_descentrada_transfer_salida: { message: "Paleta descentrada en transfer de salida", severity: "warning" },
    limite_inferior_lectura_encoder: { message: "Límite inferior de lectura del encoder", severity: "info" },
    limite_superior_lectura_encoder: { message: "Límite superior de lectura del encoder", severity: "info" },
    tiempo_transferencia_mesa_salida_carro: { message: "Tiempo de transferencia mesa salida carro excedido", severity: "warning" },
    telemetro: { message: "Problema con telemetro", severity: "warning" },
    tiempo_entrada: { message: "Tiempo de entrada excedido", severity: "warning" },
    tiempo_salida: { message: "Tiempo de salida excedido", severity: "warning" },
    paleta_entrada_sin_codigo: { message: "Paleta de entrada sin código", severity: "info" },
    paleta_salida_sin_codigo: { message: "Paleta de salida sin código", severity: "info" },
  };

  // Cargar alarmas del CT
  useEffect(() => {
    const loadCTAlarms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener el hostname actual
        const currentHost = window.location.hostname;
        
        // URL para obtener los datos de la tabla CT_Alarmas
        const url = `http://${currentHost}:3003/api/mariadb/tables/CT_Alarmas/latest`;
        
        console.log('Obteniendo alarmas del CT desde:', url);
        const response = await axios.get(url);
        
        console.log('Respuesta de alarmas CT:', response.data);
        
        if (response.data && response.data.success && response.data.data) {
          const alarmData = response.data.data;
          
          // Convertir los datos de la tabla en alarmas
          const ctAlarms: CTAlarm[] = [];
          
          // Recorrer todos los campos excepto id y timestamp
          for (const [field, value] of Object.entries(alarmData)) {
            if (field !== 'id' && field !== 'timestamp' && field in alarmMessages) {
              ctAlarms.push({
                field,
                message: alarmMessages[field].message,
                severity: alarmMessages[field].severity,
                active: value === 1
              });
            }
          }
          
          setAlarms(ctAlarms);
        } else {
          setError('No se pudieron obtener las alarmas del CT');
        }
      } catch (error) {
        console.error('Error al cargar alarmas del CT:', error);
        setError('Error al cargar las alarmas del CT');
      } finally {
        setLoading(false);
      }
    };
    
    // Cargar alarmas al montar el componente
    loadCTAlarms();
    
    // Configurar intervalo para actualizar las alarmas cada 5 segundos
    const interval = setInterval(() => {
      loadCTAlarms();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Función para obtener el color de la severidad
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-amber-600 bg-amber-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Función para obtener el icono de la severidad
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <BellRing className="h-5 w-5 text-red-600" />;
      case "warning":
        return <Bell className="h-5 w-5 text-amber-600" />;
      case "info":
        return <Bell className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  // Filtrar solo las alarmas activas
  const activeAlarms = alarms.filter(alarm => alarm.active);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Alarmas del Carro Transferidor</span>
          <Badge variant="outline" className="ml-2">
            {activeAlarms.length} activas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Cargando alarmas...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : activeAlarms.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No hay alarmas activas</div>
        ) : (
          <div className="space-y-2">
            {activeAlarms.map((alarm) => (
              <div
                key={alarm.field}
                className={`p-3 rounded-md flex items-start space-x-3 ${getSeverityColor(alarm.severity)}`}
              >
                <div className="flex-shrink-0 pt-0.5">
                  {getSeverityIcon(alarm.severity)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{alarm.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CTAlarmsPanel;
