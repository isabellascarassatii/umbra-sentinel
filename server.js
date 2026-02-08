require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const app = express();

// Configurações Globais
app.use(cors());
app.use(express.json());

// 1. Configuração da Conexão usando Variáveis de Ambiente
// Isso protege suas credenciais de banco de dados em um ambiente profissional
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 41844 // Use a porta que vimos no seu Railway
});

// Conexão com o Banco de Dados MySQL
db.connect((err) => {
    if (err) return console.error('❌ Umbra Sentinel: Falha na conexão.', err.message);
    console.log('✅ Umbra Sentinel: Banco de Dados Conectado com Sucesso.');
});

// 2. MIDDLEWARE: A Sentinela de Auditoria
// Captura metadados de acesso para garantir a rastreabilidade do sistema
app.use((req, res, next) => {
    // Evita loop de logs ao acessar a própria API de monitoramento
    if (req.url === '/api/logs') return next(); 

    const { ip, url, method } = req;
    const query = "INSERT INTO logs_auditoria (ip_usuario, metodo, rota, status_acesso) VALUES (?, ?, ?, ?)";
    
    db.query(query, [ip, method, url, 'Acesso Permitido'], (err) => {
        if (err) console.error("⚠️ Falha ao registrar log no banco:", err.message);
    });
    next();
});

// 3. ROTAS DO SISTEMA

// Rota que alimenta o dashboard React gótico
app.get('/api/logs', (req, res) => {
    db.query("SELECT * FROM logs_auditoria ORDER BY timestamp DESC", (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar logs" });
        res.json(results);
    });
});

// Rota de teste para monitoramento
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