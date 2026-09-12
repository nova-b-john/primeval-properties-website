(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("is-nav-open", !open);
      var label = toggle.querySelector(".sr-only");
      if (label) label.textContent = open ? "Open menu" : "Close menu";
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        document.body.classList.remove("is-nav-open");
        toggle.focus();
      }
    });
  }

  function closeMobileNav() {
    if (!toggle || !nav) return;
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("is-nav-open");
  }

  function samePagePath(pathname) {
    var current = window.location.pathname.replace(/\/$/, "") || "/";
    var next = pathname.replace(/\/$/, "") || "/";
    return current === next;
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[href]");
    if (!link || link.target === "_blank") return;

    var href = link.getAttribute("href");
    if (!href || href === "#") return;

    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (err) {
      return;
    }

    if (url.origin !== window.location.origin || !samePagePath(url.pathname) || !url.hash) {
      return;
    }

    var target = document.querySelector(url.hash);
    if (!target) return;

    event.preventDefault();
    closeMobileNav();

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(function () {
      target.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start"
      });
      if (history.replaceState) {
        history.replaceState(null, "", url.hash);
      }
    }, 10);
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  document.querySelectorAll(".accordion__trigger").forEach(function (button) {
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      var panelId = button.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;

      document.querySelectorAll(".accordion__trigger").forEach(function (other) {
        if (other === button) return;
        other.setAttribute("aria-expanded", "false");
        var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
        if (otherPanel) otherPanel.classList.remove("is-open");
      });

      button.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.classList.toggle("is-open", !expanded);
    });
  });

  function initWhatWeDo(section) {
    var track = section.querySelector(".what-we-do__track");
    var items = Array.prototype.slice.call(section.querySelectorAll(".what-we-do__item"));
    var dot = section.querySelector(".what-we-do__dot");
    var progress = section.querySelector(".what-we-do__progress");
    if (!track || !items.length || !dot || !progress) return;

    var ticking = false;

    function update() {
      ticking = false;
      if (window.matchMedia("(max-width: 899px)").matches) return;

      var trackRect = track.getBoundingClientRect();
      var trackHeight = track.offsetHeight;
      var anchor = window.innerHeight * 0.42;
      var y = anchor - trackRect.top;
      var minY = 40;
      var maxY = Math.max(minY, trackHeight - 24);

      if (y < minY) y = minY;
      if (y > maxY) y = maxY;

      progress.style.height = y + "px";
      dot.style.top = y + "px";

      var active = items[0];
      for (var i = 0; i < items.length; i++) {
        if (items[i].offsetTop + 40 <= y + 8) active = items[i];
      }
      items.forEach(function (el) {
        el.classList.toggle("is-active", el === active);
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  document.querySelectorAll(".what-we-do").forEach(initWhatWeDo);

  function initAboutFan() {
    var section = document.querySelector(".about-fan");
    var gallery = document.querySelector(".about-fan__gallery");
    if (!section || !gallery) return;

    var track = gallery.querySelector(".about-fan__track");
    if (!track) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll(".about-fan__card"));
    if (!cards.length) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    var heading = document.getElementById("owners-problem");
    var words = [];

    if (heading && !reduce) {
      heading.innerHTML = heading.textContent
        .trim()
        .split(/(\s+)/)
        .map(function (token) {
          if (/^\s+$/.test(token)) return token;
          return '<span class="about-fan__word">' + token + "</span>";
        })
        .join("");
      words = Array.prototype.slice.call(heading.querySelectorAll(".about-fan__word"));
    }

    function updateCopyReveal() {
      if (!heading || !words.length) return;
      var vh = window.innerHeight;
      var top = heading.getBoundingClientRect().top;
      var start = vh * 0.88;
      var end = vh * 0.36;
      var p = (start - top) / (start - end);
      if (p < 0) p = 0;
      if (p > 1) p = 1;

      var n = words.length;
      var last = Math.max(n - 1, 1);
      for (var w = 0; w < n; w++) {
        var local = (p - (w / last) * 0.7) / 0.3;
        if (local < 0) local = 0;
        if (local > 1) local = 1;
        words[w].style.opacity = String(0.16 + local * 0.84);
      }
    }

    function layout() {
      var width = window.innerWidth;
      var cardW = cards[0].offsetWidth;
      var n = cards.length;
      var span = width * 1.16;
      var start = (width - span) / 2;
      var stride = n > 1 ? (span - cardW) / (n - 1) : 0;
      var arc = width < 600 ? 42 : width < 900 ? 64 : 92;
      var rotate = width < 600 ? 5.5 : 7.2;
      var minScale = width < 600 ? 0.84 : 0.78;
      var maxScale = width < 600 ? 1.06 : 1.12;
      var mid = width / 2;

      cards.forEach(function (card, index) {
        var x = start + index * stride;
        var t = (x + cardW / 2 - mid) / (width * 0.52);
        if (t < -1.25) t = -1.25;
        if (t > 1.25) t = 1.25;
        var abs = Math.abs(t);
        var y = arc * (abs * abs);
        var scale = minScale + (maxScale - minScale) * abs;
        var rot = t * rotate;
        var xStart = mid - cardW / 2 + (x - (mid - cardW / 2)) * 0.58;

        card.dataset.t = String(t);
        card.dataset.x = String(x);
        card.dataset.y = String(y);
        card.dataset.rot = String(rot);
        card.dataset.scale = String(scale);
        card.style.setProperty("--tx", x + "px");
        card.style.setProperty("--ty", y + "px");
        card.style.setProperty("--rot", rot + "deg");
        card.style.setProperty("--scale", String(scale));
        card.style.setProperty("--tx-start", xStart + "px");
        card.style.setProperty("--ty-start", y * 0.18 + "px");
        card.style.setProperty("--scale-start", "0.92");
        card.style.setProperty("--delay", index * 70 + "ms");
        card.style.zIndex = String(Math.round(abs * 20));
      });
    }

    layout();
    window.addEventListener("resize", layout);
    window.addEventListener("scroll", updateCopyReveal, { passive: true });
    updateCopyReveal();

    function showFan() {
      gallery.classList.add("is-in");
    }

    if (reduce) {
      showFan();
      return;
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            showFan();
            observer.disconnect();
          });
        },
        { threshold: 0.25 }
      );
      observer.observe(gallery);
    } else {
      showFan();
    }

    if (!canHover) return;

    var inners = cards.map(function (card) {
      return card.querySelector(".about-fan__card-inner");
    });
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var ticking = false;

    function applyParallax() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      cards.forEach(function (card, index) {
        var inner = inners[index];
        if (!inner) return;
        var t = parseFloat(card.dataset.t || "0");
        var strength = 0.35 + Math.abs(t) * 0.65;
        var rot = currentX * 3.2 * strength;
        var dx = currentX * 10 * strength;
        var dy = currentY * 6 * strength;
        inner.style.transform =
          "translate3d(" + dx + "px, " + dy + "px, 0) rotate(" + rot + "deg)";
      });

      ticking = true;
      requestAnimationFrame(applyParallax);
    }

    section.addEventListener(
      "mousemove",
      function (event) {
        var rect = gallery.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        if (targetX < -1) targetX = -1;
        if (targetX > 1) targetX = 1;
        if (targetY < -1) targetY = -1;
        if (targetY > 1) targetY = 1;
      },
      { passive: true }
    );

    section.addEventListener("mouseleave", function () {
      targetX = 0;
      targetY = 0;
    });

    if (!ticking) applyParallax();
  }

  function initWhoWeHelp() {
    var section = document.querySelector(".who-we-help");
    if (!section) return;

    var pin = section.querySelector(".who-we-help__pin");
    var copy = section.querySelector(".who-we-help__copy");
    var inner = section.querySelector(".who-we-help__copy-inner");
    var media = section.querySelector(".who-we-help__media");
    if (!pin || !copy || !inner || !media) return;

    var desktopQuery = window.matchMedia("(min-width: 900px)");
    var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var overflow = 0;
    var ticking = false;

    function canPin() {
      return desktopQuery.matches && !reduceQuery.matches;
    }

    function reset() {
      overflow = 0;
      section.style.height = "";
      copy.style.height = "";
      inner.style.transform = "";
    }

    function update() {
      if (!canPin() || overflow <= 0) return;
      var y = -section.getBoundingClientRect().top;
      if (y < 0) y = 0;
      if (y > overflow) y = overflow;
      inner.style.transform = "translate3d(0, " + -y + "px, 0)";
    }

    function measure() {
      if (!canPin()) {
        reset();
        return;
      }

      inner.style.transform = "none";
      copy.style.height = "auto";
      section.style.height = "auto";

      var viewH = media.offsetHeight;
      if (viewH < 1) return;

      copy.style.height = viewH + "px";
      overflow = Math.max(0, inner.scrollHeight - viewH);
      section.style.height = pin.offsetHeight + overflow + "px";
      update();
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    var img = media.querySelector("img");
    if (img && !img.complete) {
      img.addEventListener("load", measure);
    }

    measure();
  }

  function initValuesScroll() {
    var section = document.querySelector(".values-scroll");
    if (!section) return;

    var items = Array.prototype.slice.call(section.querySelectorAll(".value-row article"));
    var progress = section.querySelector(".values-scroll__progress");
    var dot = section.querySelector(".values-scroll__dot");
    if (!items.length || !progress || !dot) return;

    var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var ticking = false;

    function setActive(index) {
      items.forEach(function (el, i) {
        el.classList.toggle("is-active", i === index);
      });
    }

    function alignSpine(p) {
      var last = Math.max(items.length - 1, 1);
      var scaled = p * last;
      var i0 = Math.floor(scaled);
      var i1 = Math.min(items.length - 1, i0 + 1);
      var frac = scaled - i0;
      var y0 = items[i0].offsetTop + items[i0].offsetHeight / 2;
      var y1 = items[i1].offsetTop + items[i1].offsetHeight / 2;
      var y = y0 + (y1 - y0) * frac;
      progress.style.height = y + "px";
      dot.style.top = y + "px";
    }

    function progressFromViewport() {
      var first = items[0].getBoundingClientRect();
      var lastItem = items[items.length - 1].getBoundingClientRect();
      var firstMid = first.top + first.height / 2;
      var lastMid = lastItem.top + lastItem.height / 2;
      var span = firstMid - lastMid;
      if (span === 0) return 0;
      return (firstMid - window.innerHeight * 0.42) / span;
    }

    function update() {
      if (reduceQuery.matches) return;

      var p = progressFromViewport();
      if (p < 0) p = 0;
      if (p > 1) p = 1;

      var last = Math.max(items.length - 1, 1);
      var index = Math.round(p * last);
      if (index < 0) index = 0;
      if (index > last) index = last;

      setActive(index);
      alignSpine(p);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }

    if (reduceQuery.matches) {
      items.forEach(function (el) {
        el.classList.add("is-active");
      });
      return;
    }

    section.classList.add("is-armed");
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  initAboutFan();
  initWhoWeHelp();
  initValuesScroll();

  var form = document.getElementById("property-enquiry");
  if (!form) return;

  var needField = form.querySelector("#need");
  var status = document.getElementById("form-status");
  var params = new URLSearchParams(window.location.search);
  var needParam = (params.get("need") || "").toLowerCase().trim();

  var needMap = {
    leasing: "property-leasing",
    "property-leasing": "property-leasing",
    management: "property-management",
    "property-management": "property-management",
    "leasing-management": "leasing-management",
    "leasing+management": "leasing-management",
    portfolio: "portfolio-management",
    "portfolio-management": "portfolio-management",
    commercial: "commercial-property-management",
    "commercial-property-management": "commercial-property-management"
  };

  if (needField && needMap[needParam]) {
    needField.value = needMap[needParam];
  }

  function setInvalid(field, invalid, message) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("is-invalid", invalid);
    field.setAttribute("aria-invalid", invalid ? "true" : "false");
    var error = wrap.querySelector(".field__error");
    if (error && message) error.textContent = message;
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isPhone(value) {
    return value.replace(/[^\d+]/g, "").length >= 8;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var valid = true;

    var firstName = form.querySelector("#first-name");
    var lastName = form.querySelector("#last-name");
    var email = form.querySelector("#email");
    var phone = form.querySelector("#phone");
    var propertyType = form.querySelector("#property-type");
    var location = form.querySelector("#property-location");
    var occupancy = form.querySelector("#occupancy");
    var need = form.querySelector("#need");

    if (!firstName.value.trim()) {
      setInvalid(firstName, true, "Please enter your first name.");
      valid = false;
    } else {
      setInvalid(firstName, false);
    }

    if (!lastName.value.trim()) {
      setInvalid(lastName, true, "Please enter your last name.");
      valid = false;
    } else {
      setInvalid(lastName, false);
    }

    if (!isEmail(email.value.trim())) {
      setInvalid(email, true, "Please enter a valid email address.");
      valid = false;
    } else {
      setInvalid(email, false);
    }

    if (!isPhone(phone.value.trim())) {
      setInvalid(phone, true, "Please enter a phone or WhatsApp number.");
      valid = false;
    } else {
      setInvalid(phone, false);
    }

    if (!propertyType.value) {
      setInvalid(propertyType, true, "Please select a property type.");
      valid = false;
    } else {
      setInvalid(propertyType, false);
    }

    if (!location.value.trim()) {
      setInvalid(location, true, "Please enter the property location.");
      valid = false;
    } else {
      setInvalid(location, false);
    }

    if (!occupancy.value) {
      setInvalid(occupancy, true, "Please select occupancy status.");
      valid = false;
    } else {
      setInvalid(occupancy, false);
    }

    if (!need.value) {
      setInvalid(need, true, "Please tell us what you need.");
      valid = false;
    } else {
      setInvalid(need, false);
    }

    if (!valid) {
      var firstInvalid = form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    form.hidden = true;
    if (status) {
      status.classList.add("is-visible");
      status.focus();
    }
  });

  form.addEventListener("input", function (event) {
    var field = event.target;
    if (field && field.closest(".field.is-invalid")) {
      setInvalid(field, false);
    }
  });
})();
