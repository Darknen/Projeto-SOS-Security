/* ==========================================================
   SCRIPT PRINCIPAL — SOS SECURITY (VERSÃO CORRETA E COMENTADA)
   ----------------------------------------------------------
   Este arquivo controla:
   1) Scroll suave com offset (header fixo)
   2) Menu mobile (abre/fecha) + fecha ao clicar em links + fora
   3) Header "active" ao rolar
   4) Formulário de contato (FormSubmit + WhatsApp)
   5) Modal de Orçamento (Premium):
      - abre/fecha modal
      - dropdown múltiplo "Sistemas"
      - mostra campo de CFTV (qtd câmeras) quando marcar CFTV
      - envia mensagem pronta para WhatsApp
   ========================================================== */

/* ==========================================================
   CONFIGURAÇÕES GERAIS
   ========================================================== */
const WHATSAPP_NUMBER = "5521976952138";

/* ==========================================================
   FUNÇÕES UTILITÁRIAS (helpers)
   ========================================================== */

/**
 * Retorna um elemento dentro de um container (scope), sem quebrar se não existir.
 * @param {Element|Document} scope - Onde buscar (ex: form, modal, document)
 * @param {string} selector - Seletor CSS
 */
function qs(scope, selector) {
  return scope ? scope.querySelector(selector) : null;
}

/**
 * Retorna todos os elementos dentro de um container (scope).
 * @param {Element|Document} scope
 * @param {string} selector
 */
function qsa(scope, selector) {
  return scope ? Array.from(scope.querySelectorAll(selector)) : [];
}

/**
 * Pega o valor (trim) de um campo dentro de um container sem quebrar.
 * @param {Element|Document} scope
 * @param {string} selector
 */
function getValue(scope, selector) {
  const el = qs(scope, selector);
  return el ? (el.value || "").trim() : "";
}

/**
 * Abre WhatsApp com uma mensagem pronta.
 * @param {string} text - Mensagem
 */
function openWhatsApp(text) {
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(link, "_blank");
}

/* ==========================================================
   DOM READY
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================
  // 1) SCROLL SUAVE COM OFFSET DO HEADER
  // - Evita que a seção fique escondida atrás do header fixo
  // ==========================================================
  const header = document.querySelector("header");
  const headerHeight = header ? header.offsetHeight : 90;

  qsa(document, 'a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        (headerHeight + 10);

      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // ==========================================================
  // 2) MENU MOBILE (HAMBÚRGUER)
  // - Abre/fecha menu
  // - Fecha ao clicar em qualquer link do menu
  // - Fecha ao clicar fora do menu
  // ==========================================================
  const btn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (btn && nav) {
    // Abre/fecha
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
      btn.textContent = isOpen ? "✕" : "☰";
    });

    // Fecha ao clicar em links do menu
    qsa(nav, 'a[href^="#"]').forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "☰";
      });
    });

    // Fecha se clicar fora
    document.addEventListener("click", (e) => {
      const clickedInside = nav.contains(e.target) || btn.contains(e.target);
      if (!clickedInside) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "☰";
      }
    });
  }

  // ==========================================================
  // 3) FORMULÁRIO DE CONTATO (FormSubmit + WhatsApp)
  // - Envia para FormSubmit (email)
  // - Abre WhatsApp com a mensagem pronta
  // IMPORTANTE:
  // - Pegamos os campos dentro do form (#contactForm)
  //   para não confundir com campos do modal (IDs repetidos).
  // ==========================================================
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Campos do formulário de contato (scoped no form)
      const nome = getValue(contactForm, "#nome");
      const telefone = getValue(contactForm, "#telefone");
      const email = getValue(contactForm, "#email");
      const assunto = getValue(contactForm, "#assunto");
      const mensagem = getValue(contactForm, "#mensagem");

      const texto =
`📩 CONTATO PELO SITE - SOS SECURITY
✅ Assunto: ${assunto}

👤 Nome: ${nome}
📞 Telefone: ${telefone}
✉ Email: ${email}

📝 Mensagem:
${mensagem}`;

      // 3.1) Envia para o e-mail via FormSubmit
      // Obs: se falhar, ainda abrimos WhatsApp (não perde lead)
      const formData = new FormData(contactForm);

      try {
        await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });
      } catch (err) {
        console.error("Falha ao enviar para e-mail (FormSubmit):", err);
      }

      // 3.2) Abre WhatsApp com mensagem pronta
      openWhatsApp(texto);

      // 3.3) Limpa o formulário
      contactForm.reset();
    });
  }

  // ==========================================================
  // 4) MODAL DE ORÇAMENTO (Premium)
  // ==========================================================
  initBudgetModal();
});

/* ==========================================================
   3) HEADER "ACTIVE" AO ROLAR (fora do DOMReady)
   - Dá sensação premium e melhora contraste
   ========================================================== */
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  const hero = document.querySelector(".hero");
  if (!header || !hero) return;

  if (window.scrollY > hero.offsetHeight - 80) header.classList.add("active");
  else header.classList.remove("active");
});

/* ==========================================================
   4) MODAL ORÇAMENTO — FUNÇÃO PRINCIPAL
   ========================================================== */
function initBudgetModal() {
  const abrirBtn = document.getElementById("abrirOrcamento");
  const modal = document.getElementById("modalOrcamento");
  const fecharBtn = document.getElementById("fecharModal");
  const form = document.getElementById("formOrcamentoModal");

  if (!abrirBtn || !modal || !form) return;

  // Elementos do dropdown múltiplo (Sistemas)
  const sistemasTrigger = document.getElementById("sistemasTrigger");
  const sistemasPanel = document.getElementById("sistemasPanel");
  const sistemasLabel = document.getElementById("sistemasLabel");
  const sistemasHidden = document.getElementById("sistemasHidden");

  // Bloco CFTV (opcional)
  const cftvBlock = document.getElementById("cftvBlock");
  const qtdSelect = document.getElementById("qtdCameras");
  const qtdOutroBlock = document.getElementById("qtdOutroBlock");
  const qtdOutroInput = document.getElementById("qtdCamerasOutro");

  // Helper: trava o scroll do site quando modal abre
  const lockScroll = (lock) => {
    document.body.style.overflow = lock ? "hidden" : "";
  };

  // Abre o modal
  const openModal = () => {
    modal.style.display = "flex";
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    lockScroll(true);

    // começa no topo do modal (se tiver scroll)
    const panel = qs(modal, ".modal__panel");
    panel?.scrollTo({ top: 0 });

    // foco no primeiro campo
    const first = modal.querySelector("input, select, textarea, button");
    if (first) first.focus();
  };

  // Fecha o modal
  const closeModal = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    lockScroll(false);
    setTimeout(() => {
      modal.style.display = "none";
    }, 150);

    // fecha o painel de sistemas
    sistemasPanel?.classList.remove("open");
    sistemasTrigger?.setAttribute("aria-expanded", "false");
  };

  // Clique para abrir
  abrirBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  // Clique no X
  fecharBtn?.addEventListener("click", closeModal);

  // Clique fora do conteúdo fecha
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC fecha
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") closeModal();
  });

  /* ----------------------------------------------------------
     DROPDOWN MÚLTIPLO — SISTEMAS
     - abre/fecha
     - mantém organizado: texto "X selecionado(s)"
     - preenche hidden para validação/WhatsApp
     - detecta CFTV marcado (para mostrar qtd câmeras)
  ---------------------------------------------------------- */

  const getSysChecks = () => qsa(sistemasPanel, "input[type='checkbox']");

  function refreshSistemas() {
    const checks = getSysChecks();
    const selecionados = checks.filter((c) => c.checked).map((c) => c.value);

    // Atualiza label do trigger
    if (sistemasLabel) {
      sistemasLabel.textContent =
        selecionados.length > 0
          ? `${selecionados.length} sistema(s) selecionado(s)`
          : "Selecione os sistemas";
    }

    // Atualiza hidden (para required e mensagem)
    if (sistemasHidden) sistemasHidden.value = selecionados.join(", ");

    // Verifica se tem CFTV
    const hasCFTV = checks.some((c) => c.checked && c.dataset.key === "cftv");
    if (cftvBlock) cftvBlock.style.display = hasCFTV ? "block" : "none";

    // Se tirou CFTV, limpa campos de quantidade
    if (!hasCFTV) {
      if (qtdSelect) qtdSelect.value = "";
      if (qtdOutroInput) qtdOutroInput.value = "";
      if (qtdOutroBlock) qtdOutroBlock.style.display = "none";
    }
  }

  // Abrir/fechar painel
  if (sistemasTrigger && sistemasPanel) {
    sistemasTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = sistemasPanel.classList.toggle("open");
      sistemasTrigger.setAttribute("aria-expanded", String(isOpen));
    });

    // Não fecha ao clicar dentro
    sistemasPanel.addEventListener("click", (e) => e.stopPropagation());

    // Fecha ao clicar fora (enquanto modal aberto)
    document.addEventListener("click", () => {
      if (modal.style.display !== "flex") return;
      sistemasPanel.classList.remove("open");
      sistemasTrigger.setAttribute("aria-expanded", "false");
    });

    // Atualiza quando marca/desmarca
    getSysChecks().forEach((c) => c.addEventListener("change", refreshSistemas));
  }

  // Qtd câmeras: mostra "Outro" quando selecionar
  if (qtdSelect) {
    qtdSelect.addEventListener("change", () => {
      const isOutro = qtdSelect.value === "Outro";
      if (qtdOutroBlock) qtdOutroBlock.style.display = isOutro ? "block" : "none";
      if (!isOutro && qtdOutroInput) qtdOutroInput.value = "";
    });
  }

  // Estado inicial
  refreshSistemas();

  /* ----------------------------------------------------------
     SUBMIT DO MODAL — ENVIA PARA WHATSAPP
     IMPORTANTÍSSIMO:
     - Pegamos valores dentro do FORM do modal (scope = form)
       para não confundir com o formulário de contato (IDs iguais).
  ---------------------------------------------------------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Atualiza sistemas antes de validar/enviar
    refreshSistemas();

    // Se não selecionou sistemas, foca no dropdown e não envia
    if (sistemasHidden && !sistemasHidden.value.trim()) {
      sistemasTrigger?.focus();
      return;
    }

    // Campos do modal (scoped no form!)
    const nome = getValue(form, "#nome");
    const telefone = getValue(form, "#telefone");
    const email = getValue(form, "#email");
    const contatoPref = getValue(form, "#contatoPref");
    const imovel = getValue(form, "#imovel");

    const rua = getValue(form, "#rua");
    const numero = getValue(form, "#numero");
    const complemento = getValue(form, "#complemento");
    const bairro = getValue(form, "#bairro");
    const cidade = getValue(form, "#cidade");
    const estado = getValue(form, "#estado");

    const sistemas = sistemasHidden ? sistemasHidden.value.trim() : "";

    const tipoAtendimento = getValue(form, "#tipoAtendimento");
    const urgencia = getValue(form, "#urgencia");
    const descricao = getValue(form, "#descricao");

    // Qtd câmeras (opcional)
    const hasCFTV = sistemas.includes("CFTV");
    let qtdCameras = "N/A";
    if (hasCFTV) {
      const sel = getValue(form, "#qtdCameras");
      if (!sel) qtdCameras = "Não informado";
      else if (sel === "Outro") qtdCameras = getValue(form, "#qtdCamerasOutro") || "Não informado";
      else qtdCameras = sel;
    }

    const endereco = `${rua}, ${numero} - ${complemento} - ${bairro} - ${cidade}/${estado}`;

    const texto =
`📋 ORÇAMENTO TÉCNICO - SOS SECURITY

👤 Cliente: ${nome}
📞 Telefone/WhatsApp: ${telefone}
✉ E-mail: ${email || "Não informado"}
💬 Preferência de contato: ${contatoPref}

🏢 Tipo de imóvel: ${imovel}
📍 Endereço: ${endereco}

🛠 Sistemas: ${sistemas}
📷 Qtd câmeras: ${qtdCameras}

🔧 Atendimento: ${tipoAtendimento}
⏱ Urgência: ${urgencia}

📝 Problema/necessidade:
${descricao}`;

    // Abre WhatsApp
    openWhatsApp(texto);

    // Limpa e fecha
    form.reset();
    refreshSistemas();
    closeModal();
  });
}