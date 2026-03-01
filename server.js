require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // Mudamos para a versão Promise
const cors = require('cors'); 
const app = express();

// Configurações Globais
app.use(cors());
app.use(express.json());

// 1. Configuração do POOL de Conexão (Resolve o erro "closed state")
const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10, // Mantém até 10 conexões prontas
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Teste de conexão inicial para o log gótico
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Umbra Sentinel: Banco de Dados Conectado com Sucesso.');
        connection.release(); // Libera a conexão de volta para o pool
    } catch (err) {
        console.error('❌ Umbra Sentinel: Falha crítica na conexão.', err.message);
    }
})();

// 2. MIDDLEWARE: A Sentinela de Auditoria (Refatorada para Async)
app.use(async (req, res, next) => {
    if (req.url === '/api/logs' || req.url === '/') return next(); 

    const { ip, url, method } = req;
    const status = url.includes('restrita') ? '⚠️ ALERTA: Acesso Sensível' : 'Acesso Permitido';

    const query = "INSERT INTO logs_auditoria (ip_usuario, metodo, rota, status_acesso) VALUES (?, ?, ?, ?)";
    
    try {
        // O pool gerencia a abertura/fechamento automaticamente aqui
        await pool.execute(query, [ip, method, url, status]);
    } catch (err) {
        console.error("⚠️ Falha ao registrar log no banco:", err.message);
    }
    next();
});

// 3. ROTAS DO SISTEMA

app.get('/', (req, res) => {
    res.send('<h1>Umbra Sentinel API: Sistema de Vigilância Ativo.</h1>');
});

// Rota do Dashboard (Refatorada para Async/Await)
app.get('/api/logs', async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM logs_auditoria ORDER BY timestamp DESC");
        res.json(results);
    } catch (err) {
        console.error("Erro na rota /api/logs:", err.message);
        res.status(500).json({ error: "Erro interno ao buscar logs da sentinela." });
    }
});

// ROTA ISCA (Honey Pot)
app.get('/api/area-restrita', (req, res) => {
    res.json({ 
        alerta: "Sinal capturado pela Umbra Sentinel!",
        origem: req.ip,
        timestamp: new Date()
    });
});

// Rota de status do dashboard
app.get('/dashboard', (req, res) => {
    res.json({ 
        status: "Online", 
        message: "Área Monitorada pelo Umbra Sentinel",
        timestamp: new Date()
    });
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`🔥 UMBRA SENTINEL OPERACIONAL | PORTA: ${PORT}`);
    console.log(`==========================================`);
});