/* ═══════════════════════════════════════════════════
   EXERCÍCIO — MÚLTIPLA ESCOLHA
   ═══════════════════════════════════════════════════
   Uso no HTML:
     <div class="mc-root" data-ex="mc1">
       <div class="mc-question" data-q="q1" data-correct="b">
         <p class="mc-q-text">Enunciado da pergunta?</p>
         <div class="mc-options">
           <div class="mc-option" data-opt="a">
             <span class="mc-letter">A</span>
             <span>Opção A</span>
           </div>
           <div class="mc-option" data-opt="b">
             <span class="mc-letter">B</span>
             <span>Opção B</span>
           </div>
           ...
         </div>
         <div class="mc-explanation ok">Explicação quando correto.</div>
         <div class="mc-explanation err" data-for="a">Explicação quando errou A.</div>
       </div>
       <hr class="mc-sep">
       <!-- mais questões -->
     </div>
     <div class="ex-actions">
       <button class="btn-verificar" onclick="mcVerify('mc1')">Verificar</button>
       <button class="btn-refazer"  onclick="mcReset('mc1')">Refazer</button>
     </div>
     <div class="ex-result" id="mc1-result"></div>
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    const LETTERS = ['A', 'B', 'C', 'D', 'E'];

    /* ── embaralha array in-place (Fisher-Yates) ── */
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /* ── inicialização automática ── */
    document.addEventListener('DOMContentLoaded', initAll);

    function initAll() {
        document.querySelectorAll('.mc-root').forEach(root => {
            shuffleOptions(root);
            initMC(root.dataset.ex);
        });
    }

    /* ── embaralha opções dentro de cada questão e atualiza letras ── */
    function shuffleOptions(root) {
        root.querySelectorAll('.mc-question').forEach(qEl => {
            const container = qEl.querySelector('.mc-options');
            if (!container) return;
            const opts = shuffle([...container.querySelectorAll('.mc-option')]);
            opts.forEach((opt, i) => {
                container.appendChild(opt);
                const letter = opt.querySelector('.mc-letter');
                if (letter) letter.textContent = LETTERS[i];
            });
        });
    }

    function initMC(exId) {
        const root = document.querySelector(`.mc-root[data-ex="${exId}"]`);
        if (!root) return;

        root.querySelectorAll('.mc-question').forEach(qEl => {
            qEl.querySelectorAll('.mc-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    if (opt.classList.contains('locked')) return;
                    /* deselect siblings */
                    qEl.querySelectorAll('.mc-option').forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                });
            });
        });
    }

    /* ── verificar ── */
    window.mcVerify = function (exId) {
        const root   = document.querySelector(`.mc-root[data-ex="${exId}"]`);
        const result = document.getElementById(`${exId}-result`);
        if (!root) return;

        const questions = root.querySelectorAll('.mc-question');
        let correct = 0, answered = 0;

        questions.forEach(qEl => {
            const correctOpt = qEl.dataset.correct;          // e.g. "b"
            const selected   = qEl.querySelector('.mc-option.selected');

            /* lock all options */
            qEl.querySelectorAll('.mc-option').forEach(opt => {
                opt.classList.add('locked');
                const optId = opt.dataset.opt;

                if (optId === correctOpt) {
                    /* always highlight correct */
                    opt.classList.add(selected && selected.dataset.opt === correctOpt ? 'correct' : 'reveal');
                } else if (selected && selected.dataset.opt === optId) {
                    opt.classList.add('incorrect');
                }
            });

            /* show explanation */
            if (selected) {
                answered++;
                const isOk = selected.dataset.opt === correctOpt;
                if (isOk) {
                    correct++;
                    /* show .ok explanation */
                    const exp = qEl.querySelector('.mc-explanation.ok');
                    if (exp) exp.classList.add('visible');
                } else {
                    /* show .err explanation matching selected opt, or generic err */
                    const specific = qEl.querySelector(`.mc-explanation.err[data-for="${selected.dataset.opt}"]`);
                    const generic  = qEl.querySelector('.mc-explanation.err:not([data-for])');
                    const exp      = specific || generic;
                    if (exp) exp.classList.add('visible');
                }
            } else {
                /* not answered — reveal correct only */
                const exp = qEl.querySelector('.mc-explanation.ok');
                /* don't show ok for unanswered */
            }
        });

        const total = questions.length;

        /* result banner */
        if (result) {
            result.className = 'ex-result visible ' + (
                correct === total ? 'success' :
                correct > 0       ? 'partial' : 'zero'
            );
            result.innerHTML = correct === total
                ? `🎉 Excelente! Você acertou todas as ${total} questões!`
                : `Você acertou ${correct} de ${total}. Revise as questões marcadas e tente novamente.`;
        }
    };

    /* ── refazer ── */
    window.mcReset = function (exId) {
        const root   = document.querySelector(`.mc-root[data-ex="${exId}"]`);
        const result = document.getElementById(`${exId}-result`);
        if (!root) return;

        root.querySelectorAll('.mc-option').forEach(opt => {
            opt.classList.remove('selected', 'locked', 'correct', 'incorrect', 'reveal');
        });
        root.querySelectorAll('.mc-explanation').forEach(exp => {
            exp.classList.remove('visible');
        });

        if (result) result.className = 'ex-result';
    };

})();
