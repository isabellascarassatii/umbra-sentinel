import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Activity, AlertTriangle } from 'lucide-react';

const App = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null); // Novo estado para capturar falhas

  useEffect(() => {
    document.title = "Umbra Sentinel | Auditoria de Segurança";

    const API_URL = import.meta.env.VITE_API_URL || 'https://umbra-sentinel-production.up.railway.app';

    axios.get(`${API_URL}/api/logs`)
      .then(res => {
        // Verifica se a resposta é de fato a lista de logs (um array)
        if (Array.isArray(res.data)) {
          setLogs(res.data);
          setError(null);
        } else {
          // Se a API mandar {"error": "..."}, capturamos aqui
          setError(res.data.error || "Erro inesperado nos dados.");
        }
      })
      .catch(err => {
        console.error("Erro ao buscar logs da nuvem:", err);
        setError("A sentinela está fora de alcance. Verifique a conexão com o banco.");
      });
  }, []);

  return (
    <div className="dashboard-container">
      <header className="header-umbra">
        <h1 className="flex items-center gap-2">
          <Shield /> UMBRA SENTINEL
        </h1>
        <div style={{ opacity: 0.6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color={error ? "#ef4444" : "#22c55e"} /> 
          {error ? "SYSTEM CRITICAL" : "SYSTEM OPERATIONAL"}
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '4px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      <table className="logs-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Origem (IP)</th>
            <th>Método</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map(log => (
              <tr key={log.id}>
                <td style={{ opacity: 0.6, fontSize: '0.8rem' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td style={{ fontWeight: 'bold' }}>{log.ip_usuario}</td>
                <td>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {log.metodo}
                  </span>
                </td>
                <td className="status-bullet">● {log.status_acesso}</td>
              </tr>
            ))
          ) : !error && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', opacity: 0.5 }}>
                Aguardando sinais da sentinela...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default App;