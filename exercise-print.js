/* ═══════════════════════════════════════════════════
   IMPRESSÃO DE ATIVIDADE PRÁTICA
   Abre uma janela limpa, formatada para salvar como PDF
   ═══════════════════════════════════════════════════ */

window.printPractical = function (cardId, aulaTitle) {
    const card = document.getElementById(cardId);
    if (!card) return;

    /* clone para não alterar o DOM original */
    const clone = card.cloneNode(true);
    clone.querySelectorAll('.ex-actions, .btn-print').forEach(el => el.remove());

    const css = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    background: white;
    padding: 28px 36px;
    font-size: 13px;
    line-height: 1.65;
}

/* ── cabeçalho ── */
.ph { border-bottom: 2px solid #1565c0; padding-bottom: 10px; margin-bottom: 16px; }
.ph-school { font-size: 10.5px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
.ph-title { font-size: 17px; font-weight: 700; color: #1565c0; margin-top: 4px; }
.ph-sub   { font-size: 12px; color: #444; margin-top: 2px; }

/* ── campos do aluno ── */
.student-box {
    display: flex; gap: 20px; flex-wrap: wrap;
    background: #f5f5f5; border: 1px solid #ddd;
    border-radius: 6px; padding: 9px 14px;
    margin-bottom: 20px; font-size: 12px;
}
.student-box span { display: flex; align-items: center; gap: 5px; }
.sline { display: inline-block; border-bottom: 1px solid #555; }

/* ── card content reset ── */
h2 { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 10px; }
h2::before { content: none; }

.prat-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.prat-tag  { background: #ede9fe; color: #5b21b6; border-radius: 12px; padding: 2px 10px; font-size: 11px; font-weight: 600; }

.prat-steps { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.prat-step  { display: flex; gap: 12px; align-items: flex-start; page-break-inside: avoid; }
.step-num {
    min-width: 24px; height: 24px;
    background: #6d28d9; color: white;
    border-radius: 50%; display: flex;
    align-items: center; justify-content: center;
    font-weight: 700; font-size: 11px; flex-shrink: 0;
    margin-top: 1px;
}
.step-body  { flex: 1; }
.step-label { font-weight: 700; color: #111; margin-bottom: 2px; font-size: 12px; }
.step-desc  { color: #333; font-size: 12px; }

kbd {
    display: inline-block;
    background: #eee; border: 1px solid #aaa;
    border-bottom-width: 2px; border-radius: 3px;
    padding: 0 5px; font-size: 11px;
    font-family: 'Courier New', monospace; color: #111;
}

.prat-observe {
    background: #f5f3ff; border-left: 4px solid #6d28d9;
    border-radius: 0 6px 6px 0; padding: 10px 14px;
    font-size: 11.5px; color: #3b1d6e; margin-bottom: 16px;
    page-break-inside: avoid;
}

/* ── área de anotações ── */
.answer-section { margin-top: 20px; border-top: 1px dashed #bbb; padding-top: 14px; }
.answer-title   { font-weight: 700; font-size: 12px; color: #444; margin-bottom: 10px; }
.answer-line    { border-bottom: 1px solid #ccc; height: 22px; margin-bottom: 2px; }

/* ── rodapé ── */
.pf { margin-top: 20px; border-top: 1px solid #ddd; padding-top: 7px; font-size: 10px; color: #888; display: flex; justify-content: space-between; }

@media print {
    body { padding: 14px 20px; }
}
`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Roteiro — ${aulaTitle}</title>
<style>${css}</style>
</head>
<body>

<div class="ph">
    <div class="ph-school">IFRN &mdash; Educa&ccedil;&atilde;o em Tecnologias Digitais &middot; T&eacute;cnico em Inform&aacute;tica Integrado</div>
    <div class="ph-title">${aulaTitle}</div>
    <div class="ph-sub">Roteiro de Atividade Pr&aacute;tica</div>
</div>

<div class="student-box">
    <span>Nome:&nbsp;<span class="sline" style="width:160px"></span></span>
    <span>Turma:&nbsp;<span class="sline" style="width:70px"></span></span>
    <span>Data:&nbsp;<span class="sline" style="width:80px"></span></span>
</div>

${clone.innerHTML}

<div class="answer-section">
    <div class="answer-title">&#x1F4DD; Anota&ccedil;&otilde;es</div>
    <div class="answer-line"></div>
    <div class="answer-line"></div>
    <div class="answer-line"></div>
    <div class="answer-line"></div>
    <div class="answer-line"></div>
    <div class="answer-line"></div>
    <div class="answer-line"></div>
    <div class="answer-line"></div>
</div>

<div class="pf">
    <span>Educa&ccedil;&atilde;o em Tecnologias Digitais &mdash; IFRN</span>
    <span>cesarazevedo.github.io/infodigitais</span>
</div>

<script>window.onload = function () { window.print(); }<\/script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
        alert('Permita pop-ups nesta p\u00e1gina para imprimir o roteiro.');
        return;
    }
    win.document.write(html);
    win.document.close();
};
