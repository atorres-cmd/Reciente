import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangle } from "lucide-react";

// Definición de interfaces
interface Alarma {
  campo: string;
  mensaje: string;
  activa: boolean;
}

// Componente para mostrar las alarmas del CT
const CTAlarmsPanel: React.FC = () => {
  const [alarmas, setAlarmas] = useState<Alarma[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL para las alarmas del CT
  const currentHost = window.location.hostname;
  const apiBaseUrl = currentHost === 'localhost' || currentHost.match(/^192\.168\./) 
    ? `http://${currentHost}:1880/api` 
    : 'http://localhost:1880/api';
  const ctAlarmsUrl = `${apiBaseUrl}/ct/alarmas`;
  
  // Función para cargar las alarmas
  const cargarAlarmas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Primero sincronizar alarmas
      console.log('Sincronizando alarmas del CT...');
      try {
        await axios.get(`${ctAlarmsUrl}/sync`, { params: { _t: new Date().getTime() } });
        console.log('Sincronización completada');
      } catch (syncErr) {
        console.warn('Error en sincronización, continuando con la obtención de datos:', syncErr);
        // Continuamos aunque falle la sincronización
      }
      
      // Obtener alarmas actuales
      console.log('Obteniendo alarmas del CT desde:', ctAlarmsUrl);
      const respuesta = await axios.get(ctAlarmsUrl, { params: { _t: new Date().getTime() } });
      console.log('Respuesta de alarmas:', respuesta.data);
      
      if (respuesta.data && respuesta.data.success && Array.isArray(respuesta.data.data) && respuesta.data.data.length > 0) {
        const datosAlarma = respuesta.data.data[0];
        const nuevasAlarmas: Alarma[] = [];
        
        // Procesar campos de alarmas (que empiezan con ct_defecto_)
        for (const [campo, valor] of Object.entries(datosAlarma)) {
          if (campo.startsWith('ct_defecto_')) {
            const nombreLegible = campo.replace('ct_defecto_', '').replace(/_/g, ' ');
            // Verificar si la alarma está activa (valor 1, true, "1", etc.)
            const activa = valor === 1 || valor === true || valor === '1' || valor === 'true';
            
            nuevasAlarmas.push({
              campo,
              mensaje: `Alarma: ${nombreLegible}`,
              activa
            });
            
            if (activa) {
              console.log(`Alarma ACTIVA detectada: ${campo} = ${valor}`);
            }
          }
        }
        
        console.log(`Alarmas procesadas: ${nuevasAlarmas.length} total, ${nuevasAlarmas.filter(a => a.activa).length} activas`);
        setAlarmas(nuevasAlarmas);
      } else {
        console.warn('No se encontraron datos de alarmas válidos:', respuesta.data);
        setAlarmas([]);
      }
    } catch (err) {
      console.error('Error al cargar alarmas:', err);
      setError('Error al cargar las alarmas del CT');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar alarmas al montar el componente y cada 10 segundos
  useEffect(() => {
    console.log('Componente CTAlarmsPanel montado - URL:', ctAlarmsUrl);
    cargarAlarmas();
    
    const intervalo = setInterval(() => {
      console.log('Actualizando alarmas...');
      cargarAlarmas();
    }, 10000);
    
    return () => {
      console.log('Componente CTAlarmsPanel desmontado');
      clearInterval(intervalo);
    };
  }, [ctAlarmsUrl]);
  
  // Filtrar alarmas activas
  const alarmasActivas = alarmas.filter(alarma => alarma.activa);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Alarmas del Carro Transferidor</span>
          <Badge variant="outline" className="ml-2">
            {alarmasActivas.length} activas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-center py-4">Cargando alarmas...</div>}
        
        {error && <div className="text-center py-4 text-red-500">{error}</div>}
        
        {!loading && !error && (
          <div>
            {alarmasActivas.length === 0 ? (
              <div className="text-center py-4 text-green-500">No hay alarmas activas</div>
            ) : (
              <div className="space-y-2">
                {alarmasActivas.map((alarma, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-md flex items-start space-x-3 bg-red-50 text-red-600"
                  >
                    <div className="flex-shrink-0 pt-0.5">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{alarma.mensaje}</p>
                      <p className="text-xs text-gray-500">{alarma.campo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Sección de depuración - Mostrar todas las alarmas */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium mb-2">Todas las alarmas procesadas:</h3>
              <div className="grid grid-cols-1 gap-1">
                {alarmas.map((alarma, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded-md text-xs ${alarma.activa ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{alarma.campo}</span>
                      <span>{alarma.activa ? '✓ ACTIVA' : '✗ Inactiva'}</span>
                    </div>
                    <p>{alarma.mensaje}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CTAlarmsPanel;
