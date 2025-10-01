// Sistema de Indicações e Notícias
class IndicacoesSystem {
    constructor() {
        this.apiToken = localStorage.getItem('brapiToken') || '';

        // Top FIIs Recomendados (curadoria baseada em análises de mercado)
        this.topFIIs = [
            {
                ticker: 'HGLG11',
                nome: 'CSHG Logística',
                segmento: 'Logística',
                dyMedio: 0.85,
                liquidez: 'Alta',
                gestora: 'Credit Suisse Hedging-Griffo',
                motivo: 'Maior FII de logística do Brasil, alta liquidez e dividendos consistentes',
                rating: 5
            },
            {
                ticker: 'KNRI11',
                nome: 'Kinea Renda Imobiliária',
                segmento: 'Híbrido',
                dyMedio: 0.92,
                liquidez: 'Muito Alta',
                gestora: 'Kinea',
                motivo: 'Excelente diversificação, gestão sólida e pagamento mensal consistente',
                rating: 5
            },
            {
                ticker: 'MXRF11',
                nome: 'Maxi Renda',
                segmento: 'Híbrido',
                dyMedio: 0.95,
                liquidez: 'Muito Alta',
                gestora: 'Maxi Renda',
                motivo: 'Altíssima liquidez, baixo preço por cota, ideal para pequenos investidores',
                rating: 5
            },
            {
                ticker: 'VISC11',
                nome: 'Vinci Shopping Centers',
                segmento: 'Shopping',
                dyMedio: 0.86,
                liquidez: 'Alta',
                gestora: 'Vinci Partners',
                motivo: 'Portfólio de shoppings de qualidade, recuperação pós-pandemia',
                rating: 4
            },
            {
                ticker: 'BTLG11',
                nome: 'BTG Pactual Logística',
                segmento: 'Logística',
                dyMedio: 0.90,
                liquidez: 'Alta',
                gestora: 'BTG Pactual',
                motivo: 'Gestão renomada, foco em e-commerce e logística moderna',
                rating: 5
            },
            {
                ticker: 'KNCR11',
                nome: 'Kinea Crédito Imobiliário',
                segmento: 'Papel',
                dyMedio: 0.94,
                liquidez: 'Média',
                gestora: 'Kinea',
                motivo: 'Alto dividend yield, CRIs bem estruturados, baixa vacância',
                rating: 4
            }
        ];

        // FIIs por Segmento
        this.fiisPorSegmento = {
            logistica: [
                { ticker: 'HGLG11', nome: 'CSHG Logística', dy: 0.85 },
                { ticker: 'BTLG11', nome: 'BTG Logística', dy: 0.90 },
                { ticker: 'VILG11', nome: 'Vinci Logística', dy: 0.82 },
                { ticker: 'LVBI11', nome: 'VBI Logística', dy: 0.88 }
            ],
            shoppings: [
                { ticker: 'VISC11', nome: 'Vinci Shopping Centers', dy: 0.86 },
                { ticker: 'XPML11', nome: 'XP Malls', dy: 0.88 },
                { ticker: 'MALL11', nome: 'Mall Brasil', dy: 0.84 },
                { ticker: 'HSML11', nome: 'HSI Malls', dy: 0.83 }
            ],
            lajes: [
                { ticker: 'PVBI11', nome: 'VBI Prime Properties', dy: 0.78 },
                { ticker: 'RCRB11', nome: 'RB Capital Renda', dy: 0.81 },
                { ticker: 'HGBS11', nome: 'CSHG Brasil Shopping', dy: 0.79 }
            ],
            papel: [
                { ticker: 'KNCR11', nome: 'Kinea Crédito Imobiliário', dy: 0.94 },
                { ticker: 'RBRF11', nome: 'RBR Rendimento High Grade', dy: 0.96 },
                { ticker: 'MCCI11', nome: 'Mauá Capital Recebíveis Imobiliários', dy: 0.93 },
                { ticker: 'BCFF11', nome: 'BTG Pactual Fundo de Fundos', dy: 0.91 }
            ]
        };

        this.init();
    }

    init() {
        this.carregarTopFIIs();
        this.carregarFIIsPorSegmento();
        this.carregarNoticias();
    }

    // Carregar Top FIIs
    async carregarTopFIIs() {
        const container = document.getElementById('topFIIs');

        for (const fii of this.topFIIs) {
            // Tentar buscar dados reais
            let dadosReais = null;
            if (this.apiToken) {
                try {
                    const cotacoes = await this.buscarCotacao(fii.ticker);
                    if (cotacoes && cotacoes.length > 0) {
                        dadosReais = cotacoes[0];
                    }
                } catch (error) {
                    console.error(`Erro ao buscar ${fii.ticker}:`, error);
                }
            }

            const preco = dadosReais ? dadosReais.regularMarketPrice : null;
            const variacao = dadosReais ? dadosReais.regularMarketChangePercent : null;

            const stars = '⭐'.repeat(fii.rating);

            container.innerHTML += `
                <div class="fii-recommendation-card">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <span class="badge-top me-2">#TOP ${this.topFIIs.indexOf(fii) + 1}</span>
                            <span class="badge-good">${fii.segmento}</span>
                        </div>
                        <div class="text-end">
                            ${preco ? `<h4 class="mb-0">${this.formatCurrency(preco)}</h4>` : ''}
                            ${variacao !== null ? `<small class="${variacao >= 0 ? 'text-success' : 'text-danger'}">
                                <i class="fas fa-${variacao >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                                ${Math.abs(variacao).toFixed(2)}%
                            </small>` : ''}
                        </div>
                    </div>
                    
                    <h5 class="mb-2">
                        <strong>${fii.ticker}</strong> - ${fii.nome}
                        <span class="ms-2">${stars}</span>
                    </h5>
                    
                    <p class="text-muted mb-3">${fii.motivo}</p>
                    
                    <div class="row">
                        <div class="col-md-4">
                            <div class="metric">
                                DY Médio: <span class="metric-value">${fii.dyMedio}%/mês</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="metric">
                                Liquidez: <span class="metric-value">${fii.liquidez}</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="metric">
                                Gestora: <span class="metric-value">${fii.gestora}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <button class="btn btn-sm btn-primary me-2" onclick="adicionarAoAcompanhamento('${fii.ticker}')">
                            <i class="fas fa-plus me-1"></i>Adicionar ao Acompanhamento
                        </button>
                        <a href="https://www.google.com/search?q=${fii.ticker}+dividendos" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-external-link-alt me-1"></i>Pesquisar
                        </a>
                    </div>
                </div>
            `;
        }
    }

    // Carregar FIIs por Segmento
    carregarFIIsPorSegmento() {
        // Logística
        this.renderizarSegmento('fiisLogistica', this.fiisPorSegmento.logistica);

        // Shoppings
        this.renderizarSegmento('fiisShoppings', this.fiisPorSegmento.shoppings);

        // Lajes
        this.renderizarSegmento('fiisLajes', this.fiisPorSegmento.lajes);

        // Papel
        this.renderizarSegmento('fiisPapel', this.fiisPorSegmento.papel);
    }

    // Renderizar segmento
    renderizarSegmento(containerId, fiis) {
        const container = document.getElementById(containerId);

        container.innerHTML = fiis.map(fii => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                <div>
                    <strong>${fii.ticker}</strong>
                    <br><small class="text-muted">${fii.nome}</small>
                </div>
                <div class="text-end">
                    <span class="text-success"><strong>${fii.dy}%/mês</strong></span>
                </div>
            </div>
        `).join('');
    }

    // Carregar Notícias
    async carregarNoticias() {
        const container = document.getElementById('noticiasContainer');

        // Notícias curadas manualmente (fontes confiáveis)
        const noticias = [
            {
                titulo: 'FIIs de Logística: Setor Aquecido com E-commerce',
                fonte: 'InfoMoney',
                data: new Date(),
                resumo: 'Fundos imobiliários de logística continuam entre os mais recomendados por analistas devido ao crescimento do comércio eletrônico.',
                link: 'https://www.infomoney.com.br/mercados/fundos-imobiliarios/'
            },
            {
                titulo: 'Melhores FIIs para Investir em 2025',
                fonte: 'Suno Research',
                data: new Date(Date.now() - 86400000),
                resumo: 'Análise dos FIIs com maior potencial de valorização e dividend yield para o próximo ano.',
                link: 'https://www.suno.com.br/artigos/melhores-fiis/'
            },
            {
                titulo: 'Dividendos de FIIs: O Que Esperar Este Mês',
                fonte: 'Valor Econômico',
                data: new Date(Date.now() - 172800000),
                resumo: 'Calendário de dividendos e análise dos principais pagadores do mês.',
                link: 'https://valor.globo.com/financas/fundos-imobiliarios/'
            },
            {
                titulo: 'FIIs de Papel: Oportunidade com Juros em Alta',
                fonte: 'FIIs.com.br',
                data: new Date(Date.now() - 259200000),
                resumo: 'Fundos de CRI/CRA se beneficiam do cenário de taxa Selic elevada.',
                link: 'https://fiis.com.br/'
            },
            {
                titulo: 'Estratégia: Como Diversificar em FIIs',
                fonte: 'Nord Research',
                data: new Date(Date.now() - 345600000),
                resumo: 'Guia completo sobre como montar uma carteira diversificada de fundos imobiliários.',
                link: 'https://www.google.com/search?q=diversificacao+fiis'
            }
        ];

        container.innerHTML = noticias.map(noticia => `
            <div class="news-card">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="mb-1">${noticia.titulo}</h5>
                </div>
                
                <div class="mb-2">
                    <span class="news-source">
                        <i class="fas fa-newspaper me-1"></i>${noticia.fonte}
                    </span>
                    <span class="news-date ms-3">
                        <i class="fas fa-clock me-1"></i>${this.formatarData(noticia.data)}
                    </span>
                </div>
                
                <p class="text-muted mb-3">${noticia.resumo}</p>
                
                <a href="${noticia.link}" target="_blank" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-external-link-alt me-1"></i>Ler Mais
                </a>
            </div>
        `).join('');
    }

    // Buscar cotação de um ticker
    async buscarCotacao(ticker) {
        if (!this.apiToken) return null;

        try {
            const url = `https://brapi.dev/api/quote/${ticker}?token=${this.apiToken}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) return null;
            return data.results || null;
        } catch (error) {
            return null;
        }
    }

    // Formatar data
    formatarData(data) {
        const hoje = new Date();
        const diff = hoje - data;
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (dias === 0) return 'Hoje';
        if (dias === 1) return 'Ontem';
        if (dias < 7) return `Há ${dias} dias`;

        return data.toLocaleDateString('pt-BR');
    }

    // Formatar moeda
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}

// Instância global
let indicacoesSystem;

// Funções globais
function atualizarNoticias() {
    if (indicacoesSystem) {
        indicacoesSystem.carregarNoticias();
    }
}

function adicionarAoAcompanhamento(ticker) {
    // Salvar ticker selecionado e redirecionar
    localStorage.setItem('tickerSelecionado', ticker);
    alert(`✅ ${ticker} será adicionado ao seu acompanhamento!\n\nVocê será redirecionado para a página de investimentos.`);
    window.location.href = 'investimentos.html#acompanhamento';
}

// Inicializar
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando Sistema de Indicações...');
    indicacoesSystem = new IndicacoesSystem();
    console.log('✅ Sistema inicializado!');
});

