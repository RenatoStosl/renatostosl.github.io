/* ==========================================================================
   Interações do portfólio — melhoria progressiva: a página funciona sem JS.
   ========================================================================== */

(() => {
  "use strict";

  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* armazenamento indisponível: preferência vale só nesta visita */
      }
    },
  };

  /* TEMA ------------------------------------------------------------------ */
  function initTheme() {
    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    const currentTheme = () =>
      root.dataset.theme || (prefersDark.matches ? "dark" : "light");

    const syncLabel = () => {
      const next = currentTheme() === "dark" ? "claro" : "escuro";
      toggle.setAttribute("aria-label", `Ativar tema ${next}`);
    };

    toggle.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      storage.set("theme", next);
      syncLabel();
    });

    prefersDark.addEventListener("change", syncLabel);
    syncLabel();
  }

  /* MENU MOBILE ----------------------------------------------------------- */
  function initMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const list = document.querySelector("[data-nav-list]");
    if (!button || !list) return;

    const setOpen = (open) => {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      list.classList.toggle("is-open", open);
    };

    button.addEventListener("click", () => {
      setOpen(button.getAttribute("aria-expanded") !== "true");
    });

    list.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && list.classList.contains("is-open")) {
        setOpen(false);
        button.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".nav")) setOpen(false);
    });
  }

  /* HEADER + LINK ATIVO --------------------------------------------------- */
  function initScrollState() {
    const header = document.querySelector("[data-header]");
    const links = [...document.querySelectorAll(".nav-link")];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const onScroll = () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!("IntersectionObserver" in window) || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* REVEAL ON SCROLL ------------------------------------------------------ */
  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    const showAll = () => items.forEach((el) => el.classList.add("is-visible"));

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* COPIAR E-MAIL --------------------------------------------------------- */
  function initCopy() {
    const button = document.querySelector("[data-copy]");
    const label = document.querySelector("[data-copy-label]");
    const status = document.querySelector("[data-copy-status]");
    if (!button || !label) return;

    if (!navigator.clipboard) {
      button.hidden = true;
      return;
    }

    const original = label.textContent;
    let timer;

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        label.textContent = "E-mail copiado";
        button.classList.add("is-copied");
        if (status) status.textContent = "E-mail copiado para a área de transferência.";
      } catch {
        label.textContent = "Não foi possível copiar";
      }

      clearTimeout(timer);
      timer = setTimeout(() => {
        label.textContent = original;
        button.classList.remove("is-copied");
        if (status) status.textContent = "";
      }, 2400);
    });
  }

  /* ANO NO RODAPÉ --------------------------------------------------------- */
  function initYear() {
    const year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  initTheme();
  initMenu();
  initScrollState();
  initReveal();
  initCopy();
  initYear();
})();
