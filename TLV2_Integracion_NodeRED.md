# Integración de TLV2 con Node-RED

## Resumen de Cambios Realizados

### 1. Actualización de la Interfaz TLV2StatusData

Se actualizó la interfaz `TLV2StatusData` en el archivo `api.ts` para que coincida con la nueva estructura de la tabla `tlv2_status` en MariaDB:

```typescript
export interface TLV2StatusData {
  id: number;
  tlv2_modo: number;
  tlv2_ocupacion: number;
  tlv2_averia: number;
  tlv2_reserva_3: number | null;
  tlv2_reserva_4: number | null;
  tlv2_reserva_5: number | null;
  tlv2_reserva_6: number | null;
  tlv2_reserva_7: number | null;
  tlv2_reserva_8: number | null;
  tlv2_reserva_9: number | null;
  tlv2_coord_x_actual: number | null;
  tlv2_coord_y_actual: number | null;
  tlv2_coord_z_actual: number | null;
  tlv2_matricula_actual: number | null;
  tlv2_tarea_actual: string | null;
  tlv2_uma_actual: string | null;
  tlv2_pasillo_actual: number | null;
  tlv2_orden_tipo: number;
  tlv2_orden_pasillo_origen: number | null;
  tlv2_orden_coord_x_origen: number | null;
  tlv2_orden_coord_y_origen: number | null;
  tlv2_orden_coord_z_origen: number;
  tlv2_orden_pasillo_destino: number | null;
  tlv2_orden_coord_x_destino: number | null;
  tlv2_orden_coord_y_destino: number | null;
  tlv2_orden_coord_z_destino: number;
  tlv2_orden_matricula: number | null;
  tlv2_fin_orden_estado: number;
  tlv2_fin_orden_resultado: number | null;
  tlv2_fin_orden_pasillo_destino: number | null;
  tlv2_fin_orden_coord_x_destino: number | null;
  tlv2_fin_orden_coord_y_destino: number | null;
  tlv2_fin_orden_coord_z_destino: number;
  timestamp: string;
  
  // Campos mapeados para compatibilidad con el código existente
  modo?: number;
  ocupacion?: number;
  averia?: number;
  matricula?: number;
  pasillo_actual?: number;
  x_actual?: number;
  y_actual?: number;
  z_actual?: number;
  estadoFinOrden?: number;
  resultadoFinOrden?: number;
}
```

### 2. Creación del Servicio TLV2StatusApi

Se creó un nuevo archivo `tlv2StatusApi.ts` siguiendo el mismo patrón que `tlv1StatusApi.ts`:

```typescript
import { MARIADB_API_URL, TLV2StatusData } from './api';
import axios from 'axios';

// URLs para los endpoints de TLV2 en Node-RED
const TLV2_STATUS_URL = `${MARIADB_API_URL}/tlv2/status`;
const TLV2_STATUS_SYNC_URL = `${MARIADB_API_URL}/tlv2/status/sync`;

// Exportar las URLs para usarlas en otros componentes
export { TLV2_STATUS_URL, TLV2_STATUS_SYNC_URL };

// Función para obtener el estado del TLV2 directamente desde Node-RED
export const getTLV2StatusDirectFromNodeRED = async (): Promise<TLV2StatusData | null> => {
  try {
    console.log('Solicitando datos del TLV2 desde Node-RED:', TLV2_STATUS_URL);
    const response = await axios.get(TLV2_STATUS_URL);
    
    // Manejar diferentes formatos de respuesta posibles de Node-RED
    let apiData;
    
    // Verificar si la respuesta es un array (como parece ser el caso en la consulta manual)
    if (Array.isArray(response.data) && response.data.length > 0) {
      // Si es un array, tomamos el primer elemento
      apiData = response.data[0];
      console.log('Respuesta de Node-RED es un array, tomando el primer elemento:', apiData);
    } else if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      // Formato: { success: true, data: {...} }
      apiData = response.data.data;
    } else if (response.data && typeof response.data === 'object') {
      // Formato: directamente el objeto de datos
      apiData = response.data;
    } else {
      console.error('Formato de respuesta no reconocido para el TLV2:', response.data);
      throw new Error('Formato de respuesta no reconocido para el TLV2');
    }
    
    console.log('Datos del TLV2 desde Node-RED:', apiData);
    
    // Mapear los campos según los nombres exactos que vemos en la tabla
    const convertedData: TLV2StatusData = {
      id: apiData.id ?? 0,
      tlv2_modo: apiData.tlv2_modo ?? 0,
      tlv2_ocupacion: apiData.tlv2_ocupacion ?? 0,
      tlv2_averia: apiData.tlv2_averia ?? 0,
      tlv2_reserva_3: apiData.tlv2_reserva_3 ?? null,
      tlv2_reserva_4: apiData.tlv2_reserva_4 ?? null,
      tlv2_reserva_5: apiData.tlv2_reserva_5 ?? null,
      tlv2_reserva_6: apiData.tlv2_reserva_6 ?? null,
      tlv2_reserva_7: apiData.tlv2_reserva_7 ?? null,
      tlv2_reserva_8: apiData.tlv2_reserva_8 ?? null,
      tlv2_reserva_9: apiData.tlv2_reserva_9 ?? null,
      tlv2_coord_x_actual: apiData.tlv2_coord_x_actual ?? null,
      tlv2_coord_y_actual: apiData.tlv2_coord_y_actual ?? null,
      tlv2_coord_z_actual: apiData.tlv2_coord_z_actual ?? null,
      tlv2_matricula_actual: apiData.tlv2_matricula_actual ?? null,
      tlv2_tarea_actual: apiData.tlv2_tarea_actual ?? null,
      tlv2_uma_actual: apiData.tlv2_uma_actual ?? null,
      tlv2_pasillo_actual: apiData.tlv2_pasillo_actual ?? null,
      tlv2_orden_tipo: apiData.tlv2_orden_tipo ?? 0,
      tlv2_orden_pasillo_origen: apiData.tlv2_orden_pasillo_origen ?? null,
      tlv2_orden_coord_x_origen: apiData.tlv2_orden_coord_x_origen ?? null,
      tlv2_orden_coord_y_origen: apiData.tlv2_orden_coord_y_origen ?? null,
      tlv2_orden_coord_z_origen: apiData.tlv2_orden_coord_z_origen ?? 0,
      tlv2_orden_pasillo_destino: apiData.tlv2_orden_pasillo_destino ?? null,
      tlv2_orden_coord_x_destino: apiData.tlv2_orden_coord_x_destino ?? null,
      tlv2_orden_coord_y_destino: apiData.tlv2_orden_coord_y_destino ?? null,
      tlv2_orden_coord_z_destino: apiData.tlv2_orden_coord_z_destino ?? 0,
      tlv2_orden_matricula: apiData.tlv2_orden_matricula ?? null,
      tlv2_fin_orden_estado: apiData.tlv2_fin_orden_estado ?? 0,
      tlv2_fin_orden_resultado: apiData.tlv2_fin_orden_resultado ?? null,
      tlv2_fin_orden_pasillo_destino: apiData.tlv2_fin_orden_pasillo_destino ?? null,
      tlv2_fin_orden_coord_x_destino: apiData.tlv2_fin_orden_coord_x_destino ?? null,
      tlv2_fin_orden_coord_y_destino: apiData.tlv2_fin_orden_coord_y_destino ?? null,
      tlv2_fin_orden_coord_z_destino: apiData.tlv2_fin_orden_coord_z_destino ?? 0,
      timestamp: apiData.timestamp ?? new Date().toISOString(),
      
      // Campos mapeados para compatibilidad con el código existente
      modo: apiData.tlv2_modo ?? 0,
      ocupacion: apiData.tlv2_ocupacion ?? 0,
      averia: apiData.tlv2_averia ?? 0,
      matricula: apiData.tlv2_matricula_actual ?? 0,
      pasillo_actual: apiData.tlv2_pasillo_actual ?? 0,
      x_actual: apiData.tlv2_coord_x_actual ?? 0,
      y_actual: apiData.tlv2_coord_y_actual ?? 0,
      z_actual: apiData.tlv2_coord_z_actual ?? 0,
      estadoFinOrden: apiData.tlv2_fin_orden_estado ?? 0,
      resultadoFinOrden: apiData.tlv2_fin_orden_resultado ?? 0
    };
    
    return convertedData;
  } catch (error) {
    console.error('Error al obtener datos del TLV2 desde Node-RED:', error);
    return null;
  }
};

// Función para obtener los datos del TLV2 desde MariaDB (en realidad desde Node-RED)
export const getTLV2StatusFromMariaDB = async (): Promise<TLV2StatusData> => {
  try {
    console.log('Obteniendo datos del TLV2 directamente desde Node-RED');
    
    // Usamos la función que ya hemos implementado
    const response = await getTLV2StatusDirectFromNodeRED();
    console.log('Respuesta de Node-RED para TLV2:', response);
    
    if (!response) {
      throw new Error('No se pudo obtener datos del TLV2 desde Node-RED');
    }
    
    return response;
  } catch (error) {
    console.error('Error al obtener datos del TLV2:', error);
    // En caso de error, devolvemos un objeto con valores por defecto
    return {
      id: 0,
      tlv2_modo: 0,
      tlv2_ocupacion: 0,
      tlv2_averia: 0,
      tlv2_reserva_3: null,
      tlv2_reserva_4: null,
      tlv2_reserva_5: null,
      tlv2_reserva_6: null,
      tlv2_reserva_7: null,
      tlv2_reserva_8: null,
      tlv2_reserva_9: null,
      tlv2_coord_x_actual: null,
      tlv2_coord_y_actual: null,
      tlv2_coord_z_actual: null,
      tlv2_matricula_actual: null,
      tlv2_tarea_actual: null,
      tlv2_uma_actual: null,
      tlv2_pasillo_actual: null,
      tlv2_orden_tipo: 0,
      tlv2_orden_pasillo_origen: null,
      tlv2_orden_coord_x_origen: null,
      tlv2_orden_coord_y_origen: null,
      tlv2_orden_coord_z_origen: 0,
      tlv2_orden_pasillo_destino: null,
      tlv2_orden_coord_x_destino: null,
      tlv2_orden_coord_y_destino: null,
      tlv2_orden_coord_z_destino: 0,
      tlv2_orden_matricula: null,
      tlv2_fin_orden_estado: 0,
      tlv2_fin_orden_resultado: null,
      tlv2_fin_orden_pasillo_destino: null,
      tlv2_fin_orden_coord_x_destino: null,
      tlv2_fin_orden_coord_y_destino: null,
      tlv2_fin_orden_coord_z_destino: 0,
      timestamp: new Date().toISOString(),
      
      // Campos mapeados para compatibilidad con el código existente
      modo: 0,
      ocupacion: 0,
      averia: 0,
      matricula: 0,
      pasillo_actual: 0,
      x_actual: 0,
      y_actual: 0,
      z_actual: 0,
      estadoFinOrden: 0,
      resultadoFinOrden: 0
    };
  }
};

// Función para sincronizar el estado del TLV2 en la base de datos a través de Node-RED
export const syncTLV2StatusInDB = async (tlv2Status?: Partial<TLV2StatusData>): Promise<any> => {
  // Lista de rutas posibles a probar, en orden de prioridad
  const possibleRoutes = [
    '/tlv2/status/sync',
    TLV2_STATUS_SYNC_URL
  ];
  
  let lastError: any = null;
  
  // Probar cada ruta hasta encontrar una que funcione
  for (const route of possibleRoutes) {
    try {
      console.log(`Intentando sincronizar estado del TLV2 en Node-RED usando ruta: ${route}`);
      
      // Construir la URL completa
      const fullUrl = route.startsWith('http') ? route : `${MARIADB_API_URL}${route}`;
      console.log('URL completa para sincronización de TLV2:', fullUrl);
      
      // Realizar la petición POST con los datos del TLV2
      const response = await axios.post(fullUrl, tlv2Status || {});
      console.log('Respuesta de sincronización de TLV2:', response.data);
      
      // Guardar la ruta que funcionó para futuras referencias
      localStorage.setItem('workingTLV2SyncRoute', route);
      
      return response.data;
    } catch (error) {
      console.error(`Error al intentar sincronizar TLV2 usando ruta ${route}:`, error);
      lastError = error;
      // Continuar con la siguiente ruta
    }
  }
  
  // Si llegamos aquí, ninguna ruta funcionó
  console.error('Todas las rutas de sincronización de TLV2 fallaron. Último error:', lastError);
  throw new Error('No se pudo sincronizar el estado del TLV2 con ninguna de las rutas disponibles');
};
```

### 3. Actualización de SiloVisualization

Se modificarían las importaciones en `SiloVisualization.tsx` para que utilice la nueva función `getTLV2StatusFromMariaDB` desde `tlv2StatusApi.ts`:

```typescript
import { TLV1StatusData, TLV2StatusData, PTStatusData } from '../services/api';
import { getTLV1StatusFromMariaDB } from '../services/tlv1StatusApi';
import { getTLV2StatusFromMariaDB } from '../services/tlv2StatusApi';
import { getPTStatusDirectFromNodeRED } from '../services/ptStatusApi';
```

### 4. Creación de Página de Prueba

Se creó una página HTML de prueba `test-tlv2-api.html` en la carpeta `public` para verificar la integración con los endpoints de TLV2 en Node-RED:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba API TLV2 - Node-RED</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .panel {
            flex: 1;
            min-width: 300px;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            background-color: #f9f9f9;
        }
        button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
        }
        button:hover {
            background-color: #45a049;
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .success {
            color: green;
            font-weight: bold;
        }
        .error {
            color: red;
            font-weight: bold;
        }
        .warning {
            color: orange;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>Prueba de API TLV2 con Node-RED</h1>
    
    <div class="container">
        <div class="panel">
            <h2>Obtener Estado del TLV2</h2>
            <button id="btnGetTLV2Status">Obtener Estado</button>
            <div>
                <h3>Respuesta:</h3>
                <pre id="tlv2StatusResponse">Esperando respuesta...</pre>
            </div>
        </div>
        
        <div class="panel">
            <h2>Sincronizar Estado del TLV2</h2>
            <button id="btnSyncTLV2Status">Sincronizar Estado</button>
            <div>
                <h3>Respuesta:</h3>
                <pre id="tlv2SyncResponse">Esperando respuesta...</pre>
            </div>
        </div>
    </div>

    <script>
        // Configuración de URLs
        const apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:1880/api'
            : `http://${window.location.hostname}:1880/api`;
        
        const TLV2_STATUS_URL = `${apiBaseUrl}/tlv2/status`;
        const TLV2_STATUS_SYNC_URL = `${apiBaseUrl}/tlv2/status/sync`;
        
        // Función para mostrar mensajes en la interfaz
        function showResponse(elementId, data, isError = false) {
            const element = document.getElementById(elementId);
            if (isError) {
                element.innerHTML = `<span class="error">Error: ${JSON.stringify(data, null, 2)}</span>`;
            } else {
                element.innerHTML = `<span class="success">Éxito:</span> <pre>${JSON.stringify(data, null, 2)}</pre>`;
            }
        }
        
        // Función para obtener el estado del TLV2
        async function getTLV2Status() {
            const responseElement = document.getElementById('tlv2StatusResponse');
            responseElement.innerHTML = 'Obteniendo datos...';
            
            try {
                const response = await fetch(TLV2_STATUS_URL);
                const data = await response.json();
                showResponse('tlv2StatusResponse', data);
                console.log('Datos del TLV2:', data);
            } catch (error) {
                showResponse('tlv2StatusResponse', error.message, true);
                console.error('Error al obtener datos del TLV2:', error);
            }
        }
        
        // Función para sincronizar el estado del TLV2
        async function syncTLV2Status() {
            const responseElement = document.getElementById('tlv2SyncResponse');
            responseElement.innerHTML = 'Sincronizando datos...';
            
            try {
                const response = await fetch(TLV2_STATUS_SYNC_URL, {
                    method: 'GET'
                });
                const data = await response.json();
                showResponse('tlv2SyncResponse', data);
                console.log('Sincronización del TLV2:', data);
            } catch (error) {
                showResponse('tlv2SyncResponse', error.message, true);
                console.error('Error al sincronizar datos del TLV2:', error);
            }
        }
        
        // Asignar eventos a los botones
        document.getElementById('btnGetTLV2Status').addEventListener('click', getTLV2Status);
        document.getElementById('btnSyncTLV2Status').addEventListener('click', syncTLV2Status);
        
        // Mostrar las URLs configuradas
        console.log('URLs configuradas:', {
            TLV2_STATUS_URL,
            TLV2_STATUS_SYNC_URL
        });
    </script>
</body>
</html>
```

## Configuración de Endpoints en Node-RED

Los endpoints configurados para TLV2 son:

1. `/api/tlv2/status` - Para obtener el estado actual del TLV2
2. `/api/tlv2/status/sync` - Para sincronizar/actualizar el estado del TLV2

## Prueba de la Integración

Para probar la integración:

1. Iniciar el servidor de desarrollo: `npm run dev`
2. Acceder a la página de prueba: `http://localhost:5000/test-tlv2-api.html`
3. Utilizar los botones para obtener el estado del TLV2 y sincronizarlo con la base de datos

## Consideraciones Adicionales

- La integración sigue el mismo patrón que se utilizó para el TLV1, manteniendo consistencia en el código.
- Se mantuvieron campos mapeados para compatibilidad con el código existente.
- La interfaz `TLV2StatusData` refleja la estructura actual de la tabla `tlv2_status` en MariaDB.
- La función `getTLV2StatusFromMariaDB` ahora utiliza Node-RED para obtener los datos, siguiendo el mismo patrón que `getTLV1StatusFromMariaDB`.
