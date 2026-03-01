/* =====================================================
   SCRIPT PRINCIPAL - SOS SECURITY
   Funções:
   1) Scroll suave (com offset do header fixo)
   2) Header "active" ao rolar
   3) Formulário: envia e-mail (FormSubmit) + abre WhatsApp
   4) Menu mobile: abre/fecha e fecha ao clicar em um item
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  console.log("SOS Security site carregado com sucesso.");

  // =========================
  // 1) SCROLL SUAVE COM OFFSET
  // - Evita esconder o topo da seção atrás do header fixo
  // =========================
  const header = document.querySelector("header");
  const headerHeight = header ? header.offsetHeight : 90;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - (headerHeight + 10);

      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // =========================
  // 2) MENU MOBILE (HAMBÚRGUER)
  // =========================
  const btn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (btn && nav) {
    btn.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
      btn.textContent = isOpen ? "✕" : "☰";
    });

    // Fecha menu ao clicar em qualquer link
    nav.querySelectorAll

    // Fecha menu se clicar fora (mobile)
    document.addEventListener("click", (e) => {
      const clickedInside = nav.contains(e.target) || btn.contains(e.target);
      if (!clickedInside) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "☰";
      }
    });
  }

  // =========================
  // 3) FORMULÁRIO: E-mail + WhatsApp
  // =========================
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nome = document.getElementById("nome").value.trim();
      const telefone = document.getElementById("telefone").value.trim();
      const email = document.getElementById("email").value.trim();
      const assunto = document.getElementById("assunto").value.trim();
      const mensagem = document.getElementById("mensagem").value.trim();

      const texto =
`📩 CONTATO PELO SITE - SOS SECURITY
✅ Assunto: ${assunto}

👤 Nome: ${nome}
📞 Telefone: ${telefone}
✉ Email: ${email}

📝 Mensagem:
${mensagem}`;

      // 3.1) Envia para o e-mail via FormSubmit
      // Observação: o FormSubmit pode exigir confirmação do e-mail na primeira vez.
      const formData = new FormData(form);

      try {
        await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { "Accept": "application/json" }
        });
      } catch (err) {
        // Mesmo se falhar, ainda abre WhatsApp para não perder o lead
        console.error("Falha ao enviar para e-mail:", err);
      }

      // 3.2) Abre WhatsApp com mensagem pronta
      const whatsappNumber = "5521976952138";
      const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(texto)}`;
      window.open(waLink, "_blank");

      // 3.3) Limpa o formulário
      form.reset();
    });
  }
});

// =========================
// 4) HEADER "ACTIVE" AO ROLAR
// - Dá sensação premium e melhora contraste
// =========================
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  const hero = document.querySelector(".hero");
  if (!header || !hero) return;

  if (window.scrollY > hero.offsetHeight - 80) header.classList.add("active");
  else header.classList.remove("active");
});