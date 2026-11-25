(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header state */
  var header = document.querySelector(".site-header");
  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* Mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-links");
  if (toggle && menu) {
    var closeMenu = function (restoreFocus) {
      if (!menu.classList.contains("is-open")) return;
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "打开菜单");
      if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener("click", function () {
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu(true);
    });

    document.addEventListener("click", function (event) {
      if (
        menu.classList.contains("is-open") &&
        !menu.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMenu(false);
      }
    });

    window.matchMedia("(min-width: 921px)").addEventListener("change", function (event) {
      if (event.matches) closeMenu(false);
    });
  }

  /* Scroll reveal */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (revealItems.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
      );
      revealItems.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  /* Copy command */
  var copyButtons = Array.prototype.slice.call(document.querySelectorAll("[data-copy]"));
  copyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy") || "";
      var label = button.querySelector(".copy-label");
      var resetTimer;

      var done = function (ok) {
        if (!ok) return;
        var status = document.querySelector("[data-copy-status]");
        button.classList.add("is-copied");
        if (label) label.textContent = "已复制";
        if (status) status.textContent = "命令已复制到剪贴板";

        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
          button.classList.remove("is-copied");
          if (label) label.textContent = "复制";
          if (status) status.textContent = "";
        }, 2200);
      };

      var legacyCopy = function () {
        var field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.top = "-1000px";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        var ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (error) {
          ok = false;
        }
        document.body.removeChild(field);
        done(ok);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          function () {
            done(true);
          },
          legacyCopy
        );
      } else {
        legacyCopy();
      }
    });
  });

  /* Pointer spotlight on capability cards */
  if (window.matchMedia("(hover: hover)").matches && !reducedMotion) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", event.clientX - rect.left + "px");
        card.style.setProperty("--my", event.clientY - rect.top + "px");
      });
    });
  }

  /* Current year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
