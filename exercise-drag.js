/* ═══════════════════════════════════════════════════
   EXERCÍCIO — ARRASTAR E SOLTAR
   Suporte a drag-and-drop (desktop) e clique (mobile)
   ═══════════════════════════════════════════════════
   Uso no HTML:
     <div class="ex-drag-root" data-ex="ex1">
       <div class="ex-pool" data-pool="ex1">
         <div class="drag-chip" data-id="a">Texto</div>
         ...
       </div>
       <div class="ex-zones" data-zones="ex1">
         <div class="drop-zone" data-zone="ex1-z1" data-accept="a">
           <span class="zone-name">Rótulo</span>
           <div class="zone-slot"></div>
           <div class="zone-feedback"></div>
         </div>
         ...
       </div>
     </div>
     <div class="ex-actions">
       <button class="btn-verificar" onclick="dragVerify('ex1')">Verificar</button>
       <button class="btn-refazer"  onclick="dragReset('ex1')">Refazer</button>
     </div>
     <div class="ex-result" id="ex1-result"></div>
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── estado global por exercício ── */
    const state = {};   // state[exId] = { selected: chipEl | null, placements: { zoneId: chipId } }

    function getState(exId) {
        if (!state[exId]) state[exId] = { selected: null, placements: {} };
        return state[exId];
    }

    /* ── inicialização automática ── */
    document.addEventListener('DOMContentLoaded', initAll);

    /* ── embaralha array in-place (Fisher-Yates) ── */
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function initAll() {
        document.querySelectorAll('.ex-drag-root').forEach(root => {
            const exId = root.dataset.ex;
            shufflePool(exId);
            initDrag(exId);
        });
    }

    /* ── embaralha os chips no pool ── */
    function shufflePool(exId) {
        const pool = document.querySelector(`.ex-pool[data-pool="${exId}"]`);
        if (!pool) return;
        const chips = shuffle([...pool.querySelectorAll('.drag-chip')]);
        chips.forEach(c => pool.appendChild(c));
    }

    function initDrag(exId) {
        const pool  = document.querySelector(`.ex-pool[data-pool="${exId}"]`);
        const zones = document.querySelector(`.ex-zones[data-zones="${exId}"]`);
        if (!pool || !zones) return;

        /* chips */
        pool.querySelectorAll('.drag-chip').forEach(chip => {
            chip.setAttribute('draggable', 'true');

            /* desktop: drag start */
            chip.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', chip.dataset.id);
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => chip.classList.add('dragging'), 0);
                getState(exId).dragChipId = chip.dataset.id;
            });
            chip.addEventListener('dragend', () => chip.classList.remove('dragging'));

            /* mobile / click */
            chip.addEventListener('click', () => onChipClick(exId, chip));
        });

        /* zones */
        zones.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault();
                zone.classList.add('over');
            });
            zone.addEventListener('dragleave', () => zone.classList.remove('over'));
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('over');
                const chipId = e.dataTransfer.getData('text/plain');
                placeChip(exId, zone, chipId);
            });

            /* click on zone (mobile) */
            zone.addEventListener('click', e => {
                if (e.target.classList.contains('placed-chip')) return; // handled below
                const st = getState(exId);
                if (st.selected) {
                    placeChip(exId, zone, st.selected.dataset.id);
                }
            });
        });

        /* click on placed-chip to remove */
        zones.addEventListener('click', e => {
            const pc = e.target.closest('.placed-chip');
            if (!pc) return;
            const zoneEl = pc.closest('.drop-zone');
            if (!zoneEl) return;
            removeFromZone(exId, zoneEl);
        });
    }

    /* ── click-select logic (mobile) ── */
    function onChipClick(exId, chip) {
        if (chip.classList.contains('placed')) return;
        const st = getState(exId);

        if (st.selected === chip) {
            /* deselect */
            chip.classList.remove('selected');
            st.selected = null;
            return;
        }
        /* deselect previous */
        if (st.selected) st.selected.classList.remove('selected');
        chip.classList.add('selected');
        st.selected = chip;
    }

    /* ── place a chip into a zone ── */
    function placeChip(exId, zoneEl, chipId) {
        const pool = document.querySelector(`.ex-pool[data-pool="${exId}"]`);
        const chip = pool.querySelector(`.drag-chip[data-id="${chipId}"]`);
        if (!chip) return;

        /* if zone already has a chip, return it first */
        removeFromZone(exId, zoneEl, false);

        /* mark chip as placed */
        chip.classList.add('placed');
        chip.classList.remove('selected');
        const st = getState(exId);
        if (st.selected === chip) st.selected = null;

        /* record placement */
        st.placements[zoneEl.dataset.zone] = chipId;

        /* show placed-chip inside zone */
        const slot = zoneEl.querySelector('.zone-slot');
        const pc = document.createElement('span');
        pc.className = 'placed-chip';
        pc.textContent = chip.textContent;
        pc.dataset.chipId = chipId;
        slot.innerHTML = '';
        slot.appendChild(pc);

        /* clear any previous feedback */
        clearZoneFeedback(zoneEl);
    }

    /* ── remove chip from zone ── */
    function removeFromZone(exId, zoneEl, clearState = true) {
        const slot = zoneEl.querySelector('.zone-slot');
        const pc   = slot && slot.querySelector('.placed-chip');
        if (!pc) return;

        const chipId = pc.dataset.chipId;
        const pool   = document.querySelector(`.ex-pool[data-pool="${exId}"]`);
        const chip   = pool && pool.querySelector(`.drag-chip[data-id="${chipId}"]`);
        if (chip) chip.classList.remove('placed', 'selected');

        slot.innerHTML = '';
        clearZoneFeedback(zoneEl);

        if (clearState) {
            const st = getState(exId);
            delete st.placements[zoneEl.dataset.zone];
        }
    }

    function clearZoneFeedback(zoneEl) {
        const fb = zoneEl.querySelector('.zone-feedback');
        if (fb) { fb.textContent = ''; fb.className = 'zone-feedback'; }
        zoneEl.classList.remove('correct', 'incorrect');
    }

    /* ── verificar ── */
    window.dragVerify = function (exId) {
        const zones  = document.querySelector(`.ex-zones[data-zones="${exId}"]`);
        const result = document.getElementById(`${exId}-result`);
        if (!zones) return;

        const st = getState(exId);
        let correct = 0, total = 0;

        zones.querySelectorAll('.drop-zone').forEach(zone => {
            total++;
            const accepts  = zone.dataset.accept;          // expected chip id(s), comma-sep
            const placed   = st.placements[zone.dataset.zone];
            const fb       = zone.querySelector('.zone-feedback');
            const accepted = accepts ? accepts.split(',').map(s => s.trim()) : [];
            const isOk     = placed && accepted.includes(placed);

            zone.classList.remove('correct', 'incorrect');
            zone.classList.add(isOk ? 'correct' : 'incorrect');

            if (fb) {
                fb.textContent = isOk ? '✓ Correto' : (placed ? '✗ Incorreto' : '✗ Vazio');
                fb.className   = 'zone-feedback ' + (isOk ? 'ok' : 'err');
            }
            if (isOk) correct++;
        });

        /* disable chips and zones */
        document.querySelectorAll(`.ex-pool[data-pool="${exId}"] .drag-chip`).forEach(c => {
            c.setAttribute('draggable', 'false');
            c.style.pointerEvents = 'none';
        });
        zones.querySelectorAll('.drop-zone').forEach(z => z.style.cursor = 'default');
        zones.querySelectorAll('.placed-chip').forEach(pc => pc.style.pointerEvents = 'none');

        /* result banner */
        if (result) {
            result.className = 'ex-result visible ' + (
                correct === total ? 'success' :
                correct > 0       ? 'partial' : 'zero'
            );
            result.innerHTML = correct === total
                ? `🎉 Parabéns! Você acertou todas as ${total} correspondências!`
                : `Você acertou ${correct} de ${total}. Revise as marcadas em vermelho e tente novamente.`;
        }
    };

    /* ── refazer ── */
    window.dragReset = function (exId) {
        const pool   = document.querySelector(`.ex-pool[data-pool="${exId}"]`);
        const zones  = document.querySelector(`.ex-zones[data-zones="${exId}"]`);
        const result = document.getElementById(`${exId}-result`);

        if (pool) pool.querySelectorAll('.drag-chip').forEach(c => {
            c.classList.remove('placed', 'selected', 'dragging');
            c.setAttribute('draggable', 'true');
            c.style.pointerEvents = '';
        });

        if (zones) zones.querySelectorAll('.drop-zone').forEach(z => {
            z.querySelector('.zone-slot').innerHTML = '';
            clearZoneFeedback(z);
            z.style.cursor = '';
        });

        if (result) result.className = 'ex-result';

        state[exId] = { selected: null, placements: {} };
    };

})();
