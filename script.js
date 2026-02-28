document.addEventListener("DOMContentLoaded", function () {
    console.log("SOS Security site carregado com sucesso.");

    // Scroll suave
    const links = document.querySelectorAll("nav a");

    links.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            target.scrollIntoView({ behavior: "smooth" });
        });
    });
});
// Header deixa de ser transparente após a HERO

window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    const hero = document.querySelector(".hero");

    if (window.scrollY > hero.offsetHeight - 80) {
        header.classList.add("active");
    } else {
        header.classList.remove("active");
    }
});
// Formulário: envia para e-mail (FormSubmit) e abre WhatsApp com mensagem pronta
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

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

    // 1) Envia para o e-mail via FormSubmit
    // (usa a action do form)
    const formData = new FormData(form);
    try {
      await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      });
    } catch (err) {
      // mesmo se falhar, ainda abre o WhatsApp para não perder o lead
      console.error("Falha ao enviar para e-mail:", err);
    }

    // 2) Abre WhatsApp com a mensagem pronta
    const whatsappNumber = "5521976952138";
    const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(texto)}`;
    window.open(waLink, "_blank");

    // 3) Limpa o formulário
    form.reset();
  });
});