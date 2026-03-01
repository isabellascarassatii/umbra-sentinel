import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Activity, AlertTriangle } from 'lucide-react';

const App = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const fetchLogs = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'https://umbra-sentinel-production.up.railway.app';
    
    axios.get(`${API_URL}/api/logs`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setLogs(res.data);
          setError(null);
        }
      })
      .catch(() => {
        setError("A sentinela está fora de alcance. Verifique a conexão.");
      });
  };

  useEffect(() => {
    document.title = "Umbra Sentinel | Auditoria";
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container" style={{ background: '#050505', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
      <header style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Shield /> UMBRA SENTINEL
        </h1>
        <div style={{ opacity: 0.6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color={error ? "#ef4444" : "#22c55e"} /> 
          {error ? "SYSTEM CRITICAL" : "SYSTEM OPERATIONAL"}
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '15px', borderRadius: '4px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#ef4444', borderBottom: '1px solid #1a1a1a' }}>
            <th style={{ padding: '12px' }}>TIMESTAMP</th>
            <th style={{ padding: '12px' }}>ORIGEM (IP)</th>
            <th style={{ padding: '12px' }}>MÉTODO</th>
            <th style={{ padding: '12px' }}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} style={{ borderBottom: '1px solid #0f0f0f' }}>
              <td style={{ padding: '12px', opacity: 0.5 }}>{new Date(log.timestamp).toLocaleString()}</td>
              <td style={{ padding: '12px' }}>{log.ip_usuario}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ background: '#1a1a1a', padding: '2px 8px', borderRadius: '4px' }}>{log.metodo}</span>
              </td>
              <td style={{ 
                padding: '12px', 
                color: log.status_acesso.includes('ALERTA') ? '#ef4444' : '#22c55e',
                fontWeight: 'bold'
              }}>
                ● {log.status_acesso}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
