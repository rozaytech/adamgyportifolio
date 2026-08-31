// ===== AUTH =====
if (localStorage.getItem('adamgy_auth') !== 'true') {
    window.location.href = 'login.html';
}
const activeUser = localStorage.getItem('adamgy_user') || 'Admin';

// ===== DATA STORE =====
const STORE_KEYS = {
    projects: 'adamgy_projects',
    clients: 'adamgy_clients',
    tasks: 'adamgy_tasks',
    logs: 'adamgy_logs'
};

function getStore(key) {
    const data = localStorage.getItem(STORE_KEYS[key]);
    return data ? JSON.parse(data) : {};
}

function setStore(key, data) {
    localStorage.setItem(STORE_KEYS[key], JSON.stringify(data));
}

function pushLog(detalhes) {
    const logs = getStore('logs');
    const id = Date.now().toString();
    logs[id] = {
        data: new Date().toLocaleString('pt-MZ'),
        user: activeUser,
        detalhes: detalhes
    };
    setStore('logs', logs);
    refreshLogs();
}

// Init demo data
function initDemoData() {
    if (!localStorage.getItem(STORE_KEYS.projects)) {
        const demoProjects = {
            '1': { nome: 'VMP SaaS ERP', cliente: 'VMP SaaS', categoria: 'Software', valor: '12500', status: 'Activo', data: new Date().toLocaleString() },
            '2': { nome: 'Landing Page VMP', cliente: 'VMP SaaS', categoria: 'Web', valor: '3500', status: 'Concluído', data: new Date().toLocaleString() },
            '3': { nome: 'Rede Starlink Office', cliente: 'Empresa Local', categoria: 'Redes', valor: '8500', status: 'Activo', data: new Date().toLocaleString() },
            '4': { nome: 'Sistema CFTV Loja', cliente: 'Comerciante', categoria: 'CFTV', valor: '4200', status: 'Concluído', data: new Date().toLocaleString() },
            '5': { nome: 'Consultoria TI', cliente: 'Startup MZ', categoria: 'Consultoria', valor: '2800', status: 'Pendente', data: new Date().toLocaleString() }
        };
        setStore('projects', demoProjects);
        pushLog('Sistema inicializado com dados de demonstração');
    }
    if (!localStorage.getItem(STORE_KEYS.clients)) {
        const demoClients = {
            '1': { nome: 'VMP SaaS', telefone: '+258 84 616 6104', email: 'contacto@vmpsaas.com', tipo: 'Empresa' },
            '2': { nome: 'Empresa Local Pemba', telefone: '+258 87 001 8297', email: 'empresa@email.com', tipo: 'Empresa' },
            '3': { nome: 'Comerciante Individual', telefone: '+258 84 000 0000', email: 'comerciante@email.com', tipo: 'Particular' }
        };
        setStore('clients', demoClients);
    }
    if (!localStorage.getItem(STORE_KEYS.tasks)) {
        const demoTasks = {
            '1': { descricao: 'Implementar módulo de faturação', projeto: 'VMP SaaS ERP', prioridade: 'Alta', status: 'Em Progresso' },
            '2': { descricao: 'Configurar backup automático', projeto: 'VMP SaaS ERP', prioridade: 'Alta', status: 'Pendente' },
            '3': { descricao: 'Instalar câmaras CFTV', projeto: 'Sistema CFTV Loja', prioridade: 'Média', status: 'Concluída' }
        };
        setStore('tasks', demoTasks);
    }
}

initDemoData();

// ===== UI =====
const sidebar = document.getElementById('sidebar');
document.getElementById('mToggle').onclick = () => sidebar.classList.toggle('active');

// Clock & Greeting
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('pt-MZ');
    const hrs = now.getHours();
    const greet = hrs < 12 ? 'Bom dia' : hrs < 18 ? 'Boa tarde' : 'Boa noite';
    document.getElementById('greet-left').innerText = `${greet}, ${activeUser}`;
    document.getElementById('user-right').innerText = activeUser;
}
setInterval(updateClock, 1000);
updateClock();

// SPA Navigation
document.querySelectorAll('.nav-item[data-sec]').forEach(item => {
    item.onclick = () => {
        const sec = item.getAttribute('data-sec');
        if (!sec) return;
        sidebar.classList.remove('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.spa-section').forEach(s => {
            s.classList.toggle('active', s.id === `sec-${sec}`);
        });
        if (sec === 'logs') refreshLogs();
    };
});

// ===== PROJECTS =====
let circleChart;

function refreshProjects() {
    const projects = getStore('projects');
    const list = document.getElementById('project-list');
    const fatDetails = document.getElementById('fat-detalhes');
    list.innerHTML = '';

    let totalRev = 0, count = 0, concluidos = 0;
    const stats = {};
    const statusCounts = { 'Activo': 0, 'Pendente': 0, 'Concluído': 0, 'Cancelado': 0 };

    Object.keys(projects).forEach(id => {
        const p = projects[id];
        const v = parseFloat(p.valor) || 0;
        totalRev += v;
        count++;
        if (p.status === 'Concluído') concluidos++;
        stats[p.categoria] = (stats[p.categoria] || 0) + v;
        if (statusCounts[p.status] !== undefined) statusCounts[p.status]++;

        const statusColor = p.status === 'Activo' ? 'var(--success)' : 
                           p.status === 'Concluído' ? 'var(--text)' :
                           p.status === 'Pendente' ? 'var(--warning)' : 'var(--danger)';

        list.innerHTML += `
            <tr>
                <td><b style="color: var(--text);">${p.nome}</b></td>
                <td>${p.cliente}</td>
                <td>${p.categoria}</td>
                <td style="font-weight: 600;">${v.toLocaleString()} MT</td>
                <td><span style="color: ${statusColor}; font-weight: 600; font-size: 11px;">● ${p.status}</span></td>
                <td>
                    <button class="btn-edit" onclick="window.editProject('${id}')">Editar</button>
                    <button class="btn-del" onclick="window.delProject('${id}')">Remover</button>
                </td>
            </tr>
        `;
    });

    document.getElementById('count-projetos').innerText = count;
    document.getElementById('rev-home').innerText = totalRev.toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('fat-total').innerText = totalRev.toLocaleString(undefined, {maximumFractionDigits: 2}) + ' MT';
    document.getElementById('fat-media').innerText = count > 0 ? (totalRev / count).toLocaleString(undefined, {maximumFractionDigits: 2}) + ' MT' : '0.00 MT';
    document.getElementById('fat-concluidos').innerText = concluidos;
    document.getElementById('count-tarefas').innerText = Object.keys(getStore('tasks')).length;
    document.getElementById('count-clientes').innerText = Object.keys(getStore('clients')).length;

    if (fatDetails) {
        fatDetails.innerHTML = Object.entries(stats).map(([label, val]) => `
            <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--border-solid);">
                <span style="color: var(--text-secondary);">${label}</span>
                <span style="color: var(--text); font-weight: 700;">${val.toLocaleString()} MT</span>
            </div>
        `).join('');
    }

    updateCircle(stats);
}

function updateCircle(stats) {
    const ctx = document.getElementById('circleChart');
    if (!ctx) return;
    const context = ctx.getContext('2d');
    if (circleChart) circleChart.destroy();

    const colors = ['#e5e5e5', '#888888', '#444444', '#ef4444', '#f59e0b', '#4ade80', '#3b82f6', '#14b8a6'];

    circleChart = new Chart(context, {
        type: 'doughnut',
        data: {
            labels: Object.keys(stats),
            datasets: [{
                data: Object.values(stats),
                backgroundColor: colors.slice(0, Object.keys(stats).length),
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#888888',
                        font: { size: 11, family: 'Inter' },
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
}

// ===== CLIENTS =====
function refreshClients() {
    const clients = getStore('clients');
    const list = document.getElementById('client-list');
    list.innerHTML = '';
    Object.keys(clients).forEach(id => {
        const c = clients[id];
        list.innerHTML += `
            <tr>
                <td><b style="color: var(--text);">${c.nome}</b></td>
                <td>${c.telefone}</td>
                <td>${c.email || '-'}</td>
                <td><span style="padding: 3px 10px; background: var(--accent-soft); border-radius: 12px; font-size: 11px; color: var(--text-secondary); font-weight: 600;">${c.tipo}</span></td>
                <td>
                    <button class="btn-edit" onclick="window.editClient('${id}')">Editar</button>
                    <button class="btn-del" onclick="window.delClient('${id}')">Remover</button>
                </td>
            </tr>
        `;
    });
}

// ===== TASKS =====
function refreshTasks() {
    const tasks = getStore('tasks');
    const list = document.getElementById('task-list');
    list.innerHTML = '';
    Object.keys(tasks).forEach(id => {
        const t = tasks[id];
        const priorityColor = t.prioridade === 'Alta' ? 'var(--danger)' : t.prioridade === 'Média' ? 'var(--warning)' : 'var(--success)';
        const statusColor = t.status === 'Concluída' ? 'var(--success)' : t.status === 'Em Progresso' ? 'var(--text)' : 'var(--warning)';
        list.innerHTML += `
            <tr>
                <td><b style="color: var(--text);">${t.descricao}</b></td>
                <td>${t.projeto || '-'}</td>
                <td><span style="color: ${priorityColor}; font-weight: 600; font-size: 11px;">${t.prioridade}</span></td>
                <td><span style="color: ${statusColor}; font-weight: 600; font-size: 11px;">● ${t.status}</span></td>
                <td>
                    <button class="btn-edit" onclick="window.editTask('${id}')">Editar</button>
                    <button class="btn-del" onclick="window.delTask('${id}')">Remover</button>
                </td>
            </tr>
        `;
    });
}

// ===== LOGS =====
function refreshLogs() {
    const logs = getStore('logs');
    const terminal = document.getElementById('terminal-logs');
    if (!terminal) return;
    const logEntries = Object.values(logs).reverse().slice(0, 50);
    terminal.innerHTML = logEntries.map(l => `
        <div class="log-line">
            <span class="log-ts">[${l.data}]</span>
            <span class="log-user">#${l.user}:</span>
            <span class="log-msg">${l.detalhes}</span>
        </div>
    `).join('');
    terminal.scrollTop = terminal.scrollHeight;
}

// ===== MODALS =====
window.openModal = () => {
    document.getElementById('form-project').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('modal-title').innerText = 'Novo Projecto';
    document.getElementById('modal-project').classList.add('active');
};
window.closeModal = () => document.getElementById('modal-project').classList.remove('active');

document.getElementById('form-project').onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const projects = getStore('projects');
    const payload = {
        nome: document.getElementById('proj-name').value,
        cliente: document.getElementById('proj-client').value,
        categoria: document.getElementById('proj-category').value,
        valor: document.getElementById('proj-price').value,
        status: document.getElementById('proj-status').value,
        data: new Date().toLocaleString()
    };
    if (id) {
        projects[id] = { ...projects[id], ...payload };
        pushLog(`Editou projecto: ${payload.nome}`);
    } else {
        const newId = Date.now().toString();
        projects[newId] = payload;
        pushLog(`Adicionou projecto: ${payload.nome}`);
    }
    setStore('projects', projects);
    refreshProjects();
    closeModal();
};

window.editProject = (id) => {
    const p = getStore('projects')[id];
    if (!p) return;
    document.getElementById('edit-id').value = id;
    document.getElementById('proj-name').value = p.nome;
    document.getElementById('proj-client').value = p.cliente;
    document.getElementById('proj-category').value = p.categoria;
    document.getElementById('proj-price').value = p.valor;
    document.getElementById('proj-status').value = p.status;
    document.getElementById('modal-title').innerText = 'Editar Projecto';
    document.getElementById('modal-project').classList.add('active');
};

window.delProject = (id) => {
    const projects = getStore('projects');
    const nome = projects[id]?.nome;
    if (confirm(`Tem certeza que deseja remover o projecto "${nome}"?`)) {
        delete projects[id];
        setStore('projects', projects);
        pushLog(`Removeu projecto: ${nome}`);
        refreshProjects();
    }
};

window.openClientModal = () => {
    document.getElementById('form-client').reset();
    document.getElementById('edit-client-id').value = '';
    document.getElementById('modal-client-title').innerText = 'Novo Cliente';
    document.getElementById('modal-client').classList.add('active');
};
window.closeClientModal = () => document.getElementById('modal-client').classList.remove('active');

document.getElementById('form-client').onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-client-id').value;
    const clients = getStore('clients');
    const payload = {
        nome: document.getElementById('client-name').value,
        telefone: document.getElementById('client-phone').value,
        email: document.getElementById('client-email').value,
        tipo: document.getElementById('client-type').value
    };
    if (id) {
        clients[id] = { ...clients[id], ...payload };
        pushLog(`Editou cliente: ${payload.nome}`);
    } else {
        const newId = Date.now().toString();
        clients[newId] = payload;
        pushLog(`Adicionou cliente: ${payload.nome}`);
    }
    setStore('clients', clients);
    refreshClients();
    closeClientModal();
};

window.editClient = (id) => {
    const c = getStore('clients')[id];
    if (!c) return;
    document.getElementById('edit-client-id').value = id;
    document.getElementById('client-name').value = c.nome;
    document.getElementById('client-phone').value = c.telefone;
    document.getElementById('client-email').value = c.email || '';
    document.getElementById('client-type').value = c.tipo;
    document.getElementById('modal-client-title').innerText = 'Editar Cliente';
    document.getElementById('modal-client').classList.add('active');
};

window.delClient = (id) => {
    const clients = getStore('clients');
    const nome = clients[id]?.nome;
    if (confirm(`Remover o cliente "${nome}"?`)) {
        delete clients[id];
        setStore('clients', clients);
        pushLog(`Removeu cliente: ${nome}`);
        refreshClients();
    }
};

window.openTaskModal = () => {
    document.getElementById('form-task').reset();
    document.getElementById('edit-task-id').value = '';
    document.getElementById('modal-task-title').innerText = 'Nova Tarefa';
    document.getElementById('modal-task').classList.add('active');
};
window.closeTaskModal = () => document.getElementById('modal-task').classList.remove('active');

document.getElementById('form-task').onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-task-id').value;
    const tasks = getStore('tasks');
    const payload = {
        descricao: document.getElementById('task-desc').value,
        projeto: document.getElementById('task-project').value,
        prioridade: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value
    };
    if (id) {
        tasks[id] = { ...tasks[id], ...payload };
        pushLog(`Editou tarefa: ${payload.descricao}`);
    } else {
        const newId = Date.now().toString();
        tasks[newId] = payload;
        pushLog(`Adicionou tarefa: ${payload.descricao}`);
    }
    setStore('tasks', tasks);
    refreshTasks();
    closeTaskModal();
};

window.editTask = (id) => {
    const t = getStore('tasks')[id];
    if (!t) return;
    document.getElementById('edit-task-id').value = id;
    document.getElementById('task-desc').value = t.descricao;
    document.getElementById('task-project').value = t.projeto || '';
    document.getElementById('task-priority').value = t.prioridade;
    document.getElementById('task-status').value = t.status;
    document.getElementById('modal-task-title').innerText = 'Editar Tarefa';
    document.getElementById('modal-task').classList.add('active');
};

window.delTask = (id) => {
    const tasks = getStore('tasks');
    const desc = tasks[id]?.descricao;
    if (confirm(`Remover a tarefa "${desc}"?`)) {
        delete tasks[id];
        setStore('tasks', tasks);
        pushLog(`Removeu tarefa: ${desc}`);
        refreshTasks();
    }
};

// ===== PDF EXPORT =====
window.exportPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const now = new Date().toLocaleString('pt-MZ');

    doc.setFontSize(16);
    doc.setTextColor(200, 200, 200);
    doc.text('ADAMGY ADAMO TEMBE — RELATORIO DE PROJECTOS', 14, 20);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Operador: ${activeUser}`, 14, 30);
    doc.text(`Data/Hora: ${now}`, 14, 36);

    doc.autoTable({
        html: '#main-table',
        startY: 44,
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], textColor: 255, fontSize: 9 },
        styles: { fontSize: 8, textColor: 60 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    const finalY = doc.lastAutoTable.finalY || 60;
    const projects = getStore('projects');
    const total = Object.values(projects).reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0);
    doc.text(`Total em Projectos: ${total.toLocaleString()} MT`, 14, finalY + 10);
    doc.text('--- Fim do Relatorio ---', 14, finalY + 18);

    doc.save(`Relatorio_Projectos_Adamgy_${new Date().getTime()}.pdf`);
    pushLog(`Gerou relatorio PDF`);
};

// ===== LOGOUT =====
document.getElementById('btnLogout').onclick = () => {
    localStorage.removeItem('adamgy_auth');
    localStorage.removeItem('adamgy_user');
    window.location.href = 'login.html';
};

// ===== CLOSE MODALS ON BACKDROP CLICK =====
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
});

// ===== INIT =====
refreshProjects();
refreshClients();
refreshTasks();
refreshLogs();