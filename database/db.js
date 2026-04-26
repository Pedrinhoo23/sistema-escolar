const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'escola.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar à base de dados:', err);
    } else {
        console.log('Base de dados conectada!');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        numero TEXT NOT NULL,
        turma_id INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS professores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        disciplina TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS turmas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        ano TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER,
        disciplina TEXT NOT NULL,
        nota REAL NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS utilizadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        role TEXT DEFAULT 'admin'
    )`);

    // Criar utilizador admin padrão
    const senhaHash = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO utilizadores (username, senha) VALUES (?, ?)`,
        ['admin', senhaHash]);
});

module.exports = db;