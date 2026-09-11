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

    var name = form.querySelector("#full-name");
    var email = form.querySelector("#email");
    var phone = form.querySelector("#phone");
    var propertyType = form.querySelector("#property-type");
    var location = form.querySelector("#property-location");
    var occupancy = form.querySelector("#occupancy");
    var need = form.querySelector("#need");

    if (!name.value.trim()) {
      setInvalid(name, true, "Please enter your full name.");
      valid = false;
    } else {
      setInvalid(name, false);
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
