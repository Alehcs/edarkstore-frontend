# eDarkStore FrontEnd 

Interfaz web desarrollada en ReactJS + Vite para la visualización en tiempo real de indicadores económicos (UF y Dólar). Este frontend consume la API Serverless del Backend, permitiendo la consulta, generación y monitoreo de indicadores financieros almacenados en DynamoDB.

## Stack Tecnológico

- **ReactJS** v19.2.0
- **Vite** v7.2.4 (Build Tool)
- **Axios** v1.13.2 (Cliente HTTP)
- **CSS3** (Estilos nativos con diseño Responsive/Grid)

## Prerrequisitos

Antes de iniciar, asegúrese de tener instalados los siguientes componentes:

- **Node.js** v18 o superior (recomendado)
- **NPM** (incluido con Node.js)

## Guía de Instalación y Despliegue Local

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd frontend-app
```

### Paso 2: Instalación de Dependencias

Ejecute el siguiente comando para instalar todas las dependencias del proyecto:

```bash
npm install
```

### Paso 3: Ejecución en Modo Desarrollo

Inicie el servidor de desarrollo con el siguiente comando:

```bash
npm run dev
```

El servidor de desarrollo estará disponible en `http://localhost:5173` (puerto por defecto de Vite).

## Configuración de Conexión

**Importante:** La aplicación está configurada para conectarse al Backend en las siguientes direcciones locales:

- **Backend API (Serverless Offline):** `http://localhost:3000/dev`
- **Base de Datos (DynamoDB Local):** `http://localhost:8000`

Asegúrese de que tanto el Backend como DynamoDB Local estén ejecutándose antes de iniciar el frontend. De lo contrario, la aplicación no podrá obtener ni mostrar los indicadores económicos.

### Verificación de Conectividad

Si experimenta problemas de conexión, verifique que:

1. El Backend está corriendo en modo Serverless Offline
2. DynamoDB Local está activo y accesible
3. No existen conflictos de puertos en su sistema

## Funcionalidades Principales

La aplicación ofrece las siguientes capacidades:

### 1. Visualización de Tarjetas de Resumen

Muestra tarjetas informativas con el último valor registrado de cada indicador:
- Unidad de Fomento (UF)
- Dólar Observado

Cada tarjeta presenta la fecha del último registro y el valor actualizado.

### 2. Tabla Histórica de Registros

Tabla completa con el historial de todos los registros almacenados, incluyendo:
- Código del indicador (UF / DOLAR)
- Fecha del registro
- Valor del indicador
- Enlace al reporte PDF almacenado en S3

### 3. Generación Manual de UF (Trigger)

Botón de acción que permite ejecutar manualmente la función Lambda de generación de UF. Esta funcionalidad simula la obtención de datos desde la API externa del Banco Central de Chile y almacena el registro en DynamoDB.

### 4. Simulación de Cron de Dólar

Funcionalidad que permite activar manualmente el proceso automatizado de obtención del valor del Dólar. En producción, este proceso se ejecuta automáticamente mediante EventBridge Schedule.

### 5. Acceso a Reportes PDF en S3

Cada registro de indicador incluye un enlace directo al reporte PDF generado y almacenado en Amazon S3. Los usuarios pueden descargar estos reportes directamente desde la interfaz.

## Scripts Disponibles

### Desarrollo

```bash
npm run dev
```

Inicia el servidor de desarrollo con Hot Module Replacement (HMR).

### Build de Producción

```bash
npm run build
```

Genera los archivos estáticos optimizados para producción en la carpeta `dist/`.

### Vista Previa de Producción

```bash
npm run preview
```

Sirve localmente el build de producción para verificación antes del despliegue.

### Linting

```bash
npm run lint
```

Ejecuta ESLint para análisis estático del código y detección de errores.

## Estructura del Proyecto

```
frontend-app/
├── public/             # Archivos estáticos públicos
├── src/
│   ├── services/       # Servicios de API (Axios)
│   │   └── api.js      # Configuración de endpoints
│   ├── App.jsx         # Componente principal
│   ├── App.css         # Estilos principales
│   ├── main.jsx        # Punto de entrada de React
│   └── index.css       # Estilos globales
├── package.json        # Dependencias y scripts
├── vite.config.js      # Configuración de Vite
└── README.md           # Este archivo
```

## Consideraciones de Desarrollo

### Configuración de la API

La URL del Backend se define en `src/services/api.js`:

```javascript
const API_URL = 'http://localhost:3000/dev';
```

Para ambientes de producción, modifique esta variable para apuntar a la URL del API Gateway de AWS.

### Normalización de Datos

El servicio de API implementa normalización automática de las respuestas del Backend, manejando diferentes formatos de respuesta:
- Objetos agrupados por tipo (uf, dolar)
- Arrays directos con propiedad Items
- Arrays simples de indicadores

Esto garantiza compatibilidad con diferentes versiones del Backend.

## Solución de Problemas

### Error: Cannot connect to Backend

**Causa:** El Backend no está ejecutándose o no es accesible.

**Solución:** Verifique que el Backend esté corriendo en `http://localhost:3000` ejecutando:

```bash
cd ../backend
npm start
```

### Error: DynamoDB Local not found

**Causa:** DynamoDB Local no está iniciado.

**Solución:** Inicie DynamoDB Local en el puerto 8000. Consulte la documentación del Backend para instrucciones detalladas.

### Error: Module not found

**Causa:** Dependencias no instaladas correctamente.

**Solución:** Elimine `node_modules` y reinstale:

```bash
rm -rf node_modules package-lock.json
npm install
```


## Licencia

ISC.
