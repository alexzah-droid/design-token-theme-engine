/* ============================================================
   ZTZ · UI behaviors
   • theme toggle (light/dark/auto, persisted in localStorage)
   • custom dropdown (keyboard a11y)
   • smooth accordion (open attribute + max-height)
   • tabs
   • alert close
   ============================================================ */
(function(){
  'use strict';

  /* ---------- THEME ---------- */
  const THEME_KEY = 'ztz-theme';
  const mql = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(mode){
    const effective = mode === 'auto' ? (mql.matches ? 'dark' : 'light') : mode;
    document.documentElement.setAttribute('data-theme', effective);
    document.documentElement.dataset.themeMode = mode;
    document.querySelectorAll('[data-theme-set]').forEach(btn=>{
      btn.setAttribute('aria-checked', btn.dataset.themeSet === mode ? 'true' : 'false');
    });
  }

  const stored = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(stored);

  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-theme-set]');
    if(!btn) return;
    const mode = btn.dataset.themeSet;
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
  });

  mql.addEventListener?.('change', ()=>{
    if((localStorage.getItem(THEME_KEY) || 'light') === 'auto') applyTheme('auto');
  });

  /* ---------- CUSTOM DROPDOWN ---------- */
  document.querySelectorAll('[data-dropdown]').forEach(dd => {
    const btn  = dd.querySelector('.dropdown-btn');
    const list = dd.querySelector('.dropdown-list');
    const val  = dd.querySelector('.dropdown-value');
    const items = [...list.querySelectorAll('[role="option"]')];
    let focusIx = items.findIndex(i => i.getAttribute('aria-selected') === 'true');
    if(focusIx < 0) focusIx = 0;

    const open  = () => { btn.setAttribute('aria-expanded','true');  setFocus(focusIx); };
    const close = () => { btn.setAttribute('aria-expanded','false'); };
    const toggle = () => (btn.getAttribute('aria-expanded') === 'true' ? close() : open());

    function setFocus(i){
      items.forEach(x => x.classList.remove('is-focus'));
      focusIx = (i + items.length) % items.length;
      items[focusIx].classList.add('is-focus');
    }
    function pick(i){
      items.forEach(x => x.setAttribute('aria-selected','false'));
      items[i].setAttribute('aria-selected','true');
      val.textContent = items[i].dataset.value;
      close();
      btn.focus();
      dd.dispatchEvent(new CustomEvent('dropdown:change', { detail:{ value: items[i].dataset.value } }));
    }

    btn.addEventListener('click', toggle);
    btn.addEventListener('keydown', e => {
      if(['ArrowDown','Enter',' '].includes(e.key)){ e.preventDefault(); open(); }
    });
    list.addEventListener('keydown', e => {
      if(e.key === 'ArrowDown'){ e.preventDefault(); setFocus(focusIx + 1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); setFocus(focusIx - 1); }
      else if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pick(focusIx); }
      else if(e.key === 'Escape'){ close(); btn.focus(); }
    });
    items.forEach((it, i) => {
      it.addEventListener('mouseenter', () => setFocus(i));
      it.addEventListener('click',      () => pick(i));
    });
    document.addEventListener('click', e => { if(!dd.contains(e.target)) close(); });

    // keep keyboard navigation reachable via tab
    list.setAttribute('tabindex','-1');
    btn.addEventListener('focus', () => list.blur());
  });

  /* ---------- ACCORDION (smooth, mutually exclusive optional) ---------- */
  document.querySelectorAll('[data-acc]').forEach(item => {
    const head = item.querySelector('.acc-head');
    const body = item.querySelector('.acc-body');
    const inner = item.querySelector('.acc-inner');

    function setOpen(open){
      if(open){
        item.setAttribute('open','');
        head.setAttribute('aria-expanded','true');
        body.style.maxHeight = inner.scrollHeight + 'px';
      } else {
        body.style.maxHeight = inner.scrollHeight + 'px';
        // force reflow
        body.offsetHeight; // eslint-disable-line
        item.removeAttribute('open');
        head.setAttribute('aria-expanded','false');
        body.style.maxHeight = '0px';
      }
    }
    // init
    if(item.hasAttribute('open')){
      head.setAttribute('aria-expanded','true');
      body.style.maxHeight = inner.scrollHeight + 'px';
    } else {
      head.setAttribute('aria-expanded','false');
      body.style.maxHeight = '0px';
    }

    head.addEventListener('click', () => setOpen(!item.hasAttribute('open')));
  });

  // recompute on resize
  window.addEventListener('resize', () => {
    document.querySelectorAll('[data-acc][open]').forEach(item => {
      const body = item.querySelector('.acc-body');
      const inner = item.querySelector('.acc-inner');
      body.style.maxHeight = inner.scrollHeight + 'px';
    });
  });

  /* ---------- TABS ---------- */
  document.querySelectorAll('[role="tablist"]').forEach(list => {
    list.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        list.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected','false'));
        tab.setAttribute('aria-selected','true');
      });
    });
  });

  /* ---------- TABLE: search / sort / filter ---------- */
  document.querySelectorAll('[data-table]').forEach(root => {
    const table = root.querySelector('table');
    if(!table) return;
    const tbody = table.tBodies[0];
    const rows  = [...tbody.rows];
    const search = root.querySelector('[data-tbl-search]');
    const countEl = root.querySelector('[data-tbl-count]');
    const emptyEl = root.querySelector('[data-tbl-empty]');
    const filterBtns = root.querySelectorAll('[data-filter-col]');
    const state = { q:'', filters:{}, sort:{ col:null, dir:null } };

    function cellText(row, i){
      const td = row.cells[i];
      return (td.dataset.v ?? td.textContent).trim();
    }
    function cellNum(row, i){
      const td = row.cells[i];
      const raw = td.dataset.v ?? td.textContent;
      return parseFloat(String(raw).replace(/[^\d.-]/g,'')) || 0;
    }
    function apply(){
      // sort
      let ordered = rows.slice();
      if(state.sort.col !== null){
        const th = table.tHead.rows[0].cells[state.sort.col];
        const type = th.dataset.sort || 'text';
        ordered.sort((a,b)=>{
          const av = type === 'num' ? cellNum(a,state.sort.col) : cellText(a,state.sort.col).toLowerCase();
          const bv = type === 'num' ? cellNum(b,state.sort.col) : cellText(b,state.sort.col).toLowerCase();
          if(av < bv) return state.sort.dir === 'asc' ? -1 : 1;
          if(av > bv) return state.sort.dir === 'asc' ?  1 : -1;
          return 0;
        });
      }
      // re-insert in new order
      ordered.forEach(r => tbody.appendChild(r));

      // filter + search
      let visible = 0;
      const q = state.q.toLowerCase();
      rows.forEach(r => {
        let ok = true;
        for(const [col,val] of Object.entries(state.filters)){
          if(!val) continue;
          if(!cellText(r, +col).toLowerCase().includes(val.toLowerCase())){ ok = false; break; }
        }
        if(ok && q){
          ok = [...r.cells].some(c => (c.textContent || '').toLowerCase().includes(q));
        }
        r.style.display = ok ? '' : 'none';
        if(ok) visible++;
      });
      if(countEl) countEl.textContent = visible + ' / ' + rows.length;
      if(emptyEl) emptyEl.hidden = visible > 0;
    }

    // search
    search?.addEventListener('input', e => { state.q = e.target.value; apply(); });

    // filters (chips grouped by column; active = button with .active in that column group)
    filterBtns.forEach(btn => btn.addEventListener('click', () => {
      const col = btn.dataset.filterCol;
      root.querySelectorAll(`[data-filter-col="${col}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filters[col] = btn.dataset.filterVal || '';
      apply();
    }));

    // sort
    table.querySelectorAll('thead th[data-sort]').forEach((th, i) => {
      const btn = th.querySelector('button') || th;
      btn.addEventListener('click', () => {
        table.querySelectorAll('thead th[data-sort]').forEach(x => x.removeAttribute('aria-sort'));
        if(state.sort.col === i){
          state.sort.dir = state.sort.dir === 'asc' ? 'desc' : (state.sort.dir === 'desc' ? null : 'asc');
          if(state.sort.dir === null) state.sort.col = null;
        } else {
          state.sort.col = i; state.sort.dir = 'asc';
        }
        if(state.sort.col !== null){
          th.setAttribute('aria-sort', state.sort.dir === 'asc' ? 'ascending' : 'descending');
        }
        apply();
      });
    });

    apply();
  });

  /* ---------- ALERT CLOSE ---------- */
  document.querySelectorAll('.alert .x').forEach(btn => {
    btn.addEventListener('click', e => {
      const a = e.currentTarget.closest('.alert');
      a.style.opacity = '0';
      a.style.transform = 'translateY(-4px)';
      a.style.transition = 'opacity .18s, transform .18s';
      setTimeout(() => a.remove(), 180);
    });
  });

})();
