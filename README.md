# 💰 Sistema Financeiro Completo

Sistema completo de planejamento financeiro com depósitos progressivos, investimentos em FIIs/Ações e cálculo do número mágico para independência financeira.

## 🎯 Funcionalidades

### 📊 Sistema de Depósitos Progressivos
- **Progressão Aritmética Matemática**: Sempre atinge a meta exata
- **Configurável**: Valor inicial, quantidade de depósitos e meta final
- **Rastreamento**: Acompanhe cada depósito realizado
- **Estatísticas Detalhadas**: Veja seu progresso em tempo real
- **Gráficos Interativos**: Visualize sua evolução

### 💎 Sistema de Investimentos
- **Número Mágico**: Calcule quanto precisa investir para viver de renda
- **FIIs**: Fundos Imobiliários com dividend yield
- **Ações**: Empresas pagadoras de dividendos
- **Efeito Bola de Neve**: Simule o reinvestimento de dividendos

### 🔐 Sistema de Backup
- **Export/Import JSON**: Backup local em arquivo
- **GitHub Gist**: Backup online gratuito
- **URL**: Compartilhe dados via link
- **Backup Automático**: Configure para fazer backup a cada depósito

## 🚀 Como Usar

### 1. Sistema de Depósitos

1. Configure os valores:
   - **Valor Inicial**: Quanto quer começar depositando (ex: R$ 300)
   - **Quantidade de Depósitos**: Quantos depósitos fará (ex: 1500)
   - **Meta Final**: Quanto quer acumular (ex: R$ 2.000.000)

2. Clique em **"Calcular Depósitos"**

3. O sistema mostrará:
   - ✅ Primeiro depósito
   - ✅ Último depósito
   - ✅ Total que acumulará
   - ✅ Confirmação se a meta foi atingida

4. Clique em **"Iniciar Desafio"** e comece a registrar seus depósitos!

### 2. Número Mágico

1. Acesse **Investimentos** → **Número Mágico**

2. Configure:
   - **Renda Mensal Desejada**: Quanto quer receber por mês
   - **Dividend Yield Médio**: Rendimento médio dos investimentos
   - **Prazo**: Em quantos anos quer atingir
   - **Aporte Mensal**: Quanto pode investir por mês

3. O sistema calculará:
   - 💰 Número Mágico (valor total necessário)
   - 📈 Quanto acumulará com seus aportes
   - 💵 Renda mensal que gerará
   - 📊 Gráfico de evolução

### 3. Efeito Bola de Neve

1. Acesse **Investimentos** → **Efeito Bola de Neve**

2. Configure:
   - **Investimento Inicial**: Quanto tem hoje
   - **Aporte Mensal**: Quanto investirá por mês
   - **DY Médio**: Dividend Yield mensal médio
   - **Período**: Em quantos anos
   - **Reinvestimento**: % de dividendos que reinvestirá

3. Veja a mágica acontecer com os gráficos!

## 📐 Fórmulas Matemáticas

### Progressão Aritmética (Depósitos)
```
Último Valor = (2 × Meta ÷ Quantidade) - Valor Inicial
Incremento = (Último - Primeiro) ÷ (Quantidade - 1)
```

### Número Mágico
```
Número Mágico = (Renda Mensal Desejada × 12) ÷ (Dividend Yield ÷ 100)
```

### Montante com Aportes Mensais
```
FV = PMT × (((1 + i)^n - 1) ÷ i) × (1 + i)

Onde:
- FV = Valor Futuro
- PMT = Aporte Mensal
- i = Taxa mensal
- n = Número de meses
```

### Efeito Bola de Neve
```
Para cada mês:
1. Patrimônio = Patrimônio × (1 + Taxa de Valorização)
2. Dividendos = Patrimônio × (DY ÷ 100)
3. Reinvestir = Dividendos × (% Reinvestimento ÷ 100)
4. Patrimônio = Patrimônio + Reinvestir + Aporte Mensal
```

## 💾 Backup dos Dados

### Opção 1: JSON (Recomendado para backup local)
1. Clique em **"Backup & Sync"**
2. Escolha **"Backup Manual (JSON)"**
3. Clique em **"Exportar Dados"**
4. Guarde o arquivo `.json` em segurança

**Para restaurar:**
1. Clique em **"Importar Dados"**
2. Selecione o arquivo `.json`

### Opção 2: GitHub Gist (Recomendado para acesso online)
1. Clique em **"Backup & Sync"**
2. Escolha **"GitHub Gist"**
3. *Opcional*: Cole um GitHub Token para backup privado
4. Clique em **"Backup para GitHub"**
5. Guarde a URL do Gist gerada

**Para restaurar:**
1. Clique em **"Restaurar do GitHub"**
2. Cole a URL do Gist

### Opção 3: URL (Mais rápido)
1. Clique em **"Backup & Sync"**
2. Escolha **"Backup por URL"**
3. Clique em **"Gerar Link de Backup"**
4. Copie e guarde o link

**Para restaurar:**
- Basta acessar o link gerado!

## 🌐 Hospedar Online

### GitHub Pages (Gratuito)

```bash
# 1. Inicializar Git
git init
git add .
git commit -m "Sistema Financeiro Completo"

# 2. Criar repositório no GitHub
# Acesse github.com e crie um novo repositório

# 3. Conectar e enviar
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main

# 4. Ativar GitHub Pages
# No repositório: Settings → Pages → Deploy from branch → main → Save
```

Seu site estará em: `https://SEU-USUARIO.github.io/SEU-REPO/`

### Netlify (Gratuito + Senha)

1. Acesse [netlify.com](https://netlify.com)
2. Faça login com GitHub
3. Clique em **"Add new site"** → **"Import an existing project"**
4. Conecte seu repositório GitHub
5. Deploy automático!

**Para adicionar senha:**
- Site Settings → Access Control → Visitor Access → Password Protection

## 📱 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Design responsivo e moderno
- **Bootstrap 5**: Framework CSS
- **JavaScript ES6+**: Lógica de negócios
- **Chart.js**: Gráficos interativos
- **LocalStorage**: Armazenamento local
- **Font Awesome**: Ícones

## 🎨 Paleta de Cores

- 🟢 **Verde Bancário**: `#047857` - Confiança, dinheiro, crescimento
- 🔵 **Azul Corporativo**: `#1e40af` - Estabilidade, confiança
- 🟡 **Dourado**: `#d4af37` - Riqueza, prosperidade, destaque
- ✅ **Verde Sucesso**: `#059669` - Conquistas, metas atingidas

## 📊 Exemplos de Uso

### Exemplo 1: Economia de Curto Prazo
```
Valor Inicial: R$ 100
Quantidade: 365 dias
Meta: R$ 100.000

Resultado:
- Primeiro depósito: R$ 100,00
- Último depósito: R$ 447,94
- Incremento diário: R$ 0,96
```

### Exemplo 2: Independência Financeira
```
Renda Desejada: R$ 10.000/mês
DY Médio: 0,8%/mês (9,6% ao ano)
Prazo: 15 anos
Aporte: R$ 3.000/mês

Resultado:
- Número Mágico: R$ 1.500.000
- Acumulará: R$ 1.853.214
- Atingirá: 123,5% da meta
- Renda gerada: R$ 14.825/mês
```

### Exemplo 3: Bola de Neve
```
Investimento Inicial: R$ 50.000
Aporte Mensal: R$ 2.000
DY Mensal: 0,7%
Período: 20 anos
Reinvestimento: 100%

Resultado:
- Patrimônio Final: R$ 3.847.592
- Renda Mensal: R$ 26.933
- Lucro Total: R$ 3.317.592
- Rentabilidade: 625,9%
```

## 🤝 Contribuindo

Sugestões e melhorias são bem-vindas! Este é um projeto open-source focado em educação financeira.

## 📄 Licença

MIT License - Sinta-se livre para usar, modificar e distribuir.

## 🎓 Avisos Importantes

⚠️ **Este sistema é para fins educacionais e de planejamento pessoal.**

- Não é uma recomendação de investimento
- Consulte um profissional certificado para decisões financeiras
- Rentabilidades passadas não garantem resultados futuros
- Os dados de FIIs e Ações são simulados (substitua por API real)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se seguiu todos os passos corretamente
2. Limpe o cache do navegador (Ctrl+Shift+Del)
3. Teste em modo anônimo
4. Verifique o console do navegador (F12)

---

**Desenvolvido com 💚 para ajudar você a alcançar seus objetivos financeiros!**

🎯 Transforme R$ 300 em R$ 2.000.000
💎 Atinja a independência financeira
🚀 Viva de renda passiva

---

## 🌐 API Brapi - Cotações em Tempo Real

### ✅ Já Integrado!

O sistema já vem integrado com a **API Brapi** (100% gratuita) que fornece:

- 📊 **Cotações em tempo real** da B3
- 🏢 **FIIs**: Todos os fundos imobiliários
- 📈 **Ações**: Todas as empresas listadas
- 📉 **Variação diária**: Acompanhe o mercado
- 💰 **Preços atualizados**: Dados reais

### 🔗 Como Funciona:

```javascript
// Endpoint da API Brapi
https://brapi.dev/api/quote/HGLG11,KNRI11,PETR4,VALE3

// Resposta JSON
{
  "results": [
    {
      "symbol": "HGLG11",
      "longName": "CSHG Logística",
      "regularMarketPrice": 165.50,
      "regularMarketChangePercent": 0.85,
      ...
    }
  ]
}
```

### 📝 Documentação Completa:

- **Site**: https://brapi.dev
- **Docs**: https://brapi.dev/docs
- **GitHub**: https://github.com/Mayneru/brapi

### ⚡ Recursos:

- ✅ Sem necessidade de token
- ✅ Sem limite de requisições (uso justo)
- ✅ Open Source
- ✅ Mantida pela comunidade brasileira
- ✅ Dados diretos da B3

### 💡 Dica:

O **DY (Dividend Yield)** exibido é estimado. Para dados reais de dividendos, considere:
- **Status Invest** (requer scraping ou API paga)
- **Fundamentus** (scraping)
- **B3 Oficial** (dados públicos)

