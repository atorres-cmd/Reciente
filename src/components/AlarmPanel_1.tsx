import { useState, useEffect } from 'react';
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Bell, BellRing, CheckCircle2, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { fetchAllActiveAlarms, syncAllAlarms, SystemAlarm } from "../services/alarmsService";
import { useNavigate } from "react-router-dom";

// Utilizamos el tipo SystemAlarm del servicio de alarmas
type Alarm = SystemAlarm;

// Ya no necesitamos el mapeo de mensajes, ya que el servicio de alarmas ya proporciona los mensajes formateados

const AlarmPanel = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const navigate = useNavigate();
  
  // Función para cargar todas las alarmas activas del sistema
  const loadAllAlarms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando todas las alarmas del sistema...');
      const systemAlarms = await fetchAllActiveAlarms();
      console.log(`Se encontraron ${systemAlarms.length} alarmas activas`);
      
      // Asegurarse de que los timestamps son objetos Date
      const formattedAlarms = systemAlarms.map(alarm => ({
        ...alarm,
        timestamp: alarm.timestamp instanceof Date ? alarm.timestamp : new Date(alarm.timestamp)
      }));
      
      setAlarms(formattedAlarms);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Error de conexión al servidor");
      console.error("Error al cargar alarmas del sistema:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para sincronizar manualmente todas las alarmas
  const handleSyncAlarms = async () => {
    try {
      setLoading(true);
      setError(null); // Limpiar errores anteriores
      
      console.log('Iniciando sincronización manual de todas las alarmas...');
      const success = await syncAllAlarms();
      
      if (success) {
        console.log('Sincronización exitosa, recargando alarmas...');
        // Esperar un momento para que la base de datos se actualice completamente
        setTimeout(async () => {
          await loadAllAlarms();
        }, 1000);
      } else {
        console.error('La sincronización no fue exitosa');
        setError("Error al sincronizar las alarmas");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
      console.error("Error al sincronizar alarmas del sistema:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar alarmas al montar el componente
  useEffect(() => {
    loadAllAlarms();
    
    // Configurar intervalo para actualizar las alarmas cada 30 segundos
    const interval = setInterval(() => {
      loadAllAlarms();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Función para marcar una alarma como reconocida
  const acknowledgeAlarm = (id: string) => {
    setAlarms(prev =>
      prev.map(alarm =>
        alarm.id === id ? { ...alarm, acknowledged: true } : alarm
      )
    );
  };

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-operator p-5 my-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center">
          <BellRing className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">
            Alarmas Activas <span className="text-sm font-normal text-gray-500 ml-2">({alarms.filter(a => !a.acknowledged).length} sin reconocer)</span>
          </h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/alarmas')} 
          className="mr-2"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Ver todas
        </Button>
        <div className="flex space-x-3">
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 border border-red-200">
              <BellRing className="h-4 w-4 mr-1" />
              {alarms.filter(a => a.severity === "critical" && !a.acknowledged).length}
            </span>
            <span className="text-xs text-red-600 mt-1">Críticas</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-amber-100 text-amber-700 border border-amber-200">
              <Bell className="h-4 w-4 mr-1" />
              {alarms.filter(a => a.severity === "warning" && !a.acknowledged).length}
            </span>
            <span className="text-xs text-amber-600 mt-1">Advertencias</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSyncAlarms} 
            disabled={loading}
            className="ml-2 h-9"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}
      
      {lastUpdated && (
        <div className="mb-4 text-xs text-gray-500">
          Última actualización: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      {alarms.length === 0 ? (
        <div className="text-center py-10 bg-green-50 rounded-lg border border-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-lg font-medium text-green-700">No hay alarmas activas en este momento</p>
          <p className="text-sm text-green-600 mt-1">El sistema está funcionando correctamente</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 max-h-[350px] overflow-y-auto shadow-sm">
          <ul className="divide-y divide-gray-200">
            {alarms.map((alarm) => (
              <li 
                key={alarm.id} 
                className={`p-4 flex items-start justify-between ${
                  alarm.acknowledged ? "bg-gray-50" : getSeverityColor(alarm.severity)
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-0.5">
                    {alarm.acknowledged ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      getSeverityIcon(alarm.severity)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {alarm.deviceName} ({alarm.deviceId})
                      </p>
                      {alarm.component && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                          {alarm.component}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{alarm.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(alarm.timestamp)}
                    </p>
                  </div>
                </div>
                {!alarm.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlarm(alarm.id)}
                    className="ml-3 flex-shrink-0 bg-white rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-3 py-1 border border-gray-300"
                  >
                    Reconocer
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AlarmPanel;
