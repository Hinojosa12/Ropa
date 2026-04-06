// ═══════════════════════════════════════════ PALETA
function setPalette(c1, c2, c3, c4, c5) {
  const r = document.documentElement.style;
  r.setProperty('--c1', c1); r.setProperty('--c2', c2); r.setProperty('--c3', c3);
  r.setProperty('--c4', c4); r.setProperty('--c5', c5); r.setProperty('--accent', c5);
  r.setProperty('--tab1', c2); r.setProperty('--tab2', c1);
  document.getElementById('palette-panel').classList.remove('open');
  showToast('Paleta cambiada 🎨');
}

document.getElementById('palette-btn').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('palette-panel').classList.toggle('open');
});
document.addEventListener('click', e => {
  if (!e.target.closest('#palette-panel') && !e.target.closest('#palette-btn'))
    document.getElementById('palette-panel').classList.remove('open');
});

// ── TOAST ──────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── SECTION NAVIGATION ────────────────────────────────────────────────────
function showSection(id, tabEl) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (tabEl) tabEl.classList.add('active');
  if (id === 'calendario') renderCalendarApp();
  if (id === 'historico')  renderHistorico();
  if (id === 'gastos')     { calcTotals(); buildIngresosCards(); }
}

// ═══════════════════════════════════════════ CALENDARIO CON FRANJAS HORARIAS
let calEvents = JSON.parse(localStorage.getItem('calEventsFull') || '{}');
let currentMonth = new Date();
let selectedDateStr = null;

function migrateOldEvents() {
  const old = localStorage.getItem('calEventsNew');
  if (old && !localStorage.getItem('calEventsFull')) {
    try {
      const oldObj = JSON.parse(old);
      const newObj = {};
      for (const date in oldObj) {
        if (Array.isArray(oldObj[date])) {
          newObj[date] = {};
          oldObj[date].forEach(ev => { if (ev.time && ev.text) newObj[date][ev.time] = ev.text; });
        }
      }
      localStorage.setItem('calEventsFull', JSON.stringify(newObj));
    } catch (e) {}
  }
}
migrateOldEvents();

function saveCalEvents() { localStorage.setItem('calEventsFull', JSON.stringify(calEvents)); }

function renderCalendarApp() {
  const container = document.getElementById('calendar-root');
  if (!container) return;
  renderMonthView(container);
}

function renderMonthView(container) {
  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today    = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  let html = `<div class="calendar-container"><div class="month-view">
    <div class="cal-nav">
      <button onclick="changeMonth(-1)">◀</button>
      <h3>${getMonthName(month)} ${year}</h3>
      <button onclick="changeMonth(1)">▶</button>
    </div>
    <div class="weekdays">${['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d => `<div>${d}</div>`).join('')}</div>
    <div class="cal-days-grid">`;

  for (let i = 0; i < firstDay; i++) html += `<div class="cal-day-cell empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey  = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasEvent = calEvents[dateKey] && Object.keys(calEvents[dateKey]).length > 0;
    const isToday  = dateKey === todayKey;
    html += `<div class="cal-day-cell ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" onclick="openDayView('${dateKey}')">${d}</div>`;
  }
  html += `</div></div></div>`;
  container.innerHTML = html;
}

function changeMonth(dir) {
  currentMonth.setMonth(currentMonth.getMonth() + dir);
  renderCalendarApp();
}

function openDayView(dateStr) {
  selectedDateStr = dateStr;
  const [year, month, day] = dateStr.split('-');
  const eventsMap = calEvents[dateStr] || {};

  let html = `<div class="day-view">
    <div class="day-header">
      <h4>📅 ${day}/${month}/${year}</h4>
      <button class="back-btn" onclick="renderCalendarApp()">← Volver al mes</button>
    </div>
    <div class="schedule-grid">`;

  for (let h = 0; h < 24; h++) {
    const hourStr    = `${String(h).padStart(2,'0')}:00`;
    const displayHour = h === 0 ? '12:00 AM' : (h < 12 ? `${h}:00 AM` : (h === 12 ? '12:00 PM' : `${h-12}:00 PM`));
    const eventText  = eventsMap[hourStr] || '';
    html += `<div class="time-row">
      <div class="time-label">${displayHour}</div>
      <div class="event-content">`;
    if (eventText) {
      html += `<span class="event-text">${escapeHtml(eventText)}</span>
               <span class="del-event" onclick="deleteEventFromHour('${dateStr}','${hourStr}')">🗑️</span>`;
    } else {
      html += `<input type="text" class="add-event-input" id="input-${dateStr}-${hourStr}" placeholder="Agregar evento...">
               <button class="add-event-btn" onclick="addEventToHour('${dateStr}','${hourStr}')">+</button>`;
    }
    html += `</div></div>`;
  }
  html += `</div></div>`;
  document.getElementById('calendar-root').innerHTML = html;
}

function addEventToHour(dateStr, hourStr) {
  const input = document.getElementById(`input-${dateStr}-${hourStr}`);
  const text  = input.value.trim();
  if (!text) { showToast('Escribe una descripción'); return; }
  if (!calEvents[dateStr]) calEvents[dateStr] = {};
  calEvents[dateStr][hourStr] = text;
  saveCalEvents();
  openDayView(dateStr);
  showToast('Evento agregado ✨');
}

function deleteEventFromHour(dateStr, hourStr) {
  if (calEvents[dateStr]?.[hourStr]) {
    delete calEvents[dateStr][hourStr];
    if (Object.keys(calEvents[dateStr]).length === 0) delete calEvents[dateStr];
    saveCalEvents();
    openDayView(dateStr);
    showToast('Evento eliminado');
  }
}

function getMonthName(m) {
  return ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][m];
}
function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ═══════════════════════════════════════════ PENDIENTES
let pendLists = JSON.parse(localStorage.getItem('pendLists') || '[]');

function savePend() { localStorage.setItem('pendLists', JSON.stringify(pendLists)); renderPendLists(); }

function renderPendLists() {
  const wrap = document.getElementById('pend-lists-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  pendLists.forEach((list, li) => {
    const card = document.createElement('div');
    card.className = 'pend-list-card';
    card.innerHTML = `
      <h3>
        <span>${escapeHtml(list.name)}</span>
        <span class="del-list" onclick="delList(${li})">🗑</span>
      </h3>
      <div class="pend-items">
        ${list.items.map((item, ii) => `
          <div class="pend-item">
            <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleItem(${li},${ii},this)">
            <input type="text" value="${escapeHtml(item.text)}" class="${item.done ? 'checked-item' : ''}" onchange="editItem(${li},${ii},this.value)">
            <span class="del-item" onclick="delItem(${li},${ii})">✕</span>
          </div>`).join('')}
      </div>
      <button class="add-item-btn" onclick="addItem(${li})">+ Agregar ítem</button>`;
    wrap.appendChild(card);
  });
}

function addPendList() {
  const name = document.getElementById('new-list-name')?.value.trim();
  if (name) {
    pendLists.push({ name, items: [{ text: '', done: false }] });
    savePend();
    document.getElementById('new-list-name').value = '';
  }
}
function delList(li)         { pendLists.splice(li, 1); savePend(); }
function addItem(li)         { pendLists[li].items.push({ text: '', done: false }); savePend(); }
function delItem(li, ii)     { pendLists[li].items.splice(ii, 1); savePend(); }
function toggleItem(li,ii,cb){ pendLists[li].items[ii].done = cb.checked; savePend(); }
function editItem(li,ii,val) { pendLists[li].items[ii].text = val; savePend(); }

// ═══════════════════════════════════════════ GASTOS + INGRESOS
const gastosCats = [
  { icon:'🍽️', name:'Alimentación', id:'alimentacion', editable:true },
  { icon:'🚌', name:'Transporte',   id:'transporte',   editable:false },
  { icon:'🧴', name:'Higiene',      id:'higiene',      editable:true  },
  { icon:'🏠', name:'Renta',        id:'renta',        editable:false },
  { icon:'👗', name:'Ropa',         id:'ropa',         editable:true  },
  { icon:'🛒', name:'Nec. del Hogar',id:'hogar',       editable:true  },
  { icon:'💄', name:'Belleza',      id:'belleza',      editable:true  },
  { icon:'💰', name:'Ahorros',      id:'ahorros',      editable:false },
  { icon:'📈', name:'Invertir',     id:'invertir',     editable:false },
  { icon:'🎉', name:'Ocio',         id:'ocio',         editable:true  },
  { icon:'⭐', name:'Otros',        id:'otros',        editable:true  },
];

let gastosReal    = JSON.parse(localStorage.getItem('gastosReal')   || '{}');
let gastosEst     = JSON.parse(localStorage.getItem('gastosEst')    || '{}');
let currentDescs  = JSON.parse(localStorage.getItem('gastosDescs')  || '{}');

function saveGastos() {
  localStorage.setItem('gastosReal',  JSON.stringify(gastosReal));
  localStorage.setItem('gastosEst',   JSON.stringify(gastosEst));
  localStorage.setItem('gastosDescs', JSON.stringify(currentDescs));
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function buildIngresosCards() {
  const container = document.getElementById('ingresos-cards');
  if (!container) return;
  const ingresos = [
    { icon:'💵', name:'Sueldo',        id:'sueldo' },
    { icon:'💼', name:'Trabajo extra', id:'extra'  },
    { icon:'📈', name:'Inversiones',   id:'inv'    },
  ];
  container.innerHTML = '';
  ingresos.forEach(inc => {
    const card = document.createElement('div');
    card.className = 'ingreso-card';
    card.innerHTML = `
      <div class="ingreso-card-header">
        <div class="ingreso-card-title"><span>${inc.icon}</span><span>${inc.name}</span></div>
        <input class="date-input" type="date" id="ing-fecha-${inc.id}-m" value="${document.getElementById(`ing-fecha-${inc.id}`)?.value || todayStr()}">
      </div>
      <div class="ingreso-card-row">
        <div><label>Estimado</label><br>
          <input class="amount-input" type="number" id="ing-est-${inc.id}-m" placeholder="$0"
            value="${document.getElementById(`ing-est-${inc.id}`)?.value || ''}"
            oninput="syncIngreso('${inc.id}','est',this.value)">
        </div>
        <div><label>Real</label><br>
          <input class="amount-input" type="number" id="ing-real-${inc.id}-m" placeholder="$0"
            value="${document.getElementById(`ing-real-${inc.id}`)?.value || ''}"
            oninput="syncIngreso('${inc.id}','real',this.value)">
        </div>
      </div>`;
    container.appendChild(card);
    const mobileDate = document.getElementById(`ing-fecha-${inc.id}-m`);
    if (mobileDate) {
      mobileDate.addEventListener('change', () => {
        const tableDate = document.getElementById(`ing-fecha-${inc.id}`);
        if (tableDate) tableDate.value = mobileDate.value;
      });
    }
  });
}

function syncIngreso(id, type, val) {
  const tableEl = document.getElementById(`ing-${type}-${id}`);
  if (tableEl) tableEl.value = val;
  calcTotals();
}

function buildGastos() {
  const tbody    = document.getElementById('gastos-tbody');
  const cardsDiv = document.getElementById('gastos-cards');
  if (!tbody || !cardsDiv) return;
  tbody.innerHTML   = '';
  cardsDiv.innerHTML = '';

  gastosCats.forEach(cat => {
    const realVal  = gastosReal[cat.id] || 0;
    const estVal   = gastosEst[cat.id]  || '';
    const descText = currentDescs[cat.id] || cat.name;

    // Table row
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input class="date-input" type="date" id="gas-fecha-${cat.id}" value="${todayStr()}"></td>
      <td><div class="desc-cell">
        <span class="desc-icon">${cat.icon}</span>
        ${cat.editable
          ? `<span class="desc-label" onclick="editDesc('${cat.id}')">${escapeHtml(descText)}</span>
             <input class="desc-input" id="input-${cat.id}" onblur="saveDesc('${cat.id}')">`
          : `<span>${cat.name}</span>`}
      </div></td>
      <td><input class="amount-input" type="number" id="est-${cat.id}" value="${estVal}"
            oninput="gastosEst['${cat.id}']=this.value;saveGastos();calcTotals()"></td>
      <td><span class="real-display" id="real-display-${cat.id}">$${realVal.toLocaleString()}</span></td>
      <td><input class="real-add-input" type="number" id="real-input-${cat.id}" placeholder="+"></td>`;
    tbody.appendChild(tr);

    // Mobile card
    const card = document.createElement('div');
    card.className = 'gasto-card';
    card.innerHTML = `
      <div class="gasto-card-header">
        <div class="gasto-card-title">
          <span>${cat.icon}</span>
          ${cat.editable
            ? `<span class="desc-label" onclick="editDescM('${cat.id}')">${escapeHtml(descText)}</span>
               <input class="desc-input" id="input-m-${cat.id}" onblur="saveDescM('${cat.id}')">`
            : `<span>${cat.name}</span>`}
        </div>
        <input class="date-input" type="date" id="gas-fecha-m-${cat.id}" value="${todayStr()}">
      </div>
      <div class="gasto-card-row">
        <div><label>Estimado</label><br>
          <input class="amount-input" type="number" id="est-m-${cat.id}" value="${estVal}"
            oninput="syncEst('${cat.id}',this.value)">
        </div>
        <div><label>Real acum.</label><br>
          <span class="real-display" id="real-display-m-${cat.id}">$${realVal.toLocaleString()}</span>
        </div>
        <div><label>Agregar</label><br>
          <input class="real-add-input" type="number" id="real-input-m-${cat.id}" placeholder="+">
        </div>
      </div>`;
    cardsDiv.appendChild(card);
  });
  calcTotals();
}

function syncEst(id, val) {
  const el = document.getElementById(`est-${id}`);
  if (el) el.value = val;
  gastosEst[id] = val; saveGastos(); calcTotals();
}
function editDesc(id)  { const i = document.getElementById(`input-${id}`);   i.classList.add('visible'); i.value = currentDescs[id] || ''; i.focus(); }
function saveDesc(id)  { const v = document.getElementById(`input-${id}`).value.trim();   currentDescs[id] = v || gastosCats.find(c=>c.id===id).name; saveGastos(); buildGastos(); }
function editDescM(id) { const i = document.getElementById(`input-m-${id}`); i.classList.add('visible'); i.value = currentDescs[id] || ''; i.focus(); }
function saveDescM(id) { const v = document.getElementById(`input-m-${id}`).value.trim(); currentDescs[id] = v || gastosCats.find(c=>c.id===id).name; saveGastos(); buildGastos(); }

function calcTotals() {
  const estI  = ['sueldo','extra','inv'].reduce((a,id) => a + parseFloat(document.getElementById(`ing-est-${id}`)?.value  || 0), 0);
  const realI = ['sueldo','extra','inv'].reduce((a,id) => a + parseFloat(document.getElementById(`ing-real-${id}`)?.value || 0), 0);
  const estG  = gastosCats.reduce((a,cat) => a + parseFloat(document.getElementById(`est-${cat.id}`)?.value || 0), 0);
  const realG = gastosCats.reduce((a,cat) => a + (gastosReal[cat.id] || 0), 0);

  document.getElementById('sum-ing-est').innerText  = `$${estI.toLocaleString()}`;
  document.getElementById('sum-ing-real').innerText = `$${realI.toLocaleString()}`;
  document.getElementById('sum-gas-est').innerText  = `$${estG.toLocaleString()}`;
  document.getElementById('sum-gas-real').innerText = `$${realG.toLocaleString()}`;
  document.getElementById('saldo-est').innerText    = `$${(estI - estG).toLocaleString()}`;
  document.getElementById('saldo-real').innerText   = `$${(realI - realG).toLocaleString()}`;
}

function doneGastos() {
  const entries = [];
  gastosCats.forEach(cat => {
    const addVal  = parseFloat(document.getElementById(`real-input-${cat.id}`)?.value   || 0);
    const addValM = parseFloat(document.getElementById(`real-input-m-${cat.id}`)?.value || 0);
    const total   = addVal + addValM;
    if (total > 0) {
      gastosReal[cat.id] = (gastosReal[cat.id] || 0) + total;
      const fecha = document.getElementById(`gas-fecha-${cat.id}`)?.value || todayStr();
      entries.push({ cat: cat.name, icon: cat.icon, desc: currentDescs[cat.id] || cat.name, amount: total, fecha });
      const inp  = document.getElementById(`real-input-${cat.id}`);
      const inpM = document.getElementById(`real-input-m-${cat.id}`);
      if (inp)  inp.value  = '';
      if (inpM) inpM.value = '';
      document.getElementById(`real-display-${cat.id}`).innerText   = `$${gastosReal[cat.id].toLocaleString()}`;
      document.getElementById(`real-display-m-${cat.id}`).innerText = `$${gastosReal[cat.id].toLocaleString()}`;
    }
  });
  if (entries.length) {
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
    historico.push({ date: todayStr(), entries });
    localStorage.setItem('historico', JSON.stringify(historico));
    saveGastos(); calcTotals();
    showToast('Guardado en histórico ✅');
  } else {
    showToast('Sin montos nuevos');
  }
}

function renderHistorico() {
  const hist      = JSON.parse(localStorage.getItem('historico') || '[]');
  const container = document.getElementById('hist-container');
  if (!hist.length) { container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--c4)">Sin registros aún 🌸</div>'; return; }
  let html = `<table class="hist-table"><thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Cantidad</th></tr></thead><tbody>`;
  hist.forEach(entry => {
    entry.entries.forEach(e => {
      html += `<tr><td>${e.fecha}</td><td>${e.icon} ${escapeHtml(e.desc)}</td><td><span class="hist-badge">${escapeHtml(e.cat)}</span></td><td>$${e.amount.toLocaleString()}</td></tr>`;
    });
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

// ── INICIALIZACIÓN ────────────────────────────────────────────────────────
renderPendLists();
buildGastos();
buildIngresosCards();

document.querySelectorAll('#ing-est-sueldo,#ing-real-sueldo,#ing-est-extra,#ing-real-extra,#ing-est-inv,#ing-real-inv')
  .forEach(i => i?.addEventListener('input', calcTotals));
calcTotals();
renderCalendarApp();

// Sincronización de fechas ingresos tabla ↔ móvil
['sueldo','extra','inv'].forEach(id => {
  const tableDate  = document.getElementById(`ing-fecha-${id}`);
  const mobileDate = document.getElementById(`ing-fecha-${id}-m`);
  if (tableDate && mobileDate) {
    tableDate.addEventListener('change',  () => mobileDate.value = tableDate.value);
    mobileDate.addEventListener('change', () => tableDate.value  = mobileDate.value);
  }
});
