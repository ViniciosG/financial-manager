// Dashboard Consolidado
class DashboardSystem {
    constructor() {
        this.depositosData = this.carregarDepositosData();
        this.investimentosData = this.carregarInvestimentosData();
        this.charts = {};

        this.init();
    }

    // Carregar dados dos depósitos
    carregarDepositosData() {
        const data = localStorage.getItem('depositSystemData');
        const config = localStorage.getItem('depositSystemConfig');

        if (data && config) {
            return {
                data: JSON.parse(data),
                config: JSON.parse(config)
            };
        }

        return {
            data: { deposits: [], totalSaved: 0, currentDeposit: 1, completedDeposits: 0 },
            config: { targetAmount: 2000000, totalDeposits: 1500, initialValue: 300 }
        };
    }

    // Carregar dados dos investimentos
    carregarInvestimentosData() {
        const aportes = localStorage.getItem('aportesRegistrados');

        if (aportes) {
            return JSON.parse(aportes);
        }

        return [];
    }

    // Inicializar dashboard
    init() {
        this.atualizarHeaderStats();
        this.atualizarWidgetDepositos();
        this.atualizarWidgetInvestimentos();
        this.atualizarProximasAcoes();
        this.atualizarTopFIIs();
        this.criarGraficoPatrimonio();
    }

    // Atualizar estatísticas do header
    atualizarHeaderStats() {
        // Patrimônio Total = Depósitos + Investimentos
        const totalDepositos = this.depositosData.data.totalSaved || 0;
        const totalInvestimentos = this.investimentosData.reduce((sum, a) => sum + a.total, 0);
        const patrimonioTotal = totalDepositos + totalInvestimentos;

        // Renda Mensal = Dividendos dos FIIs
        const rendaMensal = this.investimentosData.reduce((sum, a) => sum + a.dividendosMensal, 0);

        // Progresso Geral
        const metaDepositos = this.depositosData.config.targetAmount || 0;
        const progressoDepositos = metaDepositos > 0 ? (totalDepositos / metaDepositos) * 100 : 0;
        const progressoGeral = progressoDepositos;

        // Próximo Dividendo (soma mensal)
        const proximoDividendo = rendaMensal;

        document.getElementById('patrimonioTotal').textContent = this.formatCurrency(patrimonioTotal);
        document.getElementById('rendaMensal').textContent = this.formatCurrency(rendaMensal);
        document.getElementById('progressoGeral').textContent = progressoGeral.toFixed(1) + '%';
        document.getElementById('proximoDividendo').textContent = this.formatCurrency(proximoDividendo);
    }

    // Atualizar widget de depósitos
    atualizarWidgetDepositos() {
        const totalSaved = this.depositosData.data.totalSaved || 0;
        const currentDeposit = this.depositosData.data.currentDeposit || 1;
        const targetAmount = this.depositosData.config.targetAmount || 2000000;

        // Encontrar próximo depósito
        const deposits = this.depositosData.data.deposits || [];
        const nextDeposit = deposits.find(d => !d.completed);
        const nextAmount = nextDeposit ? nextDeposit.amount : 0;

        const progress = targetAmount > 0 ? (totalSaved / targetAmount) * 100 : 0;

        document.getElementById('depositoTotal').textContent = this.formatCurrency(totalSaved);
        document.getElementById('depositoAtual').textContent = '#' + currentDeposit;
        document.getElementById('depositoMeta').textContent = this.formatCurrency(targetAmount);
        document.getElementById('depositoProximo').textContent = this.formatCurrency(nextAmount);
        document.getElementById('depositoProgress').textContent = progress.toFixed(1) + '%';
        document.getElementById('depositoProgressBar').style.width = Math.min(progress, 100) + '%';
    }

    // Atualizar widget de investimentos
    atualizarWidgetInvestimentos() {
        const totalInvestido = this.investimentosData.reduce((sum, a) => sum + a.total, 0);
        const totalCotas = this.investimentosData.reduce((sum, a) => sum + a.quantidade, 0);
        const dividendosMes = this.investimentosData.reduce((sum, a) => sum + a.dividendosMensal, 0);
        const totalAportes = this.investimentosData.length;

        document.getElementById('fiisInvestido').textContent = this.formatCurrency(totalInvestido);
        document.getElementById('fiisCotas').textContent = totalCotas;
        document.getElementById('fiisDividendos').textContent = this.formatCurrency(dividendosMes);
        document.getElementById('fiisAportes').textContent = totalAportes;
    }

    // Atualizar próximas ações
    atualizarProximasAcoes() {
        const container = document.getElementById('proximasAcoes');
        const acoes = [];

        // Verificar se há depósitos pendentes
        const deposits = this.depositosData.data.deposits || [];
        const nextDeposit = deposits.find(d => !d.completed);

        if (nextDeposit) {
            acoes.push({
                tipo: 'info',
                titulo: 'Fazer Próximo Depósito',
                descricao: `Deposite ${this.formatCurrency(nextDeposit.amount)} hoje!`,
                link: 'index.html',
                icon: 'piggy-bank'
            });
        } else if (deposits.length === 0) {
            acoes.push({
                tipo: 'info',
                titulo: 'Calcule seus Depósitos',
                descricao: 'Configure e calcule sua progressão',
                link: 'index.html',
                icon: 'calculator'
            });
        }

        // Verificar se tem aportes este mês
        const hoje = new Date();
        const aporteEsteMes = this.investimentosData.find(a => {
            const dataAporte = new Date(a.data);
            return dataAporte.getMonth() === hoje.getMonth() &&
                dataAporte.getFullYear() === hoje.getFullYear();
        });

        if (!aporteEsteMes && this.investimentosData.length > 0) {
            acoes.push({
                tipo: 'warning',
                titulo: 'Aporte Mensal Pendente',
                descricao: 'Você ainda não fez aporte este mês',
                link: 'investimentos.html#acompanhamento',
                icon: 'exclamation-triangle'
            });
        }

        // Verificar marcos atingidos
        const totalPatrimonio = this.depositosData.data.totalSaved +
            this.investimentosData.reduce((sum, a) => sum + a.total, 0);

        const marcos = [10000, 50000, 100000, 250000, 500000, 1000000];
        for (const marco of marcos) {
            if (totalPatrimonio >= marco && totalPatrimonio < marco * 1.1) {
                acoes.push({
                    tipo: 'success',
                    titulo: `Parabéns! R$ ${marco.toLocaleString('pt-BR')}`,
                    descricao: 'Você atingiu um marco importante!',
                    icon: 'trophy'
                });
                break;
            }
        }

        // Se não há ações, mostrar mensagem motivacional
        if (acoes.length === 0) {
            acoes.push({
                tipo: 'success',
                titulo: 'Tudo em Dia!',
                descricao: 'Continue assim, você está no caminho certo!',
                icon: 'check-circle'
            });
        }

        // Renderizar ações
        container.innerHTML = acoes.map(acao => {
            const alertClass = `alert-${acao.tipo}-custom`;
            return `
                <div class="alert-custom ${alertClass}">
                    <i class="fas fa-${acao.icon} me-2"></i>
                    <strong>${acao.titulo}</strong>
                    <br><small>${acao.descricao}</small>
                    ${acao.link ? `<br><a href="${acao.link}" class="btn btn-sm btn-outline-primary mt-2">Ir Agora</a>` : ''}
                </div>
            `;
        }).join('');
    }

    // Atualizar Top FIIs
    atualizarTopFIIs() {
        const container = document.getElementById('topFIIsMini');

        const topFIIs = [
            { ticker: 'HGLG11', dy: '0.85%' },
            { ticker: 'KNRI11', dy: '0.92%' },
            { ticker: 'MXRF11', dy: '0.95%' }
        ];

        container.innerHTML = topFIIs.map((fii, index) => `
            <div class="stat-mini">
                <span class="stat-mini-label">
                    <span class="badge bg-warning text-dark">#${index + 1}</span>
                    ${fii.ticker}
                </span>
                <span class="stat-mini-value text-success">${fii.dy}/mês</span>
            </div>
        `).join('');
    }

    // Criar gráfico de patrimônio
    criarGraficoPatrimonio() {
        const ctx = document.getElementById('chartPatrimonio');
        if (!ctx) return;

        // Dados simulados de evolução (idealmente pegar dados reais do histórico)
        const meses = [];
        const depositosAcumulados = [];
        const investimentosAcumulados = [];
        const patrimonioTotal = [];

        const hoje = new Date();
        let depositoAcum = 0;
        let investimentoAcum = 0;

        // Gerar últimos 12 meses
        for (let i = 11; i >= 0; i--) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            meses.push(data.toLocaleDateString('pt-BR', { month: 'short' }));

            // Simular crescimento gradual
            depositoAcum = this.depositosData.data.totalSaved * ((12 - i) / 12);

            // Investimentos por mês
            const aportesAteMes = this.investimentosData.filter(a => {
                const dataAporte = new Date(a.data);
                return dataAporte <= data;
            });
            investimentoAcum = aportesAteMes.reduce((sum, a) => sum + a.total, 0);

            depositosAcumulados.push(depositoAcum);
            investimentosAcumulados.push(investimentoAcum);
            patrimonioTotal.push(depositoAcum + investimentoAcum);
        }

        this.charts.patrimonio = new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [
                    {
                        label: 'Patrimônio Total',
                        data: patrimonioTotal,
                        borderColor: '#047857',
                        backgroundColor: 'rgba(4, 120, 87, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Depósitos',
                        data: depositosAcumulados,
                        borderColor: '#1e40af',
                        backgroundColor: 'rgba(30, 64, 175, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Investimentos',
                        data: investimentosAcumulados,
                        borderColor: '#d4af37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução Patrimonial nos Últimos 12 Meses',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(context.parsed.y);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    }

    // Formatar moeda
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Atualizar tudo
    atualizarTudo() {
        this.depositosData = this.carregarDepositosData();
        this.investimentosData = this.carregarInvestimentosData();
        this.init();
    }
}

// Instância global
let dashboardSystem;

// Funções globais
function abrirBackup() {
    window.location.href = 'index.html';
    setTimeout(() => {
        if (window.depositSystem && window.depositSystem.openBackupModal) {
            window.depositSystem.openBackupModal();
        }
    }, 500);
}

function atualizarDashboard() {
    if (dashboardSystem) {
        dashboardSystem.atualizarTudo();
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando Dashboard...');
    dashboardSystem = new DashboardSystem();
    console.log('✅ Dashboard inicializado!');

    // Atualizar a cada 30 segundos
    setInterval(() => {
        dashboardSystem.atualizarHeaderStats();
    }, 30000);
});

