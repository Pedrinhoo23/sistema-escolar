const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database/db');

const app = express();
const PORT = 3000;
const SEGREDO = 'sistema-escolar-secreto-2025';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticação
function autenticar(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ erro: 'Acesso negado' });
    try {
        const verificado = jwt.verify(token, SEGREDO);
        req.utilizador = verificado;
        next();
    } catch {
        res.status(401).json({ erro: 'Token inválido' });
    }
}

// Rota de login
app.post('/login', (req, res) => {
    const { username, senha } = req.body;
    db.get('SELECT * FROM utilizadores WHERE username = ?', [username], (err, user) => {
        if (err || !user) return res.status(401).json({ erro: 'Utilizador não encontrado' });
        const senhaCorrecta = bcrypt.compareSync(senha, user.senha);
        if (!senhaCorrecta) return res.status(401).json({ erro: 'Senha incorrecta' });
        const token = jwt.sign({ id: user.id, username: user.username }, SEGREDO, { expiresIn: '8h' });
        res.json({ token, username: user.username });
    });
});

// Rotas dos alunos
app.get('/alunos', autenticar, (req, res) => {
    db.all('SELECT * FROM alunos', [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

app.post('/alunos', autenticar, (req, res) => {
    const { nome, numero, turma_id } = req.body;
    db.run('INSERT INTO alunos (nome, numero, turma_id) VALUES (?, ?, ?)',
        [nome, numero, turma_id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ id: this.lastID, nome, numero, turma_id });
    });
});

app.delete('/alunos/:id', autenticar, (req, res) => {
    db.run('DELETE FROM alunos WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Aluno removido' });
    });
});

// Rotas das turmas
app.get('/turmas', autenticar, (req, res) => {
    db.all('SELECT * FROM turmas', [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

app.post('/turmas', autenticar, (req, res) => {
    const { nome, ano } = req.body;
    db.run('INSERT INTO turmas (nome, ano) VALUES (?, ?)',
        [nome, ano], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ id: this.lastID, nome, ano });
    });
});

// Rotas dos professores
app.get('/professores', autenticar, (req, res) => {
    db.all('SELECT * FROM professores', [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

app.post('/professores', autenticar, (req, res) => {
    const { nome, disciplina } = req.body;
    db.run('INSERT INTO professores (nome, disciplina) VALUES (?, ?)',
        [nome, disciplina], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ id: this.lastID, nome, disciplina });
    });
});

// Rotas das notas
app.get('/notas', autenticar, (req, res) => {
    db.all('SELECT * FROM notas', [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

app.post('/notas', autenticar, (req, res) => {
    const { aluno_id, disciplina, nota } = req.body;
    db.run('INSERT INTO notas (aluno_id, disciplina, nota) VALUES (?, ?, ?)',
        [aluno_id, disciplina, nota], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ id: this.lastID, aluno_id, disciplina, nota });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});