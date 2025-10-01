// Sistema de Depósitos Progressivos - Caminho para 2 Milhões
class DepositSystem {
    constructor() {
        this.config = {
            initialValue: 300,
            totalDeposits: 1500,
            targetAmount: 2000000
        };

        this.data = {
            deposits: [],
            currentDeposit: 1,
            totalSaved: 0,
            completedDeposits: 0,
            startDate: new Date().toISOString().split('T')[0],
            currentFilter: 'all',
            showAllDeposits: false
        };

        this.backupSettings = {
            autoBackup: false,
            backupMethod: 'json',
            githubToken: '',
            googleDriveConnected: false,
            lastBackupDate: null
        };

        this.charts = {
            deposits: null,
            progress: null
        };

        this.loadData();
        this.initializeEventListeners();
        this.updateUI();
    }

    // Carregar dados salvos do localStorage
    loadData() {
        const savedConfig = localStorage.getItem('depositSystemConfig');
        const savedData = localStorage.getItem('depositSystemData');
        const savedBackupSettings = localStorage.getItem('depositSystemBackupSettings');

        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }

        if (savedData) {
            this.data = { ...this.data, ...JSON.parse(savedData) };
        }

        if (savedBackupSettings) {
            this.backupSettings = { ...this.backupSettings, ...JSON.parse(savedBackupSettings) };
        }

        // Atualizar campos da interface com dados carregados
        this.updateConfigFields();

        // Verificar se deve carregar dados da URL
        this.checkUrlParams();
    }

    // Salvar dados no localStorage
    saveData() {
        localStorage.setItem('depositSystemConfig', JSON.stringify(this.config));
        localStorage.setItem('depositSystemData', JSON.stringify(this.data));
        localStorage.setItem('depositSystemBackupSettings', JSON.stringify(this.backupSettings));

        // Auto backup se habilitado
        if (this.backupSettings.autoBackup) {
            this.performAutoBackup();
        }
    }

    // Atualizar campos de configuração na interface
    updateConfigFields() {
        document.getElementById('initialValue').value = this.config.initialValue;
        document.getElementById('totalDeposits').value = this.config.totalDeposits;
        document.getElementById('targetAmount').value = this.config.targetAmount;
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Eventos para atualizar configuração em tempo real
        ['initialValue', 'totalDeposits', 'targetAmount'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateConfig();
                });
            }
        });

        // Definir data atual nos campos de data
        const today = new Date().toISOString().split('T')[0];
        const dateField = document.getElementById('depositDate');
        if (dateField) {
            dateField.value = today;
        }
    }

    // Atualizar configuração
    updateConfig() {
        this.config.initialValue = parseFloat(document.getElementById('initialValue').value) || 300;
        this.config.totalDeposits = parseInt(document.getElementById('totalDeposits').value) || 1500;
        this.config.targetAmount = parseFloat(document.getElementById('targetAmount').value) || 2000000;
    }

    // Calcular valores dos depósitos baseado na configuração
    calculateDepositValues() {
        const values = [];
        const { initialValue, totalDeposits, targetAmount } = this.config;

        // Calcular valor final necessário para atingir meta exata
        // Fórmula da Progressão Aritmética: Soma = n * (primeiro + último) / 2
        // Resolvendo para o último valor: último = (2 * Soma / n) - primeiro
        const lastValue = (2 * targetAmount / totalDeposits) - initialValue;
        const increment = (lastValue - initialValue) / (totalDeposits - 1);

        // Gerar progressão aritmética
        for (let i = 0; i < totalDeposits; i++) {
            const value = initialValue + (increment * i);
            values.push(Math.round(value * 100) / 100);
        }

        // Verificação final: ajustar último valor se necessário para compensar arredondamentos
        const currentTotal = values.reduce((sum, v) => sum + v, 0);
        const difference = targetAmount - currentTotal;

        if (Math.abs(difference) > 0.01) {
            // Ajustar o último depósito para garantir meta exata
            values[values.length - 1] = Math.round((values[values.length - 1] + difference) * 100) / 100;
        }

        return values;
    }

    // Calcular depósitos e criar estrutura de dados
    calculateDeposits() {
        this.showLoading(true);

        // Simular delay para mostrar loading
        setTimeout(() => {
            this.updateConfig();

            const values = this.calculateDepositValues();
            const newDeposits = [];

            for (let i = 0; i < this.config.totalDeposits; i++) {
                const existingDeposit = this.data.deposits.find(d => d.number === i + 1);

                newDeposits.push({
                    number: i + 1,
                    amount: values[i],
                    completed: existingDeposit ? existingDeposit.completed : false,
                    completedDate: existingDeposit ? existingDeposit.completedDate : null,
                    actualAmount: existingDeposit ? existingDeposit.actualAmount : 0,
                    note: existingDeposit ? existingDeposit.note : ''
                });
            }

            this.data.deposits = newDeposits;
            this.recalculateStats();
            this.saveData();
        this.updateUI();
            this.showLoading(false);

            // Mostrar resultado do cálculo com validação
            const totalCalculated = values.reduce((sum, value) => sum + value, 0);
            const metaAtingida = Math.abs(totalCalculated - this.config.targetAmount) < 1;

            const alertType = metaAtingida ? 'success' : 'warning';
            const checkIcon = metaAtingida ? '✅' : '⚠️';
            const message = `
                ${checkIcon} <strong>Depósitos Calculados!</strong><br>
                📊 Total de depósitos: ${this.config.totalDeposits}<br>
                💰 Primeiro depósito: ${this.formatCurrency(values[0])}<br>
                💎 Último depósito: ${this.formatCurrency(values[values.length - 1])}<br>
                🎯 Total calculado: ${this.formatCurrency(totalCalculated)}<br>
                🏆 Meta definida: ${this.formatCurrency(this.config.targetAmount)}<br>
                ${metaAtingida ? '✅ <strong>Meta atingida perfeitamente!</strong>' : '⚠️ Diferença: ' + this.formatCurrency(Math.abs(totalCalculated - this.config.targetAmount))}
            `;

            this.showAlert(alertType, message);
        }, 500);
    }

    // Recalcular estatísticas
    recalculateStats() {
        this.data.completedDeposits = this.data.deposits.filter(d => d.completed).length;
        this.data.totalSaved = this.data.deposits
            .filter(d => d.completed)
            .reduce((sum, d) => sum + d.actualAmount, 0);

        // Encontrar próximo depósito
        const nextDeposit = this.data.deposits.find(d => !d.completed);
        this.data.currentDeposit = nextDeposit ? nextDeposit.number : this.config.totalDeposits;
    }

    // Iniciar desafio
    startChallenge() {
        if (this.data.deposits.length === 0) {
            this.calculateDeposits();
        }

        this.showAlert('info', 'Desafio iniciado! Comece completando o primeiro depósito.');
        this.scrollToDeposits();
    }

    // Resetar sistema
    resetSystem() {
        if (confirm('Tem certeza que deseja resetar todo o sistema? Isso apagará todo o progresso.')) {
            this.data = {
                deposits: [],
                currentDeposit: 1,
                totalSaved: 0,
                completedDeposits: 0,
                startDate: new Date().toISOString().split('T')[0],
                currentFilter: 'all'
            };

            this.saveData();
            this.updateUI();
            this.showAlert('warning', 'Sistema resetado com sucesso!');
        }
    }

    // Completar depósito
    completeDeposit(depositNumber) {
        const deposit = this.data.deposits.find(d => d.number === depositNumber);
        if (!deposit) return;

        // Preencher modal com dados do depósito
        document.getElementById('depositAmount').value = deposit.amount;
        document.getElementById('depositDate').value = deposit.completedDate || new Date().toISOString().split('T')[0];
        document.getElementById('depositNote').value = deposit.note || '';

        // Armazenar número do depósito no modal
        document.getElementById('depositModal').dataset.depositNumber = depositNumber;

        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('depositModal'));
        modal.show();
    }

    // Salvar depósito
    saveDeposit() {
        const depositNumber = parseInt(document.getElementById('depositModal').dataset.depositNumber);
        const amount = parseFloat(document.getElementById('depositAmount').value);
        const date = document.getElementById('depositDate').value;
        const note = document.getElementById('depositNote').value;

        if (!amount || amount <= 0) {
            this.showAlert('danger', 'Por favor, insira um valor válido para o depósito.');
            return;
        }

        const deposit = this.data.deposits.find(d => d.number === depositNumber);
        if (!deposit) return;

        // Atualizar depósito
        const wasCompleted = deposit.completed;

        deposit.completed = true;
        deposit.completedDate = date;
        deposit.actualAmount = amount;
        deposit.note = note;

        // Recalcular estatísticas
        this.recalculateStats();
            this.saveData();
            this.updateUI();

        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('depositModal'));
        modal.hide();

        // Mostrar modal de sucesso apenas se for um novo depósito
        if (!wasCompleted) {
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        }

        this.showAlert('success', `Depósito #${depositNumber} salvo com sucesso!`);
    }

    // Mostrar depósitos filtrados
    showDeposits(filter) {
        this.data.currentFilter = filter;
        this.updateDepositGrid();

        // Atualizar botões ativos
        document.querySelectorAll('[onclick^="showDeposits"]').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
        });

        if (event && event.target) {
            event.target.classList.remove('btn-outline-primary');
            event.target.classList.add('btn-primary');
        }
    }

    // Atualizar grid de depósitos
    updateDepositGrid() {
        const grid = document.getElementById('depositGrid');
        if (!grid) return;

        let filteredDeposits = this.data.deposits;

        switch (this.data.currentFilter) {
            case 'completed':
                filteredDeposits = this.data.deposits.filter(d => d.completed);
                break;
            case 'pending':
                filteredDeposits = this.data.deposits.filter(d => !d.completed);
                break;
            default:
                filteredDeposits = this.data.deposits;
        }

        // Mostrar mais depósitos para melhor visualização
        const depositsPerPage = this.data.showAllDeposits ? filteredDeposits.length : 100;
        const depositsToShow = filteredDeposits.slice(0, depositsPerPage);

        grid.innerHTML = depositsToShow.map(deposit => {
            let cardClass = 'deposit-card';
            let statusText = 'Pendente';

            if (deposit.completed) {
                cardClass += ' completed';
                statusText = 'Concluído';
            } else if (deposit.number === this.data.currentDeposit) {
                cardClass += ' current';
                statusText = 'Atual';
            }

            return `
                <div class="${cardClass}" onclick="completeDeposit(${deposit.number})">
                    <div class="deposit-number">#${deposit.number}</div>
                    <div class="deposit-amount">${this.formatCurrency(deposit.amount)}</div>
                    <div class="deposit-status">${statusText}</div>
                    ${deposit.completed ? `<small class="mt-1">💰 ${this.formatCurrency(deposit.actualAmount)}</small>` : ''}
                    </div>
            `;
        }).join('');

        if (filteredDeposits.length > depositsPerPage && !this.data.showAllDeposits) {
            grid.innerHTML += `
                <div class="deposit-card" style="border: 2px dashed #047857; color: #047857; cursor: pointer;" onclick="showMoreDeposits()">
                    <div class="deposit-number"><i class="fas fa-eye"></i></div>
                    <div class="deposit-amount">+${filteredDeposits.length - depositsPerPage}</div>
                    <div class="deposit-status">Ver Todos</div>
                    <small class="mt-1">Clique para ver todos os depósitos</small>
                </div>
            `;
        } else if (this.data.showAllDeposits && filteredDeposits.length > 100) {
            grid.innerHTML += `
                <div class="deposit-card" style="border: 2px dashed #d4af37; color: #d4af37; cursor: pointer;" onclick="showLessDeposits()">
                    <div class="deposit-number"><i class="fas fa-eye-slash"></i></div>
                    <div class="deposit-amount">Menos</div>
                    <div class="deposit-status">Mostrar Menos</div>
                    <small class="mt-1">Clique para mostrar menos</small>
                </div>
            `;
        }

        if (depositsToShow.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center p-4">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Nenhum depósito encontrado</h5>
                    <p class="text-muted">Clique em "Calcular Depósitos" para começar.</p>
                </div>
            `;
        }
    }

    // Mostrar mais depósitos
    showMoreDeposits() {
        this.data.showAllDeposits = true;
        this.updateDepositGrid();
    }

    // Mostrar menos depósitos
    showLessDeposits() {
        this.data.showAllDeposits = false;
        this.updateDepositGrid();
    }

    // Atualizar estatísticas da interface
    updateStats() {
        document.getElementById('currentDeposit').textContent = this.data.currentDeposit;
        document.getElementById('totalSaved').textContent = this.formatCurrency(this.data.totalSaved);
        document.getElementById('remainingDeposits').textContent = this.config.totalDeposits - this.data.completedDeposits;

        const nextDeposit = this.data.deposits.find(d => !d.completed);
        document.getElementById('nextAmount').textContent = nextDeposit
            ? this.formatCurrency(nextDeposit.amount)
            : 'Concluído!';

        // Valor do último depósito (maior número de depósito)
        const lastDeposit = this.data.deposits.length > 0 ? this.data.deposits[this.data.deposits.length - 1] : null;
        const lastDepositElement = document.getElementById('lastDepositValue');
        if (lastDepositElement) {
            lastDepositElement.textContent = lastDeposit
                ? this.formatCurrency(lastDeposit.amount)
                : 'R$ 0,00';
        }

        // Valor médio dos depósitos
        const averageDepositElement = document.getElementById('averageDeposit');
        if (averageDepositElement) {
            const totalValue = this.data.deposits.reduce((sum, d) => sum + d.amount, 0);
            const average = this.data.deposits.length > 0 ? totalValue / this.data.deposits.length : 0;
            averageDepositElement.textContent = this.formatCurrency(average);
        }

        // Total teórico (meta)
        const totalTheoricalElement = document.getElementById('totalTheorical');
        if (totalTheoricalElement) {
            const totalTheorical = this.data.deposits.reduce((sum, d) => sum + d.amount, 0);
            totalTheoricalElement.textContent = this.formatCurrency(totalTheorical);

            // Verificar se está próximo da meta
            const difference = Math.abs(totalTheorical - this.config.targetAmount);
            if (difference < 1) {
                totalTheoricalElement.parentElement.style.borderTop = '3px solid #d4af37';
            } else {
                totalTheoricalElement.parentElement.style.borderTop = '3px solid #059669';
            }
        }
    }

    // Atualizar barra de progresso
    updateProgress() {
        const totalPossible = this.data.deposits.reduce((sum, d) => sum + d.amount, 0);
        const progress = totalPossible > 0 ? (this.data.totalSaved / totalPossible) * 100 : 0;

        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressPercent').textContent = `${progress.toFixed(1)}%`;
    }

    // Atualizar gráficos
    updateCharts() {
        this.updateDepositsChart();
        this.updateProgressChart();
    }

    // Atualizar gráfico de depósitos
    updateDepositsChart() {
        const ctx = document.getElementById('depositsChart');
        if (!ctx) return;

        if (this.charts.deposits) {
            this.charts.deposits.destroy();
        }

        const last30Deposits = this.data.deposits.slice(0, 30);
        const labels = last30Deposits.map(d => `#${d.number}`);
        const amounts = last30Deposits.map(d => d.amount);

        this.charts.deposits = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor do Depósito',
                    data: amounts,
                    borderColor: '#047857',
                    backgroundColor: 'rgba(4, 120, 87, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#d4af37',
                    pointBorderColor: '#047857',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Progressão dos Valores'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function (value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    // Atualizar gráfico de progresso
    updateProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        if (this.charts.progress) {
            this.charts.progress.destroy();
        }

        const completed = this.data.completedDeposits;
        const remaining = this.config.totalDeposits - completed;

        this.charts.progress = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Concluídos', 'Restantes'],
                datasets: [{
                    data: [completed, remaining],
                    backgroundColor: ['#047857', '#f3f4f6'],
                    borderWidth: 3,
                    borderColor: ['#d4af37', '#e5e7eb'],
                    hoverBackgroundColor: ['#059669', '#e5e7eb'],
                    hoverBorderColor: ['#d4af37', '#d1d5db']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Progresso Geral'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Atualizar toda a interface
    updateUI() {
        this.updateStats();
        this.updateProgress();
        this.updateDepositGrid();
        this.updateCharts();
    }

    // Utilitários
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    showAlert(type, message) {
        // Remover alertas existentes
        const existingAlerts = document.querySelectorAll('.alert-custom');
        existingAlerts.forEach(alert => alert.remove());

        // Criar novo alerta
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show alert-custom`;
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.style.minWidth = '300px';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alert);

        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('show', show);
        }
    }

    scrollToDeposits() {
        const depositGrid = document.getElementById('depositGrid');
        if (depositGrid) {
            depositGrid.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // === SISTEMA DE BACKUP ===

    // Verificar parâmetros da URL para carregamento automático
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const backupData = urlParams.get('data');

        if (backupData) {
            try {
                const decodedData = JSON.parse(atob(backupData));
                this.loadBackupData(decodedData);
                this.showAlert('success', 'Dados carregados automaticamente da URL!');

                // Limpar URL sem recarregar a página
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                this.showAlert('danger', 'Erro ao carregar dados da URL: ' + error.message);
            }
        }
    }

    // Exportar dados para JSON
    exportData() {
        const exportData = {
            config: this.config,
            data: this.data,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `depositos-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showAlert('success', 'Dados exportados com sucesso!');
        this.backupSettings.lastBackupDate = new Date().toISOString();
        this.saveData();
    }

    // Importar dados do JSON
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                if (this.validateBackupData(importedData)) {
                    const confirmed = confirm('Isso substituirá todos os dados atuais. Deseja continuar?');
                    if (confirmed) {
                        this.loadBackupData(importedData);
                        this.showAlert('success', 'Dados importados com sucesso!');
                    }
                } else {
                    this.showAlert('danger', 'Arquivo de backup inválido!');
                }
            } catch (error) {
                this.showAlert('danger', 'Erro ao importar dados: ' + error.message);
            }
        };
        reader.readAsText(file);

        // Limpar input
        event.target.value = '';
    }

    // Validar dados de backup
    validateBackupData(data) {
        return data &&
            data.config &&
            data.data &&
            Array.isArray(data.data.deposits) &&
            typeof data.config.initialValue === 'number' &&
            typeof data.config.totalDeposits === 'number';
    }

    // Carregar dados de backup
    loadBackupData(backupData) {
        this.config = { ...this.config, ...backupData.config };
        this.data = { ...this.data, ...backupData.data };

        this.saveData();
        this.updateUI();
        this.updateConfigFields();
    }

    // Backup para GitHub Gist
    async backupToGithub() {
        const token = document.getElementById('githubToken').value;
        const isPublic = !token; // Se não tem token, será público

        const exportData = {
            config: this.config,
            data: this.data,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const gistData = {
            description: `Backup Depósitos - ${new Date().toLocaleDateString('pt-BR')}`,
            public: isPublic,
            files: {
                'depositos-backup.json': {
                    content: JSON.stringify(exportData, null, 2)
                }
            }
        };

        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `token ${token}`;
            }

            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(gistData)
            });

            if (response.ok) {
                const result = await response.json();
                const gistUrl = result.html_url;

                // Salvar URL do Gist para futuras restaurações
                localStorage.setItem('lastGithubGistUrl', gistUrl);
                localStorage.setItem('lastGithubGistId', result.id);

                this.showAlert('success', `Backup salvo no GitHub! <a href="${gistUrl}" target="_blank">Ver Gist</a>`);
                this.backupSettings.lastBackupDate = new Date().toISOString();
                this.saveData();
        } else {
                throw new Error('Erro ao criar Gist: ' + response.status);
            }
        } catch (error) {
            this.showAlert('danger', 'Erro ao fazer backup no GitHub: ' + error.message);
        }
    }

    // Restaurar do GitHub Gist
    async restoreFromGithub() {
        const gistUrl = prompt('Cole aqui a URL do GitHub Gist com seu backup:');
        if (!gistUrl) return;

        try {
            // Extrair ID do Gist da URL
            const gistId = gistUrl.split('/').pop();

            const response = await fetch(`https://api.github.com/gists/${gistId}`);

            if (response.ok) {
                const gist = await response.json();
                const fileContent = gist.files['depositos-backup.json'].content;
                const backupData = JSON.parse(fileContent);

                if (this.validateBackupData(backupData)) {
                    const confirmed = confirm('Isso substituirá todos os dados atuais. Deseja continuar?');
                    if (confirmed) {
                        this.loadBackupData(backupData);
                        this.showAlert('success', 'Dados restaurados do GitHub com sucesso!');
                    }
                } else {
                    this.showAlert('danger', 'Backup do GitHub inválido!');
                }
            } else {
                throw new Error('Gist não encontrado ou privado');
            }
        } catch (error) {
            this.showAlert('danger', 'Erro ao restaurar do GitHub: ' + error.message);
        }
    }

    // Gerar URL de backup
    generateBackupUrl() {
        const exportData = {
            config: this.config,
            data: this.data,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const encodedData = btoa(JSON.stringify(exportData));
        const backupUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;

        document.getElementById('backupUrl').value = backupUrl;

        // Copiar para clipboard
        navigator.clipboard.writeText(backupUrl).then(() => {
            this.showAlert('success', 'URL de backup gerada e copiada para a área de transferência!');
        }).catch(() => {
            this.showAlert('info', 'URL de backup gerada! Copie o link do campo abaixo.');
        });

        this.backupSettings.lastBackupDate = new Date().toISOString();
        this.saveData();
    }

    // Carregar dados da URL
    loadFromUrl() {
        const url = document.getElementById('backupUrl').value || prompt('Cole aqui a URL de backup:');
        if (!url) return;

        try {
            const urlObj = new URL(url);
            const backupData = urlObj.searchParams.get('data');

            if (backupData) {
                const decodedData = JSON.parse(atob(backupData));

                if (this.validateBackupData(decodedData)) {
                    const confirmed = confirm('Isso substituirá todos os dados atuais. Deseja continuar?');
                    if (confirmed) {
                        this.loadBackupData(decodedData);
                        this.showAlert('success', 'Dados carregados da URL com sucesso!');
                    }
                } else {
                    this.showAlert('danger', 'URL de backup inválida!');
                }
            } else {
                this.showAlert('danger', 'URL não contém dados de backup!');
            }
        } catch (error) {
            this.showAlert('danger', 'Erro ao carregar dados da URL: ' + error.message);
        }
    }

    // Conectar Google Drive (placeholder - requer configuração da API)
    connectGoogleDrive() {
        this.showAlert('info', 'Funcionalidade do Google Drive em desenvolvimento. Use as outras opções por enquanto.');
        // TODO: Implementar integração com Google Drive API
    }

    // Sincronizar com Google Drive (placeholder)
    syncGoogleDrive() {
        this.showAlert('info', 'Funcionalidade do Google Drive em desenvolvimento.');
    }

    // Backup automático
    performAutoBackup() {
        if (!this.backupSettings.autoBackup) return;

        switch (this.backupSettings.backupMethod) {
            case 'json':
                // Para JSON, apenas salva localmente (já feito)
                break;
            case 'github':
                if (this.backupSettings.githubToken) {
                    this.backupToGithub().catch(console.error);
                }
                break;
            case 'url':
                this.generateBackupUrl();
                break;
            case 'drive':
                // TODO: Implementar quando Google Drive estiver pronto
                break;
        }
    }

    // Salvar configurações de backup
    saveBackupSettings() {
        this.backupSettings.autoBackup = document.getElementById('autoBackup').checked;
        this.backupSettings.backupMethod = document.getElementById('backupMethod').value;
        this.backupSettings.githubToken = document.getElementById('githubToken').value;

        this.saveData();
        this.updateBackupStatus();
        this.showAlert('success', 'Configurações de backup salvas!');

        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('backupModal'));
        if (modal) modal.hide();
    }

    // Atualizar status do backup
    updateBackupStatus() {
        const statusElement = document.getElementById('backupStatus');
        if (!statusElement) return;

        if (this.backupSettings.autoBackup) {
            const method = this.backupSettings.backupMethod;
            const lastBackup = this.backupSettings.lastBackupDate
                ? new Date(this.backupSettings.lastBackupDate).toLocaleString('pt-BR')
                : 'Nunca';

            statusElement.innerHTML = `
                Backup automático ativo (${method.toUpperCase()})<br>
                <small>Último backup: ${lastBackup}</small>
            `;
            statusElement.className = 'text-success';
    } else {
            statusElement.textContent = 'Backup automático desativado';
            statusElement.className = 'text-warning';
        }
    }

    // Abrir modal de backup
    openBackupModal() {
        // Preencher campos com dados atuais
        document.getElementById('autoBackup').checked = this.backupSettings.autoBackup;
        document.getElementById('backupMethod').value = this.backupSettings.backupMethod;
        document.getElementById('githubToken').value = this.backupSettings.githubToken;

        this.updateBackupStatus();

        const modal = new bootstrap.Modal(document.getElementById('backupModal'));
        modal.show();
    }
}

// Instância global do sistema
let depositSystem;

// Funções globais para os botões
function calculateDeposits() {
    if (depositSystem) {
        depositSystem.calculateDeposits();
    }
}

function startChallenge() {
    if (depositSystem) {
        depositSystem.startChallenge();
    }
}

function resetSystem() {
    if (depositSystem) {
        depositSystem.resetSystem();
    }
}

function completeDeposit(depositNumber) {
    if (depositSystem) {
        depositSystem.completeDeposit(depositNumber);
    }
}

function saveDeposit() {
    if (depositSystem) {
        depositSystem.saveDeposit();
    }
}

function showDeposits(filter) {
    if (depositSystem) {
        depositSystem.showDeposits(filter);
    }
}

function showMoreDeposits() {
    if (depositSystem) {
        depositSystem.showMoreDeposits();
    }
}

function showLessDeposits() {
    if (depositSystem) {
        depositSystem.showLessDeposits();
    }
}

// === FUNÇÕES GLOBAIS DE BACKUP ===

function openBackupModal() {
    if (depositSystem) {
        depositSystem.openBackupModal();
    }
}

function exportData() {
    if (depositSystem) {
        depositSystem.exportData();
    }
}

function importData(event) {
    if (depositSystem) {
        depositSystem.importData(event);
    }
}

function backupToGithub() {
    if (depositSystem) {
        depositSystem.backupToGithub();
    }
}

function restoreFromGithub() {
    if (depositSystem) {
        depositSystem.restoreFromGithub();
    }
}

function connectGoogleDrive() {
    if (depositSystem) {
        depositSystem.connectGoogleDrive();
    }
}

function syncGoogleDrive() {
    if (depositSystem) {
        depositSystem.syncGoogleDrive();
    }
}

function generateBackupUrl() {
    if (depositSystem) {
        depositSystem.generateBackupUrl();
    }
}

function loadFromUrl() {
    if (depositSystem) {
        depositSystem.loadFromUrl();
    }
}

function saveBackupSettings() {
    if (depositSystem) {
        depositSystem.saveBackupSettings();
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando Sistema de Depósitos Progressivos...');

    depositSystem = new DepositSystem();

    console.log('✅ Sistema inicializado com sucesso!');
    console.log('📊 Configuração atual:', depositSystem.config);
    console.log('📈 Dados atuais:', depositSystem.data);
});
