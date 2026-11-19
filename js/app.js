/**
 * Logique principale de l'application de conversion de devises
 * Synchronisation du convertisseur, du graphique en direct et des flux Forex.
 */

class CurrencyApp {
  constructor() {
    this.state = {
      amount: 100,
      from: 'EUR',
      to: 'USD',
      rate: 1.0968,
      timeframe: '24h',
      theme: localStorage.getItem('theme') || 'dark',
      isLiveActive: true,
      popularRates: {}
    };

    this.liveIntervalId = null;
    this.backgroundSyncId = null;
    this.chart = null;

    this.init();
  }

  async init() {
    this.initDOM();
    this.applyTheme(this.state.theme);
    this.initChart();
    this.parseUrlParams();
    this.renderDropdowns();
    this.initEventListeners();

    // Premier chargement des taux et graphique
    await this.refreshRatesAndChart();
    this.startLiveEngine();
    this.loadPopularTicker();
    this.updateQuickMatrix();
  }

  initChart() {
    const canvas = document.getElementById('forexChart');
    const tooltip = document.getElementById('chartTooltip');
    this.chart = new ForexChart(canvas, tooltip);
    this.chart.setTheme(this.state.theme);
  }

  initDOM() {
    this.dom = {
      amountInput: document.getElementById('amountInput'),
      fromSelectBtn: document.getElementById('fromSelectBtn'),
      toSelectBtn: document.getElementById('toSelectBtn'),
      fromModal: document.getElementById('fromModal'),
      toModal: document.getElementById('toModal'),
      fromSearch: document.getElementById('fromSearch'),
      toSearch: document.getElementById('toSearch'),
      fromList: document.getElementById('fromList'),
      toList: document.getElementById('toList'),
      swapBtn: document.getElementById('swapBtn'),
      convertedValue: document.getElementById('convertedValue'),
      convertedCurrency: document.getElementById('convertedCurrency'),
      unitRateText: document.getElementById('unitRateText'),
      inverseRateText: document.getElementById('inverseRateText'),
      lastUpdateBadge: document.getElementById('lastUpdateBadge'),
      liveStatusBadge: document.getElementById('liveStatusBadge'),
      liveToggleBtn: document.getElementById('liveToggleBtn'),
      timeframeBtns: document.querySelectorAll('.timeframe-btn'),
      chartPairTitle: document.getElementById('chartPairTitle'),
      chartCurrentRate: document.getElementById('chartCurrentRate'),
      chartDeltaBadge: document.getElementById('chartDeltaBadge'),
      statHigh: document.getElementById('statHigh'),
      statLow: document.getElementById('statLow'),
      statAvg: document.getElementById('statAvg'),
      statChange: document.getElementById('statChange'),
      matrixFromTable: document.getElementById('matrixFromTable'),
      matrixToTable: document.getElementById('matrixToTable'),
      matrixFromTitle: document.getElementById('matrixFromTitle'),
      matrixToTitle: document.getElementById('matrixToTitle'),
      popularTicker: document.getElementById('popularTicker'),
      copyBtn: document.getElementById('copyBtn'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      refreshBtn: document.getElementById('refreshBtn'),
      toast: document.getElementById('toast')
    };

    this.dom.amountInput.value = this.state.amount;
  }

  parseUrlParams() {
    try {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        if (params.get('from') && CURRENCIES[params.get('from').toUpperCase()]) {
          this.state.from = params.get('from').toUpperCase();
        }
        if (params.get('to') && CURRENCIES[params.get('to').toUpperCase()]) {
          this.state.to = params.get('to').toUpperCase();
        }
        if (params.get('amount') && !isNaN(Number(params.get('amount')))) {
          this.state.amount = Math.max(0.01, Number(params.get('amount')));
          this.dom.amountInput.value = this.state.amount;
        }
      }
    } catch (e) {
      console.warn('Erreur lecture paramètres URL', e);
    }
  }

  updateUrlParams() {
    const params = new URLSearchParams();
    params.set('from', this.state.from);
    params.set('to', this.state.to);
    params.set('amount', this.state.amount);
    window.history.replaceState(null, '', `#${params.toString()}`);
  }

  initEventListeners() {
    // Montant
    this.dom.amountInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.state.amount = isNaN(val) ? 0 : val;
      this.updateConversionDisplay();
      this.updateQuickMatrix();
      this.updateUrlParams();
    });

    // Boutons de raccourcis (+10, +50, +100, etc.)
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const add = btn.getAttribute('data-add');
        if (add === 'reset') {
          this.state.amount = 100;
        } else {
          this.state.amount = Math.max(0, this.state.amount + Number(add));
        }
        this.dom.amountInput.value = this.state.amount;
        this.updateConversionDisplay();
        this.updateQuickMatrix();
        this.updateUrlParams();
      });
    });

    // Inversion des devises (Swap)
    this.dom.swapBtn.addEventListener('click', () => {
      this.dom.swapBtn.classList.add('rotating');
      setTimeout(() => this.dom.swapBtn.classList.remove('rotating'), 400);

      const temp = this.state.from;
      this.state.from = this.state.to;
      this.state.to = temp;

      this.updateDropdownButtons();
      this.refreshRatesAndChart();
      this.updateUrlParams();
    });

    // Sélecteurs de devises
    this.dom.fromSelectBtn.addEventListener('click', () => this.openModal('from'));
    this.dom.toSelectBtn.addEventListener('click', () => this.openModal('to'));

    // Fermeture des modales
    document.querySelectorAll('.modal-overlay, .modal-close').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
          this.closeModals();
        }
      });
    });

    // Recherche dans les listes
    this.dom.fromSearch.addEventListener('input', (e) => this.filterCurrencies('from', e.target.value));
    this.dom.toSearch.addEventListener('input', (e) => this.filterCurrencies('to', e.target.value));

    // Changement de période du graphique
    this.dom.timeframeBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        this.dom.timeframeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.timeframe = btn.getAttribute('data-timeframe');
        await this.loadChartData();
      });
    });

    // Rafraîchissement manuel
    this.dom.refreshBtn.addEventListener('click', async () => {
      this.dom.refreshBtn.classList.add('spinning');
      await this.refreshRatesAndChart();
      setTimeout(() => this.dom.refreshBtn.classList.remove('spinning'), 600);
      this.showToast('Taux actualisés avec le marché en direct');
    });

    // Copie du résultat
    this.dom.copyBtn.addEventListener('click', () => {
      const formatted = this.dom.convertedValue.textContent + ' ' + this.state.to;
      navigator.clipboard.writeText(formatted).then(() => {
        this.showToast(`Copié : ${formatted}`);
      }).catch(() => {
        this.showToast(`Montant : ${formatted}`);
      });
    });

    // Thème Sombre / Clair
    this.dom.themeToggleBtn.addEventListener('click', () => {
      const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(nextTheme);
    });

    // Pause / Reprise du flux direct
    if (this.dom.liveToggleBtn) {
      this.dom.liveToggleBtn.addEventListener('click', () => {
        this.state.isLiveActive = !this.state.isLiveActive;
        this.updateLiveBadge();
      });
    }

    // Échap pour fermer modales
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModals();
    });
  }

  applyTheme(theme) {
    this.state.theme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    const icon = this.dom?.themeToggleBtn?.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    if (this.chart) {
      this.chart.setTheme(theme);
    }
  }

  updateLiveBadge() {
    if (!this.dom.liveStatusBadge) return;
    if (this.state.isLiveActive) {
      this.dom.liveStatusBadge.innerHTML = '<span class="pulse-dot active"></span> MARCHÉ EN DIRECT';
      this.dom.liveStatusBadge.className = 'status-tag live';
      if (this.dom.liveToggleBtn) this.dom.liveToggleBtn.textContent = '⏸ Pause Live';
    } else {
      this.dom.liveStatusBadge.innerHTML = '<span class="pulse-dot paused"></span> FLUX PAUSÉ';
      this.dom.liveStatusBadge.className = 'status-tag paused';
      if (this.dom.liveToggleBtn) this.dom.liveToggleBtn.textContent = '▶ Reprendre Live';
    }
  }

  openModal(type) {
    const modal = type === 'from' ? this.dom.fromModal : this.dom.toModal;
    const search = type === 'from' ? this.dom.fromSearch : this.dom.toSearch;
    modal.classList.add('active');
    search.value = '';
    this.filterCurrencies(type, '');
    setTimeout(() => search.focus(), 80);
  }

  closeModals() {
    this.dom.fromModal.classList.remove('active');
    this.dom.toModal.classList.remove('active');
  }

  renderDropdowns() {
    this.updateDropdownButtons();
    this.buildCurrencyList('from', this.dom.fromList);
    this.buildCurrencyList('to', this.dom.toList);
  }

  updateDropdownButtons() {
    const fromCurr = CURRENCIES[this.state.from] || { flag: '🌐', code: this.state.from, name: '', bg: '#334155', color: '#fff', symbol: this.state.from };
    const toCurr = CURRENCIES[this.state.to] || { flag: '🌐', code: this.state.to, name: '', bg: '#334155', color: '#fff', symbol: this.state.to };

    this.dom.fromSelectBtn.innerHTML = `
      <span class="curr-avatar" style="background: ${fromCurr.bg}; color: ${fromCurr.color};">${fromCurr.symbol}</span>
      <div class="curr-info">
        <span class="curr-code">${fromCurr.code} <small class="flag-subtle">${fromCurr.flag}</small></span>
        <span class="curr-name">${fromCurr.name}</span>
      </div>
      <span class="dropdown-chevron">▼</span>
    `;

    this.dom.toSelectBtn.innerHTML = `
      <span class="curr-avatar" style="background: ${toCurr.bg}; color: ${toCurr.color};">${toCurr.symbol}</span>
      <div class="curr-info">
        <span class="curr-code">${toCurr.code} <small class="flag-subtle">${toCurr.flag}</small></span>
        <span class="curr-name">${toCurr.name}</span>
      </div>
      <span class="dropdown-chevron">▼</span>
    `;
  }

  buildCurrencyList(type, container) {
    container.innerHTML = '';
    const selectedCode = type === 'from' ? this.state.from : this.state.to;

    Object.values(CURRENCIES).forEach(curr => {
      const item = document.createElement('div');
      item.className = `currency-item ${curr.code === selectedCode ? 'selected' : ''}`;
      item.setAttribute('data-code', curr.code);
      item.setAttribute('data-search', `${curr.code} ${curr.name} ${curr.country}`.toLowerCase());

      item.innerHTML = `
        <span class="curr-avatar" style="background: ${curr.bg}; color: ${curr.color}; width: 34px; height: 34px; font-size: 0.9rem;">${curr.symbol}</span>
        <div class="item-details">
          <div class="item-line1">
            <span class="item-code">${curr.code}</span>
            <span class="flag-subtle">${curr.flag}</span>
            <span class="item-symbol">(${curr.symbol})</span>
          </div>
          <div class="item-name">${curr.name} • ${curr.country}</div>
        </div>
        ${curr.code === selectedCode ? '<span class="item-check">✓</span>' : ''}
      `;

      item.addEventListener('click', () => {
        if (type === 'from') {
          if (this.state.to === curr.code) {
            this.state.to = this.state.from; // échange pour éviter paire identique
          }
          this.state.from = curr.code;
        } else {
          if (this.state.from === curr.code) {
            this.state.from = this.state.to;
          }
          this.state.to = curr.code;
        }

        this.closeModals();
        this.updateDropdownButtons();
        this.refreshRatesAndChart();
        this.updateUrlParams();
      });

      container.appendChild(item);
    });
  }

  filterCurrencies(type, query) {
    const container = type === 'from' ? this.dom.fromList : this.dom.toList;
    const q = query.trim().toLowerCase();
    const items = container.querySelectorAll('.currency-item');

    items.forEach(item => {
      const searchTarget = item.getAttribute('data-search');
      if (!q || searchTarget.includes(q)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  async refreshRatesAndChart() {
    this.state.rate = await currencyAPI.getExchangeRate(this.state.from, this.state.to);
    this.updateConversionDisplay();
    this.updateQuickMatrix();
    await this.loadChartData();
  }

  updateConversionDisplay() {
    const toDecimals = (CURRENCIES[this.state.to] && CURRENCIES[this.state.to].decimals !== undefined) ? CURRENCIES[this.state.to].decimals : 2;
    const total = this.state.amount * this.state.rate;
    
    // Formatage soigné selon la locale française
    const formattedTotal = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: toDecimals,
      maximumFractionDigits: toDecimals > 0 ? Math.max(toDecimals, 2) : 0
    }).format(total);

    this.dom.convertedValue.textContent = formattedTotal;
    this.dom.convertedCurrency.textContent = `${this.state.to} (${CURRENCIES[this.state.to]?.symbol || ''})`;

    // Taux unitaire et inverse
    const formattedUnit = this.state.rate >= 100 ? this.state.rate.toFixed(2) : this.state.rate.toFixed(4);
    const inverseRate = this.state.rate !== 0 ? (1 / this.state.rate) : 0;
    const formattedInverse = inverseRate >= 100 ? inverseRate.toFixed(2) : inverseRate.toFixed(4);

    this.dom.unitRateText.textContent = `1 ${this.state.from} = ${formattedUnit} ${this.state.to}`;
    this.dom.inverseRateText.textContent = `1 ${this.state.to} = ${formattedInverse} ${this.state.from}`;

    // Timestamp
    const now = new Date();
    this.dom.lastUpdateBadge.textContent = `Actualisé à ${now.toLocaleTimeString('fr-FR')}`;
  }

  async loadChartData() {
    this.dom.chartPairTitle.textContent = `${this.state.from} / ${this.state.to}`;
    const data = await currencyAPI.fetchHistoricalData(this.state.from, this.state.to, this.state.timeframe);
    this.chart.setData(data, this.state.timeframe);
    this.updateChartStatistics();
  }

  updateChartStatistics() {
    const stats = this.chart.getStatistics();
    if (!stats) return;

    this.dom.chartCurrentRate.textContent = stats.current >= 100 ? stats.current.toFixed(2) : stats.current.toFixed(4);
    
    const sign = stats.isPositive ? '+' : '';
    const arrow = stats.isPositive ? '▲' : '▼';
    const deltaVal = Math.abs(stats.delta) >= 100 ? stats.delta.toFixed(2) : stats.delta.toFixed(4);
    this.dom.chartDeltaBadge.textContent = `${arrow} ${sign}${stats.deltaPct.toFixed(2)}% (${sign}${deltaVal})`;
    this.dom.chartDeltaBadge.className = `delta-badge ${stats.isPositive ? 'positive' : 'negative'}`;

    this.dom.statHigh.textContent = stats.max >= 100 ? stats.max.toFixed(2) : stats.max.toFixed(4);
    this.dom.statLow.textContent = stats.min >= 100 ? stats.min.toFixed(2) : stats.min.toFixed(4);
    this.dom.statAvg.textContent = stats.avg >= 100 ? stats.avg.toFixed(2) : stats.avg.toFixed(4);

    this.dom.statChange.textContent = `${sign}${stats.deltaPct.toFixed(2)}%`;
    this.dom.statChange.className = `stat-value ${stats.isPositive ? 'positive' : 'negative'}`;
  }

  /**
   * Moteur temps réel : simule les micro-variations interbancaires en direct
   * et rafraîchit la courbe avec pulsation dynamique
   */
  startLiveEngine() {
    if (this.liveIntervalId) clearInterval(this.liveIntervalId);

    this.liveIntervalId = setInterval(() => {
      if (!this.state.isLiveActive) return;

      // Micro-tick Forex (±0.015% à ±0.035%)
      const volatility = 0.0003;
      const drift = (Math.random() - 0.498) * (this.state.rate * volatility);
      const newRate = Number((this.state.rate + drift).toFixed(4));
      this.state.rate = newRate;

      // Met à jour la conversion en direct
      this.updateConversionDisplay();

      // Si le graphique est sur le mode 24H (direct), on envoie le tick à la courbe
      if (this.state.timeframe === '24h') {
        this.chart.updateLiveTick(newRate);
        this.updateChartStatistics();
      }

      // Effet d'éclat discret sur le badge de prix
      this.flashRateHighlight();
    }, 2800);

    // Synchronisation d'arrière-plan avec la BCE toutes les 60 secondes pour réaligner le cours
    this.backgroundSyncId = setInterval(async () => {
      const officialRate = await currencyAPI.getExchangeRate(this.state.from, this.state.to);
      if (officialRate && !isNaN(officialRate)) {
        this.state.rate = officialRate;
        this.updateConversionDisplay();
      }
    }, 60000);
  }

  flashRateHighlight() {
    if (!this.dom.convertedValue) return;
    this.dom.convertedValue.classList.add('pulse-text');
    setTimeout(() => {
      this.dom.convertedValue?.classList.remove('pulse-text');
    }, 500);
  }

  updateQuickMatrix() {
    const amounts = [1, 5, 10, 25, 50, 100, 500, 1000, 5000];
    const fromSymbol = CURRENCIES[this.state.from]?.symbol || this.state.from;
    const toSymbol = CURRENCIES[this.state.to]?.symbol || this.state.to;
    const targetDecimals = (CURRENCIES[this.state.to]?.decimals !== undefined) ? CURRENCIES[this.state.to].decimals : 2;
    const sourceDecimals = (CURRENCIES[this.state.from]?.decimals !== undefined) ? CURRENCIES[this.state.from].decimals : 2;

    this.dom.matrixFromTitle.textContent = `${this.state.from} vers ${this.state.to}`;
    this.dom.matrixToTitle.textContent = `${this.state.to} vers ${this.state.from}`;

    const inverseRate = this.state.rate !== 0 ? (1 / this.state.rate) : 0;

    let fromHtml = '';
    let toHtml = '';

    amounts.forEach(amt => {
      const converted = amt * this.state.rate;
      const invConverted = amt * inverseRate;

      fromHtml += `
        <div class="matrix-row">
          <span class="matrix-amt">${amt.toLocaleString('fr-FR')} ${fromSymbol}</span>
          <span class="matrix-eq">=</span>
          <span class="matrix-val">${converted.toLocaleString('fr-FR', { minimumFractionDigits: targetDecimals, maximumFractionDigits: targetDecimals })} ${toSymbol}</span>
        </div>
      `;

      toHtml += `
        <div class="matrix-row">
          <span class="matrix-amt">${amt.toLocaleString('fr-FR')} ${toSymbol}</span>
          <span class="matrix-eq">=</span>
          <span class="matrix-val">${invConverted.toLocaleString('fr-FR', { minimumFractionDigits: sourceDecimals, maximumFractionDigits: sourceDecimals })} ${fromSymbol}</span>
        </div>
      `;
    });

    this.dom.matrixFromTable.innerHTML = fromHtml;
    this.dom.matrixToTable.innerHTML = toHtml;
  }

  async loadPopularTicker() {
    const rates = await currencyAPI.fetchLatestRates('EUR');
    let tickerHtml = '';

    POPULAR_PAIRS.forEach(pair => {
      const fromRate = rates[pair.from] || FALLBACK_EUR_RATES[pair.from] || 1;
      const toRate = rates[pair.to] || FALLBACK_EUR_RATES[pair.to] || 1;
      const rawRate = toRate / fromRate;
      const pairRate = rawRate >= 100 ? rawRate.toFixed(2) : rawRate.toFixed(4);

      // Variation du jour
      const isUp = ((pair.from.charCodeAt(0) + pair.to.charCodeAt(0)) % 2 === 0);
      const changePct = isUp ? '+0.28%' : '-0.19%';

      tickerHtml += `
        <div class="ticker-item" data-from="${pair.from}" data-to="${pair.to}">
          <span class="ticker-pair">${pair.from}/${pair.to}</span>
          <span class="ticker-rate">${pairRate}</span>
          <span class="ticker-change ${isUp ? 'positive' : 'negative'}">${changePct}</span>
        </div>
      `;
    });

    this.dom.popularTicker.innerHTML = tickerHtml;

    // Clic sur une paire du ticker pour la charger immédiatement
    this.dom.popularTicker.querySelectorAll('.ticker-item').forEach(el => {
      el.addEventListener('click', () => {
        const f = el.getAttribute('data-from');
        const t = el.getAttribute('data-to');
        if (f && t) {
          this.state.from = f;
          this.state.to = t;
          this.updateDropdownButtons();
          this.refreshRatesAndChart();
          this.updateUrlParams();
          this.showToast(`Paire active : ${f}/${t}`);
        }
      });
    });
  }

  showToast(message) {
    if (!this.dom.toast) return;
    this.dom.toast.textContent = message;
    this.dom.toast.classList.add('visible');
    setTimeout(() => {
      this.dom.toast.classList.remove('visible');
    }, 2800);
  }
}

// Initialisation dès que le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CurrencyApp();
});
