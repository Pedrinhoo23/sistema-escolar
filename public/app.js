const API = '';
let token = localStorage.getItem('token');
let usernameGuardado = localStorage.getItem('username');

// Verificar se já está logado ao abrir a página
// Verificar se já está logado ao abrir a página
window.addEventListener('load', function() {
    if (token) {
        try {
            mostrarSistema();
        } catch(e) {
            localStorage.clear();
            token = null;
        }
    }
});
function fazerLogin() {
    const username = document.getElementById('login-username').value;
    const senha = document.getElementById('login-senha').value;

    if (!username || !senha) {
        document.getElementById('login-erro').textContent = 'Preenche todos os campos!';
        return;
    }

    fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, senha })
    })
    .then(r => r.json())
    .then(dados => {
        if (dados.erro) {
            document.getElementById('login-erro').textContent = dados.erro;
            return;
        }
        token = dados.token;
        localStorage.setItem('token', token);
        localStorage.setItem('username', dados.username);
        window.location.href = '/';
    })
    .catch(err => {
        document.getElementById('login-erro').textContent = 'Erro ao conectar ao servidor';
    });
}
function mostrarSistema() {
    document.getElementById('pagina-login').classList.add('escondido');
    document.getElementById('sistema').classList.remove('escondido');
    document.getElementById('nome-utilizador').textContent = localStorage.getItem('username');
    carregarAlunos();
}

function fazerLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    token = null;
    document.getElementById('sistema').classList.add('escondido');
    document.getElementById('pagina-login').classList.remove('escondido');
    document.getElementById('login-username').value = '';
    document.getElementById('login-senha').value = '';
    document.getElementById('login-erro').textContent = '';
}

// ---- NAVEGAÇÃO ----
function mostrarSecao(nome) {
    document.querySelectorAll('section').forEach(s => s.classList.add('escondido'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('ativo'));
    document.getElementById(nome).classList.remove('escondido');
    event.target.classList.add('ativo');
    carregarDados(nome);
}

function carregarDados(secao) {
    if (secao === 'alunos') carregarAlunos();
    if (secao === 'turmas') carregarTurmas();
    if (secao === 'professores') carregarProfessores();
    if (secao === 'notas') carregarNotas();
}

// Headers com token para todas as requisições
function headers() {
    return {
        'Content-Type': 'application/json',
        'authorization': token
    };
}

// ---- ALUNOS ----
function carregarAlunos() {
    fetch(`${API}/alunos`, { headers: headers() })
        .then(r => r.json())
        .then(alunos => {
            const tabela = document.getElementById('tabela-alunos');
            tabela.innerHTML = '';
            alunos.forEach(a => {
                tabela.innerHTML += `
                    <tr>
                        <td>${a.id}</td>
                        <td>${a.nome}</td>
                        <td>${a.numero}</td>
                        <td><button class="btn-remover" onclick="removerAluno(${a.id})">Remover</button></td>
                    </tr>`;
            });
        });
}

function adicionarAluno() {
    const nome = document.getElementById('aluno-nome').value;
    const numero = document.getElementById('aluno-numero').value;
    if (!nome || !numero) return alert('Preenche todos os campos!');
    fetch(`${API}/alunos`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ nome, numero })
    }).then(() => {
        document.getElementById('aluno-nome').value = '';
        document.getElementById('aluno-numero').value = '';
        carregarAlunos();
    });
}

function removerAluno(id) {
    if (!confirm('Tens a certeza que queres remover este aluno?')) return;
    fetch(`${API}/alunos/${id}`, { method: 'DELETE', headers: headers() })
        .then(() => carregarAlunos());
}

// ---- TURMAS ----
function carregarTurmas() {
    fetch(`${API}/turmas`, { headers: headers() })
        .then(r => r.json())
        .then(turmas => {
            const tabela = document.getElementById('tabela-turmas');
            tabela.innerHTML = '';
            turmas.forEach(t => {
                tabela.innerHTML += `
                    <tr>
                        <td>${t.id}</td>
                        <td>${t.nome}</td>
                        <td>${t.ano}</td>
                    </tr>`;
            });
        });
}

function adicionarTurma() {
    const nome = document.getElementById('turma-nome').value;
    const ano = document.getElementById('turma-ano').value;
    if (!nome || !ano) return alert('Preenche todos os campos!');
    fetch(`${API}/turmas`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ nome, ano })
    }).then(() => {
        document.getElementById('turma-nome').value = '';
        document.getElementById('turma-ano').value = '';
        carregarTurmas();
    });
}

// ---- PROFESSORES ----
function carregarProfessores() {
    fetch(`${API}/professores`, { headers: headers() })
        .then(r => r.json())
        .then(professores => {
            const tabela = document.getElementById('tabela-professores');
            tabela.innerHTML = '';
            professores.forEach(p => {
                tabela.innerHTML += `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.nome}</td>
                        <td>${p.disciplina}</td>
                    </tr>`;
            });
        });
}

function adicionarProfessor() {
    const nome = document.getElementById('professor-nome').value;
    const disciplina = document.getElementById('professor-disciplina').value;
    if (!nome || !disciplina) return alert('Preenche todos os campos!');
    fetch(`${API}/professores`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ nome, disciplina })
    }).then(() => {
        document.getElementById('professor-nome').value = '';
        document.getElementById('professor-disciplina').value = '';
        carregarProfessores();
    });
}

// ---- NOTAS ----
function carregarNotas() {
    fetch(`${API}/notas`, { headers: headers() })
        .then(r => r.json())
        .then(notas => {
            const tabela = document.getElementById('tabela-notas');
            tabela.innerHTML = '';
            notas.forEach(n => {
                tabela.innerHTML += `
                    <tr>
                        <td>${n.id}</td>
                        <td>${n.aluno_id}</td>
                        <td>${n.disciplina}</td>
                        <td>${n.nota}</td>
                    </tr>`;
            });
        });
}

function adicionarNota() {
    const aluno_id = document.getElementById('nota-aluno').value;
    const disciplina = document.getElementById('nota-disciplina').value;
    const nota = document.getElementById('nota-valor').value;
    if (!aluno_id || !disciplina || !nota) return alert('Preenche todos os campos!');
    fetch(`${API}/notas`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ aluno_id, disciplina, nota })
    }).then(() => {
        document.getElementById('nota-aluno').value = '';
        document.getElementById('nota-disciplina').value = '';
        document.getElementById('nota-valor').value = '';
        carregarNotas();
    });
}