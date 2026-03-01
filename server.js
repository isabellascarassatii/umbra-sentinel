require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

// Configurações Globais
app.use(cors());
app.use(express.json());

// 1. Configuração do POOL (Resolve erro de conexão fechada no Railway)
const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// 2. MIDDLEWARE: Sentinela de Auditoria
app.use(async (req, res, next) => {
    // Filtros para evitar logs fantasmas ou loops
    if (
        req.method === 'OPTIONS' || 
        req.path === '/api/logs' || 
        req.path.includes('favicon')
    ) {
        return next();
    }

    const { ip, method, path } = req;
    
    // Define se o acesso é sensível (ignora a home '/' para não poluir como alerta)
    const isSensitive = path.toLowerCase().includes('restrita');
    const status = isSensitive ? '⚠️ ALERTA: Acesso Sensível' : 'Acesso Permitido';

    const query = "INSERT INTO logs_auditoria (ip_usuario, metodo, rota, status_acesso) VALUES (?, ?, ?, ?)";
    
    try {
        await pool.execute(query, [ip, method, path, status]);
    } catch (err) {
        console.error("⚠️ Falha ao registrar log:", err.message);
    }
    next();
});

// 3. ROTAS COM ESTÉTICA GÓTICA

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Umbra Sentinel | Core</title>
                <style>
                    body { background: #0a0a0a; color: #ef4444; font-family: 'Courier New', monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .container { border: 1px solid #1a1a1a; padding: 40px; border-radius: 8px; box-shadow: 0 0 20px rgba(239, 68, 68, 0.1); text-align: center; }
                    .status { font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; opacity: 0.6; margin-bottom: 10px; }
                    h1 { font-size: 1.5rem; margin: 0; font-weight: normal; letter-spacing: -1px; }
                    .blink { animation: blinker 1.5s linear infinite; }
                    @keyframes blinker { 50% { opacity: 0; } }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="status"><span class="blink">●</span> Vigilância Ativa</div>
                    <h1>UMBRA SENTINEL API</h1>
                    <p style="color: #444; font-size: 0.9rem; margin-top: 20px;">Kernel v1.0.0 | Estação: Railway</p>
                </div>
            </body>
        </html>
    `);
});

app.get('/api/area-restrita', (req, res) => {
    const data = { alerta: "Sinal capturado!", origem: req.ip, timestamp: new Date().toISOString() };
    res.send(`
        <html>
            <head>
                <title>⚠️ BREACH DETECTED</title>
                <style>
                    body { background: #000; color: #fff; font-family: 'Courier New', monospace; padding: 20px; }
                    .alert-box { border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.1); padding: 20px; max-width: 600px; margin: 50px auto; }
                    h2 { color: #ef4444; margin-top: 0; }
                    pre { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 4px; color: #22c55e; overflow-x: auto; }
                </style>
            </head>
            <body>
                <div class="alert-box">
                    <h2>⚠️ INTRUSÃO DETECTADA</h2>
                    <p>Dados interceptados:</p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            </body>
        </html>
    `);
});

// Rota para o Dashboard
app.get('/api/logs', async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM logs_auditoria ORDER BY timestamp DESC LIMIT 50");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar logs" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 UMBRA SENTINEL ATIVA NA PORTA: ${PORT}`));