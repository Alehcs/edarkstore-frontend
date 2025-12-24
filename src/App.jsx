import { useEffect, useState, useMemo } from 'react';
import { getIndicators, triggerUFCreation } from './services/api';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Cargar datos
  const loadData = async () => {
    console.log('[LoadData] Iniciando carga de datos...');
    setLoading(true);
    try {
      const result = await getIndicators();
      
      console.log('[LoadData] Datos recibidos:', result);
      console.log('[LoadData] Es array:', Array.isArray(result));
      console.log('[LoadData] Cantidad de items:', result?.length);
      
      //Validar que result sea un array
      if (!Array.isArray(result)) {
        console.warn('[LoadData] Los datos NO son un array. Convirtiendo a array vacío.');
        setData([]);
        setError('El formato de datos del backend es incorrecto.');
        return;
      }
      
      //Ordenar por fecha (más nuevo primero)
      const sortedData = result.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateB - dateA;
      });
      
      console.log('[LoadData] Datos ordenados correctamente:', sortedData);
      setData(sortedData);
      setError(null);
      
    } catch (err) {
      console.error('[LoadData] Error:', err);
      console.error('[LoadData] Stack trace:', err.stack);
      setError('Error de conexión. Revisa que el Backend esté corriendo (sls offline).');
    } finally {
      setLoading(false);
      console.log('[LoadData] Carga de datos finalizada');
    }
  };

  //Generar nueva UF
  const handleGenerateUF = async () => {
    console.log('[GenerateUF] Iniciando generación de UF...');
    setLoading(true);
    try {
      const result = await triggerUFCreation();
      console.log('[GenerateUF] UF generada correctamente:', result);
      
      //Espera para que la base de datos se actualice
      console.log('[GenerateUF] Esperando 1.5 segundos antes de recargar datos...');
      setTimeout(() => {
        loadData();
      }, 1500);
      
    } catch (err) {
      console.error('[GenerateUF] Error al generar UF:', err);
      alert("No se pudo generar la UF. Revisa la consola para más detalles.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  //Formatear moneda en pesos chilenos
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) {
      console.warn('[FormatCurrency] Valor inválido para formatear:', value);
      return '-';
    }
    
    try {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } catch (error) {
      console.error('[FormatCurrency] Error formateando moneda:', error);
      return `$${value}`;
    }
  };

  //Formatear fecha a formato legible DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) {
      console.warn('[FormatDate] Fecha vacía recibida');
      return '-';
    }
    
    try {
      const date = new Date(dateString);
      
      //Validar que la fecha sea válida
      if (isNaN(date.getTime())) {
        console.warn('[FormatDate] Fecha inválida:', dateString);
        return dateString; //Devolver el string original si no se puede parsear
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('[FormatDate] Error formateando fecha:', error);
      return dateString;
    }
  };

  //Obtener nombre completo del indicador
  const getIndicatorName = (codigo) => {
    const names = {
      'UF': 'Unidad de Fomento',
      'DOLAR': 'Dólar Observado',
      'USD': 'Dólar Observado'
    };
    return names[codigo?.toUpperCase()] || codigo || '-';
  };

  //Obtener el valor más reciente de UF
  const latestUF = useMemo(() => {
    const ufItems = data.filter(item => 
      (item.codigo?.toUpperCase() === 'UF' || item.id?.toUpperCase() === 'UF')
    );
    return ufItems.length > 0 ? ufItems[0] : null;
  }, [data]);

  //Obtener el valor más reciente de Dólar
  const latestDolar = useMemo(() => {
    const dolarItems = data.filter(item => 
      (item.codigo?.toUpperCase() === 'DOLAR' || 
       item.codigo?.toUpperCase() === 'USD' ||
       item.id?.toUpperCase() === 'DOLAR' ||
       item.id?.toUpperCase() === 'USD')
    );
    return dolarItems.length > 0 ? dolarItems[0] : null;
  }, [data]);

  //Manejar actualización de Dólar (simulación)
  const handleUpdateDolar = () => {
    alert('La actualización del Dólar es automática desde el backend. Usa el botón "Actualizar" para refrescar los datos.');
    loadData();
  };

  return (
    <div className="dashboard-container">
      {/* Header Principal */}
      <header className="dashboard-header">
          <div className="header-content">
            <div className="header-title-wrapper">
              <img src="/edarkstore-logo.png" alt="eDarkStore Logo" className="header-logo" />
              <h1 className="main-title">Indicadores eDarkStore</h1>
            </div>
          <p className="main-subtitle">Panel de control de indicadores económicos en tiempo real</p>
        </div>
        <button 
          className="btn-refresh" 
          onClick={loadData} 
          disabled={loading}
          title="Actualizar todos los indicadores"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </header>

      {/* Mensaje de Error */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Layout Principal - Tarjetas y Historial */}
      <div className="main-layout">
        {/* Columna Izquierda - UF y Historial */}
        <div className="left-column">
          {/* Tarjeta UF */}
          <div className="indicator-card card-uf">
            <div className="card-header">
              <div className="card-icon uf-icon">UF</div>
              <div className="card-meta">
                <h2 className="card-title">Unidad de Fomento</h2>
                <p className="card-date">
                  {latestUF ? formatDate(latestUF.fecha) : 'Sin datos'}
                </p>
              </div>
            </div>
            
            <div className="card-value">
              {latestUF ? formatCurrency(latestUF.valor) : '$ --'}
            </div>
            
            <div className="card-footer">
              <button 
                className="card-action-btn btn-primary"
                onClick={handleGenerateUF}
                disabled={loading}
              >
                {loading ? 'Generando...' : 'Generar Valor Hoy'}
              </button>
              {latestUF?.urlPdf && (
                <a 
                  href={latestUF.urlPdf} 
                  target="_blank" 
                  rel="noreferrer"
                  className="card-link"
                >
                  Ver Documento PDF
                </a>
              )}
            </div>
          </div>

          {/* Historial debajo de UF */}
          <section className="history-section">
            <div className="section-header">
              <h2 className="section-title">Historial de Registros</h2>
              <span className="section-count">
                {data.length} {data.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>

            <div className="table-card">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tipo de Indicador</th>
                      <th>Fecha</th>
                      <th>Valor (CLP)</th>
                      <th>Documento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && data.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          <div className="loading-message">
                            <span className="loading-spinner"></span>
                            Cargando datos...
                          </div>
                        </td>
                      </tr>
                    ) : data.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          <div className="empty-message">
                            No hay datos registrados. Genera un nuevo valor para comenzar.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr key={index}>
                          <td className="indicator-type">
                            <span className={`badge badge-${(item.codigo || item.id)?.toLowerCase()}`}>
                              {getIndicatorName(item.codigo || item.id)}
                            </span>
                          </td>
                          <td>{formatDate(item.fecha)}</td>
                          <td className="value-cell">
                            {formatCurrency(item.valor)}
                          </td>
                          <td>
                            {item.urlPdf ? (
                              <a 
                                href={item.urlPdf} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="pdf-link"
                              >
                                Ver PDF
                              </a>
                            ) : (
                              <span className="no-document">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* Columna Derecha - Dólar */}
        <div className="right-column">
          {/* Tarjeta Dólar */}
          <div className="indicator-card card-dolar">
            <div className="card-header">
              <div className="card-icon dolar-icon">USD</div>
              <div className="card-meta">
                <h2 className="card-title">Dólar Observado</h2>
                <p className="card-date">
                  {latestDolar ? formatDate(latestDolar.fecha) : 'Sin datos'}
                </p>
              </div>
            </div>
            
            <div className="card-value">
              {latestDolar ? formatCurrency(latestDolar.valor) : '$ --'}
            </div>
            
            <div className="card-footer">
              <button 
                className="card-action-btn btn-primary"
                onClick={handleUpdateDolar}
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar Valor'}
              </button>
              {latestDolar?.urlPdf && (
                <a 
                  href={latestDolar.urlPdf} 
                  target="_blank" 
                  rel="noreferrer"
                  className="card-link"
                >
                  Ver Documento PDF
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;