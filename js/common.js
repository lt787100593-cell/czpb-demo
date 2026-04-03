/* =========================================
   学生成长画像平台 - 通用JS工具
   ========================================= */

// ---- Tab切换 ----
function initTabs(containerSelector) {
  const containers = document.querySelectorAll(containerSelector || '.tabs-container');
  containers.forEach(container => {
    const tabs = container.querySelectorAll('.tab-item');
    const panels = container.querySelectorAll('.tab-panel');
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        if (panels[i]) panels[i].classList.add('active');
      });
    });
    if (tabs[0]) tabs[0].classList.add('active');
    if (panels[0]) panels[0].classList.add('active');
  });
}

// ---- 弹窗 ----
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('open');
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('open');
}

// 点击遮罩关闭
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) {
    e.target.classList.remove('open');
  }
});

// ---- 抽屉 ----
function openDrawer(id) {
  document.getElementById(id)?.classList.add('open');
  document.getElementById('drawer-overlay')?.classList.add('open');
}

function closeDrawer(id) {
  document.getElementById(id)?.classList.remove('open');
  document.getElementById('drawer-overlay')?.classList.remove('open');
}

// ---- SVG 雷达图 ----
function drawRadar(canvasId, labels, values, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  // 读取 viewBox 宽高，fallback 到 width 属性，再 fallback 到 220
  const vb = canvas.viewBox && canvas.viewBox.baseVal;
  const size = (vb && vb.width > 0) ? vb.width : (parseFloat(canvas.getAttribute('width')) || 220);
  // 留出充裕的标签边距：标签区占 22% 四周
  const margin = size * 0.22;
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - margin;
  const n = labels.length;
  const angles = labels.map((_, i) => (i * 2 * Math.PI / n) - Math.PI / 2);

  const polygon = (vals, scale) =>
    vals.map((v, i) => {
      const x = cx + scale * r * Math.cos(angles[i]) * v / 100;
      const y = cy + scale * r * Math.sin(angles[i]) * v / 100;
      return `${x},${y}`;
    }).join(' ');

  // 背景网格
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPolygons = gridLevels.map(level => {
    const pts = angles.map(a => `${cx + level * r * Math.cos(a)},${cy + level * r * Math.sin(a)}`);
    return `<polygon points="${pts.join(' ')}" fill="none" stroke="#e5e7eb" stroke-width="1"/>`;
  }).join('');

  // 轴线
  const axes = angles.map(a =>
    `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="#e5e7eb" stroke-width="1"/>`
  ).join('');

  // 数据多边形
  const dataPolygon = `<polygon points="${polygon(values, 1)}" fill="${color}30" stroke="${color}" stroke-width="2"/>`;

  // 数据点
  const dots = values.map((v, i) => {
    const x = cx + r * Math.cos(angles[i]) * v / 100;
    const y = cy + r * Math.sin(angles[i]) * v / 100;
    return `<circle cx="${x}" cy="${y}" r="4" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;
  }).join('');

  // 标签：标签距轴端留出固定偏移
  const lblOffset = 18;
  const lbls = labels.map((lb, i) => {
    const lx = cx + (r + lblOffset) * Math.cos(angles[i]);
    const ly = cy + (r + lblOffset) * Math.sin(angles[i]);
    const cosA = Math.cos(angles[i]);
    const sinA = Math.sin(angles[i]);
    // text-anchor：左侧 end，右侧 start，顶/底 middle
    const anchor = cosA > 0.15 ? 'start' : cosA < -0.15 ? 'end' : 'middle';
    // 垂直偏移：上方往上，下方往下，水平方向居中
    const baselineShift = sinA < -0.15 ? -4 : sinA > 0.15 ? 4 : 0;
    const labelY = ly + baselineShift;
    const valueY = labelY + 14;
    return `<text x="${lx}" y="${labelY}" text-anchor="${anchor}" dominant-baseline="auto" font-size="11" fill="#6b7280" font-family="inherit">${lb}</text>
            <text x="${lx}" y="${valueY}" text-anchor="${anchor}" dominant-baseline="auto" font-size="10" fill="${color}" font-weight="600" font-family="inherit">${values[i]}</text>`;
  }).join('');

  canvas.innerHTML = `${gridPolygons}${axes}${dataPolygon}${dots}${lbls}`;
}

// ---- 简单柱状图 ----
function drawBarChart(containerId, data, maxVal, color) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = data.map(item => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#6b7280;margin-bottom:4px;">
        <span>${item.label}</span><span style="font-weight:600;color:#374151;">${item.value}</span>
      </div>
      <div style="height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${(item.value / (maxVal || 100)) * 100}%;background:${color || '#2ecc87'};border-radius:4px;transition:width 0.6s ease;"></div>
      </div>
    </div>
  `).join('');
}

// ---- 简单折线图SVG ----
function drawLineChart(svgId, datasets, labels) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const W = svg.viewBox?.baseVal?.width || 400;
  const H = svg.viewBox?.baseVal?.height || 160;
  const pad = { top: 16, right: 16, bottom: 28, left: 40 };
  const gW = W - pad.left - pad.right;
  const gH = H - pad.top - pad.bottom;

  const colors = ['#2ecc87', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const allVals = datasets.flatMap(d => d.values);
  const maxV = Math.max(...allVals) * 1.15;
  const minV = 0;

  const xPos = i => pad.left + (gW / (labels.length - 1)) * i;
  const yPos = v => pad.top + gH - ((v - minV) / (maxV - minV)) * gH;

  // 网格
  const gridLines = [0, 25, 50, 75, 100].filter(v => v <= maxV * 1.1).map(v => {
    const y = yPos(v * maxV / 100);
    return `<line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}" stroke="#f3f4f6" stroke-width="1"/>
            <text x="${pad.left - 4}" y="${y + 4}" text-anchor="end" font-size="10" fill="#9ca3af">${Math.round(v * maxV / 100)}</text>`;
  }).join('');

  // X轴标签
  const xLabels = labels.map((lb, i) =>
    `<text x="${xPos(i)}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#9ca3af">${lb}</text>`
  ).join('');

  // 数据线
  const lines = datasets.map((d, di) => {
    const pts = d.values.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ');
    const area = `M${xPos(0)},${yPos(d.values[0])} ` +
      d.values.map((v, i) => `L${xPos(i)},${yPos(v)}`).slice(1).join(' ') +
      ` L${xPos(d.values.length - 1)},${pad.top + gH} L${xPos(0)},${pad.top + gH} Z`;
    const dots = d.values.map((v, i) =>
      `<circle cx="${xPos(i)}" cy="${yPos(v)}" r="3.5" fill="${colors[di]}" stroke="#fff" stroke-width="1.5"/>`
    ).join('');
    return `<path d="${area}" fill="${colors[di]}" fill-opacity="0.08"/>
            <polyline points="${pts}" fill="none" stroke="${colors[di]}" stroke-width="2" stroke-linejoin="round"/>
            ${dots}`;
  }).join('');

  svg.innerHTML = `${gridLines}${xLabels}${lines}`;
}

// ---- 可交互折线图（div容器版，支持hover tooltip） ----
function drawInteractiveLineChart(containerId, datasets, labels, options) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const opts = Object.assign({ height: 200, colors: ['#3b82f6','#f59e0b','#8b5cf6','#2ecc87','#ef4444'] }, options || {});

  function render() {
    const W = container.clientWidth || 500;
    const H = opts.height;
    const pad = { top: 18, right: 18, bottom: 36, left: 42 };
    const gW = W - pad.left - pad.right;
    const gH = H - pad.top - pad.bottom;
    const n = labels.length;
    const allVals = datasets.flatMap(d => d.values);
    const rawMin = Math.min(...allVals), rawMax = Math.max(...allVals);
    const span = rawMax - rawMin || 1;
    const minV = Math.max(0, rawMin - span * 0.15);
    const maxV = rawMax + span * 0.15;

    const xPos = i => pad.left + (n <= 1 ? gW / 2 : (gW / (n - 1)) * i);
    const yPos = v => pad.top + gH - ((v - minV) / (maxV - minV)) * gH;

    // Y轴刻度
    const yTicks = 4;
    let gridSvg = '';
    for (let t = 0; t <= yTicks; t++) {
      const v = minV + (maxV - minV) * (t / yTicks);
      const y = yPos(v);
      gridSvg += `<line x1="${pad.left}" y1="${y.toFixed(1)}" x2="${W - pad.right}" y2="${y.toFixed(1)}" stroke="#f0f0f0" stroke-width="1"/>`;
      gridSvg += `<text x="${pad.left - 5}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#9ca3af">${Math.round(v)}</text>`;
    }

    // X轴标签
    let xLabelsSvg = '';
    labels.forEach((lb, i) => {
      const x = xPos(i);
      xLabelsSvg += `<text x="${x.toFixed(1)}" y="${(H - 8).toFixed(1)}" text-anchor="middle" font-size="11" fill="#6b7280">${lb}</text>`;
    });

    // 轴线
    const axesSvg = `
      <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + gH}" stroke="#e5e7eb" stroke-width="1"/>
      <line x1="${pad.left}" y1="${pad.top + gH}" x2="${W - pad.right}" y2="${pad.top + gH}" stroke="#e5e7eb" stroke-width="1"/>`;

    // 数据线
    let linesSvg = '';
    datasets.forEach((d, di) => {
      const col = d.color || opts.colors[di % opts.colors.length];
      // 面积
      if (n > 1) {
        const areaPath = `M${xPos(0).toFixed(1)},${yPos(d.values[0]).toFixed(1)}` +
          d.values.slice(1).map((v, i) => ` L${xPos(i+1).toFixed(1)},${yPos(v).toFixed(1)}`).join('') +
          ` L${xPos(n-1).toFixed(1)},${(pad.top + gH).toFixed(1)} L${xPos(0).toFixed(1)},${(pad.top + gH).toFixed(1)} Z`;
        linesSvg += `<path d="${areaPath}" fill="${col}" fill-opacity="0.06"/>`;
      }
      // 折线
      const pts = d.values.map((v, i) => `${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`).join(' ');
      linesSvg += `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
      // 数据点（可hover）
      d.values.forEach((v, i) => {
        const cx = xPos(i), cy = yPos(v);
        linesSvg += `<circle class="il-dot" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="${col}" stroke="#fff" stroke-width="2" style="cursor:pointer;"
          data-label="${labels[i]}" data-name="${d.name || ('系列'+(di+1))}" data-val="${v}" data-color="${col}"
          onmouseenter="ilShowTip(event,this)" onmouseleave="ilHideTip()"/>`;
      });
    });

    // 垂直悬停线
    const hoverLineSvg = `<line id="${containerId}-vline" x1="-999" y1="${pad.top}" x2="-999" y2="${pad.top + gH}" stroke="#d1d5db" stroke-width="1" stroke-dasharray="4,3" pointer-events="none"/>`;

    container.innerHTML = `
      <svg id="${containerId}-svg" width="${W}" height="${H}" style="display:block;overflow:visible;width:100%;">
        ${gridSvg}${axesSvg}${hoverLineSvg}${xLabelsSvg}${linesSvg}
      </svg>
      <div id="${containerId}-tip" style="display:none;position:fixed;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;box-shadow:0 4px 16px rgba(0,0,0,0.12);font-size:12px;pointer-events:none;z-index:9999;min-width:120px;"></div>`;
  }

  render();
  // 响应式
  if (!window._ilResizeHandlers) window._ilResizeHandlers = [];
  window._ilResizeHandlers.push({ id: containerId, fn: render });
  if (!window._ilResizeListenerAdded) {
    window._ilResizeListenerAdded = true;
    window.addEventListener('resize', () => {
      clearTimeout(window._ilResizeTimer);
      window._ilResizeTimer = setTimeout(() => {
        (window._ilResizeHandlers || []).forEach(h => {
          const el = document.getElementById(h.id);
          if (el) h.fn();
        });
      }, 150);
    });
  }
}

function ilShowTip(e, dot) {
  const tipId = dot.closest('svg').parentElement.id + '-tip';
  const tip = document.getElementById(tipId);
  if (!tip) return;
  const lbl = dot.getAttribute('data-label');
  const name = dot.getAttribute('data-name');
  const val = dot.getAttribute('data-val');
  const col = dot.getAttribute('data-color');
  tip.innerHTML = `<div style="font-size:11px;color:#6b7280;margin-bottom:5px;border-bottom:1px solid #f3f4f6;padding-bottom:4px;">${lbl}</div>
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="width:10px;height:10px;border-radius:50%;background:${col};flex-shrink:0;"></span>
      <span style="color:#374151;">${name}</span>
      <span style="margin-left:auto;font-size:15px;font-weight:800;color:${col};">${val}</span>
    </div>`;
  tip.style.display = 'block';
  tip.style.left = (e.clientX + 14) + 'px';
  tip.style.top = (e.clientY - 44) + 'px';
}

function ilHideTip() {
  document.querySelectorAll('[id$="-tip"]').forEach(el => {
    if (el.style.display !== 'none') el.style.display = 'none';
  });
}

// ---- 饼图 ----
function drawPieChart(svgId, segments) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const cx = 70, cy = 70, r = 50;
  const total = segments.reduce((s, d) => s + d.value, 0);
  let startAngle = -Math.PI / 2;
  const colors = ['#2ecc87', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

  const paths = segments.map((seg, i) => {
    const angle = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
    startAngle += angle;
    return `<path d="${path}" fill="${colors[i % colors.length]}" opacity="0.85"/>`;
  }).join('');

  const legend = segments.map((seg, i) =>
    `<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#4b5563;margin-bottom:4px;">
      <span style="width:10px;height:10px;border-radius:50%;background:${colors[i % colors.length]};flex-shrink:0;"></span>
      <span>${seg.label}</span><span style="margin-left:auto;font-weight:600;color:#1f2937;">${Math.round(seg.value / total * 100)}%</span>
    </div>`
  ).join('');

  svg.innerHTML = paths;

  const legendEl = document.getElementById(svgId + '-legend');
  if (legendEl) legendEl.innerHTML = legend;
}

// ---- 进度更新 ----
function setProgress(id, pct, colorClass) {
  const el = document.getElementById(id);
  if (el) {
    el.style.width = pct + '%';
    if (colorClass) el.className = 'progress-fill ' + colorClass;
  }
}

// ---- 页面初始化 ----
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  // 初始化所有filter-select交互提示
  document.querySelectorAll('.filter-select').forEach(sel => {
    sel.addEventListener('change', () => {
      sel.style.borderColor = '#2ecc87';
      setTimeout(() => { sel.style.borderColor = ''; }, 1000);
    });
  });
  // 统一按钮点击反馈
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (btn.dataset.action) {
        handleAction(btn.dataset.action, btn);
      }
    });
  });
});

function handleAction(action, el) {
  const map = {
    'export': () => showToast('已导出数据', 'success'),
    'refresh': () => showToast('数据已刷新', 'success'),
  };
  if (map[action]) map[action]();
}

// ---- Toast ----
function showToast(msg, type = 'info') {
  const colors = { success: '#2ecc87', info: '#3b82f6', warn: '#f59e0b', error: '#ef4444' };
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;right:24px;background:#fff;border-left:4px solid ${colors[type]};
    padding:12px 18px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);
    font-size:13px;color:#374151;z-index:9999;animation:fadeIn 0.2s ease;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
