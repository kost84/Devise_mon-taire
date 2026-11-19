/**
 * Moteur de graphique interactif haute performance sur HTML5 Canvas
 * 100% Vanilla JS, zéro dépendance.
 * Supporte le rendu haute résolution (Retina/4K), courbes de Bézier fluides,
 * réticule interactif (crosshair), tooltip dynamique et mode LIVE avec pulsation en temps réel.
 */

class ForexChart {
  constructor(canvasElement, tooltipElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.tooltip = tooltipElement;
    this.data = [];
    this.timeframe = '24h';
    this.isLiveMode = true;
    this.pulseRadius = 4;
    this.pulseDirection = 1;
    this.animationFrameId = null;
    this.hoverIndex = -1;
    this.theme = 'dark';

    // Padding intérieur du graphique
    this.padding = { top: 30, right: 70, bottom: 40, left: 20 };

    this.initEvents();
    this.handleResize();
    this.startLiveAnimation();
  }

  setTheme(theme) {
    this.theme = theme;
    this.render();
  }

  initEvents() {
    // Redimensionnement automatique avec ResizeObserver sécurisé
    if (window.ResizeObserver && this.canvas.parentElement) {
      let resizeTimer = null;
      const ro = new ResizeObserver(() => {
        if (resizeTimer) cancelAnimationFrame(resizeTimer);
        resizeTimer = requestAnimationFrame(() => this.handleResize());
      });
      ro.observe(this.canvas.parentElement);
    }
    window.addEventListener('resize', () => {
      requestAnimationFrame(() => this.handleResize());
    });

    // Suivi souris
    this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handlePointerLeave());

    // Support tactile (mobile / tablette)
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.handlePointerMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY
        });
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.handlePointerMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY
        });
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => this.handlePointerLeave());
  }

  handleResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const newWidth = Math.floor(rect.width);
    const newHeight = Math.max(300, Math.floor(rect.height || 380));

    if (newWidth <= 0) return;
    if (this.width === newWidth && this.height === newHeight) return;

    this.width = newWidth;
    this.height = newHeight;

    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render();
  }

  setData(dataPoints, timeframe = '24h') {
    this.data = (dataPoints || []).filter(d => d && typeof d.rate === 'number' && !isNaN(d.rate) && isFinite(d.rate));
    this.timeframe = timeframe;
    this.isLiveMode = (timeframe === '24h');
    this.hoverIndex = -1;
    this.hideTooltip();
    this.render();
  }

  /**
   * Ajoute ou met à jour le dernier point pour le flux en direct
   */
  updateLiveTick(newRate) {
    if (!this.data || this.data.length === 0 || isNaN(newRate)) return;
    const now = new Date();
    const lastPoint = this.data[this.data.length - 1];

    if (Date.now() - lastPoint.timestamp < 10000) {
      lastPoint.rate = newRate;
      lastPoint.timestamp = Date.now();
      lastPoint.date = now.toISOString();
    } else {
      this.data.push({
        date: now.toISOString(),
        timestamp: Date.now(),
        rate: newRate,
        label: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      // Garde les 50 derniers points max en direct
      if (this.data.length > 55) {
        this.data.shift();
      }
    }
    this.render();
  }

  startLiveAnimation() {
    const animate = () => {
      if (this.isLiveMode && this.data.length > 0 && this.hoverIndex === -1) {
        this.pulseRadius += 0.12 * this.pulseDirection;
        if (this.pulseRadius > 9) this.pulseDirection = -1;
        if (this.pulseRadius < 4) this.pulseDirection = 1;
        this.render();
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  handlePointerMove(e) {
    if (!this.data || this.data.length < 2) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const plotWidth = this.width - this.padding.left - this.padding.right;
    const stepX = plotWidth / (this.data.length - 1);

    const rawIndex = (mouseX - this.padding.left) / stepX;
    const index = Math.max(0, Math.min(this.data.length - 1, Math.round(rawIndex)));

    this.hoverIndex = index;
    this.render();
    this.showTooltip(index, mouseX, mouseY);
  }

  handlePointerLeave() {
    this.hoverIndex = -1;
    this.hideTooltip();
    this.render();
  }

  showTooltip(index, mouseX, mouseY) {
    if (!this.tooltip || !this.data[index]) return;
    const point = this.data[index];
    const firstPoint = this.data[0];
    const diff = point.rate - firstPoint.rate;
    const diffPct = firstPoint.rate !== 0 ? (diff / firstPoint.rate) * 100 : 0;
    const isPositive = diff >= 0;

    const dateOptions = {
      day: 'numeric',
      month: 'short'
    };
    if (this.timeframe === '5y') {
      dateOptions.year = 'numeric';
    }
    if (this.timeframe === '24h') {
      dateOptions.hour = '2-digit';
      dateOptions.minute = '2-digit';
      dateOptions.second = '2-digit';
    }

    const dateFormatted = new Date(point.timestamp).toLocaleString('fr-FR', dateOptions);

    this.tooltip.innerHTML = `
      <div class="tooltip-date">${dateFormatted}</div>
      <div class="tooltip-rate">${point.rate >= 100 ? point.rate.toFixed(2) : point.rate.toFixed(4)}</div>
      <div class="tooltip-change ${isPositive ? 'positive' : 'negative'}">
        ${isPositive ? '▲ +' : '▼ '}${diffPct.toFixed(2)}% (${isPositive ? '+' : ''}${point.rate >= 100 ? diff.toFixed(2) : diff.toFixed(4)})
      </div>
    `;

    this.tooltip.style.display = 'block';

    // Positionnement intelligent sans déborder du canvas
    const tooltipWidth = this.tooltip.offsetWidth || 140;
    const tooltipHeight = this.tooltip.offsetHeight || 75;

    let posX = mouseX + 15;
    let posY = mouseY - tooltipHeight - 15;

    if (posX + tooltipWidth > this.width - 10) {
      posX = mouseX - tooltipWidth - 15;
    }
    if (posY < 10) {
      posY = mouseY + 20;
    }

    this.tooltip.style.left = `${posX}px`;
    this.tooltip.style.top = `${posY}px`;
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (!this.data || this.data.length < 2) {
      this.drawEmptyState();
      return;
    }

    const isDark = this.theme === 'dark';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

    // Calcul min et max avec marge
    const rates = this.data.map(d => d.rate).filter(r => !isNaN(r) && isFinite(r));
    let minRate = Math.min(...rates);
    let maxRate = Math.max(...rates);

    // Éviter min === max
    if (minRate === maxRate) {
      minRate *= 0.999;
      maxRate *= 1.001;
    }

    const range = maxRate - minRate;
    const paddedMin = minRate - range * 0.08;
    const paddedMax = maxRate + range * 0.08;
    const paddedRange = paddedMax - paddedMin;

    const plotWidth = this.width - this.padding.left - this.padding.right;
    const plotHeight = this.height - this.padding.top - this.padding.bottom;

    // Coordonnées de projection
    const getX = (i) => this.padding.left + (i / (this.data.length - 1)) * plotWidth;
    const getY = (val) => this.padding.top + plotHeight - ((val - paddedMin) / paddedRange) * plotHeight;

    // Tendance globale (vert si gain, rouge si baisse)
    const startRate = this.data[0].rate;
    const endRate = this.data[this.data.length - 1].rate;
    const isUp = endRate >= startRate;

    const strokeColor = isUp ? '#10B981' : '#F43F5E';
    const glowColor = isUp ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)';

    // 1. Grille horizontale & labels Y
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const val = paddedMin + (paddedRange * i) / yTicks;
      const y = getY(val);

      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(this.padding.left, y);
      ctx.lineTo(this.width - this.padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label prix à droite
      const formattedVal = val >= 100 ? val.toFixed(2) : val.toFixed(4);
      ctx.fillText(formattedVal, this.width - this.padding.right + 8, y);
    }

    // 2. Grille verticale & labels X
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xStepCount = Math.min(5, this.data.length - 1);
    for (let i = 0; i <= xStepCount; i++) {
      const idx = Math.round((i / xStepCount) * (this.data.length - 1));
      const pt = this.data[idx];
      const x = getX(idx);

      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(x, this.padding.top);
      ctx.lineTo(x, this.height - this.padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillText(pt.label || '', x, this.height - this.padding.bottom + 8);
    }

    // 3. Remplissage dégradé sous la courbe
    const gradient = ctx.createLinearGradient(0, this.padding.top, 0, this.height - this.padding.bottom);
    if (isUp) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.32)');
      gradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.08)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(244, 63, 94, 0.32)');
      gradient.addColorStop(0.7, 'rgba(244, 63, 94, 0.08)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
    }

    ctx.beginPath();
    ctx.moveTo(getX(0), this.height - this.padding.bottom);
    ctx.lineTo(getX(0), getY(this.data[0].rate));

    for (let i = 0; i < this.data.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(this.data[i].rate);
      const x1 = getX(i + 1);
      const y1 = getY(this.data[i + 1].rate);
      const cpX = (x0 + x1) / 2;
      ctx.bezierCurveTo(cpX, y0, cpX, y1, x1, y1);
    }

    ctx.lineTo(getX(this.data.length - 1), this.height - this.padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 4. Ligne de courbe avec lueur (glow)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(this.data[0].rate));

    for (let i = 0; i < this.data.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(this.data[i].rate);
      const x1 = getX(i + 1);
      const y1 = getY(this.data[i + 1].rate);
      const cpX = (x0 + x1) / 2;
      ctx.bezierCurveTo(cpX, y0, cpX, y1, x1, y1);
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    // 5. Point de fin ou animation LIVE
    const lastIdx = this.data.length - 1;
    const lastX = getX(lastIdx);
    const lastY = getY(this.data[lastIdx].rate);

    if (this.isLiveMode && this.hoverIndex === -1) {
      // Onde de pulsation
      ctx.beginPath();
      ctx.arc(lastX, lastY, this.pulseRadius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';
      ctx.fill();

      // Point central
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 6. Réticule et point survolé
    if (this.hoverIndex >= 0 && this.hoverIndex < this.data.length) {
      const hoverPt = this.data[this.hoverIndex];
      const hX = getX(this.hoverIndex);
      const hY = getY(hoverPt.rate);

      // Ligne verticale de mire
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(hX, this.padding.top);
      ctx.lineTo(hX, this.height - this.padding.bottom);
      ctx.stroke();

      // Ligne horizontale de mire
      ctx.beginPath();
      ctx.moveTo(this.padding.left, hY);
      ctx.lineTo(this.width - this.padding.right, hY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point actif agrandi
      ctx.beginPath();
      ctx.arc(hX, hY, 8, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(hX, hY, 5, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  drawEmptyState() {
    this.ctx.font = '14px sans-serif';
    this.ctx.fillStyle = '#64748B';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Chargement des données du marché...', this.width / 2, this.height / 2);
  }

  getStatistics() {
    if (!this.data || this.data.length === 0) return null;
    const rates = this.data.map(d => d.rate).filter(r => !isNaN(r) && isFinite(r));
    if (rates.length === 0) return null;

    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const sum = rates.reduce((a, b) => a + b, 0);
    const avg = sum / rates.length;
    const start = this.data[0].rate;
    const current = this.data[this.data.length - 1].rate;
    const delta = current - start;
    const deltaPct = start !== 0 ? (delta / start) * 100 : 0;

    return {
      min,
      max,
      avg,
      start,
      current,
      delta,
      deltaPct,
      isPositive: delta >= 0
    };
  }
}
