const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'escola.db');
const db = new Database(dbPath);

console.log('Base de dados conectada!');

db.exec(`CREATE TABLE IF NOT EXISTS alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    numero TEXT NOT NULL,
    turma_id INTEGER
)`);

db.exec(`CREATE TABLE IF NOT EXISTS professores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    disciplina TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS turmas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    ano TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS notas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER,
    disciplina TEXT NOT NULL,
    nota REAL NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS utilizadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    role TEXT DEFAULT 'admin'
)`);

const senhaHash = bcrypt.hashSync('admin123', 10);
const insertAdmin = db.prepare(`INSERT OR IGNORE INTO utilizadores (username, senha) VALUES (?, ?)`);
insertAdmin.run('admin', senhaHash);

module.exports = db;