(() => {
  "use strict";

  // Plain canvas keeps the direct-open frontend free of an additional chart dependency.
  class MigrationHeatmap {
    static isHeatmap(type) {
      return type === "heatmap-h" || type === "heatmap-v";
    }

    static kingdomLabel(id) {
      return `K${String(id).padStart(4, "0")}`;
    }

    static orderedCharts(charts, sort = "kingdom-asc") {
      const total = (chart) => chart.counts.reduce((sum, count) => sum + count, 0);
      const byTotal = sort === "total-asc" || sort === "total-desc";
      const byAverage = sort === "average-asc" || sort === "average-desc";
      const direction = sort.endsWith("-desc") ? -1 : 1;
      return [...charts].sort((a, b) => {
        if (byAverage && Number.isFinite(a.average) !== Number.isFinite(b.average)) return Number.isFinite(a.average) ? -1 : 1;
        const difference = byAverage ? (a.average ?? 0) - (b.average ?? 0)
          : byTotal ? total(a) - total(b) : a.kingdomId - b.kingdomId;
        return difference * direction || a.kingdomId - b.kingdomId;
      });
    }

    static pages(snapshot, type, kingdomsPerPage = 45, bandsPerPage = 70, sort = "kingdom-asc") {
      const charts = this.orderedCharts(snapshot.charts, sort);
      const pages = [];
      for (let row = 0; row < charts.length; row += kingdomsPerPage) {
        for (let band = 0; band < snapshot.labels.length; band += bandsPerPage) {
          pages.push({
            labels: snapshot.labels.slice(band, band + bandsPerPage),
            powers: snapshot.powers?.slice(band, band + bandsPerPage + 1),
            charts: charts.slice(row, row + kingdomsPerPage).map((chart) => ({
              ...chart,
              // Keep the complete-range total, even if the power axis spans pages.
              total: chart.counts.reduce((sum, count) => sum + count, 0),
              incomplete: chart.available ? chart.available.some((value) => !value) : false,
              counts: chart.counts.slice(band, band + bandsPerPage),
              available: chart.available?.slice(band, band + bandsPerPage),
            })),
          });
        }
      }
      return pages;
    }

    static maxCount(snapshot) {
      return snapshot.charts.reduce((max, chart) =>
        chart.counts.reduce((current, count) => Math.max(current, count), max), 0);
    }

    constructor(canvas, snapshot, options) {
      this.canvas = canvas;
      this.snapshot = snapshot;
      this.options = options;
      this.vertical = options.type === "heatmap-v";
      this.width = options.width;
      this.rows = this.vertical ? snapshot.labels.length : snapshot.charts.length;
      this.columns = this.vertical ? snapshot.charts.length : snapshot.labels.length;
      this.top = (this.vertical ? 174 : 142) - (options.interactive ? 60 : 0);
      this.left = this.vertical ? 132 : 76;
      this.right = this.vertical ? 24 : 160;
      this.cellHeight = this.vertical ? 20 : 34;
      this.gridWidth = this.width - this.left - this.right;
      this.cellWidth = this.gridWidth / this.columns;
      this.height = this.top + this.rows * this.cellHeight + 76;
      this.maxCount = Math.max(1, options.maxCount);
      this.maxTotal = Math.max(1, options.maxTotal);
      this.primary = options.primary;
      this.palette = options.palette;
      this.scale = options.scale || 1;
      canvas.width = Math.round(this.width * this.scale);
      canvas.height = Math.round(this.height * this.scale);
      canvas.style.width = `${this.width}px`;
      canvas.style.height = `${this.height}px`;
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", `${options.title}. ${options.description}`);
      this.ctx = canvas.getContext("2d");
      this.ctx.scale(this.scale, this.scale);
      this.draw();
      this.addAccessibleTable();
      if (options.interactive) this.bindTooltip();
    }

    color(count, available = true) {
      if (!available) return "#e2e5e9";
      if (count === 0) return "#ffffff";
      const ratio = 0.14 + 0.86 * Math.min(count / this.maxCount, 1);
      const rgb = this.primary.map((value) => Math.round(255 + (value - 255) * ratio));
      return `rgb(${rgb.join(",")})`;
    }

    text(value, x, y, { size = 12, weight = 400, align = "left", color = this.palette.strong, family = "system-ui, sans-serif" } = {}) {
      this.ctx.font = `${weight} ${size}px ${family}`;
      this.ctx.fillStyle = color;
      this.ctx.textAlign = align;
      this.ctx.fillText(value, x, y);
    }

    hatch(x, y, width, height) {
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
      ctx.strokeStyle = "#9ba3ad";
      ctx.lineWidth = 1;
      for (let offset = -height; offset < width; offset += 6) {
        ctx.beginPath();
        ctx.moveTo(x + offset, y + height);
        ctx.lineTo(x + offset + height, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    cell(row, column) {
      const chartIndex = this.vertical ? column : row;
      const bandIndex = this.vertical ? this.snapshot.labels.length - 1 - row : column;
      const chart = this.snapshot.charts[chartIndex];
      return {
        kingdomId: chart.kingdomId,
        label: this.snapshot.labels[bandIndex],
        count: chart.counts[bandIndex],
        average: chart.average,
        available: chart.available ? chart.available[bandIndex] : true,
      };
    }

    draw() {
      const ctx = this.ctx;
      const { labels, charts } = this.snapshot;
      ctx.fillStyle = this.palette.background;
      ctx.fillRect(0, 0, this.width, this.height);
      if (!this.options.interactive) {
        ctx.fillStyle = `rgb(${this.primary.join(",")})`;
        ctx.fillRect(24, 22, 4, 35);
        this.text(this.options.title, 40, 40, { size: 21, weight: 700 });
        this.text(this.options.description, 40, 62, { size: 11, color: this.palette.text });
      }
      this.drawLegend();

      for (let row = 0; row < this.rows; row += 1) {
        for (let column = 0; column < this.columns; column += 1) {
          const cell = this.cell(row, column);
          const x = this.left + column * this.cellWidth;
          const y = this.top + row * this.cellHeight;
          ctx.fillStyle = this.color(cell.count, cell.available);
          ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
          if (!cell.available) this.hatch(x, y, this.cellWidth, this.cellHeight);
        }
      }
      ctx.strokeStyle = this.palette.border;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let i = 0; i <= this.columns; i += 1) {
        const x = this.left + i * this.cellWidth;
        ctx.moveTo(x, this.top);
        ctx.lineTo(x, this.top + this.rows * this.cellHeight);
      }
      for (let i = 0; i <= this.rows; i += 1) {
        const y = this.top + i * this.cellHeight;
        ctx.moveTo(this.left, y);
        ctx.lineTo(this.left + this.gridWidth, y);
      }
      ctx.stroke();
      this.drawAverageMarkers();

      if (this.vertical) {
        charts.forEach((chart, index) => {
          ctx.save();
          ctx.translate(this.left + (index + 0.5) * this.cellWidth, this.top - 10);
          ctx.rotate(-Math.PI / 3);
          this.text(MigrationHeatmap.kingdomLabel(chart.kingdomId), 0, 0, { size: 11, family: "ui-monospace, SFMono-Regular, Menlo, monospace" });
          ctx.restore();
        });
        // Every band remains addressable; visible ticks are spaced to avoid overlapping.
        const step = Math.max(1, Math.ceil(labels.length / 18));
        for (let row = 0; row < this.rows; row += 1) {
          if (row % step === 0 || row === this.rows - 1) {
            this.text(labels[labels.length - 1 - row], this.left - 8,
              this.top + row * this.cellHeight + 14, { align: "right", size: 10 });
          }
        }
      } else {
        this.text(this.options.totalLabel, this.width - this.right + 12, this.top - 30,
          { size: 12, weight: 700 });
        this.text(this.options.summaryLabel, this.width - this.right + 12, this.top - 12,
          { size: 9.5 });
        charts.forEach((chart, row) => {
          const y = this.top + row * this.cellHeight;
          this.text(MigrationHeatmap.kingdomLabel(chart.kingdomId), 24, y + 21,
            { align: "left", weight: 600, family: "ui-monospace, SFMono-Regular, Menlo, monospace" });
          const trackX = this.width - this.right + 12;
          const trackWidth = this.right - 24;
          const averageText = Number.isFinite(chart.average) ? `${(chart.average / 1000).toFixed(2)} B` : "—";
          this.text(`${chart.total}${chart.incomplete ? "*" : ""} / ${averageText}`, trackX, y + 13,
            { size: 11, weight: 600 });
          ctx.fillStyle = this.palette.border;
          ctx.fillRect(trackX, y + 21, trackWidth, 8);
          ctx.fillStyle = `rgb(${this.primary.join(",")})`;
          ctx.fillRect(trackX, y + 21, trackWidth * chart.total / this.maxTotal, 8);
          if (Number.isFinite(chart.average)) {
            const ratio = (chart.average - this.options.fromPower) / (this.options.toPower - this.options.fromPower);
            this.drawAverageBar(trackX + Math.max(0, Math.min(1, ratio)) * trackWidth, y + 25, false, 14);
          }
        });
        const step = Math.max(1, Math.ceil(64 / this.cellWidth));
        labels.forEach((label, index) => {
          if (index % step !== 0 && index !== labels.length - 1) return;
          if (index !== labels.length - 1 && labels.length - 1 - index < step * 0.75) return;
          const x = this.left + (index + 0.5) * this.cellWidth;
          const start = label.split(" - ")[0];
          this.text(start, x, this.top - 12, { size: 10, align: "center" });
        });
      }
      this.text(this.options.averageNote, 24, this.height - 38, { size: 10, color: this.palette.text });
      this.text(this.options.footnote, 24, this.height - 20, { size: 10, color: this.palette.text });
    }

    drawAverageBar(x, y, horizontal = false, length = 16, thickness = 3) {
      const ctx = this.ctx;
      const width = horizontal ? length : thickness;
      const height = horizontal ? thickness : length;
      const outline = thickness / 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - width / 2 - outline, y - height / 2 - outline, width + outline * 2, height + outline * 2);
      ctx.fillStyle = this.palette.strong;
      ctx.fillRect(x - width / 2, y - height / 2, width, height);
    }

    drawAverageMarkers() {
      const powers = this.options.pagePowers;
      if (!powers || powers.length < 2) return;
      const from = powers[0];
      const to = powers[powers.length - 1];
      this.snapshot.charts.forEach((chart, index) => {
        if (!Number.isFinite(chart.average) || chart.average < from || chart.average > to) return;
        const ratio = (chart.average - from) / (to - from);
        const x = this.vertical ? this.left + (index + 0.5) * this.cellWidth : this.left + ratio * this.gridWidth;
        const y = this.vertical ? this.top + (1 - ratio) * this.rows * this.cellHeight
          : this.top + (index + 0.5) * this.cellHeight;
        if (this.vertical) {
          this.drawAverageBar(x, y, true, Math.max(6, Math.min(18, this.cellWidth * 0.7)));
        } else {
          // Keep the full-height marker and its outline inside this kingdom's row.
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.rect(this.left, this.top + index * this.cellHeight, this.gridWidth, this.cellHeight);
          this.ctx.clip();
          this.drawAverageBar(x, y, false, this.cellHeight, 1);
          this.ctx.restore();
        }
      });
    }

    drawLegend() {
      const ctx = this.ctx;
      const x = 96;
      const y = this.options.interactive ? 24 : 84;
      const width = Math.min(300, this.width / 3);
      this.text(this.options.countLabel, 24, y + 12, { size: 12, weight: 600 });
      for (let i = 0; i < width; i += 1) {
        ctx.fillStyle = this.options.maxCount === 0 ? "#ffffff" : this.color(this.maxCount * i / width);
        ctx.fillRect(x + i, y, 1, 12);
      }
      this.text("0", x, y + 27, { size: 10 });
      this.text(String(this.options.maxCount), x + width, y + 27, { size: 10, align: "right" });
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + width + 24, y, 18, 12);
      ctx.strokeStyle = this.palette.border;
      ctx.strokeRect(x + width + 24, y, 18, 12);
      this.text(this.options.zeroLabel, x + width + 48, y + 11, { size: 11 });
      ctx.fillStyle = this.color(0, false);
      ctx.fillRect(x + width + 122, y, 18, 12);
      this.hatch(x + width + 122, y, 18, 12);
      this.text(this.options.unavailableLabel, x + width + 146, y + 11, { size: 11 });
      this.drawAverageBar(x + width + 260, y + 6, this.vertical, 14);
      this.text(this.options.averageLabel, x + width + 272, y + 11, { size: 11 });
    }

    addAccessibleTable() {
      const table = document.createElement("table");
      const caption = document.createElement("caption");
      caption.textContent = this.options.title;
      table.appendChild(caption);
      const head = document.createElement("tr");
      for (const label of [this.options.kingdomLabel, ...this.snapshot.labels]) {
        const th = document.createElement("th");
        th.textContent = label;
        th.scope = "col";
        head.appendChild(th);
      }
      table.appendChild(head);
      for (const chart of this.snapshot.charts) {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        th.scope = "row";
        th.textContent = MigrationHeatmap.kingdomLabel(chart.kingdomId);
        th.setAttribute("aria-label", `${MigrationHeatmap.kingdomLabel(chart.kingdomId)}, ${this.options.averageLabel}: ${Number.isFinite(chart.average)
          ? `${(chart.average / 1000).toFixed(2)} B` : this.options.averageUnavailable}`);
        tr.appendChild(th);
        chart.counts.forEach((count, index) => {
          const td = document.createElement("td");
          td.textContent = !chart.available || chart.available[index]
            ? String(count) : this.options.unavailableLabel;
          tr.appendChild(td);
        });
        table.appendChild(tr);
      }
      this.canvas.appendChild(table);
    }

    bindTooltip() {
      this.tooltip = document.createElement("div");
      this.tooltip.className = "rank-heatmap-tooltip";
      this.tooltip.hidden = true;
      this.tooltip.setAttribute("role", "tooltip");
      document.body.appendChild(this.tooltip);
      this.onMove = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * this.width / rect.width;
        const y = (event.clientY - rect.top) * this.height / rect.height;
        const row = Math.floor((y - this.top) / this.cellHeight);
        const column = Math.floor((x - this.left) / this.cellWidth);
        if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
          this.tooltip.hidden = true;
          return;
        }
        const cell = this.cell(row, column);
        this.tooltip.textContent = `${MigrationHeatmap.kingdomLabel(cell.kingdomId)}\n${cell.label}\n${cell.available
          ? `${this.options.countLabel}: ${cell.count}` : this.options.unavailableLabel}\n${this.options.averageLabel}: ${Number.isFinite(cell.average)
          ? `${(cell.average / 1000).toFixed(2)} B` : this.options.averageUnavailable}`;
        this.tooltip.hidden = false;
        this.tooltip.style.left = `${Math.max(8, Math.min(event.clientX + 12, window.innerWidth - this.tooltip.offsetWidth - 8))}px`;
        this.tooltip.style.top = `${Math.max(8, Math.min(event.clientY + 12, window.innerHeight - this.tooltip.offsetHeight - 8))}px`;
      };
      this.onLeave = () => { this.tooltip.hidden = true; };
      this.canvas.addEventListener("pointermove", this.onMove);
      this.canvas.addEventListener("pointerleave", this.onLeave);
    }

    destroy() {
      if (this.onMove) this.canvas.removeEventListener("pointermove", this.onMove);
      if (this.onLeave) this.canvas.removeEventListener("pointerleave", this.onLeave);
      this.tooltip?.remove();
    }
  }

  window.MigrationHeatmap = MigrationHeatmap;
})();
