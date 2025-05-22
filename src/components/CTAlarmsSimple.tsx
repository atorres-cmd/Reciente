import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangle } from "lucide-react";

// Componente simple para mostrar alarmas del CT
const CTAlarmsSimple: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // URL directa al endpoint de alarmas del CT
        const currentHost = window.location.hostname;
        const apiBaseUrl = currentHost === 'localhost' || currentHost.match(/^192\.168\./) 
          ? `http://${currentHost}:1880/api` 
          : 'http://localhost:1880/api';
        const url = `${apiBaseUrl}/ct/alarmas`;
        
        console.log('Realizando petición directa a:', url);
        const response = await axios.get(url);
        
        console.log('Respuesta completa:', response.data);
        setData(response.data);
      } catch (err) {
        console.error('Error al obtener datos:', err);
        setError('Error al comunicarse con Node-RED');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Actualizar cada 10 segundos
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Función para verificar si una alarma está activa
  const isAlarmActive = (value: any) => {
    return value === 1 || value === true || value === '1' || value === 'true';
  };

  // Obtener todas las alarmas activas
  const getActiveAlarms = () => {
    if (!data || !data.success || !data.data) return [];
    
    // El formato es {success: true, data: {id: 1, ct_defecto_xxx: 1, ...}}
    const alarmData = data.data;
    const activeAlarms = [];
    
    // Lista exacta de campos de alarma basada en la estructura de la tabla
    const alarmFields = [
      'ct_defecto_error_comunicacion',
      'ct_defecto_emergencia_armario_carro',
      'ct_defecto_anomalia_variador',
      'ct_defecto_anomalia_motor_traslacion',
      'ct_defecto_anomalia_motor_entrada',
      'ct_defecto_anomalia_motor_salida',
      'ct_defecto_final_carrera_pasillo1',
      'ct_defecto_final_carrera_pasillo12',
      'ct_defecto_paleta_descentrada_entrada',
      'ct_defecto_paleta_descentrada_salida',
      'ct_defecto_limite_superior_lectura_encoder',
      'ct_defecto_limite_inferior_lectura_encoder',
      'ct_defecto_tiempo_transferencia_mesa_salida',
      'ct_defecto_telemetro',
      'ct_defecto_tiempo_entrada',
      'ct_defecto_tiempo_salida',
      'ct_defecto_paleta_entrada_sin_codigo',
      'ct_defecto_paleta_salida_sin_codigo'
    ];
    
    // Verificar cada campo de alarma
    for (const field of alarmFields) {
      if (field in alarmData && isAlarmActive(alarmData[field])) {
        activeAlarms.push({
          key: field,
          value: alarmData[field]
        });
      }
    }
    
    console.log('Alarmas activas encontradas:', activeAlarms);
    return activeAlarms;
  };

  const activeAlarms = data ? getActiveAlarms() : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Alarmas del Carro Transferidor</span>
          <Badge variant="outline" className="ml-2">
            {activeAlarms.length} activas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-center py-4">Cargando alarmas...</div>}
        
        {error && <div className="text-center py-4 text-red-500">{error}</div>}
        
        {!loading && !error && (
          <div>
            {activeAlarms.length === 0 ? (
              <div className="text-center py-4 text-green-500">No hay alarmas activas</div>
            ) : (
              <div className="space-y-2">
                {activeAlarms.map((alarm, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-md flex items-start space-x-3 bg-red-50 text-red-600"
                  >
                    <div className="flex-shrink-0 pt-0.5">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{alarm.key.replace('ct_defecto_', '').replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500">{alarm.key}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CTAlarmsSimple;
