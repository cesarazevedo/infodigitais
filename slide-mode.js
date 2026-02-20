// === MODO SLIDE ===
(function() {
    // Aplica modo escuro antes do DOM renderizar (evita flash)
    if (localStorage.getItem('darkMode') === '1') {
        document.body.classList.add('dark-mode');
    }

    let currentSlide = 0;
    let slides = [];
    let lessonTitle = '';

    function initSlideMode() {
        // Inject HUD elements
        const hud = document.createElement('div');
        hud.className = 'slide-hud';
        hud.innerHTML = `
            <button class="slide-hud-btn" id="slidePrev" title="Anterior (←)">&#x2B05;</button>
            <span class="slide-counter" id="slideCounter">1 / 1</span>
            <button class="slide-hud-btn" id="slideNext" title="Próximo (→)">&#x27A1;</button>
            <button class="slide-hud-close" id="slideClose" title="Sair (ESC)">&#x2716;</button>
        `;
        document.body.appendChild(hud);

        // Inject title bar
        const titleBar = document.createElement('div');
        titleBar.className = 'slide-title-bar';
        titleBar.id = 'slideTitleBar';
        document.body.appendChild(titleBar);

        // Get lesson title
        const heroTitle = document.querySelector('.lesson-hero h1');
        lessonTitle = heroTitle ? heroTitle.textContent : 'Aula';

        // Get all content cards as slides
        slides = Array.from(document.querySelectorAll('.content-card'));

        // Button events
        document.getElementById('slidePrev').addEventListener('click', prevSlide);
        document.getElementById('slideNext').addEventListener('click', nextSlide);
        document.getElementById('slideClose').addEventListener('click', exitSlideMode);

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);
    }

    function handleKeyboard(e) {
        if (!document.body.classList.contains('slide-active')) return;

        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                prevSlide();
                break;
            case 'Escape':
                e.preventDefault();
                exitSlideMode();
                break;
        }
    }

    function enterSlideMode() {
        if (slides.length === 0) return;
        currentSlide = 0;
        document.body.classList.add('slide-active');
        showSlide(0);
    }

    function exitSlideMode() {
        document.body.classList.remove('slide-active');
        slides.forEach(s => s.classList.remove('slide-visible'));
    }

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('slide-visible'));
        slides[index].classList.add('slide-visible');

        // Reset scroll position of the slide
        slides[index].scrollTop = 0;

        // Update counter
        const counter = document.getElementById('slideCounter');
        counter.textContent = (index + 1) + ' / ' + slides.length;

        // Update title bar
        const titleBar = document.getElementById('slideTitleBar');
        titleBar.textContent = lessonTitle;
    }

    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            showSlide(currentSlide);
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            showSlide(currentSlide);
        }
    }

    // === NAVEGAÇÃO ENTRE PÁGINAS (fora do modo slide) ===
    document.addEventListener('keydown', function(e) {
        if (document.body.classList.contains('slide-active')) return;
        const links = document.querySelectorAll('.nav-link');
        if (e.key === 'ArrowLeft'  && links[0]) links[0].click();
        if (e.key === 'ArrowRight' && links[1]) links[1].click();
    });

    // === BARRA DE FERRAMENTAS DOS BLOCOS DE CÓDIGO ===
    function initCodeToolbars() {
        document.querySelectorAll('.code-block').forEach(function(block) {
            // Captura texto do label e do código ANTES de modificar o DOM
            const labelEl = block.querySelector('.code-label');
            const labelText = labelEl ? labelEl.textContent : '';

            const clone = block.cloneNode(true);
            clone.querySelector('.code-label') && clone.querySelector('.code-label').remove();
            const codeText = clone.textContent.trim();

            labelEl && labelEl.remove();

            // Monta toolbar
            const toolbar = document.createElement('div');
            toolbar.className = 'code-toolbar';

            const labelSpan = document.createElement('span');
            labelSpan.className = 'code-toolbar-label';
            labelSpan.textContent = labelText;
            toolbar.appendChild(labelSpan);

            const actions = document.createElement('div');
            actions.className = 'code-toolbar-actions';

            // Botão Python Tutor (só para blocos com código Python real)
            if (block.querySelector('.keyword, .function')) {
                const ptUrl = 'https://pythontutor.com/render.html#code='
                    + encodeURIComponent(codeText)
                    + '&cumulative=false&curInstr=0&heapPrimitives=nevernest'
                    + '&mode=display&origin=opt-frontend.js&py=3'
                    + '&rawInputLstJSON=%5B%5D&textReferences=false';
                const ptBtn = document.createElement('a');
                ptBtn.className = 'code-action-btn';
                ptBtn.href = ptUrl;
                ptBtn.target = '_blank';
                ptBtn.rel = 'noopener noreferrer';
                ptBtn.textContent = '\u25B6 Executar';
                actions.appendChild(ptBtn);
            }

            // Botão Copiar
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-action-btn';
            copyBtn.textContent = 'Copiar';
            copyBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(codeText).then(function() {
                    copyBtn.textContent = '\u2713 Copiado';
                    copyBtn.classList.add('copied');
                    setTimeout(function() {
                        copyBtn.textContent = 'Copiar';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }).catch(function() {
                    // Fallback para navegadores sem clipboard API
                    const ta = document.createElement('textarea');
                    ta.value = codeText;
                    ta.style.cssText = 'position:fixed;opacity:0';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    copyBtn.textContent = '\u2713 Copiado';
                    setTimeout(function() { copyBtn.textContent = 'Copiar'; }, 2000);
                });
            });
            actions.appendChild(copyBtn);

            toolbar.appendChild(actions);
            block.insertBefore(toolbar, block.firstChild);
            block.style.paddingTop = '44px';
        });
    }

    // === CONTROLE DE TAMANHO DE FONTE ===
    function initFontSize() {
        const topBar = document.querySelector('.top-bar');
        if (!topBar) return;

        const wrap = document.createElement('div');
        wrap.className = 'font-controls';
        wrap.innerHTML = '<button class="font-btn" id="fontDec" title="Diminuir fonte">A&#x2212;</button>'
                       + '<button class="font-btn" id="fontInc" title="Aumentar fonte">A+</button>';

        const slideToggle = topBar.querySelector('.slide-toggle');
        slideToggle ? topBar.insertBefore(wrap, slideToggle) : topBar.appendChild(wrap);

        let size = parseFloat(localStorage.getItem('lessonFontSize') || '16');
        document.documentElement.style.fontSize = size + 'px';

        document.getElementById('fontDec').addEventListener('click', function() {
            size = Math.max(13, size - 1);
            document.documentElement.style.fontSize = size + 'px';
            localStorage.setItem('lessonFontSize', size);
        });
        document.getElementById('fontInc').addEventListener('click', function() {
            size = Math.min(22, size + 1);
            document.documentElement.style.fontSize = size + 'px';
            localStorage.setItem('lessonFontSize', size);
        });
    }

    // === MODO ESCURO ===
    function initDarkMode() {
        const topBar = document.querySelector('.top-bar');
        if (!topBar) return;

        const btn = document.createElement('button');
        btn.className = 'dark-toggle';
        btn.id = 'darkToggleBtn';
        btn.title = 'Alternar modo escuro';
        btn.textContent = document.body.classList.contains('dark-mode') ? '\u2600\uFE0F' : '\uD83C\uDF19';

        const fontControls = topBar.querySelector('.font-controls');
        const slideToggle = topBar.querySelector('.slide-toggle');
        if (fontControls) topBar.insertBefore(btn, fontControls);
        else if (slideToggle) topBar.insertBefore(btn, slideToggle);
        else topBar.appendChild(btn);

        btn.addEventListener('click', function() {
            const isDark = document.body.classList.toggle('dark-mode');
            btn.textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
            localStorage.setItem('darkMode', isDark ? '1' : '0');
        });
    }

    // === SERVICE WORKER ===
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(function() {});
    }

    // === INICIALIZAÇÃO ===
    document.addEventListener('DOMContentLoaded', function() {
        initSlideMode();
        initCodeToolbars();
        initFontSize();
        initDarkMode();

        const toggleBtn = document.getElementById('slideToggleBtn');
        if (toggleBtn) toggleBtn.addEventListener('click', enterSlideMode);
    });

    // Expose for external use
    window.slideMode = {
        enter: enterSlideMode,
        exit: exitSlideMode,
        next: nextSlide,
        prev: prevSlide
    };
})();
