# Integración de TLV1 con Node-RED

## Resumen de Cambios Realizados

### 1. Actualización de la Interfaz TLV1StatusData

Se actualizó la interfaz `TLV1StatusData` en el archivo `api.ts` para que coincida con la nueva estructura de la tabla `tlv1_status` en MariaDB:

```typescript
export interface TLV1StatusData {
  id: number;
  tlv1_modo: number;
  tlv1_ocupacion: number;
  tlv1_averia: number;
  tlv1_reserva_3: number | null;
  tlv1_reserva_4: number | null;
  tlv1_reserva_5: number | null;
  tlv1_reserva_6: number | null;
  tlv1_reserva_7: number | null;
  tlv1_reserva_8: number | null;
  tlv1_reserva_9: number | null;
  tlv1_coord_x_actual: number | null;
  tlv1_coord_y_actual: number | null;
  tlv1_coord_z_actual: number | null;
  tlv1_matricula_actual: number | null;
  tlv1_tarea_actual: string | null;
  tlv1_uma_actual: string | null;
  tlv1_pasillo_actual: number | null;
  tlv1_orden_tipo: number;
  tlv1_orden_pasillo_origen: number | null;
  tlv1_orden_coord_x_origen: number | null;
  tlv1_orden_coord_y_origen: number | null;
  tlv1_orden_coord_z_origen: number;
  tlv1_orden_pasillo_destino: number | null;
  tlv1_orden_coord_x_destino: number | null;
  tlv1_orden_coord_y_destino: number | null;
  tlv1_orden_coord_z_destino: number;
  tlv1_orden_matricula: number | null;
  tlv1_fin_orden_estado: number;
  tlv1_fin_orden_resultado: number | null;
  tlv1_fin_orden_pasillo_destino: number | null;
  tlv1_fin_orden_coord_x_destino: number | null;
  tlv1_fin_orden_coord_y_destino: number | null;
  tlv1_fin_orden_coord_z_destino: number;
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

### 2. Creación del Servicio TLV1StatusApi

Se creó un nuevo archivo `tlv1StatusApi.ts` siguiendo el mismo patrón que `ctStatusApi.ts`:

```typescript
import { MARIADB_API_URL, TLV1StatusData } from './api';
import axios from 'axios';

// URLs para los endpoints de TLV1 en Node-RED
const TLV1_STATUS_URL = `${MARIADB_API_URL}/tlv1/status`;
const TLV1_STATUS_SYNC_URL = `${MARIADB_API_URL}/tlv1/status/sync`;

// Exportar las URLs para usarlas en otros componentes
export { TLV1_STATUS_URL, TLV1_STATUS_SYNC_URL };

// Función para obtener el estado del TLV1 directamente desde Node-RED
export const getTLV1StatusDirectFromNodeRED = async (): Promise<TLV1StatusData | null> => {
  // Implementación para obtener datos del TLV1 desde Node-RED
  // ...
};

// Función para obtener los datos del TLV1 desde MariaDB (en realidad desde Node-RED)
export const getTLV1StatusFromMariaDB = async (): Promise<TLV1StatusData> => {
  // Implementación para obtener datos del TLV1 y manejar errores
  // ...
};

// Función para sincronizar el estado del TLV1 en la base de datos a través de Node-RED
export const syncTLV1StatusInDB = async (tlv1Status?: Partial<TLV1StatusData>): Promise<any> => {
  // Implementación para sincronizar el estado del TLV1
  // ...
};
```

### 3. Actualización de Funciones Simuladas

Se actualizaron las funciones simuladas en `api.ts` para que utilicen la nueva estructura de la interfaz `TLV1StatusData`:

- `getTLV1HistoryFromMariaDB`
- `getTLV2StatusFromMariaDB`
- `getTLV2HistoryFromMariaDB`

### 4. Actualización de SiloVisualization

Se modificaron las importaciones en `SiloVisualization.tsx` para que utilice la nueva función `getTLV1StatusFromMariaDB` desde `tlv1StatusApi.ts`:

```typescript
import { getTLV2StatusFromMariaDB, TLV1StatusData, TLV2StatusData, PTStatusData } from '../services/api';
import { getTLV1StatusFromMariaDB } from '../services/tlv1StatusApi';
import { getPTStatusDirectFromNodeRED } from '../services/ptStatusApi';
```

### 5. Creación de Página de Prueba

Se creó una página HTML de prueba `test-tlv1-api.html` en la carpeta `public` para verificar la integración con los endpoints de TLV1 en Node-RED:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba API TLV1 - Node-RED</title>
    <!-- Estilos y contenido de la página -->
</head>
<body>
    <h1>Prueba de API TLV1 con Node-RED</h1>
    
    <div class="container">
        <div class="panel">
            <h2>Obtener Estado del TLV1</h2>
            <button id="btnGetTLV1Status">Obtener Estado</button>
            <div>
                <h3>Respuesta:</h3>
                <pre id="tlv1StatusResponse">Esperando respuesta...</pre>
            </div>
        </div>
        
        <div class="panel">
            <h2>Sincronizar Estado del TLV1</h2>
            <button id="btnSyncTLV1Status">Sincronizar Estado</button>
            <div>
                <h3>Respuesta:</h3>
                <pre id="tlv1SyncResponse">Esperando respuesta...</pre>
            </div>
        </div>
    </div>

    <script>
        // Configuración y funciones JavaScript para interactuar con los endpoints
    </script>
</body>
</html>
```

## Configuración de Endpoints en Node-RED

Los endpoints configurados para TLV1 son:

1. `/api/tlv1/status` - Para obtener el estado actual del TLV1
2. `/api/tlv1/status/sync` - Para sincronizar/actualizar el estado del TLV1

## Prueba de la Integración

Para probar la integración:

1. Iniciar el servidor de desarrollo: `npm run dev`
2. Acceder a la página de prueba: `http://localhost:5000/test-tlv1-api.html`
3. Utilizar los botones para obtener el estado del TLV1 y sincronizarlo con la base de datos

## Consideraciones Adicionales

- La integración sigue el mismo patrón que se utilizó para el CT, manteniendo consistencia en el código.
- Se mantuvieron campos mapeados para compatibilidad con el código existente.
- La interfaz `TLV1StatusData` refleja la estructura actual de la tabla `tlv1_status` en MariaDB.
- La función `getTLV1StatusFromMariaDB` ahora utiliza Node-RED para obtener los datos, siguiendo el mismo patrón que `getCTStatusFromMariaDB`.
