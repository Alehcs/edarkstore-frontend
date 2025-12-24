import axios from 'axios';

//La URL del Backend (Serverless Offline)
const API_URL = 'http://localhost:3000/dev';

export const getIndicators = async () => {
    try {
        const response = await axios.get(`${API_URL}/indicadores`);
        
        console.log('=== DEBUGGING API RESPONSE ===');
        console.log('1. Response completo:', response);
        console.log('2. Response.data:', response.data);
        console.log('3. Tipo de response.data:', typeof response.data);
        
        let data = response.data;
        
        //Si el body viene como string JSON, parsearlo
        if (typeof data === 'string') {
            console.log('4. Parseando body como JSON string...');
            data = JSON.parse(data);
        }
        
        console.log('5. Data después de parsear:', data);
        
        //Normalizar la estructura: combinar UF y Dólar en un solo array
        const indicators = [];
        
        //Procesar items de UF
        if (data.uf && Array.isArray(data.uf)) {
            console.log('6. Items de UF encontrados:', data.uf.length);
            data.uf.forEach(item => {
                indicators.push({
                    codigo: 'UF',
                    id: 'UF',
                    fecha: item.fecha,
                    valor: item.valor,
                    urlPdf: item.s3_url || item.urlPdf || null
                });
            });
        }
        
        //Procesar items de Dólar
        if (data.dolar && Array.isArray(data.dolar)) {
            console.log('7. Items de DOLAR encontrados:', data.dolar.length);
            data.dolar.forEach(item => {
                indicators.push({
                    codigo: 'DOLAR',
                    id: 'DOLAR',
                    fecha: item.fecha,
                    valor: item.valor,
                    urlPdf: item.s3_url || item.urlPdf || null
                });
            });
        }
        
        //Si viene en otro formato (array directo con Items)
        if (data.Items && Array.isArray(data.Items)) {
            console.log('8. Items encontrados en data.Items:', data.Items.length);
            data.Items.forEach(item => {
                indicators.push({
                    codigo: item.codigo || item.id,
                    id: item.id || item.codigo,
                    fecha: item.fecha,
                    valor: item.valor,
                    urlPdf: item.s3_url || item.urlPdf || null
                });
            });
        }
        
        //Si viene como array directo
        if (Array.isArray(data) && !data.uf && !data.dolar) {
            console.log('9. Array directo encontrado:', data.length);
            data.forEach(item => {
                indicators.push({
                    codigo: item.codigo || item.id,
                    id: item.id || item.codigo,
                    fecha: item.fecha,
                    valor: item.valor,
                    urlPdf: item.s3_url || item.urlPdf || null
                });
            });
        }
        
        console.log('10. RESULTADO FINAL - Total de indicadores:', indicators.length);
        console.log('11. Indicadores procesados:', indicators);
        console.log('=== FIN DEBUGGING ===');
        
        return indicators;
        
    } catch (error) {
        console.error("[API] Error conectando con el Backend:", error);
        console.error("[API] Detalles del error:", error.response?.data || error.message);
        throw error;
    }
};

export const triggerUFCreation = async () => {
    try {
        console.log('[API] Generando nueva UF...');
        const response = await axios.post(`${API_URL}/indicadores/uf`);
        console.log('[API] UF generada exitosamente:', response.data);
        return response.data;
    } catch (error) {
        console.error("[API] Error generando UF:", error);
        console.error("[API] Detalles del error:", error.response?.data || error.message);
        throw error;
    }
};