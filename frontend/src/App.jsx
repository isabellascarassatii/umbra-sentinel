import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Activity } from 'lucide-react';

const App = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Agora o Backend já está enviando os dados, como vimos no seu terminal!
    axios.get('http://localhost:3000/api/logs').then(res => setLogs(res.data));
  }, []);

  return (
    <div className="dashboard-container">
      <header className="header-umbra">
        <h1 className="flex items-center gap-2">
          <Shield /> UMBRA SENTINEL
        </h1>
        <div style={{ opacity: 0.6, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="#22c55e" /> SYSTEM OPERATIONAL
        </div>
      </header>

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
          {logs.map(log => (
            <tr key={log.id}>
              <td style={{ opacity: 0.6, fontSize: '0.8rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
              <td style={{ fontWeight: 'bold' }}>{log.ip_usuario}</td>
              <td><span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{log.metodo}</span></td>
              <td className="status-bullet">● {log.status_acesso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;