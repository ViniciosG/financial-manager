// Sistema de Investimentos - FIIs, Ações e Número Mágico
class InvestmentSystem {
    constructor() {
        this.apiBase = 'https://brapi.dev/api';
        this.apiToken = localStorage.getItem('brapiToken') || '';
        this.fiisCache = [];
        this.acoesCache = [];
        this.selectedAssets = [];
        this.charts = {};
        this.usandoDadosSimulados = false;

        // Sistema de Acompanhamento
        this.aportes = this.carregarAportes();
        this.dividendosHistorico = this.carregarDividendos();

        // Lista de FIIs populares (limitado a 8 para plano gratuito)
        this.popularFIIs = [
            'HGLG11', 'KNRI11', 'MXRF11', 'XPML11',
            'VILG11', 'BTLG11', 'KNCR11', 'VISC11'
        ];

        // Lista de ações populares (limitado a 8 para plano gratuito)
        this.popularAcoes = [
            'PETR4', 'VALE3', 'ITUB4', 'BBDC4',
            'ABEV3', 'TAEE11', 'BBSE3', 'WEGE3'
        ];

        // Dados simulados como fallback
        this.mockFIIs = this.createMockFIIsDatabase();
        this.mockAcoes = this.createMockAcoesDatabase();

        this.verificarToken();
    }

    // Verificar se tem token configurado
    verificarToken() {
        if (!this.apiToken) {
            console.warn('⚠️ Token da Brapi não configurado. Usando dados simulados.');
            this.mostrarAvisoToken();
        }
    }

    // Mostrar aviso sobre token
    mostrarAvisoToken() {
        const avisoHtml = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;">
                <i class="fas fa-key me-2"></i>
                <strong>Token não configurado!</strong><br>
                Para cotações reais, configure seu token gratuito da Brapi.
                <button type="button" class="btn btn-sm btn-warning mt-2 w-100" onclick="investmentSystem.mostrarModalToken()">
                    <i class="fas fa-cog me-1"></i>Configurar Token
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = avisoHtml;
        document.body.appendChild(div);
    }

    // Mostrar modal para configurar token
    mostrarModalToken() {
        const modal = `
            <div class="modal fade" id="tokenModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header" style="background: var(--gradient-primary); color: white;">
                            <h5 class="modal-title"><i class="fas fa-key me-2"></i>Configurar Token Brapi</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Como conseguir seu token gratuito:</strong>
                                <ol class="mb-0 mt-2">
                                    <li>Acesse: <a href="https://brapi.dev/dashboard" target="_blank">brapi.dev/dashboard</a></li>
                                    <li>Faça login (GitHub, Google ou Email)</li>
                                    <li>Copie seu API Token</li>
                                    <li>Cole aqui abaixo</li>
                                </ol>
                                <small class="text-muted d-block mt-2">
                                    <strong>Plano Gratuito:</strong><br>
                                    • 1 ação por requisição<br>
                                    • 200 requisições/dia<br>
                                    • Sistema carrega 8 ativos por vez
                                </small>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">
                                    <i class="fas fa-key me-1"></i>Token da API Brapi
                                </label>
                                <input type="text" class="form-control" id="brapiTokenInput" 
                                    placeholder="Cole seu token aqui..." value="${this.apiToken}">
                                <small class="text-muted">Exemplo: abc123xyz456...</small>
                            </div>

                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="usarDadosSimulados">
                                <label class="form-check-label" for="usarDadosSimulados">
                                    Usar dados simulados (sem token)
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="investmentSystem.salvarToken()">
                                <i class="fas fa-save me-1"></i>Salvar Token
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal antigo se existir
        const oldModal = document.getElementById('tokenModal');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modal);
        const modalEl = new bootstrap.Modal(document.getElementById('tokenModal'));
        modalEl.show();
    }

    // Salvar token
    salvarToken() {
        const token = document.getElementById('brapiTokenInput').value.trim();
        const usarSimulados = document.getElementById('usarDadosSimulados').checked;

        if (token) {
            this.apiToken = token;
            localStorage.setItem('brapiToken', token);
            this.usandoDadosSimulados = false;
            alert('✅ Token salvo com sucesso! Recarregando dados...');
        } else if (usarSimulados) {
            this.usandoDadosSimulados = true;
            alert('ℹ️ Usando dados simulados. Configure um token para cotações reais.');
        }

        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('tokenModal'));
        modal.hide();

        // Recarregar dados
        this.buscarFIIs();
        this.buscarAcoes();
    }

    // Criar banco de dados simulado de FIIs
    createMockFIIsDatabase() {
        return [
            { symbol: 'HGLG11', longName: 'CSHG Logística', regularMarketPrice: 165.50, regularMarketChangePercent: 0.85 },
            { symbol: 'KNRI11', longName: 'Kinea Renda Imobiliária', regularMarketPrice: 105.20, regularMarketChangePercent: -0.32 },
            { symbol: 'MXRF11', longName: 'Maxi Renda', regularMarketPrice: 10.15, regularMarketChangePercent: 0.15 },
            { symbol: 'XPML11', longName: 'XP Malls', regularMarketPrice: 102.80, regularMarketChangePercent: 1.20 },
            { symbol: 'VILG11', longName: 'Vinci Logística', regularMarketPrice: 98.50, regularMarketChangePercent: -0.45 },
            { symbol: 'BTLG11', longName: 'BTG Logística', regularMarketPrice: 112.30, regularMarketChangePercent: 0.67 },
            { symbol: 'KNCR11', longName: 'Kinea Crédito Imobiliário', regularMarketPrice: 99.80, regularMarketChangePercent: 0.22 },
            { symbol: 'RBRF11', longName: 'RBR Rendimento High Grade', regularMarketPrice: 88.50, regularMarketChangePercent: -0.18 },
            { symbol: 'PVBI11', longName: 'VBI Prime Properties', regularMarketPrice: 120.40, regularMarketChangePercent: 0.95 },
            { symbol: 'VISC11', longName: 'Vinci Shopping Centers', regularMarketPrice: 96.70, regularMarketChangePercent: 0.41 }
        ];
    }

    // Criar banco de dados simulado de Ações
    createMockAcoesDatabase() {
        return [
            { symbol: 'PETR4', longName: 'Petrobras PN', regularMarketPrice: 38.50, regularMarketChangePercent: 1.28 },
            { symbol: 'VALE3', longName: 'Vale ON', regularMarketPrice: 65.20, regularMarketChangePercent: -0.85 },
            { symbol: 'ITUB4', longName: 'Itaú Unibanco PN', regularMarketPrice: 28.90, regularMarketChangePercent: 0.52 },
            { symbol: 'BBDC4', longName: 'Bradesco PN', regularMarketPrice: 14.80, regularMarketChangePercent: -0.27 },
            { symbol: 'ABEV3', longName: 'Ambev ON', regularMarketPrice: 12.45, regularMarketChangePercent: 0.16 },
            { symbol: 'TAEE11', longName: 'Taesa Unit', regularMarketPrice: 39.20, regularMarketChangePercent: 1.15 },
            { symbol: 'BBSE3', longName: 'BB Seguridade ON', regularMarketPrice: 32.60, regularMarketChangePercent: 0.74 },
            { symbol: 'EGIE3', longName: 'Engie Brasil ON', regularMarketPrice: 42.30, regularMarketChangePercent: -0.33 },
            { symbol: 'CPLE6', longName: 'Copel PNB', regularMarketPrice: 8.90, regularMarketChangePercent: 0.90 },
            { symbol: 'TRPL4', longName: 'Transmissão Paulista PN', regularMarketPrice: 24.50, regularMarketChangePercent: 0.61 }
        ];
    }

    // Buscar cotação de múltiplos ativos na Brapi
    async buscarCotacoesBrapi(tickers) {
        // Se estiver usando dados simulados
        if (this.usandoDadosSimulados || !this.apiToken) {
            return this.buscarDadosSimulados(tickers);
        }

        try {
            // Plano gratuito: máximo 1 ticker por requisição
            // Vamos fazer requisições individuais para cada ticker
            const results = [];

            // Limitar a 10 tickers para não estourar o limite de requisições
            const tickersLimitados = tickers.slice(0, 10);

            for (const ticker of tickersLimitados) {
                try {
                    const url = `${this.apiBase}/quote/${ticker}?token=${this.apiToken}`;
                    const response = await fetch(url);
                    const data = await response.json();

                    // Se retornar erro de autenticação
                    if (data.error && data.message === 'Unauthorized') {
                        console.error('Token inválido ou expirado');
                        this.mostrarModalToken();
                        return this.buscarDadosSimulados(tickers);
                    }

                    // Se retornar erro de limite de plano
                    if (data.error && data.message.includes('plano')) {
                        console.warn('Limite do plano atingido:', data.message);
                        // Continuar com dados simulados
                        return this.buscarDadosSimulados(tickers);
                    }

                    if (data.results && data.results.length > 0) {
                        results.push(data.results[0]);
                    }

                    // Pequeno delay entre requisições para não sobrecarregar
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (tickerError) {
                    console.error(`Erro ao buscar ${ticker}:`, tickerError);
                    continue;
                }
            }

            return results;

        } catch (error) {
            console.error('Erro na API Brapi:', error);
            // Fallback para dados simulados
            return this.buscarDadosSimulados(tickers);
        }
    }

    // Buscar dados simulados
    buscarDadosSimulados(tickers) {
        const allMock = [...this.mockFIIs, ...this.mockAcoes];
        return allMock.filter(item => tickers.includes(item.symbol));
    }

    // Calcular DY estimado (simulado - API não fornece DY diretamente)
    calcularDYEstimado(ticker, price) {
        // FIIs geralmente têm DY entre 0.7% e 1.2% ao mês
        if (ticker.includes('11')) {
            return (0.7 + Math.random() * 0.5).toFixed(2);
        }
        // Ações geralmente têm DY entre 2% e 6% ao ano
        return (2 + Math.random() * 4).toFixed(2);
    }

    // Calcular Número Mágico
    calcularNumeroMagico() {
        const rendaDesejada = parseFloat(document.getElementById('rendaDesejada').value) || 5000;
        const dividendYield = parseFloat(document.getElementById('dividendYield').value) || 8;
        const prazoAnos = parseInt(document.getElementById('prazoAnos').value) || 10;
        const aporteMensal = parseFloat(document.getElementById('aporteMensal').value) || 1000;
        const rentabilidadeAnual = parseFloat(document.getElementById('rentabilidadeAnual').value) || 10;

        // Calcular Número Mágico
        const rendaAnual = rendaDesejada * 12;
        const numeroMagico = rendaAnual / (dividendYield / 100);

        // Calcular quanto acumular com aportes
        const meses = prazoAnos * 12;
        const taxaMensal = rentabilidadeAnual / 12 / 100;

        // Fórmula do montante com aportes mensais
        const montanteFinal = aporteMensal * (((Math.pow(1 + taxaMensal, meses) - 1) / taxaMensal) * (1 + taxaMensal));

        // Calcular se consegue atingir
        const percentualAtingido = (montanteFinal / numeroMagico) * 100;
        const faltante = numeroMagico - montanteFinal;
        const aporteNecessario = this.calcularAporteNecessario(numeroMagico, prazoAnos, rentabilidadeAnual);

        // Calcular renda mensal que conseguirá gerar
        const rendaMensalFinal = (montanteFinal * (dividendYield / 100)) / 12;

        this.exibirResultadoNumeroMagico({
            numeroMagico,
            rendaDesejada,
            montanteFinal,
            percentualAtingido,
            faltante,
            aporteNecessario,
            rendaMensalFinal,
            prazoAnos,
            dividendYield
        });
    }

    // Calcular aporte necessário para atingir meta
    calcularAporteNecessario(meta, anos, rentabilidadeAnual) {
        const meses = anos * 12;
        const taxaMensal = rentabilidadeAnual / 12 / 100;

        // Fórmula invertida: PMT = FV * (i / ((1 + i)^n - 1))
        const aporte = meta * (taxaMensal / (Math.pow(1 + taxaMensal, meses) - 1));
        return aporte / (1 + taxaMensal);
    }

    // Exibir resultado do Número Mágico
    exibirResultadoNumeroMagico(dados) {
        const container = document.getElementById('resultadoNumeroMagico');

        const atingiu = dados.percentualAtingido >= 100;
        const alertClass = atingiu ? 'success' : 'warning';

        container.innerHTML = `
            <div class="result-card">
                <h4 class="text-center mb-4">
                    <i class="fas fa-magic me-2"></i>Resultado do Número Mágico
                </h4>
                
                <div class="magic-number">
                    ${this.formatCurrency(dados.numeroMagico)}
                </div>
                
                <p class="text-center text-muted mb-4">
                    Este é o valor total que você precisa investir para gerar R$ ${this.formatCurrency(dados.rendaDesejada)}/mês
                    <br>com um Dividend Yield de ${dados.dividendYield}% ao ano
                </p>

                <div class="row">
                    <div class="col-md-3">
                        <div class="stat-box">
                            <div class="stat-value">${this.formatCurrency(dados.montanteFinal)}</div>
                            <div class="stat-label">Acumulará em ${dados.prazoAnos} anos</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-box" style="background: var(--gradient-${atingiu ? 'success' : 'gold'})">
                            <div class="stat-value">${dados.percentualAtingido.toFixed(1)}%</div>
                            <div class="stat-label">Da meta atingida</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-box" style="background: var(--gradient-secondary)">
                            <div class="stat-value">${this.formatCurrency(dados.rendaMensalFinal)}</div>
                            <div class="stat-label">Renda mensal gerada</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-box" style="background: var(--gradient-gold)">
                            <div class="stat-value">${this.formatCurrency(dados.aporteNecessario)}</div>
                            <div class="stat-label">Aporte necessário/mês</div>
                        </div>
                    </div>
                </div>

                <div class="alert alert-${alertClass} mt-4">
                    <i class="fas fa-${atingiu ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                    ${atingiu
                ? `<strong>Parabéns!</strong> Com seus aportes, você atingirá ${dados.percentualAtingido.toFixed(1)}% da meta e terá uma renda mensal de ${this.formatCurrency(dados.rendaMensalFinal)}!`
                : `<strong>Atenção!</strong> Faltam ${this.formatCurrency(dados.faltante)} para atingir a meta. Aumente seu aporte mensal para ${this.formatCurrency(dados.aporteNecessario)} ou aumente o prazo.`
            }
                </div>

                <div class="chart-container mt-4">
                    <canvas id="chartNumeroMagico"></canvas>
                </div>
            </div>
        `;

        this.criarGraficoNumeroMagico(dados);
    }

    // Criar gráfico do Número Mágico
    criarGraficoNumeroMagico(dados) {
        const ctx = document.getElementById('chartNumeroMagico');
        if (!ctx) return;

        if (this.charts.numeroMagico) {
            this.charts.numeroMagico.destroy();
        }

        const anos = [];
        const valores = [];
        const rendas = [];

        const aporteMensal = parseFloat(document.getElementById('aporteMensal').value) || 1000;
        const rentabilidadeAnual = parseFloat(document.getElementById('rentabilidadeAnual').value) || 10;
        const taxaMensal = rentabilidadeAnual / 12 / 100;

        for (let ano = 0; ano <= dados.prazoAnos; ano++) {
            anos.push(`Ano ${ano}`);
            const meses = ano * 12;
            const valor = aporteMensal * (((Math.pow(1 + taxaMensal, meses) - 1) / taxaMensal) * (1 + taxaMensal));
            valores.push(valor);
            rendas.push((valor * (dados.dividendYield / 100)) / 12);
        }

        this.charts.numeroMagico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: anos,
                datasets: [
                    {
                        label: 'Patrimônio Acumulado',
                        data: valores,
                        borderColor: '#047857',
                        backgroundColor: 'rgba(4, 120, 87, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Renda Mensal Gerada',
                        data: rendas,
                        borderColor: '#d4af37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Patrimônio (R$)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Renda Mensal (R$)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução do Patrimônio e Renda ao Longo do Tempo'
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
                }
            }
        });
    }

    // Buscar FIIs da API
    async buscarFIIs() {
        const searchTerm = document.getElementById('searchFii').value.toUpperCase().trim();
        const container = document.getElementById('listaFIIs');

        // Mostrar loading
        container.innerHTML = `
            <div class="col-12 text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-3">Buscando cotações na Brapi...</p>
            </div>
        `;

        try {
            // Se tem busca específica, buscar apenas esse ticker
            let tickers = searchTerm ? [searchTerm] : this.popularFIIs;

            // Buscar cotações
            const cotacoes = await this.buscarCotacoesBrapi(tickers);

            if (cotacoes.length === 0) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Nenhum FII encontrado. Tente outro ticker (ex: HGLG11, KNRI11, MXRF11)
                        </div>
                    </div>
                `;
                return;
            }

            // Armazenar no cache
            this.fiisCache = cotacoes;

            // Adicionar indicador se usando dados simulados
            if (!this.apiToken || this.usandoDadosSimulados) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-warning">
                            <i class="fas fa-database me-2"></i>
                            <strong>Dados Simulados</strong> - Configure seu token para cotações reais.
                            <button class="btn btn-sm btn-outline-warning ms-2" onclick="investmentSystem.mostrarModalToken()">
                                <i class="fas fa-key me-1"></i>Configurar Token
                            </button>
                        </div>
                    </div>
                `;
            }

            // Renderizar FIIs
            container.innerHTML += cotacoes.map(fii => {
                const dy = this.calcularDYEstimado(fii.symbol, fii.regularMarketPrice);
                const variacao = fii.regularMarketChangePercent || 0;
                const variacaoClass = variacao >= 0 ? 'text-success' : 'text-danger';
                const variacaoIcon = variacao >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                const fonte = this.apiToken && !this.usandoDadosSimulados ? 'Tempo Real - B3' : 'Simulado';

                return `
                    <div class="col-md-6 mb-3">
                        <div class="fii-card" onclick="investmentSystem.selecionarAtivo('${fii.symbol}', 'fii')">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-0"><strong>${fii.symbol}</strong></h6>
                                    <small class="text-muted">${fii.longName || fii.shortName || 'FII'}</small>
                                    <div class="mt-1">
                                        <small class="${variacaoClass}">
                                            <i class="fas ${variacaoIcon}"></i>
                                            ${Math.abs(variacao).toFixed(2)}%
                                        </small>
                                    </div>
                                </div>
                                <div class="text-end">
                                    <div><strong>${this.formatCurrency(fii.regularMarketPrice)}</strong></div>
                                    <small class="text-success">DY: ~${dy}%/mês</small>
                                    <div><small class="text-muted">${fonte}</small></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Erro ao buscar cotações: ${error.message}
                        <br><small>Verifique sua conexão com a internet.</small>
                    </div>
                </div>
            `;
        }
    }

    // Buscar Ações da API
    async buscarAcoes() {
        const searchTerm = document.getElementById('searchAcao').value.toUpperCase().trim();
        const container = document.getElementById('listaAcoes');

        // Mostrar loading
        container.innerHTML = `
            <div class="col-12 text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-3">Buscando cotações na Brapi...</p>
            </div>
        `;

        try {
            // Se tem busca específica, buscar apenas esse ticker
            let tickers = searchTerm ? [searchTerm] : this.popularAcoes;

            // Buscar cotações
            const cotacoes = await this.buscarCotacoesBrapi(tickers);

            if (cotacoes.length === 0) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Nenhuma ação encontrada. Tente outro ticker (ex: PETR4, VALE3, ITUB4)
                        </div>
                    </div>
                `;
                return;
            }

            // Armazenar no cache
            this.acoesCache = cotacoes;

            // Adicionar indicador se usando dados simulados
            if (!this.apiToken || this.usandoDadosSimulados) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-warning">
                            <i class="fas fa-database me-2"></i>
                            <strong>Dados Simulados</strong> - Configure seu token para cotações reais.
                            <button class="btn btn-sm btn-outline-warning ms-2" onclick="investmentSystem.mostrarModalToken()">
                                <i class="fas fa-key me-1"></i>Configurar Token
                            </button>
                        </div>
                    </div>
                `;
            }

            // Renderizar ações
            container.innerHTML += cotacoes.map(acao => {
                const dy = this.calcularDYEstimado(acao.symbol, acao.regularMarketPrice);
                const variacao = acao.regularMarketChangePercent || 0;
                const variacaoClass = variacao >= 0 ? 'text-success' : 'text-danger';
                const variacaoIcon = variacao >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                const fonte = this.apiToken && !this.usandoDadosSimulados ? 'Tempo Real - B3' : 'Simulado';

                return `
                    <div class="col-md-6 mb-3">
                        <div class="fii-card" onclick="investmentSystem.selecionarAtivo('${acao.symbol}', 'acao')">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-0"><strong>${acao.symbol}</strong></h6>
                                    <small class="text-muted">${acao.longName || acao.shortName || 'Ação'}</small>
                                    <div class="mt-1">
                                        <small class="${variacaoClass}">
                                            <i class="fas ${variacaoIcon}"></i>
                                            ${Math.abs(variacao).toFixed(2)}%
                                        </small>
                                    </div>
                                </div>
                                <div class="text-end">
                                    <div><strong>${this.formatCurrency(acao.regularMarketPrice)}</strong></div>
                                    <small class="text-success">DY: ~${dy}%/ano</small>
                                    <div><small class="text-muted">${fonte}</small></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Erro ao buscar cotações: ${error.message}
                        <br><small>Verifique sua conexão com a internet.</small>
                    </div>
                </div>
            `;
        }
    }

    // Selecionar ativo
    selecionarAtivo(ticker, tipo) {
        console.log('Ativo selecionado:', ticker, tipo);
        // TODO: Implementar lógica de seleção
    }

    // Atualizar DY do FII selecionado
    async atualizarDYdoFII() {
        const fiiSelecionado = document.getElementById('fiiSelecionado').value;
        const dyInput = document.getElementById('dyMensal');
        const dyInfo = document.getElementById('dyInfo');

        if (fiiSelecionado === 'manual') {
            dyInput.readOnly = false;
            dyInfo.textContent = 'DY médio estimado';
            return;
        }

        // Buscar dados do FII
        dyInfo.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando dados do FII...';

        try {
            const cotacoes = await this.buscarCotacoesBrapi([fiiSelecionado]);

            if (cotacoes.length > 0) {
                const fii = cotacoes[0];
                const dyEstimado = this.calcularDYEstimado(fii.symbol, fii.regularMarketPrice);

                dyInput.value = dyEstimado;
                dyInput.readOnly = true;

                dyInfo.innerHTML = `
                    <span class="text-success">
                        <i class="fas fa-check-circle"></i>
                        ${fii.longName || fii.shortName} - 
                        Preço: ${this.formatCurrency(fii.regularMarketPrice)} - 
                        DY: ${dyEstimado}%/mês
                    </span>
                `;
            } else {
                dyInput.readOnly = false;
                dyInfo.innerHTML = '<span class="text-warning">Não foi possível buscar dados. Use manual.</span>';
            }
        } catch (error) {
            dyInput.readOnly = false;
            dyInfo.innerHTML = '<span class="text-danger">Erro ao buscar FII. Use manual.</span>';
        }
    }

    // Simular Bola de Neve
    async simularBolaDeNeve() {
        const fiiSelecionado = document.getElementById('fiiSelecionado').value;
        const investimentoInicial = parseFloat(document.getElementById('investimentoInicial').value) || 10000;
        const aporteMensal = parseFloat(document.getElementById('aporteBolaDeNeve').value) || 500;
        let dyMensal = parseFloat(document.getElementById('dyMensal').value) || 0.7;
        const periodoAnos = parseInt(document.getElementById('periodoBolaDeNeve').value) || 20;
        const reinvestimento = parseInt(document.getElementById('reinvestimento').value) || 100;
        const valorizacaoAnual = parseFloat(document.getElementById('valorizacaoAnual').value) || 5;

        // Se selecionou um FII específico, buscar dados reais
        let fiiDados = null;
        if (fiiSelecionado !== 'manual') {
            try {
                const cotacoes = await this.buscarCotacoesBrapi([fiiSelecionado]);
                if (cotacoes.length > 0) {
                    fiiDados = cotacoes[0];
                    dyMensal = parseFloat(this.calcularDYEstimado(fiiDados.symbol, fiiDados.regularMarketPrice));
                }
            } catch (error) {
                console.error('Erro ao buscar FII:', error);
            }
        }

        const meses = periodoAnos * 12;
        const taxaValorizacaoMensal = valorizacaoAnual / 12 / 100;
        const taxaReinvestimento = reinvestimento / 100;

        let patrimonio = investimentoInicial;
        let dividendosRecebidos = 0;
        let totalInvestido = investimentoInicial;

        const dadosGrafico = {
            meses: [],
            patrimonios: [],
            dividendos: [],
            investimentos: []
        };

        for (let mes = 1; mes <= meses; mes++) {
            // Valorização do patrimônio
            patrimonio = patrimonio * (1 + taxaValorizacaoMensal);

            // Dividendos do mês
            const dividendosMes = patrimonio * (dyMensal / 100);
            dividendosRecebidos += dividendosMes;

            // Reinvestir dividendos
            const valorReinvestido = dividendosMes * taxaReinvestimento;
            patrimonio += valorReinvestido;

            // Aporte mensal
            patrimonio += aporteMensal;
            totalInvestido += aporteMensal;

            // Guardar dados para gráfico (a cada 3 meses)
            if (mes % 3 === 0 || mes === 1) {
                dadosGrafico.meses.push(`Mês ${mes}`);
                dadosGrafico.patrimonios.push(patrimonio);
                dadosGrafico.dividendos.push(dividendosRecebidos);
                dadosGrafico.investimentos.push(totalInvestido);
            }
        }

        const rendaMensalFinal = patrimonio * (dyMensal / 100);
        const rendaAnualFinal = rendaMensalFinal * 12;
        const lucroTotal = patrimonio - totalInvestido;
        const rentabilidadeTotal = ((patrimonio / totalInvestido) - 1) * 100;

        this.exibirResultadoBolaDeNeve({
            patrimonio,
            totalInvestido,
            dividendosRecebidos,
            rendaMensalFinal,
            rendaAnualFinal,
            lucroTotal,
            rentabilidadeTotal,
            periodoAnos,
            dadosGrafico,
            fiiDados,
            fiiSelecionado,
            dyMensal
        });
    }

    // Exibir resultado Bola de Neve
    exibirResultadoBolaDeNeve(dados) {
        const container = document.getElementById('resultadoBolaDeNeve');

        // Informações do FII se foi selecionado
        let fiiInfo = '';
        if (dados.fiiDados) {
            fiiInfo = `
                <div class="alert alert-info mb-4">
                    <i class="fas fa-building me-2"></i>
                    <strong>FII Selecionado:</strong> ${dados.fiiDados.symbol} - ${dados.fiiDados.longName || dados.fiiDados.shortName}<br>
                    <small>
                        Preço atual: ${this.formatCurrency(dados.fiiDados.regularMarketPrice)} | 
                        DY médio: ${dados.dyMensal}%/mês | 
                        Fonte: ${this.apiToken ? 'Dados Reais - B3' : 'Simulado'}
                    </small>
                </div>
            `;
        } else if (dados.fiiSelecionado !== 'manual') {
            fiiInfo = `
                <div class="alert alert-warning mb-4">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>FII:</strong> ${dados.fiiSelecionado} (usando dados estimados)
                </div>
            `;
        }

        container.innerHTML = `
            <div class="result-card">
                <h4 class="text-center mb-4">
                    <i class="fas fa-snowflake me-2"></i>Resultado do Efeito Bola de Neve
                </h4>
                
                ${fiiInfo}
                
                <div class="row">
                    <div class="col-md-3">
                        <div class="stat-box">
                            <div class="stat-value">${this.formatCurrency(dados.patrimonio)}</div>
                            <div class="stat-label">Patrimônio Final</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-box" style="background: var(--gradient-gold)">
                            <div class="stat-value">${this.formatCurrency(dados.rendaMensalFinal)}</div>
                            <div class="stat-label">Renda Mensal</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-box" style="background: var(--gradient-success)">
                            <div class="stat-value">${this.formatCurrency(dados.lucroTotal)}</div>
                            <div class="stat-label">Lucro Total</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-box" style="background: var(--gradient-secondary)">
                            <div class="stat-value">${dados.rentabilidadeTotal.toFixed(1)}%</div>
                            <div class="stat-label">Rentabilidade</div>
                        </div>
                    </div>
                </div>

                <div class="alert alert-success mt-4">
                    <i class="fas fa-trophy me-2"></i>
                    <strong>Parabéns!</strong> Em ${dados.periodoAnos} anos, seu patrimônio cresceu para ${this.formatCurrency(dados.patrimonio)}, 
                    gerando uma renda passiva de ${this.formatCurrency(dados.rendaMensalFinal)}/mês (${this.formatCurrency(dados.rendaAnualFinal)}/ano).
                    Você recebeu ${this.formatCurrency(dados.dividendosRecebidos)} em dividendos totais!
                </div>

                <div class="chart-container mt-4">
                    <canvas id="chartBolaDeNeve"></canvas>
                </div>
            </div>
        `;

        this.criarGraficoBolaDeNeve(dados);
    }

    // Criar gráfico Bola de Neve
    criarGraficoBolaDeNeve(dados) {
        const ctx = document.getElementById('chartBolaDeNeve');
        if (!ctx) return;

        if (this.charts.bolaDeNeve) {
            this.charts.bolaDeNeve.destroy();
        }

        this.charts.bolaDeNeve = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dados.dadosGrafico.meses,
                datasets: [
                    {
                        label: 'Patrimônio Total',
                        data: dados.dadosGrafico.patrimonios,
                        borderColor: '#047857',
                        backgroundColor: 'rgba(4, 120, 87, 0.1)',
                        borderWidth: 3,
                        fill: true
                    },
                    {
                        label: 'Total Investido',
                        data: dados.dadosGrafico.investimentos,
                        borderColor: '#1e40af',
                        backgroundColor: 'rgba(30, 64, 175, 0.1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Dividendos Acumulados',
                        data: dados.dadosGrafico.dividendos,
                        borderColor: '#d4af37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução do Patrimônio com Efeito Bola de Neve'
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

    // === SISTEMA DE ACOMPANHAMENTO ===

    // Carregar aportes salvos
    carregarAportes() {
        const savedAportes = localStorage.getItem('aportesRegistrados');
        return savedAportes ? JSON.parse(savedAportes) : [];
    }

    // Carregar dividendos salvos
    carregarDividendos() {
        const savedDividendos = localStorage.getItem('dividendosHistorico');
        return savedDividendos ? JSON.parse(savedDividendos) : [];
    }

    // Salvar aportes
    salvarAportes() {
        localStorage.setItem('aportesRegistrados', JSON.stringify(this.aportes));
    }

    // Salvar dividendos
    salvarDividendos() {
        localStorage.setItem('dividendosHistorico', JSON.stringify(this.dividendosHistorico));
    }

    // Buscar preço atual do ativo
    async buscarPrecoAtual() {
        const ativo = document.getElementById('aporteAtivo').value.toUpperCase().trim();

        if (!ativo) {
            alert('Por favor, informe o ticker do ativo primeiro (ex: HGLG11)');
            return;
        }

        try {
            const cotacoes = await this.buscarCotacoesBrapi([ativo]);

            if (cotacoes.length > 0) {
                const preco = cotacoes[0].regularMarketPrice;
                document.getElementById('aportePreco').value = preco.toFixed(2);

                alert(`✅ Preço atual de ${ativo}: ${this.formatCurrency(preco)}`);
            } else {
                alert('❌ Não foi possível buscar o preço. Informe manualmente.');
            }
        } catch (error) {
            alert('❌ Erro ao buscar preço. Informe manualmente.');
        }
    }

    // Registrar novo aporte
    async registrarAporte() {
        const ativo = document.getElementById('aporteAtivo').value.toUpperCase().trim();
        const quantidade = parseInt(document.getElementById('aporteQuantidade').value);
        const preco = parseFloat(document.getElementById('aportePreco').value);
        const data = document.getElementById('aporteData').value;

        if (!ativo || !quantidade || !preco || !data) {
            alert('❌ Por favor, preencha todos os campos!');
            return;
        }

        const total = quantidade * preco;
        const dyMensal = parseFloat(this.calcularDYEstimado(ativo, preco));
        const dividendosMensal = total * (dyMensal / 100);

        // Criar objeto do aporte
        const aporte = {
            id: Date.now(),
            ativo,
            quantidade,
            preco,
            total,
            data,
            dyMensal,
            dividendosMensal
        };

        // Adicionar ao array
        this.aportes.push(aporte);
        this.salvarAportes();

        // Atualizar interface
        this.atualizarAcompanhamento();

        // Limpar formulário
        document.getElementById('aporteAtivo').value = '';
        document.getElementById('aporteQuantidade').value = '';
        document.getElementById('aportePreco').value = '';

        alert(`✅ Aporte registrado com sucesso!\n\n` +
            `${ativo}: ${quantidade} cotas × ${this.formatCurrency(preco)} = ${this.formatCurrency(total)}\n` +
            `Dividendos mensais estimados: ${this.formatCurrency(dividendosMensal)}`);
    }

    // Remover aporte
    removerAporte(id) {
        if (confirm('Tem certeza que deseja remover este aporte?')) {
            this.aportes = this.aportes.filter(a => a.id !== id);
            this.salvarAportes();
            this.atualizarAcompanhamento();
        }
    }

    // Atualizar acompanhamento
    atualizarAcompanhamento() {
        this.atualizarResumoPortfolio();
        this.atualizarTabelaAportes();
        this.atualizarGraficoEvolucao();
    }

    // Atualizar resumo do portfólio
    atualizarResumoPortfolio() {
        const totalInvestido = this.aportes.reduce((sum, a) => sum + a.total, 0);
        const totalCotas = this.aportes.reduce((sum, a) => sum + a.quantidade, 0);
        const dividendosMes = this.aportes.reduce((sum, a) => sum + a.dividendosMensal, 0);

        // Calcular patrimônio atual (buscar preços atuais seria ideal, mas vamos usar o investido)
        const patrimonioAtual = totalInvestido; // Simplificado

        document.getElementById('totalInvestidoAcomp').textContent = this.formatCurrency(totalInvestido);
        document.getElementById('totalCotasAcomp').textContent = totalCotas;
        document.getElementById('dividendosMesAcomp').textContent = this.formatCurrency(dividendosMes);
        document.getElementById('patrimonioAtualAcomp').textContent = this.formatCurrency(patrimonioAtual);
    }

    // Atualizar tabela de aportes
    atualizarTabelaAportes() {
        const tbody = document.getElementById('tabelaAportes');

        if (this.aportes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        Nenhum aporte registrado ainda. Comece registrando seu primeiro aporte!
                    </td>
                </tr>
            `;
            return;
        }

        // Ordenar por data (mais recente primeiro)
        const aportesOrdenados = [...this.aportes].sort((a, b) => new Date(b.data) - new Date(a.data));

        tbody.innerHTML = aportesOrdenados.map(aporte => `
            <tr>
                <td>${new Date(aporte.data).toLocaleDateString('pt-BR')}</td>
                <td><strong>${aporte.ativo}</strong></td>
                <td>${aporte.quantidade}</td>
                <td>${this.formatCurrency(aporte.preco)}</td>
                <td><strong>${this.formatCurrency(aporte.total)}</strong></td>
                <td>${aporte.dyMensal}%</td>
                <td class="text-success"><strong>${this.formatCurrency(aporte.dividendosMensal)}</strong></td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="investmentSystem.removerAporte(${aporte.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Calcular dividendos do mês
    calcularDividendos() {
        if (this.aportes.length === 0) {
            alert('❌ Você ainda não tem aportes registrados!');
            return;
        }

        const dividendosContainer = document.getElementById('previsaoDividendos');
        const calendarioContainer = document.getElementById('calendarioDividendos');

        // Agrupar aportes por ativo
        const porAtivo = {};
        this.aportes.forEach(aporte => {
            if (!porAtivo[aporte.ativo]) {
                porAtivo[aporte.ativo] = {
                    totalCotas: 0,
                    totalInvestido: 0,
                    dividendosMensal: 0,
                    dyMedio: 0
                };
            }

            porAtivo[aporte.ativo].totalCotas += aporte.quantidade;
            porAtivo[aporte.ativo].totalInvestido += aporte.total;
            porAtivo[aporte.ativo].dividendosMensal += aporte.dividendosMensal;
            porAtivo[aporte.ativo].dyMedio = aporte.dyMensal;
        });

        const totalDividendosMes = Object.values(porAtivo).reduce((sum, a) => sum + a.dividendosMensal, 0);

        // Gerar calendário dos próximos 12 meses
        const hoje = new Date();
        let calendarioHtml = '<div class="row">';

        for (let mes = 1; mes <= 12; mes++) {
            const dataProxima = new Date(hoje.getFullYear(), hoje.getMonth() + mes, 1);
            const nomeMes = dataProxima.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

            calendarioHtml += `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <h6>${nomeMes}</h6>
                            <h4 class="text-success">${this.formatCurrency(totalDividendosMes)}</h4>
                            <small class="text-muted">Dividendos estimados</small>
                        </div>
                    </div>
                </div>
            `;
        }

        calendarioHtml += '</div>';

        // Detalhamento por ativo
        calendarioHtml += '<hr><h6>Detalhamento por Ativo:</h6><div class="row">';

        Object.keys(porAtivo).forEach(ativo => {
            const dados = porAtivo[ativo];
            calendarioHtml += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h6><strong>${ativo}</strong></h6>
                            <p class="mb-1">Cotas: <strong>${dados.totalCotas}</strong></p>
                            <p class="mb-1">Investido: <strong>${this.formatCurrency(dados.totalInvestido)}</strong></p>
                            <p class="mb-1">DY Médio: <strong>${dados.dyMedio}%/mês</strong></p>
                            <p class="mb-0 text-success">Dividendos/Mês: <strong>${this.formatCurrency(dados.dividendosMensal)}</strong></p>
                        </div>
                    </div>
                </div>
            `;
        });

        calendarioHtml += '</div>';

        calendarioContainer.innerHTML = calendarioHtml;
        dividendosContainer.style.display = 'block';

        // Scroll para visualizar
        dividendosContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Atualizar gráfico de evolução
    atualizarGraficoEvolucao() {
        if (this.aportes.length === 0) {
            document.getElementById('graficoEvolucao').style.display = 'none';
            return;
        }

        document.getElementById('graficoEvolucao').style.display = 'block';

        const ctx = document.getElementById('chartAcompanhamento');
        if (!ctx) return;

        if (this.charts.acompanhamento) {
            this.charts.acompanhamento.destroy();
        }

        // Ordenar aportes por data
        const aportesOrdenados = [...this.aportes].sort((a, b) => new Date(a.data) - new Date(b.data));

        const labels = [];
        const investidoAcumulado = [];
        const dividendosAcumulados = [];

        let totalInvestido = 0;
        let dividendosMensal = 0;

        aportesOrdenados.forEach((aporte, index) => {
            totalInvestido += aporte.total;
            dividendosMensal += aporte.dividendosMensal;

            labels.push(`Aporte ${index + 1}`);
            investidoAcumulado.push(totalInvestido);
            dividendosAcumulados.push(dividendosMensal);
        });

        this.charts.acompanhamento = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Investido',
                        data: investidoAcumulado,
                        borderColor: '#1e40af',
                        backgroundColor: 'rgba(30, 64, 175, 0.1)',
                        borderWidth: 3,
                        fill: true
                    },
                    {
                        label: 'Dividendos/Mês Acumulado',
                        data: dividendosAcumulados,
                        borderColor: '#d4af37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução dos Aportes e Dividendos'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Total Investido (R$)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Dividendos/Mês (R$)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
}

// Instância global
let investmentSystem;

// Funções globais
function calcularNumeroMagico() {
    if (investmentSystem) {
        investmentSystem.calcularNumeroMagico();
    }
}

function buscarFIIs() {
    if (investmentSystem) {
        investmentSystem.buscarFIIs();
    }
}

function buscarAcoes() {
    if (investmentSystem) {
        investmentSystem.buscarAcoes();
    }
}

function simularBolaDeNeve() {
    if (investmentSystem) {
        investmentSystem.simularBolaDeNeve();
    }
}

function registrarAporte() {
    if (investmentSystem) {
        investmentSystem.registrarAporte();
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando Sistema de Investimentos...');
    investmentSystem = new InvestmentSystem();

    // Carregar FIIs e Ações por padrão
    investmentSystem.buscarFIIs();
    investmentSystem.buscarAcoes();

    // Configurar data atual no formulário de aporte
    const hoje = new Date().toISOString().split('T')[0];
    const aporteDataField = document.getElementById('aporteData');
    if (aporteDataField) {
        aporteDataField.value = hoje;
    }

    // Carregar acompanhamento se houver aportes
    if (investmentSystem.aportes.length > 0) {
        investmentSystem.atualizarAcompanhamento();
    }

    console.log('✅ Sistema de Investimentos inicializado!');
    console.log('📊 Aportes carregados:', investmentSystem.aportes.length);
});

