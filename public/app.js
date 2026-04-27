const API = '';
let token = localStorage.getItem('token');

window.addEventListener('load', function() {
    if (token) mostrarSistema();
});

// ---- LOGIN ----
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
        mostrarSistema();
    })
    .catch(() => {
        document.getElementById('login-erro').textContent = 'Erro ao conectar ao servidor';
    });
}

function mostrarSistema() {
    document.getElementById('pagina-login').classList.add('escondido');
    document.getElementById('sistema').classList.remove('escondido');
    document.getElementById('nome-utilizador').textContent = localStorage.getItem('username');
    mostrarSecaoNome('dashboard');
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

function headers() {
    return { 'Content-Type': 'application/json', 'authorization': token };
}

// ---- NAVEGAÇÃO ----
function mostrarSecao(e, nome) {
    document.querySelectorAll('section').forEach(s => s.classList.add('escondido'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('ativo'));
    document.getElementById(nome).classList.remove('escondido');
    if (e) e.target.classList.add('ativo');
    carregarDados(nome);
}

function mostrarSecaoNome(nome) {
    document.querySelectorAll('section').forEach(s => s.classList.add('escondido'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('ativo'));
    document.getElementById(nome).classList.remove('escondido');
    const btn = document.querySelector(`nav button[data-secao="${nome}"]`);
    if (btn) btn.classList.add('ativo');
    carregarDados(nome);
}

function carregarDados(secao) {
    if (secao === 'dashboard') carregarDashboard();
    if (secao === 'alunos') carregarAlunos();
    if (secao === 'turmas') carregarTurmas();
    if (secao === 'professores') carregarProfessores();
    if (secao === 'notas') carregarNotas();
}

// ---- MODAL ----
function abrirModal(titulo, html, onGuardar) {
    document.getElementById('modal-titulo').textContent = titulo;
    document.getElementById('modal-corpo').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('escondido');
    document.getElementById('modal-guardar').onclick = onGuardar;
}

function fecharModal() {
    document.getElementById('modal-overlay').classList.add('escondido');
}

function fecharModalFora(e) {
    if (e.target.id === 'modal-overlay') fecharModal();
}

// ---- DASHBOARD ----
function carregarDashboard() {
    fetch(`${API}/dashboard`, { headers: headers() })
        .then(r => r.json())
        .then(dados => {
            document.getElementById('stat-alunos').textContent = dados.totalAlunos;
            document.getElementById('stat-turmas').textContent = dados.totalTurmas;
            document.getElementById('stat-professores').textContent = dados.totalProfessores;
            document.getElementById('stat-media').textContent = dados.mediaNotas || '—';
            const grafico = document.getElementById('grafico-disciplinas');
            grafico.innerHTML = '';
            if (dados.notasPorDisciplina.length === 0) {
                grafico.innerHTML = '<p style="color:rgba(255,255,255,0.4);font-size:14px;">Ainda não há notas registadas.</p>';
                return;
            }
            dados.notasPorDisciplina.forEach(d => {
                const largura = Math.round((d.media / 20) * 100);
                grafico.innerHTML += `
                    <div class="grafico-linha">
                        <div class="grafico-nome">${d.disciplina}</div>
                        <div class="grafico-barra-fundo">
                            <div class="grafico-barra" style="width:${largura}%"></div>
                        </div>
                        <div class="grafico-media">${d.media}</div>
                    </div>`;
            });
        });
}

// ---- ALUNOS ----
function carregarAlunos() {
    fetch(`${API}/alunos`, { headers: headers() })
        .then(r => r.json())
        .then(alunos => {
            const tabela = document.getElementById('tabela-alunos');
            tabela.innerHTML = '';
            if (alunos.length === 0) {
                tabela.innerHTML = '<tr><td colspan="4" style="text-align:center;color:rgba(255,255,255,0.4)">Nenhum aluno registado</td></tr>';
                return;
            }
            alunos.forEach(a => {
                tabela.innerHTML += `
                    <tr>
                        <td>${a.id}</td>
                        <td>${a.nome}</td>
                        <td>${a.numero}</td>
                        <td>
                            <button class="btn-editar" onclick="editarAluno(${a.id},'${a.nome}','${a.numero}')">Editar</button>
                            <button class="btn-remover" onclick="removerAluno(${a.id})">Remover</button>
                        </td>
                    </tr>`;
            });
        });
}

function adicionarAluno() {
    const html = `
        <input type="text" id="m-nome" placeholder="Nome do aluno">
        <input type="text" id="m-numero" placeholder="Número do aluno">
    `;
    abrirModal('Adicionar Aluno', html, () => {
        const nome = document.getElementById('m-nome').value;
        const numero = document.getElementById('m-numero').value;
        if (!nome || !numero) return alert('Preenche todos os campos!');
        fetch(`${API}/alunos`, {
            method: 'POST', headers: headers(),
            body: JSON.stringify({ nome, numero })
        }).then(() => { fecharModal(); carregarAlunos(); });
    });
}

function editarAluno(id, nome, numero) {
    const html = `
        <input type="text" id="m-nome" value="${nome}" placeholder="Nome do aluno">
        <input type="text" id="m-numero" value="${numero}" placeholder="Número do aluno">
    `;
    abrirModal('Editar Aluno', html, () => {
        const novoNome = document.getElementById('m-nome').value;
        const novoNumero = document.getElementById('m-numero').value;
        if (!novoNome || !novoNumero) return alert('Preenche todos os campos!');
        fetch(`${API}/alunos/${id}`, {
            method: 'PUT', headers: headers(),
            body: JSON.stringify({ nome: novoNome, numero: novoNumero })
        }).then(() => { fecharModal(); carregarAlunos(); });
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
            if (turmas.length === 0) {
                tabela.innerHTML = '<tr><td colspan="4" style="text-align:center;color:rgba(255,255,255,0.4)">Nenhuma turma registada</td></tr>';
                return;
            }
            turmas.forEach(t => {
                tabela.innerHTML += `
                    <tr>
                        <td>${t.id}</td>
                        <td>${t.nome}</td>
                        <td>${t.ano}</td>
                        <td>
                            <button class="btn-editar" onclick="editarTurma(${t.id},'${t.nome}','${t.ano}')">Editar</button>
                            <button class="btn-remover" onclick="removerTurma(${t.id})">Remover</button>
                        </td>
                    </tr>`;
            });
        });
}

function adicionarTurma() {
    const html = `
        <input type="text" id="m-nome" placeholder="Nome da turma">
        <input type="text" id="m-ano" placeholder="Ano">
    `;
    abrirModal('Adicionar Turma', html, () => {
        const nome = document.getElementById('m-nome').value;
        const ano = document.getElementById('m-ano').value;
        if (!nome || !ano) return alert('Preenche todos os campos!');
        fetch(`${API}/turmas`, {
            method: 'POST', headers: headers(),
            body: JSON.stringify({ nome, ano })
        }).then(() => { fecharModal(); carregarTurmas(); });
    });
}

function editarTurma(id, nome, ano) {
    const html = `
        <input type="text" id="m-nome" value="${nome}" placeholder="Nome da turma">
        <input type="text" id="m-ano" value="${ano}" placeholder="Ano">
    `;
    abrirModal('Editar Turma', html, () => {
        const novoNome = document.getElementById('m-nome').value;
        const novoAno = document.getElementById('m-ano').value;
        fetch(`${API}/turmas/${id}`, {
            method: 'PUT', headers: headers(),
            body: JSON.stringify({ nome: novoNome, ano: novoAno })
        }).then(() => { fecharModal(); carregarTurmas(); });
    });
}

function removerTurma(id) {
    if (!confirm('Tens a certeza que queres remover esta turma?')) return;
    fetch(`${API}/turmas/${id}`, { method: 'DELETE', headers: headers() })
        .then(() => carregarTurmas());
}

// ---- PROFESSORES ----
function carregarProfessores() {
    fetch(`${API}/professores`, { headers: headers() })
        .then(r => r.json())
        .then(professores => {
            const tabela = document.getElementById('tabela-professores');
            tabela.innerHTML = '';
            if (professores.length === 0) {
                tabela.innerHTML = '<tr><td colspan="4" style="text-align:center;color:rgba(255,255,255,0.4)">Nenhum professor registado</td></tr>';
                return;
            }
            professores.forEach(p => {
                tabela.innerHTML += `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.nome}</td>
                        <td>${p.disciplina}</td>
                        <td>
                            <button class="btn-editar" onclick="editarProfessor(${p.id},'${p.nome}','${p.disciplina}')">Editar</button>
                            <button class="btn-remover" onclick="removerProfessor(${p.id})">Remover</button>
                        </td>
                    </tr>`;
            });
        });
}

function adicionarProfessor() {
    const html = `
        <input type="text" id="m-nome" placeholder="Nome do professor">
        <input type="text" id="m-disciplina" placeholder="Disciplina">
    `;
    abrirModal('Adicionar Professor', html, () => {
        const nome = document.getElementById('m-nome').value;
        const disciplina = document.getElementById('m-disciplina').value;
        if (!nome || !disciplina) return alert('Preenche todos os campos!');
        fetch(`${API}/professores`, {
            method: 'POST', headers: headers(),
            body: JSON.stringify({ nome, disciplina })
        }).then(() => { fecharModal(); carregarProfessores(); });
    });
}

function editarProfessor(id, nome, disciplina) {
    const html = `
        <input type="text" id="m-nome" value="${nome}" placeholder="Nome do professor">
        <input type="text" id="m-disciplina" value="${disciplina}" placeholder="Disciplina">
    `;
    abrirModal('Editar Professor', html, () => {
        const novoNome = document.getElementById('m-nome').value;
        const novaDisciplina = document.getElementById('m-disciplina').value;
        fetch(`${API}/professores/${id}`, {
            method: 'PUT', headers: headers(),
            body: JSON.stringify({ nome: novoNome, disciplina: novaDisciplina })
        }).then(() => { fecharModal(); carregarProfessores(); });
    });
}

function removerProfessor(id) {
    if (!confirm('Tens a certeza que queres remover este professor?')) return;
    fetch(`${API}/professores/${id}`, { method: 'DELETE', headers: headers() })
        .then(() => carregarProfessores());
}

// ---- NOTAS ----
function carregarNotas() {
    fetch(`${API}/notas`, { headers: headers() })
        .then(r => r.json())
        .then(notas => {
            const tabela = document.getElementById('tabela-notas');
            tabela.innerHTML = '';
            if (notas.length === 0) {
                tabela.innerHTML = '<tr><td colspan="5" style="text-align:center;color:rgba(255,255,255,0.4)">Nenhuma nota registada</td></tr>';
                return;
            }
            notas.forEach(n => {
                tabela.innerHTML += `
                    <tr>
                        <td>${n.id}</td>
                        <td>${n.aluno_id}</td>
                        <td>${n.disciplina}</td>
                        <td>${n.nota}</td>
                        <td>
                            <button class="btn-editar" onclick="editarNota(${n.id},'${n.disciplina}',${n.nota})">Editar</button>
                            <button class="btn-remover" onclick="removerNota(${n.id})">Remover</button>
                        </td>
                    </tr>`;
            });
        });
}

function adicionarNota() {
    const html = `
        <input type="number" id="m-aluno" placeholder="ID do aluno">
        <input type="text" id="m-disciplina" placeholder="Disciplina">
        <input type="number" id="m-nota" placeholder="Nota (0-20)" min="0" max="20">
    `;
    abrirModal('Adicionar Nota', html, () => {
        const aluno_id = document.getElementById('m-aluno').value;
        const disciplina = document.getElementById('m-disciplina').value;
        const nota = document.getElementById('m-nota').value;
        if (!aluno_id || !disciplina || !nota) return alert('Preenche todos os campos!');
        fetch(`${API}/notas`, {
            method: 'POST', headers: headers(),
            body: JSON.stringify({ aluno_id, disciplina, nota })
        }).then(() => { fecharModal(); carregarNotas(); });
    });
}

function editarNota(id, disciplina, nota) {
    const html = `
        <input type="text" id="m-disciplina" value="${disciplina}" placeholder="Disciplina">
        <input type="number" id="m-nota" value="${nota}" placeholder="Nota (0-20)" min="0" max="20">
    `;
    abrirModal('Editar Nota', html, () => {
        const novaDisciplina = document.getElementById('m-disciplina').value;
        const novaNota = document.getElementById('m-nota').value;
        fetch(`${API}/notas/${id}`, {
            method: 'PUT', headers: headers(),
            body: JSON.stringify({ disciplina: novaDisciplina, nota: novaNota })
        }).then(() => { fecharModal(); carregarNotas(); });
    });
}

function removerNota(id) {
    if (!confirm('Tens a certeza que queres remover esta nota?')) return;
    fetch(`${API}/notas/${id}`, { method: 'DELETE', headers: headers() })
        .then(() => carregarNotas());
}