/* ============================================================
   Musse — interactions & catalog
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     Contacts — единая точка правды.
     ⚠ Перед деплоем заменить на реальные данные заказчика (TZ §10).
     ---------------------------------------------------------- */
  var TELEGRAM_USER = "musse_tashkent"; // TODO: реальный аккаунт

  /* ----------------------------------------------------------
     Force scroll to top (0, 0) on page refresh / F5 reload
     ---------------------------------------------------------- */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.addEventListener("beforeunload", function () {
    window.scrollTo(0, 0);
  });
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  /* ----------------------------------------------------------
     Giant Typography Preloader (3-Second Script + Lock Scroll)
     ---------------------------------------------------------- */
  var preloader = document.getElementById("preloader");
  var preloaderCount = document.getElementById("preloader-count");
  var preloaderBar = document.getElementById("preloader-bar");

  if (preloader) {
    document.body.classList.add("preloader-active");
    document.documentElement.classList.add("preloader-active");

    var DURATION = 3000;
    var startTime = performance.now();

    function updatePreloader(now) {
      var elapsed = now - startTime;
      var pct = Math.min(100, Math.floor((elapsed / DURATION) * 100));

      if (preloaderCount) {
        preloaderCount.textContent = pct < 10 ? "0" + pct : String(pct);
      }
      if (preloaderBar) {
        preloaderBar.style.width = pct + "%";
      }

      if (elapsed < DURATION) {
        requestAnimationFrame(updatePreloader);
      } else {
        if (preloaderCount) preloaderCount.textContent = "100";
        if (preloaderBar) preloaderBar.style.width = "100%";
        setTimeout(function () {
          preloader.classList.add("is-revealed");
          document.body.classList.remove("preloader-active");
          document.documentElement.classList.remove("preloader-active");
        }, 150);
      }
    }

    requestAnimationFrame(updatePreloader);
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     Header: shrink + frosted background on scroll
     ---------------------------------------------------------- */
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------- */
  var burger = document.querySelector(".burger");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (burger && mobileMenu) {
    var setMenu = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      mobileMenu.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    mobileMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) setMenu(false);
    });
  }

  /* ----------------------------------------------------------
     Scroll-reveal (IntersectionObserver)
     ---------------------------------------------------------- */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  function observeReveals(root) {
    (root || document)
      .querySelectorAll(".reveal, .reveal-left, .reveal-card")
      .forEach(function (el) { revealObserver.observe(el); });
  }
  observeReveals();

  /* ----------------------------------------------------------
     Light parallax for venue photos (5–10% offset)
     ---------------------------------------------------------- */
  var parallaxEls = document.querySelectorAll("[data-parallax]");
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    var applyParallax = function () {
      ticking = false;
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var progress = (rect.top + rect.height / 2 - vh / 2) / vh; // -0.5..0.5
        var shift = Math.max(-1, Math.min(1, progress)) * -(rect.height * 0.07);
        el.style.transform = "translateY(" + shift.toFixed(1) + "px)";
      });
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(applyParallax); }
    }, { passive: true });
    applyParallax();
  }

  /* ----------------------------------------------------------
     Telegram deeplink with pre-filled message
     ---------------------------------------------------------- */
  function tgOrderLink(productName) {
    var msg = "Здравствуйте! Хочу заказать «" + productName + "»";
    return "https://t.me/" + TELEGRAM_USER + "?text=" + encodeURIComponent(msg);
  }

  /* ==========================================================
     Catalog data — Фаза 1: статично (TZ §5.4).
     Фаза 2: этот массив заменяется fetch'ем из админ-панели.
     available: true → «В наличии», false → «Нет в наличии»
     ========================================================== */
  var PRODUCTS = [
    // — Муссовые торты —
    { id: "cake-kashtan", cat: "cakes", name: "Каштан",
      desc: "Каштановый мусс, ваниль, хрустящее пралине",
      price: 320000, available: true, photo: "img/cake_kashtan.png",
      flavor: { top: "Шоколадно-ореховый гляссаж", heart: "Каштановый мусс на французский манер", base: "Хрустящее пралине с ванилью" },
      art: { type: "cake", glaze: "#8A6648", body: "#EFDCC3", garnish: ["#5C3A28", "#C4956A", "#9F6B73"] } },
    { id: "cake-strawberry-pistachio", cat: "cakes", name: "Клубника-фисташка",
      desc: "Фисташковый мусс, клубничное конфи, миндальный бисквит",
      price: 340000, available: true, photo: "img/cake_strawberry.png",
      flavor: { top: "Клубничный велюр и лепестки фисташки", heart: "Воздушный фисташковый мусс", base: "Сочное конфи и миндальный сабле" },
      art: { type: "cake", glaze: "#D9A6A0", body: "#F3E9D2", garnish: ["#A9B594", "#C97B74", "#A9B594"] } },
    { id: "cake-mango", cat: "cakes", name: "Манго-маракуйя",
      desc: "Тропический мусс, кокосовый бисквит, цветочный мёд",
      price: 330000, available: false, photo: "img/hero.png",
      flavor: { top: "Тропическое зеркало", heart: "Мусс из спелого манго и маракуйи", base: "Кокосовый дакуаз" },
      art: { type: "cake", glaze: "#E0A964", body: "#F6ECD8", garnish: ["#C4956A", "#E0A964", "#A9B594"] } },
    { id: "cake-three-choc", cat: "cakes", name: "Три шоколада",
      desc: "Тёмный, молочный и белый шоколад, какао-бисквит",
      price: 310000, available: true, photo: "img/cake_three_choc.png",
      flavor: { top: "Глянцевый шоко-глассаж", heart: "Мусс из тёмного и молочного шоколада", base: "Воздушный мусс из белого шоколада" },
      art: { type: "cake", glaze: "#5C3A28", body: "#E9D5BD", garnish: ["#8A6648", "#5C3A28", "#C4956A"] } },

    // — Эклеры —
    { id: "eclair-vanilla", cat: "eclairs", name: "Эклер «Ваниль»",
      desc: "Заварной крем с мадагаскарской ванилью",
      price: 28000, available: true, photo: "img/promo_eclairs.png",
      flavor: { top: "Золотистая глазурь", heart: "Нежный крем с семенами мадагаскарской ванили", base: "Заварное тесто Choux" },
      art: { type: "eclair", glaze: "#E8C988", sprinkle: "#C4956A" } },
    { id: "eclair-pistachio", cat: "eclairs", name: "Эклер «Фисташка»",
      desc: "Фисташковый крем, рубленые орехи",
      price: 32000, available: true, photo: "img/promo_eclairs.png",
      flavor: { top: "Фисташковая помадка", heart: "Заварной крем с натуральной фисташковой пастой", base: "Дробленый изумрудный фисташка" },
      art: { type: "eclair", glaze: "#A9B594", sprinkle: "#7E8F6E" } },
    { id: "eclair-lemon", cat: "eclairs", name: "Эклер «Лимон»",
      desc: "Лимонный курд, лёгкая меренга",
      price: 30000, available: true, photo: "img/promo_eclairs.png",
      flavor: { top: "Опаленная швейцарская меренга", heart: "Освежающий цитрусовый курд", base: "Заварное тесто Choux" },
      art: { type: "eclair", glaze: "#E6C98A", sprinkle: "#FDF8F3" } },
    { id: "eclair-berry", cat: "eclairs", name: "Эклер «Ягодный»",
      desc: "Крем с малиной и чёрной смородиной",
      price: 30000, available: false, photo: "img/promo_eclairs.png",
      flavor: { top: "Ягодный гляссаж", heart: "Малиново-смородиновый заварной крем", base: "Заварное тесто" },
      art: { type: "eclair", glaze: "#9F6B73", sprinkle: "#D9A6A0" } },

    // — Тарты и пирожные —
    { id: "tart-lemon", cat: "tarts", name: "Лимонный тарт",
      desc: "Песочная основа, лимонный курд, меренга",
      price: 45000, available: true, photo: "img/promo_tart.png",
      flavor: { top: "Карамелизованные пики меренги", heart: "Яркий сицилийский лимонный курд", base: "Хрустящий песчаный сабле" },
      art: { type: "tart", fill: "#E6C98A", garnish: ["#F9EDD4", "#F1DFBC", "#F9EDD4"] } },
    { id: "tart-berry", cat: "tarts", name: "Ягодный тарт",
      desc: "Миндальный крем, сезонные ягоды",
      price: 48000, available: true, photo: "img/promo_tart.png",
      flavor: { top: "Свежая фермерская клубника", heart: "Запеченный миндальный франжипан", base: "Песочное корзиночное тесто" },
      art: { type: "tart", fill: "#EFDCC3", garnish: ["#9F6B73", "#C97B74", "#5C3A28", "#D9A6A0"] } },
    { id: "tart-caramel", cat: "tarts", name: "Карамельный тарт",
      desc: "Солёная карамель, шоколадный ганаш",
      price: 46000, available: true, photo: "img/promo_tart.png",
      flavor: { top: "Какао-порошок и кристаллы соли", heart: "Тягучая солёная карамель", base: "Ганаш из тёмного шоколада 70%" },
      art: { type: "tart", fill: "#C4956A", garnish: ["#5C3A28", "#8A6648", "#5C3A28"] } },

    // — Наборы —
    { id: "set-eclairs", cat: "sets", name: "Набор эклеров",
      desc: "8 эклеров: ваниль, фисташка, лимон, ягоды",
      price: 220000, available: true, photo: "img/promo_eclairs.png",
      flavor: { top: "4 фирменных вкуса", heart: "Ассорти 8 свежих эклеров", base: "Подарочная фирменная коробка" },
      art: { type: "set", kind: "eclairs", colors: ["#E8C988", "#A9B594", "#E6C98A", "#9F6B73"] } },
    { id: "set-tarts", cat: "sets", name: "Набор тартов",
      desc: "6 мини-тартов: лимон, ягоды, карамель",
      price: 260000, available: true, photo: "img/promo_tart.png",
      flavor: { top: "6 мини-тартов", heart: "Лимон, ягоды, солёная карамель", base: "Крафтовая упаковка" },
      art: { type: "set", kind: "tarts", colors: ["#E6C98A", "#9F6B73", "#C4956A"] } },
    { id: "set-mix", cat: "sets", name: "Микс-набор",
      desc: "10 десертов: эклеры и мини-тарты на выбор",
      price: 290000, available: false, photo: "img/hero.png",
      flavor: { top: "Большой праздничный сет", heart: "10 десертов на выбор", base: "Брендированная подарочная лента" },
      art: { type: "set", kind: "mix", colors: ["#E8C988", "#A9B594", "#9F6B73", "#C4956A"] } },
  ];

  /* ----------------------------------------------------------
     SVG art placeholders.
     ⚠ После фотосъёмки заменить на <img src="..." alt="...">
       (студийные фото 4:5, светлый фон — TZ §5.2).
     ---------------------------------------------------------- */
  function svgOpen() {
    return '<svg viewBox="0 0 400 500" role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">';
  }

  function artCake(a) {
    var g = a.garnish;
    return svgOpen() +
      '<ellipse cx="200" cy="430" rx="125" ry="13" fill="rgba(44,24,16,0.07)"/>' +
      '<ellipse cx="200" cy="408" rx="145" ry="16" fill="#F1E6D4"/>' +
      '<rect x="92" y="262" width="216" height="138" rx="26" fill="' + a.body + '"/>' +
      '<path d="M92 288c0-14 12-26 26-26h164c14 0 26 12 26 26v22c0 6-5 11-11 11-9 0-9 26-19 26s-9-20-19-20-9 12-19 12-10-30-20-30-9 16-19 16-10-22-20-22-9 26-19 26-9-14-19-14-10 18-20 18c-6 0-11-5-11-11v-34z" fill="' + a.glaze + '"/>' +
      '<ellipse cx="155" cy="282" rx="46" ry="9" fill="rgba(255,255,255,0.28)"/>' +
      '<circle cx="170" cy="250" r="11" fill="' + g[0] + '"/>' +
      '<circle cx="199" cy="244" r="13" fill="' + g[1] + '"/>' +
      '<circle cx="228" cy="251" r="10" fill="' + g[2] + '"/>' +
      '<path d="M236 236c10-7 21-7 26-2-7 6-18 8-26 2z" fill="#A9B594"/>' +
      '</svg>';
  }

  function artEclair(a) {
    var dots = "";
    for (var i = 0; i < 5; i++) {
      dots += '<circle cx="' + (130 + i * 38) + '" cy="262" r="9" fill="#F8EDDC"/>';
    }
    var sprinkles =
      '<circle cx="160" cy="218" r="3.5" fill="' + a.sprinkle + '"/>' +
      '<circle cx="210" cy="210" r="3" fill="' + a.sprinkle + '"/>' +
      '<circle cx="258" cy="216" r="3.5" fill="' + a.sprinkle + '"/>';
    return svgOpen() +
      '<ellipse cx="200" cy="330" rx="135" ry="13" fill="rgba(44,24,16,0.07)"/>' +
      '<g transform="rotate(-14 200 250)">' +
      '<rect x="78" y="222" width="244" height="82" rx="41" fill="#E8D3B4"/>' +
      dots +
      '<rect x="84" y="196" width="232" height="52" rx="26" fill="' + a.glaze + '"/>' +
      '<ellipse cx="150" cy="212" rx="42" ry="7" fill="rgba(255,255,255,0.3)"/>' +
      sprinkles +
      '</g></svg>';
  }

  function artTart(a) {
    var garnish = "";
    var xs = [160, 200, 240, 182, 222];
    for (var i = 0; i < a.garnish.length && i < 5; i++) {
      garnish += '<circle cx="' + xs[i] + '" cy="' + (262 - (i % 2) * 14) + '" r="' + (13 - (i % 3) * 2) + '" fill="' + a.garnish[i] + '"/>';
    }
    var flutes = "";
    for (var j = 0; j < 10; j++) {
      flutes += '<line x1="' + (108 + j * 20.5) + '" y1="302" x2="' + (108 + j * 20.5) + '" y2="352" stroke="#C7A476" stroke-width="2"/>';
    }
    return svgOpen() +
      '<ellipse cx="200" cy="392" rx="130" ry="13" fill="rgba(44,24,16,0.07)"/>' +
      '<ellipse cx="200" cy="372" rx="148" ry="15" fill="#F1E6D4"/>' +
      '<rect x="96" y="298" width="208" height="62" rx="10" fill="#D9B98C"/>' +
      flutes +
      '<rect x="104" y="280" width="192" height="26" rx="10" fill="' + a.fill + '"/>' +
      garnish +
      '<path d="M246 236c11-8 23-8 28-2-7 7-19 9-28 2z" fill="#A9B594"/>' +
      '</svg>';
  }

  function artSet(a) {
    var items = "";
    var c = a.colors;
    if (a.kind === "eclairs") {
      for (var i = 0; i < 8; i++) {
        var col = i % 2, row = Math.floor(i / 2);
        items += '<rect x="' + (118 + col * 92) + '" y="' + (158 + row * 62) + '" width="72" height="34" rx="17" fill="' + c[i % c.length] + '"/>';
      }
    } else if (a.kind === "tarts") {
      for (var t = 0; t < 6; t++) {
        var tc = t % 2, tr = Math.floor(t / 2);
        items += '<circle cx="' + (152 + tc * 96) + '" cy="' + (180 + tr * 82) + '" r="30" fill="#D9B98C"/>' +
                 '<circle cx="' + (152 + tc * 96) + '" cy="' + (180 + tr * 82) + '" r="21" fill="' + c[t % c.length] + '"/>';
      }
    } else {
      items =
        '<rect x="116" y="156" width="76" height="34" rx="17" fill="' + c[0] + '"/>' +
        '<rect x="208" y="156" width="76" height="34" rx="17" fill="' + c[1] + '"/>' +
        '<circle cx="150" cy="248" r="28" fill="#D9B98C"/><circle cx="150" cy="248" r="19" fill="' + c[2] + '"/>' +
        '<circle cx="250" cy="248" r="28" fill="#D9B98C"/><circle cx="250" cy="248" r="19" fill="' + c[3] + '"/>' +
        '<rect x="116" y="312" width="76" height="34" rx="17" fill="' + c[1] + '"/>' +
        '<rect x="208" y="312" width="76" height="34" rx="17" fill="' + c[3] + '"/>';
    }
    return svgOpen() +
      '<ellipse cx="200" cy="430" rx="150" ry="13" fill="rgba(44,24,16,0.07)"/>' +
      '<rect x="84" y="112" width="232" height="306" rx="20" fill="#DCC6A6"/>' +
      '<rect x="98" y="126" width="204" height="278" rx="14" fill="#F5EBDB"/>' +
      items +
      // kraft label with twine — фирменный мотив
      '<line x1="284" y1="96" x2="306" y2="124" stroke="#B89B76" stroke-width="2"/>' +
      '<g transform="rotate(8 316 134)">' +
      '<rect x="288" y="112" width="56" height="40" rx="4" fill="#E9D9BF" stroke="#C4956A" stroke-width="1"/>' +
      '<text x="316" y="139" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="22" fill="#8A6648">M</text>' +
      '</g></svg>';
  }

  function productArt(p) {
    if (p.photo) {
      return '<img src="' + p.photo + '" alt="' + p.name + '" loading="lazy">';
    }
    switch (p.art.type) {
      case "cake":   return artCake(p.art);
      case "eclair": return artEclair(p.art);
      case "tart":   return artTart(p.art);
      case "set":    return artSet(p.art);
      default:       return svgOpen() + "</svg>";
    }
  }

  /* ----------------------------------------------------------
     Quick View Modal Logic
     ---------------------------------------------------------- */
  var modalBackdrop = document.getElementById("quick-view-modal");
  function openModal(p) {
    if (!modalBackdrop) return;
    var mediaEl = modalBackdrop.querySelector(".modal-media");
    var titleEl = modalBackdrop.querySelector(".modal-title");
    var descEl = modalBackdrop.querySelector(".modal-desc");
    var flavorBox = modalBackdrop.querySelector(".modal-flavor-container");
    var priceEl = modalBackdrop.querySelector(".modal-price");
    var actionBox = modalBackdrop.querySelector(".modal-action");

    if (mediaEl) mediaEl.innerHTML = productArt(p);
    if (titleEl) titleEl.textContent = p.name;
    if (descEl) descEl.textContent = p.desc;
    if (priceEl) priceEl.textContent = p.price.toLocaleString("ru-RU").replace(/ /g, " ") + " сум";

    if (flavorBox) {
      if (p.flavor) {
        flavorBox.innerHTML =
          '<div class="flavor-pyramid">' +
            '<div class="flavor-pyramid-title">Пирамида вкуса</div>' +
            '<div class="flavor-row"><span class="flavor-layer">Верх</span><span class="flavor-val">' + p.flavor.top + '</span></div>' +
            '<div class="flavor-row"><span class="flavor-layer">Сердце</span><span class="flavor-val">' + p.flavor.heart + '</span></div>' +
            '<div class="flavor-row"><span class="flavor-layer">База</span><span class="flavor-val">' + p.flavor.base + '</span></div>' +
          '</div>';
      } else {
        flavorBox.innerHTML = "";
      }
    }

    if (actionBox) {
      var tgSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15" style="display:inline-block; vertical-align:-2px; margin-right:6px;"><path d="M21.5 4.5 2.9 11.7c-.8.3-.8 1.4 0 1.7l4.6 1.5 1.7 5.2c.2.7 1.1.9 1.6.4l2.5-2.4 4.7 3.5c.6.4 1.4.1 1.6-.6l3-15c.2-.9-.7-1.6-1.6-1.3Z"/><path d="m7.5 14.9 9.8-7.6"/></svg>';
      actionBox.innerHTML = p.available
        ? '<a class="btn btn-primary modal-order-btn" href="' + tgOrderLink(p.name) + '" target="_blank" rel="noopener">' + tgSvg + '<span>Заказать</span></a>'
        : '<span class="btn modal-order-btn" aria-disabled="true">Нет в наличии</span>';
    }

    modalBackdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", function (e) {
      if (e.target === modalBackdrop || e.target.closest(".modal-close")) {
        closeModal();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalBackdrop.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  /* ----------------------------------------------------------
     Menu page: render + filter
     ---------------------------------------------------------- */
  var grid = document.getElementById("product-grid");
  if (grid) {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab-pill, .tab"));
    var indicator = document.querySelector(".tab-indicator");
    var tabsBar = document.querySelector(".tabs, .tabs-pill-bar");

    var formatPrice = function (n) {
      return n.toLocaleString("ru-RU").replace(/ /g, " ") + " сум";
    };

    var renderCard = function (p, index) {
      var card = document.createElement("article");
      card.className = "product-card reveal-card" + (p.available ? "" : " is-unavailable");
      card.style.setProperty("--d", (index * 0.1) + "s");
      card.style.cursor = "pointer";

      var badge = p.available
        ? '<span class="badge badge-ok"><span class="badge-dot"></span>В наличии</span>'
        : '<span class="badge badge-na">Под заказ</span>';

      var cta = p.available
        ? '<a class="btn btn-primary" href="' + tgOrderLink(p.name) + '" target="_blank" rel="noopener">Заказать</a>'
        : '<span class="btn" aria-disabled="true">Заказать</span>';

      card.innerHTML =
        '<div class="card-media">' + productArt(p) + badge + "</div>" +
        '<div class="card-body">' +
          '<h3 class="card-name">' + p.name + "</h3>" +
          '<p class="card-desc">' + p.desc + "</p>" +
          '<div class="card-foot">' +
            '<span class="card-price">' + formatPrice(p.price) + "</span>" + cta +
          "</div>" +
        "</div>";

      card.addEventListener("click", function (e) {
        if (!e.target.closest("a, button")) {
          openModal(p);
        }
      });
      return card;
    };

    var renderGrid = function (cat) {
      grid.innerHTML = "";
      var list = cat === "all" ? PRODUCTS : PRODUCTS.filter(function (p) { return p.cat === cat; });
      if (!list.length) {
        grid.innerHTML = '<p class="grid-empty">В этой категории пока пусто — загляните позже.</p>';
        return;
      }
      list.forEach(function (p, i) {
        grid.appendChild(renderCard(p, Math.min(i, 8)));
      });
      observeReveals(grid);
    };

    var moveIndicator = function (tab) {
      if (!indicator || !tab) return;
      indicator.style.left = (tab.offsetLeft) + "px";
      indicator.style.width = tab.offsetWidth + "px";
    };

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
        tab.setAttribute("aria-selected", "true");
        moveIndicator(tab);
        renderGrid(tab.dataset.cat);
        if (tabsBar) {
          tab.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", inline: "center", block: "nearest" });
        }
      });
    });

    var active = document.querySelector('.tab-pill[aria-selected="true"], .tab[aria-selected="true"]') || tabs[0];
    renderGrid(active ? active.dataset.cat : "all");
    var settle = function () { moveIndicator(document.querySelector('.tab[aria-selected="true"]')); };
    window.addEventListener("resize", settle);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(settle); }
    settle();
  }

  /* ----------------------------------------------------------
     Home page: promo "Заказать в Telegram" links
     ---------------------------------------------------------- */
  document.querySelectorAll("[data-tg-order]").forEach(function (link) {
    link.href = tgOrderLink(link.getAttribute("data-tg-order"));
  });

  /* ----------------------------------------------------------
     3D depth — only on devices with a fine pointer (mouse),
     never on touch, never with reduced motion.
     ---------------------------------------------------------- */
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var allow3D = finePointer && !reduceMotion;

  /* — Card tilt: card leans toward the cursor — */
  if (allow3D) {
    var MAX_TILT = 6;
    var bindTilt = function (card) {
      var raf = null, tx = 0, ty = 0;
      var onMove = function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        ty = px * MAX_TILT;
        tx = -py * MAX_TILT;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      var apply = function () {
        raf = null;
        card.style.transform =
          "perspective(900px) rotateX(" + tx.toFixed(2) + "deg) rotateY(" +
          ty.toFixed(2) + "deg) translateY(-6px)";
      };
      var reset = function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        card.style.transform = "";
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", reset);
    };

    var bindAllTilt = function (root) {
      (root || document)
        .querySelectorAll(".product-card:not([data-tilt]), .promo-card:not([data-tilt])")
        .forEach(function (c) { c.setAttribute("data-tilt", "1"); bindTilt(c); });
    };
    bindAllTilt();
    var gridEl = document.getElementById("product-grid");
    if (gridEl) {
      var mo = new MutationObserver(function () { bindAllTilt(gridEl); });
      mo.observe(gridEl, { childList: true });
    }
  }

  /* — Hero mouse-parallax — */
  var heroArt = document.querySelector(".hero-art");
  var heroContent = document.querySelector(".hero-content");
  if (allow3D && heroArt) {
    var hraf = null, mx = 0, my = 0;
    var hero = document.querySelector(".hero");
    var onHero = function (e) {
      var r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      if (!hraf) hraf = requestAnimationFrame(applyHero);
    };
    var applyHero = function () {
      hraf = null;
      heroArt.style.transform =
        "translate(" + (mx * 18).toFixed(1) + "px," + (my * 14).toFixed(1) + "px) scale(1.06)";
      if (heroContent) {
        heroContent.style.transform =
          "translate(" + (mx * -7).toFixed(1) + "px," + (my * -5).toFixed(1) + "px)";
      }
    };
    var resetHero = function () {
      if (hraf) { cancelAnimationFrame(hraf); hraf = null; }
      heroArt.style.transform = "scale(1.06)";
      if (heroContent) heroContent.style.transform = "";
    };
    hero.addEventListener("mousemove", onHero);
    hero.addEventListener("mouseleave", resetHero);
  }

  /* — Custom Cursor Script — */
  if (finePointer && !reduceMotion) {
    var cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    var follower = document.createElement("div");
    follower.className = "custom-cursor-follower";
    document.body.appendChild(cursor);
    document.body.appendChild(follower);
    document.body.classList.add("has-custom-cursor");

    var cx = -100, cy = -100, fx = -100, fy = -100;
    document.addEventListener("mousemove", function (e) {
      cx = e.clientX;
      cy = e.clientY;
      cursor.style.transform = "translate3d(" + cx + "px, " + cy + "px, 0)";

      var interactive = e.target.closest("a, button, .product-card, .promo-card, .tab, .bottom-nav-item");
      document.body.classList.toggle("cursor-hover", !!interactive);
    });

    var mapFrames = document.querySelectorAll(".map-frame, iframe");
    mapFrames.forEach(function (frame) {
      frame.addEventListener("mouseenter", function () {
        document.body.classList.add("is-over-iframe");
      });
      frame.addEventListener("mouseleave", function () {
        document.body.classList.remove("is-over-iframe");
      });
    });

    function loopFollower() {
      fx += (cx - fx) * 0.18;
      fy += (cy - fy) * 0.18;
      follower.style.transform = "translate3d(" + fx.toFixed(1) + "px, " + fy.toFixed(1) + "px, 0)";
      requestAnimationFrame(loopFollower);
    }
    requestAnimationFrame(loopFollower);
  }

  /* ----------------------------------------------------------
     Mobile Bottom Nav Scroll Observer (Single Active Item)
     ---------------------------------------------------------- */
  var bottomNavItems = document.querySelectorAll(".bottom-nav:not(.bottom-nav-back-only) .bottom-nav-item");
  if (bottomNavItems.length > 0) {
    var sections = [
      { id: "promos", navIdx: 0 },
      { id: "about", navIdx: 2 },
      { id: "venue", navIdx: 3 },
      { id: "contacts", navIdx: 4 }
    ];

    function updateBottomNavActive() {
      var scrollPos = window.scrollY + 200;
      var activeNavIdx = 0;

      for (var i = 0; i < sections.length; i++) {
        var secEl = document.getElementById(sections[i].id);
        if (secEl) {
          var top = secEl.offsetTop;
          var height = secEl.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            activeNavIdx = sections[i].navIdx;
          }
        }
      }

      bottomNavItems.forEach(function (item, idx) {
        if (idx === activeNavIdx) {
          item.classList.add("is-active");
        } else {
          item.classList.remove("is-active");
        }
      });
    }

    window.addEventListener("scroll", updateBottomNavActive, { passive: true });
    updateBottomNavActive();
  }
})();

