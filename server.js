const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;
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
    const user = db.prepare('SELECT * FROM utilizadores WHERE username = ?').get(username);
    if (!user) return res.status(401).json({ erro: 'Utilizador não encontrado' });
    const senhaCorrecta = bcrypt.compareSync(senha, user.senha);
    if (!senhaCorrecta) return res.status(401).json({ erro: 'Senha incorrecta' });
    const token = jwt.sign({ id: user.id, username: user.username }, SEGREDO, { expiresIn: '8h' });
    res.json({ token, username: user.username });
});

// Rotas dos alunos
app.get('/alunos', autenticar, (req, res) => {
    const rows = db.prepare('SELECT * FROM alunos').all();
    res.json(rows);
});

app.post('/alunos', autenticar, (req, res) => {
    const { nome, numero, turma_id } = req.body;
    const result = db.prepare('INSERT INTO alunos (nome, numero, turma_id) VALUES (?, ?, ?)').run(nome, numero, turma_id);
    res.json({ id: result.lastInsertRowid, nome, numero, turma_id });
});

app.delete('/alunos/:id', autenticar, (req, res) => {
    db.prepare('DELETE FROM alunos WHERE id = ?').run(req.params.id);
    res.json({ mensagem: 'Aluno removido' });
});

// Rotas das turmas
app.get('/turmas', autenticar, (req, res) => {
    const rows = db.prepare('SELECT * FROM turmas').all();
    res.json(rows);
});

app.post('/turmas', autenticar, (req, res) => {
    const { nome, ano } = req.body;
    const result = db.prepare('INSERT INTO turmas (nome, ano) VALUES (?, ?)').run(nome, ano);
    res.json({ id: result.lastInsertRowid, nome, ano });
});

// Rotas dos professores
app.get('/professores', autenticar, (req, res) => {
    const rows = db.prepare('SELECT * FROM professores').all();
    res.json(rows);
});

app.post('/professores', autenticar, (req, res) => {
    const { nome, disciplina } = req.body;
    const result = db.prepare('INSERT INTO professores (nome, disciplina) VALUES (?, ?)').run(nome, disciplina);
    res.json({ id: result.lastInsertRowid, nome, disciplina });
});

// Rotas das notas
app.get('/notas', autenticar, (req, res) => {
    const rows = db.prepare('SELECT * FROM notas').all();
    res.json(rows);
});

app.post('/notas', autenticar, (req, res) => {
    const { aluno_id, disciplina, nota } = req.body;
    const result = db.prepare('INSERT INTO notas (aluno_id, disciplina, nota) VALUES (?, ?, ?)').run(aluno_id, disciplina, nota);
    res.json({ id: result.lastInsertRowid, aluno_id, disciplina, nota });
});
// Rota do dashboard
app.get('/dashboard', autenticar, (req, res) => {
    const totalAlunos = db.prepare('SELECT COUNT(*) as total FROM alunos').get();
    const totalTurmas = db.prepare('SELECT COUNT(*) as total FROM turmas').get();
    const totalProfessores = db.prepare('SELECT COUNT(*) as total FROM professores').get();
    const mediaNotas = db.prepare('SELECT ROUND(AVG(nota), 1) as media FROM notas').get();
    const notasPorDisciplina = db.prepare(`
        SELECT disciplina, ROUND(AVG(nota), 1) as media, COUNT(*) as total
        FROM notas GROUP BY disciplina
    `).all();
    res.json({
        totalAlunos: totalAlunos.total,
        totalTurmas: totalTurmas.total,
        totalProfessores: totalProfessores.total,
        mediaNotas: mediaNotas.media || 0,
        notasPorDisciplina
    });
});

app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});