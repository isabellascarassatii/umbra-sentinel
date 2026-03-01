require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); 
const app = express();


app.use(cors());
app.use(express.json());


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


(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Umbra Sentinel: Banco de Dados Conectado com Sucesso.');
        connection.release();
    } catch (err) {
        console.error('❌ Umbra Sentinel: Falha crítica na conexão.', err.message);
    }
})();



app.use(async (req, res, next) => {

    if (
        req.method === 'OPTIONS' || 
        req.path === '/api/logs' || 
        req.path === '/' || 
        req.path.includes('favicon')
    ) {
        return next();
    }

    const { ip, method, path } = req; 
    

    const isSensitive = path.toLowerCase().includes('restrita');
    const status = isSensitive ? '⚠️ ALERTA: Acesso Sensível' : 'Acesso Permitido';

    const query = "INSERT INTO logs_auditoria (ip_usuario, metodo, rota, status_acesso) VALUES (?, ?, ?, ?)";
    
    try {

        await pool.execute(query, [ip, method, path, status]);
    } catch (err) {
        console.error("⚠️ Falha ao registrar log no banco:", err.message);
    }
    next();
});

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Umbra Sentinel | Core</title>
                <style>
                    body { background: #0a0a0a; color: #ef4444; font-family: 'Courier New', monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .container { border: 1px solid #1a1a1a; padding: 40px; border-radius: 8px; box-shadow: 0 0 20px rgba(239, 68, 68, 0.05); text-align: center; }
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
    const data = { 
        alerta: "Sinal capturado pela Umbra Sentinel!",
        origem: req.ip,
        timestamp: new Date().toISOString()
    };

    res.send(`
        <html>
            <head>
                <title>⚠️ BREACH DETECTED</title>
                <style>
                    body { background: #000; color: #fff; font-family: 'Courier New', monospace; padding: 20px; }
                    .alert-box { border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.1); padding: 20px; max-width: 600px; margin: 50px auto; }
                    h2 { color: #ef4444; margin-top: 0; }
                    pre { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 4px; color: #22c55e; overflow-x: auto; font-size: 0.85rem; }
                    .log-line { color: #888; font-size: 0.8rem; margin-bottom: 5px; }
                </style>
            </head>
            <body>
                <div class="alert-box">
                    <h2>⚠️ INTRUSÃO DETECTADA</h2>
                    <div class="log-line">> Capturando metadados da conexão...</div>
                    <div class="log-line">> Registrando IP de origem: ${data.origem}</div>
                    <div class="log-line">> Encaminhando para o banco de auditoria...</div>
                    <p>Os seguintes dados foram interceptados pela sentinela:</p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                    <div style="margin-top: 20px; font-size: 0.7rem; text-align: right; color: #ef4444;">[ ACESSO MONITORADO ]</div>
                </div>
            </body>
        </html>
    `);
});


app.get('/api/logs', async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM logs_auditoria ORDER BY timestamp DESC LIMIT 50");
        res.json(results);
    } catch (err) {
        console.error("Erro na rota /api/logs:", err.message);
        res.status(500).json({ error: "Erro interno ao buscar logs da sentinela." });
    }
});


app.get('/dashboard/status', (req, res) => {
    res.json({ status: "Online", station: "Railway", time: new Date() });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`🔥 UMBRA SENTINEL OPERACIONAL | PORTA: ${PORT}`);
    console.log(`==========================================`);
});