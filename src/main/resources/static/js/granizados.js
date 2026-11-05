// @ts-nocheck
/**
 * FROST GLACIAL — 100% FRUTA NATURAL (CONECTADO A SPRING BOOT)
 * Diseño "Tropical Lush": Vaso SVG nativo, pulpa pura de frutas, pedidos y rastreo en vivo
 */

(function () {
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var R = document.documentElement;

  var fmt = function (n) {
    return "$" + Number(n).toLocaleString("es-CO");
  };

  // 1. Aplicación de Colores de Marca al Vaso de Granizado (desde Configuración del Negocio)
  function aplicarColoresGranizadoHero(c1, c2) {
    var col1 = c1 || "#FFB703";
    var col2 = c2 || "#FB8500";
    if (R) {
      R.style.setProperty("--t1", col1);
      R.style.setProperty("--t2", col1);
      R.style.setProperty("--t3", col1);
      R.style.setProperty("--t4", col2);
      R.style.setProperty("--t5", col2);
      R.style.setProperty("--t6", col2);
    }
  }
  window.aplicarColoresGranizadoHero = aplicarColoresGranizadoHero;

  // 2. Extraer emoji frutal representativo según sabor o nombre
  function getFlavorEmoji(nombre, tipo) {
    var str = (nombre || "").toLowerCase();
    if (tipo === "COMBO") return "📦";
    if (str.includes("menta") || str.includes("hierbabuena")) return "🌿";
    if (str.includes("limon") || str.includes("lima")) return "🍋";
    if (str.includes("lulo")) return "🍈";
    if (str.includes("fresa")) return "🍓";
    if (str.includes("mango")) return "🥭";
    if (str.includes("maracuya")) return "🍊";
    if (str.includes("coco")) return "🥥";
    if (str.includes("piña") || str.includes("pina")) return "🍍";
    if (str.includes("mora") || str.includes("arandano") || str.includes("rojos") || str.includes("frambuesa")) return "🫐";
    if (str.includes("mandarina") || str.includes("naranja")) return "🍊";
    return "🥤";
  }

  // 3. Determinar categoría frutal para filtros
  function getFruitCategory(nombre, categoriaSlug) {
    if (categoriaSlug && categoriaSlug.trim() !== "") {
      return categoriaSlug.toLowerCase().trim();
    }
    var str = ((nombre || "")).toLowerCase();
    if (str.includes("fresa") || str.includes("mora") || str.includes("arandano") || str.includes("berries") || str.includes("rojos") || str.includes("frambuesa")) {
      return "berries";
    }
    if (str.includes("lulo") || str.includes("limon") || str.includes("lima") || str.includes("menta") || str.includes("hierbabuena") || str.includes("citric")) {
      return "citrus";
    }
    return "tropical"; // mango, maracuya, piña, coco, etc.
  }

  // 4. Ilustración SVG de respaldo o Foto real
  function vis(x) {
    if (x.img && x.img.trim() !== "") {
      var aj = x.ajusteImagen || {};
      var fit = aj.fit || "cover";
      var zoom = aj.zoom !== undefined && aj.zoom !== null ? aj.zoom : 1.0;
      var posX = aj.posX !== undefined && aj.posX !== null ? aj.posX : 50;
      var posY = aj.posY !== undefined && aj.posY !== null ? aj.posY : 50;
      var imgStyle = "object-fit:" + fit + "; object-position:" + posX + "% " + posY + "%; transform:scale(" + zoom + ");";
      return '<img class="pic" src="' + x.img + '" alt="' + x.n + '" style="' + imgStyle + '" loading="lazy" onerror="this.style.display=\'none\'; if(this.nextElementSibling) this.nextElementSibling.style.display=\'block\';">' +
             '<div class="cupw" style="display:none;"><span class="top">' + x.e + '</span><span class="str"></span><div class="cup"></div></div>';
    }
    return '<div class="cupw"><span class="top">' + x.e + '</span><span class="str"></span><div class="cup"></div></div>';
  }

  // Estructuras de datos conectadas a la API
  var P = [];
  var rawCatalog = { 
    granizados: [], 
    configuracion: { 
      costoEnvioBase: 5000,
      whatsappPedidos: "573013557467"
    } 
  };
  var cart = [];

  // Función global para refrescar el enlace del Botón Flotante de WhatsApp
  window.actualizarBotonFlotanteWhatsapp = function (numero) {
    var btn = $("#btn-whatsapp-flotante");
    if (!btn) return;
    var num = numero || (rawCatalog.configuracion && (rawCatalog.configuracion.whatsappPedidos || rawCatalog.configuracion.whatsappNegocio)) || "573013557467";
    num = String(num).replace(/\D/g, "");
    if (num.length === 10) num = "57" + num;
    if (!num) num = "573013557467";
    var msg = encodeURIComponent("¡Hola Granifresh! 🥤 Quiero consultar sobre los granizados 100% fruta natural y hacer un pedido");
    btn.href = "https://wa.me/" + num + "?text=" + msg;
  };

  // ==========================================================
  // SECCIÓN "NOSOTROS": REDES SOCIALES & MAPA GOOGLE MAPS CON LOGO
  // ==========================================================
  var publicNosotrosMap = null;
  var publicNosotrosMarker = null;

  function crearPublicLogoPinIcon() {
    return L.divIcon({
      className: 'custom-map-pin-badge',
      html: '<div class="map-brand-pin-marker">' +
              '<div class="pin-radar-ripple"></div>' +
              '<div class="pin-logo-bubble">' +
                '<img src="/img/granifresh-logo.jpg" alt="Granifresh Logo" />' +
              '</div>' +
              '<div class="pin-pointer-tip"></div>' +
              '<div class="pin-name-tag">GRANIFRESH</div>' +
            '</div>',
      iconSize: [64, 82],
      iconAnchor: [32, 68],
      popupAnchor: [0, -68]
    });
  }

  window.renderizarSeccionNosotros = function (config) {
    if (!config) return;

    // 1. Redes Sociales
    var igBtn = $("#btn-social-instagram");
    var igUser = $("#nosotros-instagram-user");
    if (igBtn) {
      var igUrl = config.instagramUrl || "https://instagram.com/granifresh";
      igBtn.href = igUrl;
      var cleanIg = igUrl.replace(/\/$/, "").split("/").pop();
      if (igUser) igUser.textContent = cleanIg ? "@" + cleanIg : "@granifresh";
    }

    var fbBtn = $("#btn-social-facebook");
    var fbUser = $("#nosotros-facebook-user");
    if (fbBtn) {
      var fbUrl = config.facebookUrl || "https://facebook.com/granifresh";
      fbBtn.href = fbUrl;
      if (fbUser) fbUser.textContent = config.nombreNegocio || "Granifresh Oficial";
    }

    var wspBtn = $("#btn-social-whatsapp");
    var wspUser = $("#nosotros-whatsapp-user");
    if (wspBtn) {
      var wspNum = config.whatsappPedidos || "573013557467";
      var rawNum = String(wspNum).replace(/\D/g, "");
      if (rawNum.length === 10) rawNum = "57" + rawNum;
      wspBtn.href = "https://wa.me/" + rawNum + "?text=" + encodeURIComponent("¡Hola Granifresh! 🥤 Quisiera información sobre la sede y hacer un pedido.");
      if (wspUser) wspUser.textContent = config.telefonoContacto || ("+" + rawNum);
    }

    // 2. Historia & Esencia
    var historiaEl = $("#nosotros-historia-txt");
    if (historiaEl && config.historiaNosotros) {
      historiaEl.textContent = config.historiaNosotros;
    }

    // 3. Dirección y Horario
    var dirTitulo = $("#nosotros-direccion-titulo");
    if (dirTitulo && config.direccionSede) {
      dirTitulo.textContent = config.direccionSede;
    }
    var horarioSub = $("#nosotros-horario-sub");
    if (horarioSub && config.horarioAtencion) {
      horarioSub.innerHTML = "🕒 Horario: " + config.horarioAtencion + " &nbsp;·&nbsp; Cobertura en toda la ciudad";
    }

    // 4. Coordenadas y Mapa
    var lat = config.latitud !== undefined && config.latitud !== null ? Number(config.latitud) : 10.4075;
    var lng = config.longitud !== undefined && config.longitud !== null ? Number(config.longitud) : -75.5255;

    var gmapsLink = $("#nosotros-gmaps-link");
    if (gmapsLink) {
      gmapsLink.href = "https://www.google.com/maps/search/?api=1&query=" + lat + "," + lng;
    }

    var mapEl = $("#mapa-publico-nosotros");
    if (!mapEl || typeof L === "undefined") return;

    if (!publicNosotrosMap) {
      publicNosotrosMap = L.map("mapa-publico-nosotros", {
        center: [lat, lng],
        zoom: 16,
        scrollWheelZoom: false
      });

      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        attribution: "Leaflet | &copy; Google Maps"
      }).addTo(publicNosotrosMap);

      publicNosotrosMarker = L.marker([lat, lng], {
        icon: crearPublicLogoPinIcon()
      }).addTo(publicNosotrosMap);

      var nombreNegocioFinal = (config && config.nombreNegocio && !config.nombreNegocio.toUpperCase().includes("FROST"))
        ? config.nombreNegocio
        : "GRANIFRESH";

      publicNosotrosMarker.bindPopup(
        '<div style="text-align:center; font-family:Outfit,sans-serif; padding:4px;">' +
          '<b style="color:#00B4D8; font-size:1.05rem;">🍃 ' + nombreNegocioFinal + '</b><br>' +
          '<span style="font-size:0.85rem; color:#444;">' + (config.direccionSede || "Cra. 50 #31b, Olaya Herrera") + '</span><br>' +
          '<small style="color:#10B981; font-weight:700;">100% Fruta Natural Cosechada</small>' +
        '</div>'
      ).openPopup();
    } else {
      publicNosotrosMarker.setLatLng([lat, lng]);
      publicNosotrosMap.setView([lat, lng], 16);
      var nombreNegocioFinal = (config && config.nombreNegocio && !config.nombreNegocio.toUpperCase().includes("FROST"))
        ? config.nombreNegocio
        : "GRANIFRESH";
      publicNosotrosMarker.setPopupContent(
        '<div style="text-align:center; font-family:Outfit,sans-serif; padding:4px;">' +
          '<b style="color:#00B4D8; font-size:1.05rem;">🍃 ' + nombreNegocioFinal + '</b><br>' +
          '<span style="font-size:0.85rem; color:#444;">' + (config.direccionSede || "Cra. 50 #31b, Olaya Herrera") + '</span><br>' +
          '<small style="color:#10B981; font-weight:700;">100% Fruta Natural Cosechada</small>' +
        '</div>'
      );
    }

    setTimeout(function () {
      if (publicNosotrosMap) publicNosotrosMap.invalidateSize();
    }, 400);
  };

  function info(c) {
    var y = P[+c.dataset.i];
    var s = +c.dataset.s;
    return {
      id: y.id,
      nombreBase: y.n,
      n: y.n + " · " + y.sizes[s],
      tamano: y.sizes[s],
      p: y.priceList[s],
      img: y.img,
      e: y.e,
      qty: 1
    };
  }

  // Renderizar botón de acción de tarjeta (+ Añadir o [-] [qty] [+])
  function renderCardAction(prodIndex, sizeIndex) {
    var prod = P[prodIndex];
    if (!prod) return '<button type="button" class="add">+ Añadir</button>';
    var sIdx = sizeIndex !== undefined ? sizeIndex : 0;
    var size = (prod.sizes && prod.sizes[sIdx]) || "12oz";
    var inCart = cart.find(function (it) {
      return it.id === prod.id && it.tamano === size;
    });
    if (inCart && inCart.qty > 0) {
      return '<div class="card-qty-ctrl">' +
               '<button type="button" class="btn-card-qty-minus" onclick="modificarCantidadPorCard(' + prodIndex + ', -1)" aria-label="Disminuir cantidad">−</button>' +
               '<span class="card-qty-num">' + inCart.qty + '</span>' +
               '<button type="button" class="btn-card-qty-plus" onclick="modificarCantidadPorCard(' + prodIndex + ', 1)" aria-label="Aumentar cantidad">+</button>' +
             '</div>';
    }
    return '<button type="button" class="add" onclick="modificarCantidadPorCard(' + prodIndex + ', 1)">+ Añadir</button>';
  }
  window.renderCardAction = renderCardAction;

  // Modificar cantidad directamente desde la tarjeta del catálogo
  window.modificarCantidadPorCard = function (prodIndex, delta) {
    var prod = P[prodIndex];
    if (!prod) return;
    var cardEl = document.querySelector('.card[data-i="' + prodIndex + '"]');
    var sIdx = cardEl ? (+cardEl.dataset.s || 0) : 0;
    var tamano = (prod.sizes && prod.sizes[sIdx]) || "12oz";
    var precio = (prod.priceList && prod.priceList[sIdx]) || prod.p;

    var idx = cart.findIndex(function (it) {
      return it.id === prod.id && it.tamano === tamano;
    });

    if (idx !== -1) {
      cart[idx].qty = (cart[idx].qty || 1) + delta;
      if (cart[idx].qty <= 0) {
        cart.splice(idx, 1);
        if (window.showToast) window.showToast("Quitaste " + prod.n + " (" + tamano + ") del carrito", "info");
      } else if (delta > 0) {
        if (window.showToast) window.showToast("¡Agregaste otro " + prod.n + "! 🥤 (" + cart[idx].qty + " en carrito)", "success");
      }
    } else if (delta > 0) {
      cart.push({
        id: prod.id,
        nombreBase: prod.n,
        n: prod.n + " · " + tamano,
        tamano: tamano,
        p: precio,
        img: prod.img,
        e: prod.e,
        qty: 1
      });
      if (window.showToast) window.showToast("¡" + prod.n + " (" + tamano + ") añadido al carrito! 🥤", "success");
    }

    upd();
  };

  // Carga inicial del catálogo desde Spring Boot
  async function cargarCatalogo() {
    try {
      var res = await fetch("/api/public/catalogo");
      if (!res.ok) throw new Error("Error HTTP " + res.status);
      var data = await res.json();
      rawCatalog = data;

      var items = data.granizados || [];

      // Filtrar y omitir combos y cualquier ítem residual con alcohol
      var reg = items.filter(function (g) {
        return g.tipo !== "COMBO" && g.activo && g.tipo !== "CON_ALCOHOL";
      });

      // Mapear Granizados Frutales a P directamente desde la base de datos
      P = reg.map(function (g) {
        var precios = g.preciosPorTamano && Object.keys(g.preciosPorTamano).length > 0
          ? g.preciosPorTamano
          : { "12oz": g.precioBase, "16oz": g.precioBase + 3500, "24oz": g.precioBase + 7000 };
        var sizes = Object.keys(precios);
        var priceList = Object.values(precios);
        var fruitCat = getFruitCategory(g.nombre, g.categoriaSlug);

        return {
          id: g.id,
          n: g.nombre,
          d: g.descripcion,
          p: priceList[0] || g.precioBase,
          a: "0.0% FRUTA PURA",
          t: (g.insignia && g.insignia.trim()) ? g.insignia.trim() : "",
          c: g.coloresGradiente && g.coloresGradiente.length >= 2
            ? g.coloresGradiente
            : (fruitCat === "berries" ? ["#FF1E56", "#8A1C58"] : (fruitCat === "citrus" ? ["#10B981", "#34D399"] : ["#FFB703", "#FB8500"])),
          e: getFlavorEmoji(g.nombre, g.tipo),
          k: fruitCat,
          img: g.imagenUrl || "",
          ajusteImagen: g.ajusteImagen || null,
          sizes: sizes,
          priceList: priceList
        };
      });

      renderCatalog();

      // Renderizar dinámicamente los botones de categorías de clientes si vienen en el catálogo
      if (Array.isArray(data.categorias) && data.categorias.length > 0) {
        var fltEl = $("#flt");
        if (fltEl) {
          var catActiva = ($("#flt .on") && $("#flt .on").dataset.f) || "all";
          var fltHtml = '<button class="' + (catActiva === "all" ? "on" : "") + '" data-f="all">🥤 Todos los Sabores</button>';
          data.categorias.forEach(function (cat) {
            var estaOn = catActiva === cat.slug ? "on" : "";
            fltHtml += '<button class="' + estaOn + '" data-f="' + cat.slug + '">' + cat.nombre + '</button>';
          });
          fltEl.innerHTML = fltHtml;
          initFilterEvents();
        }
      }

      // Configuración de negocio (colores del granizado, marquesina, WhatsApp y costo de envío)
      if (data.configuracion) {
        if (data.configuracion.colorGranizado1 && data.configuracion.colorGranizado2) {
          aplicarColoresGranizadoHero(data.configuracion.colorGranizado1, data.configuracion.colorGranizado2);
        }
        if (data.configuracion.costoEnvioBase) {
          checkoutState.costoEnvio = data.configuracion.costoEnvioBase;
          var badgeEnv = $("#chk-delivery-cost-badge");
          if (badgeEnv) badgeEnv.textContent = fmt(data.configuracion.costoEnvioBase) + " COP";
          if (window.actualizarValoresTotales) actualizarValoresTotales();
        }
        if (data.configuracion.mensajeAlertaSuperior) {
          updateMarquee(data.configuracion.mensajeAlertaSuperior);
        }
        if (data.configuracion.whatsappPedidos) {
          actualizarBotonFlotanteWhatsapp(data.configuracion.whatsappPedidos);
        }
        renderizarSeccionNosotros(data.configuracion);
      }
    } catch (err) {
      console.warn("Aviso al consultar catálogo remoto:", err);
      renderCatalog();
    }
  }

  function renderCatalog() {
    if (!P || P.length === 0) {
      $("#grid").innerHTML = '<div style="grid-column: 1 / -1; width:100%; text-align: center; padding: 48px 16px; color: var(--mut);"><span style="font-size: 2.2rem; display: block; margin-bottom: 8px;">🥤</span><h4 style="color: #fff; margin-bottom: 6px;">Catálogo de productos</h4><p style="font-size: 0.9rem; margin: 0;">No hay productos disponibles por ahora.</p></div>';
      return;
    }
    // Render Granizados
    $("#grid").innerHTML = P.map(function (x, i) {
      return (
        '<article class="card" data-k="' + x.k + '" data-n="' + x.n.toLowerCase() + '" data-i="' + i + '" data-s="0">' +
          '<div class="art" style="--a:' + x.c[0] + ';--b:' + x.c[1] + '">' +
            (x.t ? '<span class="bd r">' + x.t + '</span>' : '') +
            vis(x) +
          "</div>" +
          '<div class="cb">' +
            "<h3>" + x.n + "</h3>" +
            "<p>" + x.d + "</p>" +
            '<div class="sz">' +
              x.sizes.map(function (s, j) {
                return '<button data-s="' + j + '" class="' + (j === 0 ? "on" : "") + '">' + s + "</button>";
              }).join("") +
            "</div>" +
            '<div class="ft" id="card-ft-' + i + '">' +
              '<div class="pr"><small>PRECIO</small><span>' + fmt(x.priceList[0]) + "</span></div>" +
              '<div class="card-action-box" id="card-act-' + i + '">' +
                renderCardAction(i, 0) +
              '</div>' +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    filt();
    initCatalogMouseDrag();
  }

  // 5. Desplazamiento y Drag estilo Carrusel
  window.scrollCatalog = function (containerId, direction) {
    var container = document.getElementById(containerId);
    if (container) {
      var card = container.querySelector(".card");
      var step = card ? (card.offsetWidth + 22) : 307;
      container.scrollBy({ left: direction * step, behavior: "smooth" });
    }
  };

  function initCatalogMouseDrag() {
    var grid = document.getElementById("grid");
    if (!grid || grid.dataset.mouseDragBound === "true") return;
    grid.dataset.mouseDragBound = "true";

    var isDown = false;
    var startX = 0;
    var scrollStart = 0;

    grid.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      if (e.target.closest("button, a, input, select, textarea")) return;
      isDown = true;
      startX = e.pageX - grid.offsetLeft;
      scrollStart = grid.scrollLeft;
      grid.style.userSelect = "none";
      grid.style.scrollBehavior = "auto";
      grid.style.scrollSnapType = "none";
      grid.classList.add("is-dragging");
    });

    window.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      var x = e.pageX - grid.offsetLeft;
      grid.scrollLeft = scrollStart - (x - startX);
    });

    var endDrag = function () {
      if (!isDown) return;
      isDown = false;
      grid.style.userSelect = "";
      grid.style.scrollBehavior = "";
      grid.style.scrollSnapType = "";
      grid.classList.remove("is-dragging");
    };

    window.addEventListener("mouseup", endDrag);
    window.addEventListener("mouseleave", endDrag);
  }

  // 6. Sistema de Notificaciones Toast
  window.showToast = function (message, type) {
    var container = document.getElementById("toast-container");
    if (!container) return;
    var toast = document.createElement("div");
    var typeClass = type === "error" ? "toast-error" : (type === "success" ? "toast-success" : "");
    var icon = type === "error" ? "⚠️" : (type === "success" ? "🥭" : "🍃");
    toast.className = "toast-msg " + typeClass;
    toast.innerHTML = '<span style="font-size:18px;">' + icon + '</span>' +
                      '<span style="flex:1; line-height:1.35;">' + message + '</span>' +
                      '<button type="button" style="background:none; border:none; color:var(--mut, #888); font-size:16px; cursor:pointer; padding:0 4px; line-height:1;" onclick="this.parentElement.remove()">✕</button>';
    container.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("hide");
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 320);
    }, 2800);
  };
  window.mostrarNotificacionFlash = window.showToast;

  // 7. Carrito y eventos de añadir
  function upd() {
    var count = cart.reduce(function (a, b) { return a + (b.qty || 1); }, 0);
    var t = cart.reduce(function (a, b) { return a + (b.p * (b.qty || 1)); }, 0);
    var cn = $("#cn");
    if (cn) cn.textContent = count;
    
    var fbar = $("#fbar");
    if (fbar) {
      fbar.classList.toggle("on", count > 0);
      var fbarCount = $("#fbar-count");
      var fbarTotal = $("#fbar-total");
      if (fbarCount && fbarTotal) {
        fbarCount.textContent = count + " granizado" + (count > 1 ? "s" : "");
        fbarTotal.textContent = fmt(t);
      } else {
        fbar.textContent = count + " granizado" + (count > 1 ? "s" : "") + " • " + fmt(t) + "   Ver Carrito ➜";
      }
    }

    $("#pl").innerHTML = cart.map(function (x, i) {
      var qty = x.qty || 1;
      return '<li><span>' + x.n + ' <small style="color:var(--cy); font-weight:800;">x' + qty + '</small></span><span>' + fmt(x.p * qty) + ' <button data-x="' + i + '" class="panel-del-btn" aria-label="Quitar del carrito" title="Quitar granizado">✕ Quitar</button></span></li>';
    }).join("");
    $("#pt").textContent = "Total: " + fmt(t);
    if (!cart.length) $("#panel").classList.remove("on");

    try {
      localStorage.setItem("frost_cart", JSON.stringify(cart));
    } catch (e) {}

    // Sincronizar controles en tarjetas del catálogo
    $$("#grid .card").forEach(function (cardEl) {
      var pIdx = +cardEl.dataset.i;
      var sIdx = +cardEl.dataset.s || 0;
      var actBox = cardEl.querySelector(".card-action-box");
      if (actBox) {
        actBox.innerHTML = renderCardAction(pIdx, sIdx);
      }
    });

    var modalChk = $("#modal-checkout");
    if (modalChk && modalChk.classList.contains("active")) {
      renderCheckoutItems();
      if (typeof actualizarValoresTotales === "function") {
        actualizarValoresTotales();
      }
    }
  }

  function loadSavedCart() {
    try {
      var saved = localStorage.getItem("frost_cart");
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          cart = parsed.map(function (it) {
            it.qty = it.qty && it.qty > 0 ? it.qty : 1;
            return it;
          });
        } else {
          cart = [];
        }
        upd();
      }
    } catch (e) {
      cart = [];
    }
  }

  function tog() {
    abrirCheckout(1);
  }

  var fbarBtn = $("#fbar");
  if (fbarBtn) fbarBtn.onclick = tog;
  var cartbBtn = $("#cartb");
  if (cartbBtn) cartbBtn.onclick = tog;

  document.addEventListener("click", function (e) {
    var c = e.target.closest(".card");
    if (c && e.target.closest(".sz button")) {
      var sIdx = +e.target.dataset.s;
      c.dataset.s = sIdx;
      [].forEach.call(c.querySelectorAll(".sz button"), function (b) {
        b.classList.toggle("on", b === e.target);
      });
      c.querySelector(".pr span").textContent = fmt(info(c).p);
      var actBox = c.querySelector(".card-action-box");
      if (actBox) {
        actBox.innerHTML = renderCardAction(+c.dataset.i, sIdx);
      }
    }
    if (e.target.dataset.x !== undefined) {
      var removed = cart.splice(+e.target.dataset.x, 1);
      upd();
      if (removed && removed[0]) {
        window.showToast("Granizado retirado del carrito", "info");
      }
    }
    if (e.target.dataset.go) {
      mode(e.target.dataset.go);
    }
  });

  // 8. Filtros y Búsqueda Frutal
  function filt() {
    var f = ($("#flt .on") && $("#flt .on").dataset.f) || "all";
    var q = $("#q").value.toLowerCase().trim();
    $$("#grid .card").forEach(function (c) {
      var matchFilt = f === "all" || c.dataset.k === f;
      var matchSearch = c.dataset.n.indexOf(q) > -1;
      c.style.display = matchFilt && matchSearch ? "" : "none";
    });
    var gridEl = $("#grid");
    if (gridEl) gridEl.scrollLeft = 0;
  }

  function initFilterEvents() {
    $$("#flt button").forEach(function (b) {
      b.onclick = function () {
        $$("#flt button").forEach(function (o) { o.classList.toggle("on", o === b); });
        filt();
      };
    });
  }
  initFilterEvents();

  $("#q").oninput = filt;

  // ==========================================================
  // 9. CHECKOUT MULTI-PASO SEGURO CON LÍNEA DE GRANIZADOS
  // ==========================================================
  var checkoutState = {
    pasoActual: 1,
    metodoEntrega: "DOMICILIO",
    metodoPago: "NEQUI",
    costoEnvio: 5000
  };

  // Renderizar la lista de granizados en el Paso 1
  function renderCheckoutItems() {
    var cont = $("#checkout-items-list");
    if (!cont) return;

    var subtotal = cart.reduce(function (a, b) { return a + (b.p * (b.qty || 1)); }, 0);
    var count = cart.reduce(function (a, b) { return a + (b.qty || 1); }, 0);

    var headerCount = $("#chk-header-count");
    if (headerCount) headerCount.textContent = count;
    var step1Count = $("#chk-step1-count-txt");
    if (step1Count) step1Count.textContent = count + " granizado" + (count !== 1 ? "s" : "");
    var step1Subtotal = $("#chk-step1-subtotal");
    if (step1Subtotal) step1Subtotal.textContent = fmt(subtotal);

    if (count === 0) {
      cont.innerHTML = 
        '<div class="chk-empty-state">' +
          '<div class="chk-empty-cup-box">' +
            '<svg class="chk-granizado-svg" viewBox="0 0 100 135" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Vaso de granizado vacío">' +
              '<line x1="64" y1="6" x2="48" y2="46" stroke="#00B4D8" stroke-width="7" stroke-linecap="round"/>' +
              '<line x1="62" y1="10" x2="50" y2="42" stroke="#90E0EF" stroke-width="2.5" stroke-linecap="round"/>' +
              '<path d="M22 46 C22 26, 78 26, 78 46 Z" fill="url(#slushEmptyGrad)"/>' +
              '<polygon points="40,30 46,24 52,28 46,34" fill="#FFFFFF" fill-opacity="0.6"/>' +
              '<polygon points="56,32 62,26 68,31 61,36" fill="#FFFFFF" fill-opacity="0.5"/>' +
              '<polygon points="28,38 34,33 40,37 33,42" fill="#FFFFFF" fill-opacity="0.5"/>' +
              '<ellipse cx="50" cy="46" rx="30" ry="7.5" fill="#FFFFFF" fill-opacity="0.25" stroke="#FFFFFF" stroke-width="1.8"/>' +
              '<path d="M20 46 L32 116 Q33 124 42 124 L58 124 Q67 124 68 116 L80 46 Z" fill="url(#cupEmptyGlassGrad)" stroke="#FFFFFF" stroke-width="1.8" stroke-opacity="0.45"/>' +
              '<path d="M23 52 L33 114 Q34 120 42 120 L58 120 Q66 120 67 114 L77 52 Q64 56 50 52 Q36 48 23 52 Z" fill="url(#slushEmptyBodyGrad)"/>' +
              '<circle cx="42" cy="72" r="2" fill="#FFFFFF" fill-opacity="0.75"/>' +
              '<circle cx="58" cy="86" r="2.5" fill="#FFFFFF" fill-opacity="0.75"/>' +
              '<circle cx="48" cy="102" r="1.8" fill="#FFFFFF" fill-opacity="0.65"/>' +
              '<circle cx="38" cy="92" r="1.5" fill="#FFFFFF" fill-opacity="0.55"/>' +
              '<circle cx="63" cy="67" r="1.8" fill="#FFFFFF" fill-opacity="0.65"/>' +
              '<path d="M26 54 L35 112" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.45"/>' +
              '<defs>' +
                '<linearGradient id="slushEmptyGrad" x1="22" y1="26" x2="78" y2="46" gradientUnits="userSpaceOnUse">' +
                  '<stop stop-color="#FFB703"/>' +
                  '<stop offset="0.5" stop-color="#FB8500"/>' +
                  '<stop offset="1" stop-color="#FF1E56"/>' +
                '</linearGradient>' +
                '<linearGradient id="slushEmptyBodyGrad" x1="23" y1="52" x2="77" y2="120" gradientUnits="userSpaceOnUse">' +
                  '<stop stop-color="#FFB703"/>' +
                  '<stop offset="0.4" stop-color="#FB8500"/>' +
                  '<stop offset="0.75" stop-color="#FF1E56"/>' +
                  '<stop offset="1" stop-color="#10B981"/>' +
                '</linearGradient>' +
                '<linearGradient id="cupEmptyGlassGrad" x1="20" y1="46" x2="80" y2="124" gradientUnits="userSpaceOnUse">' +
                  '<stop stop-color="#FFFFFF" stop-opacity="0.18"/>' +
                  '<stop offset="1" stop-color="#FFFFFF" stop-opacity="0.04"/>' +
                '</linearGradient>' +
              '</defs>' +
            '</svg>' +
          '</div>' +
          '<div class="chk-empty-title">Tu carrito está vacío</div>' +
          '<p class="chk-empty-sub">Aún no has añadido granizados 100% fruta natural. ¡Elige tus sabores favoritos recién batidos a -4°C!</p>' +
          '<button type="button" class="cta chk-empty-btn" onclick="cerrarModales()">¡Pedir Granizados Frescos! 🥤</button>' +
        '</div>';
      var nextBtn = $("#btn-chk-next");
      if (nextBtn && checkoutState.pasoActual === 1) nextBtn.disabled = true;
      return;
    }

    var nextBtn = $("#btn-chk-next");
    if (nextBtn) nextBtn.disabled = false;

    var html = "";
    cart.forEach(function (it, idx) {
      var thumb = it.img && it.img.trim() !== ""
        ? '<img src="' + it.img + '" alt="' + it.n + '" onerror="this.parentElement.textContent=\'' + (it.e || '🥤') + '\'">'
        : (it.e || '🥤');

      var qty = it.qty || 1;
      var itemTotal = it.p * qty;

      html += 
        '<div class="chk-item-card">' +
          '<div class="chk-item-thumb">' + thumb + '</div>' +
          '<div class="chk-item-info">' +
            '<h4 class="chk-item-name">' + it.n + '</h4>' +
            '<div class="chk-item-sub">' + (it.tamano || '12oz Frappé') + ' · <b style="color:var(--li);">' + fmt(itemTotal) + '</b></div>' +
          '</div>' +
          '<div class="chk-item-qty-wrap">' +
            '<div class="chk-qty-selector" style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); border:1px solid rgba(52,211,153,0.35); border-radius:8px; padding:3px 6px;">' +
              '<button type="button" class="chk-qty-btn chk-qty-minus" onclick="modificarCantidadCartItem(' + idx + ', -1)" aria-label="Restar una unidad" title="Restar uno" style="width:26px; height:26px; border:none; background:rgba(255,255,255,0.08); border-radius:6px; color:#fff; font-weight:800; cursor:pointer; font-size:15px; display:grid; place-items:center;">−</button>' +
              '<span class="chk-qty-val" style="min-width:20px; text-align:center; font-weight:800; color:#fff; font-size:13.5px;">' + qty + '</span>' +
              '<button type="button" class="chk-qty-btn chk-qty-plus" onclick="modificarCantidadCartItem(' + idx + ', 1)" aria-label="Sumar otra unidad" title="Sumar otro" style="width:26px; height:26px; border:none; background:rgba(255,255,255,0.08); border-radius:6px; color:#fff; font-weight:800; cursor:pointer; font-size:15px; display:grid; place-items:center;">+</button>' +
            '</div>' +
            '<button type="button" class="chk-del-btn" onclick="quitarItemCart(' + idx + ')" title="Quitar este granizado del pedido" aria-label="Quitar este granizado">' +
              '<svg class="chk-del-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>' +
              '</svg>' +
              '<span>Quitar</span>' +
            '</button>' +
          '</div>' +
        '</div>';
    });

    cont.innerHTML = html;
    actualizarValoresTotales();
  }

  // Modificar cantidad directamente desde el Paso 1 del checkout
  window.modificarCantidadCartItem = function (index, delta) {
    if (index >= 0 && index < cart.length) {
      cart[index].qty = (cart[index].qty || 1) + delta;
      if (cart[index].qty <= 0) {
        var removed = cart.splice(index, 1);
        if (removed.length && window.showToast) {
          window.showToast("Quitaste " + removed[0].n + " del carrito", "info");
        }
      }
      upd();
      renderCheckoutItems();
    }
  };

  // Quitar ítem desde el checkout
  window.quitarItemCart = function (index) {
    if (index >= 0 && index < cart.length) {
      var removed = cart.splice(index, 1);
      upd();
      renderCheckoutItems();
      if (removed.length) {
        window.showToast("Quitaste " + removed[0].n + " del carrito", "info");
      }
    }
  };

  // Cambiar método de entrega (Domicilio Express vs Recogida)
  window.cambiarMetodoEntrega = function (tipo) {
    checkoutState.metodoEntrega = tipo;
    var isDom = tipo === "DOMICILIO";

    var cardDom = $("#label-delivery-express");
    var cardRec = $("#label-delivery-pickup");
    if (cardDom) cardDom.classList.toggle("active", isDom);
    if (cardRec) cardRec.classList.toggle("active", !isDom);

    var dirWrap = $("#wrap-field-direccion");
    if (dirWrap) {
      dirWrap.style.display = isDom ? "block" : "none";
    }

    var baseEnvio = (rawCatalog.configuracion && rawCatalog.configuracion.costoEnvioBase) || 5000;
    checkoutState.costoEnvio = isDom ? baseEnvio : 0;

    var badgeStep2 = $("#chk-step2-dest-txt");
    if (badgeStep2) badgeStep2.textContent = isDom ? "Domicilio" : "Recogida en Local";

    var txtEnvio = $("#chk-resumen-envio-txt");
    if (txtEnvio) {
      txtEnvio.innerHTML = isDom 
        ? fmt(checkoutState.costoEnvio) + " (Domicilio térmico)"
        : '<span style="color:#34D399; font-weight:800;">¡GRATIS! (Recogida en local)</span>';
    }

    var inputDir = $("#checkout-direccion");
    if (inputDir) {
      if (isDom) {
        if (inputDir.value.indexOf("Recogida") !== -1 || inputDir.value.indexOf("Punto Físico") !== -1 || inputDir.value.indexOf("Calle 45") !== -1) {
          inputDir.value = "";
        }
      } else {
        inputDir.value = "";
      }
    }

    // Método de pago en Efectivo (Solo disponible para Recogida en Local)
    var cardEfectivo = $("#pay-card-efectivo");
    if (cardEfectivo) {
      cardEfectivo.style.display = isDom ? "none" : "";
    }
    // Si era Efectivo y el cliente cambió a Domicilio, reasignar a NEQUI
    if (isDom && checkoutState.metodoPago === "EFECTIVO") {
      cambiarMetodoPago("NEQUI");
    }

    actualizarValoresTotales();
  };

  // Copiar número de cuenta al portapapeles con feedback
  window.copiarCuenta = function (idElemento, btn) {
    var el = document.getElementById(idElemento);
    if (!el) return;
    var texto = el.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () {
        var oldHtml = btn.innerHTML;
        btn.innerHTML = "✅ ¡Copiado!";
        btn.classList.add("copied");
        if (window.showToast) window.showToast("Copiado al portapapeles: " + texto + " 📋", "info");
        setTimeout(function () {
          btn.innerHTML = oldHtml;
          btn.classList.remove("copied");
        }, 2200);
      }).catch(function () {
        prompt("Copia el número:", texto);
      });
    } else {
      prompt("Copia el número:", texto);
    }
  };

  // Cambiar método de pago
  window.cambiarMetodoPago = function (metodo) {
    checkoutState.metodoPago = metodo;
    $$(".chk-payment-card").forEach(function (card) {
      var input = card.querySelector("input");
      if (input) card.classList.toggle("active", input.value === metodo);
    });

    var esEfectivo = metodo === "EFECTIVO";
    var guideTrans = $("#chk-steps-transferencia");
    var guideCash = $("#chk-steps-efectivo");
    if (guideTrans) guideTrans.style.display = esEfectivo ? "none" : "block";
    if (guideCash) guideCash.style.display = esEfectivo ? "block" : "none";

    var sub = $("#chk-step-subtitle");
    if (sub && checkoutState.pasoActual === 3) {
      sub.textContent = esEfectivo
        ? "Paso 3 de 3: Confirma tu pedido para pagar en caja al recoger"
        : "Paso 3 de 3: Transfiere a cuenta y envía comprobante";
    }

    var btnNext = $("#btn-chk-next");
    if (btnNext && checkoutState.pasoActual === 3) {
      btnNext.innerHTML = esEfectivo
        ? "📲 Confirmar Pedido para Recogida ➔"
        : "📲 Enviar Comprobante por WhatsApp ➔";
    }
  };

  // Calcular y refrescar totales
  function actualizarValoresTotales() {
    var subtotal = cart.reduce(function (a, b) { return a + (b.p * (b.qty || 1)); }, 0);
    var count = cart.reduce(function (a, b) { return a + (b.qty || 1); }, 0);
    var costoEnvio = checkoutState.metodoEntrega === "DOMICILIO" ? checkoutState.costoEnvio : 0;
    var total = subtotal + costoEnvio;

    var elSub = $("#checkout-subtotal-val");
    if (elSub) elSub.textContent = fmt(subtotal);
    var elStep1Sub = $("#chk-step1-subtotal");
    if (elStep1Sub) elStep1Sub.textContent = fmt(subtotal);

    var elTotal = $("#checkout-total-val");
    if (elTotal) elTotal.textContent = fmt(total);

    var pillTot = $("#chk-step3-total-pill");
    if (pillTot) pillTot.textContent = fmt(total) + " COP";
    var pillCashTot = $("#chk-step3-cash-total-pill");
    if (pillCashTot) pillCashTot.textContent = fmt(total) + " COP";

    var elCountRes = $("#chk-resumen-cant");
    if (elCountRes) elCountRes.textContent = count;

    var elCostBadge = $("#chk-delivery-cost-badge");
    if (elCostBadge) elCostBadge.textContent = fmt((rawCatalog && rawCatalog.configuracion && rawCatalog.configuracion.costoEnvioBase) || 5000) + " COP";
  }

  // Navegar entre los 3 pasos del checkout con los granizados
  window.irAPasoCheckout = function (paso) {
    if (paso < 1 || paso > 3) return;

    if (paso > 1 && cart.length === 0) {
      window.showToast("Agrega al menos un granizado para continuar 🥤", "error");
      return;
    }

    if (paso === 3) {
      var nom = $("#checkout-nombre").value.trim();
      var tel = $("#checkout-telefono").value.trim();
      var dir = $("#checkout-direccion").value.trim();

      if (!nom) {
        window.showToast("Ingresa el nombre de quien recibe 👤", "error");
        $("#checkout-nombre").focus();
        return;
      }
      if (!tel || tel.replace(/\D/g, "").length < 7) {
        window.showToast("Ingresa un número de WhatsApp de contacto válido 📱", "error");
        $("#checkout-telefono").focus();
        return;
      }
      if (checkoutState.metodoEntrega === "DOMICILIO" && !dir) {
        window.showToast("Ingresa la dirección exacta de entrega 📍", "error");
        $("#checkout-direccion").focus();
        return;
      }

      var resCli = $("#chk-resumen-cliente");
      if (resCli) resCli.textContent = nom;
      var resTel = $("#chk-resumen-contacto");
      if (resTel) resTel.textContent = tel;
      var resDir = $("#chk-resumen-destino");
      if (resDir) {
        resDir.textContent = checkoutState.metodoEntrega === "DOMICILIO"
          ? dir
          : "Recogida en punto físico del local";
      }
    }

    checkoutState.pasoActual = paso;

    // 1. Subtítulo dinámico
    var sub = $("#chk-step-subtitle");
    if (sub) {
      if (paso === 1) sub.textContent = "Paso 1 de 3: Revisa tus granizados seleccionados";
      else if (paso === 2) sub.textContent = "Paso 2 de 3: Método de envío y datos de entrega";
      else if (paso === 3) {
        sub.textContent = checkoutState.metodoPago === "EFECTIVO"
          ? "Paso 3 de 3: Confirma tu pedido para pagar en caja al recoger"
          : "Paso 3 de 3: Transfiere a cuenta y envía comprobante";
      }
    }

    // Si entra al paso 3, refrescar cuentas bancarias e importe total en la guía
    if (paso === 3) {
      var esEfectivo = checkoutState.metodoPago === "EFECTIVO";
      var guideTrans = $("#chk-steps-transferencia");
      var guideCash = $("#chk-steps-efectivo");
      if (guideTrans) guideTrans.style.display = esEfectivo ? "none" : "block";
      if (guideCash) guideCash.style.display = esEfectivo ? "block" : "none";

      if (rawCatalog && rawCatalog.configuracion) {
        var cfg = rawCatalog.configuracion;
        var elN = $("#chk-num-nequi"); if (elN && cfg.numeroNequi) elN.textContent = cfg.numeroNequi;
        var elB = $("#chk-num-bancolombia"); if (elB && cfg.cuentaBancolombia) elB.textContent = cfg.cuentaBancolombia;
        var elD = $("#chk-num-daviplata"); if (elD && cfg.numeroDaviplata) elD.textContent = cfg.numeroDaviplata;
      }
      var subtotalStep3 = cart.reduce(function (a, b) { return a + (b.p * (b.qty || 1)); }, 0);
      var costoStep3 = checkoutState.metodoEntrega === "DOMICILIO" ? checkoutState.costoEnvio : 0;
      var totStep3 = subtotalStep3 + costoStep3;
      var pillTot = $("#chk-step3-total-pill");
      if (pillTot) pillTot.textContent = fmt(totStep3) + " COP";
      var pillCashTot = $("#chk-step3-cash-total-pill");
      if (pillCashTot) pillCashTot.textContent = fmt(totStep3) + " COP";
    }

    // 2. Vasitos de Granizado (Step Tabs)
    [1, 2, 3].forEach(function (s) {
      var tab = $("#step-tab-" + s);
      if (!tab) return;
      tab.classList.remove("active", "completed");
      if (s < paso) {
        tab.classList.add("completed");
      } else if (s === paso) {
        tab.classList.add("active");
      }
    });

    // 3. Líneas conectoras de néctar
    var con1 = $("#connector-1-2");
    if (con1) con1.classList.toggle("filled", paso >= 2);
    var con2 = $("#connector-2-3");
    if (con2) con2.classList.toggle("filled", paso >= 3);

    // 4. Mostrar solo el panel activo
    [1, 2, 3].forEach(function (s) {
      var pane = $("#chk-pane-" + s);
      if (pane) pane.classList.toggle("active", s === paso);
    });

    // 5. Configurar botones del footer
    var btnPrev = $("#btn-chk-prev");
    var btnNext = $("#btn-chk-next");

    if (btnPrev && btnNext) {
      if (paso === 1) {
        btnPrev.textContent = "⬅ Seguir comprando";
        btnNext.innerHTML = "Continuar a Envío &amp; Datos ➔";
        btnNext.style.background = "";
        btnNext.style.boxShadow = "";
        btnNext.disabled = cart.length === 0;
      } else if (paso === 2) {
        btnPrev.textContent = "⬅ Volver a Ítems";
        btnNext.innerHTML = "Continuar al Pago ➔";
        btnNext.style.background = "";
        btnNext.style.boxShadow = "";
        btnNext.disabled = false;
      } else if (paso === 3) {
        var esEfectivo = checkoutState.metodoPago === "EFECTIVO";
        btnPrev.textContent = "⬅ Volver a Datos";
        btnNext.innerHTML = esEfectivo
          ? "📲 Confirmar Pedido para Recogida ➔"
          : "📲 Enviar Comprobante por WhatsApp ➔";
        btnNext.style.background = "linear-gradient(135deg, #10B981, #059669)";
        btnNext.style.boxShadow = "0 4px 18px rgba(16, 185, 129, 0.4)";
        btnNext.disabled = false;
      }
    }

    actualizarValoresTotales();
  };

  // Botón "Continuar" del footer
  window.avanzarPasoCheckout = function () {
    if (checkoutState.pasoActual === 1) {
      irAPasoCheckout(2);
    } else if (checkoutState.pasoActual === 2) {
      irAPasoCheckout(3);
    } else if (checkoutState.pasoActual === 3) {
      enviarPedidoFinal();
    }
  };

  // Botón "Volver" del footer
  window.retrocederPasoCheckout = function () {
    if (checkoutState.pasoActual === 1) {
      cerrarModales();
    } else if (checkoutState.pasoActual === 2) {
      irAPasoCheckout(1);
    } else if (checkoutState.pasoActual === 3) {
      irAPasoCheckout(2);
    }
  };

  // Apertura global del checkout
  window.abrirCheckout = function (pasoInicial) {
    var panel = $("#panel");
    if (panel) panel.classList.remove("on");

    renderCheckoutItems();
    irAPasoCheckout(pasoInicial || 1);
    var modal = $("#modal-checkout");
    if (modal) modal.classList.add("active");
  };

  var btnOk = $("#ok");
  if (btnOk) btnOk.onclick = function () { abrirCheckout(1); };

  // Envío final del Pedido a Spring Boot
  async function enviarPedidoFinal() {
    var btn = $("#btn-chk-next");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = "Batilizando tu pedido... 🧊";
    }

    var subtotal = cart.reduce(function (a, b) { return a + (b.p * (b.qty || 1)); }, 0);
    var isDom = checkoutState.metodoEntrega === "DOMICILIO";
    var costoEnvio = isDom
      ? ((rawCatalog.configuracion && rawCatalog.configuracion.costoEnvioBase) || 5000)
      : 0;
    var total = subtotal + costoEnvio;

    var dirFinal = isDom
      ? $("#checkout-direccion").value.trim()
      : "Recogida en el local";

    var payload = {
      clienteNombre: $("#checkout-nombre").value.trim(),
      clienteTelefono: $("#checkout-telefono").value.trim(),
      clienteDireccion: dirFinal,
      tipoEntrega: isDom ? "DOMICILIO" : "RECOGIDA",
      barrio: isDom ? "Domicilio Express" : "Recogida Local",
      indicaciones: $("#checkout-indicaciones").value.trim() + (!isDom ? " [RECOGIDA EN LOCAL FÍSICO]" : ""),
      metodoPago: checkoutState.metodoPago,
      subtotal: subtotal,
      costoEnvio: costoEnvio,
      total: total,
      items: cart.map(function (it) {
        return {
          granizadoId: it.id,
          granizadoNombre: it.n,
          nombreGranizado: it.n,
          tamano: it.tamano || "12oz",
          precioUnitario: it.p,
          cantidad: it.qty || 1,
          toppingsSeleccionados: [],
          escarchadoSeleccionado: "Natural"
        };
      })
    };

    try {
      var res = await fetch("/api/public/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        var errData = await res.json().catch(function () { return {}; });
        throw new Error(errData.error || errData.message || "Error al procesar el pedido (" + res.status + ")");
      }

      var resJson = await res.json();
      var pedidoGuardado = resJson.pedido || resJson;

      // Limpiar Carrito
      cart = [];
      upd();
      localStorage.removeItem("frost_cart");

      // Cerrar Checkout
      $("#modal-checkout").classList.remove("active");

      // Mostrar Éxito
      var cod = pedidoGuardado.codigoPedido || resJson.codigoPedido || "GRZ-" + Math.floor(10000 + Math.random() * 90000);
      $("#exito-codigo-pedido").textContent = cod;
      $("#exito-cliente-nombre").textContent = pedidoGuardado.clienteNombre || payload.clienteNombre;
      $("#exito-direccion").textContent = pedidoGuardado.clienteDireccion || payload.clienteDireccion;
      $("#exito-total").textContent = fmt(pedidoGuardado.total || payload.total);

      // Armar enlace de WhatsApp
      var whatsappNum = (rawCatalog.configuracion && (rawCatalog.configuracion.whatsappPedidos || rawCatalog.configuracion.whatsappNegocio)) || "573013557467";
      whatsappNum = String(whatsappNum).replace(/\D/g, "");
      if (whatsappNum.length === 10) whatsappNum = "57" + whatsappNum;
      if (!whatsappNum) whatsappNum = "573013557467";

      var itemsTxt = (pedidoGuardado.items || payload.items).map(function (it) {
        var cant = it.cantidad || it.qty || 1;
        var cantTxt = cant > 1 ? (" x" + cant) : "";
        return "• " + (it.nombreGranizado || it.granizadoNombre || it.n) + cantTxt + " (" + fmt((it.precioUnitario || it.p) * cant) + ")";
      }).join("%0A");

      var entregaTxt = isDom ? "🛵 Domicilio Express a " + payload.clienteDireccion : "🏪 Recogida en el punto físico";

      var esEfectivo = payload.metodoPago === "EFECTIVO";
      var nomMetodo = esEfectivo
        ? "💵 Efectivo (Pago contra entrega en el punto físico)"
        : (payload.metodoPago === "BANCOLOMBIA"
            ? "Bancolombia Transferencia"
            : (payload.metodoPago === "DAVIPLATA" ? "Daviplata Móvil" : "Nequi"));

      var headerPago = esEfectivo
        ? "Acabo de realizar mi pedido web para recoger con pago en efectivo:"
        : "Acabo de realizar mi pedido web y transferir el pago:";
      var totalLabel = esEfectivo ? "💰 *Total a Cancelar en Caja:* " : "💰 *Total Transferido:* ";
      var cierreMsg = esEfectivo
        ? "💵 *PAGO EN EFECTIVO AL RECOGER EN EL LOCAL.* Por favor confirmarme que mi pedido esté recibido para pasar a recogerlo. ¡Muchas gracias! 🚀"
        : "📎 *ADJUNTO MI COMPROBANTE DE PAGO EN ESTE CHAT* para que rectifiquen mi transferencia e inicien el batido. ¡Muchas gracias! 🚀";

      var msgWp = "¡Hola *GRANIFRESH*! 🥤%0A%0A" +
                  headerPago + "%0A" +
                  "📌 *Código de Pedido:* " + cod + "%0A" +
                  "👤 *Cliente:* " + payload.clienteNombre + "%0A" +
                  "📱 *WhatsApp:* " + payload.clienteTelefono + "%0A" +
                  "📍 *Modalidad:* " + entregaTxt + "%0A" +
                  "💳 *Método de Pago:* " + nomMetodo + "%0A" +
                  totalLabel + fmt(payload.total) + "%0A%0A" +
                  "🥤 *Granizados Solicitados:*%0A" + itemsTxt + "%0A%0A" +
                  cierreMsg;

      var wpUrl = "https://wa.me/" + whatsappNum + "?text=" + msgWp;
      var wpBtn = $("#btn-whatsapp-confirmar");
      if (wpBtn) wpBtn.href = wpUrl;

      // Abrir WhatsApp en nueva pestaña para que el cliente adjunte el comprobante
      try {
        window.open(wpUrl, "_blank");
      } catch (e) {}

      $("#modal-exito-pedido").classList.add("active");

    } catch (err) {
      console.error(err);
      window.showToast("Error al procesar el pedido: " + err.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = checkoutState.metodoPago === "EFECTIVO"
          ? "📲 Confirmar Pedido para Recogida ➔"
          : "📲 Enviar Comprobante por WhatsApp ➔";
      }
    }
  }

  // 11. Rastreo de Pedido
  async function track() {
    var c = $("#tc").value.trim().toUpperCase();
    if (!c) {
      window.showToast("Ingresa el código de pedido (ej: GRZ-12345)", "error");
      return;
    }

    $("#eta").textContent = "Buscando en la cámara de congelación...";

    try {
      var res = await fetch("/api/public/pedidos/rastreo/" + encodeURIComponent(c));
      if (!res.ok) {
        $("#eta").textContent = "Pedido no encontrado. Verifica el código.";
        $$(".st").forEach(function (e) { e.classList.remove("on"); });
        $("#bar").style.width = "0%";
        return;
      }

      var pedido = await res.json();
      var estado = pedido.estadoPedido;

      var stepMap = {
        "RECIBIDO": 1,
        "EN_PREPARACION": 2,
        "EN_CAMINO": 3,
        "ENTREGADO": 4,
        "CANCELADO": 0
      };

      var n = stepMap[estado] !== undefined ? stepMap[estado] : 1;

      if (n === 0) {
        $("#eta").textContent = "Este pedido fue cancelado. Comunícate por WhatsApp si tienes dudas.";
        $$(".st").forEach(function (e) { e.classList.remove("on"); });
        $("#bar").style.width = "0%";
        return;
      }

      $$(".st").forEach(function (e, i) {
        e.classList.toggle("on", i < n);
      });
      $("#bar").style.width = ((n - 1) / 3 * 88) + "%";

      var msgs = [
        "",
        "📥 Pedido recibido en sistema. Pronto comenzamos el batido.",
        "🧊 Macerando fruta fresca y preparando frappé a -4°C…",
        "🛵 ¡En camino con empaque térmico! Llega en unos " + (pedido.tiempoEstimadoMinutos || 35) + " min a " + (pedido.clienteDireccion || "tu dirección") + ".",
        "🎉 Entregado. ¡Disfruta la frescura de la fruta real!"
      ];
      $("#eta").textContent = msgs[n];

    } catch (err) {
      $("#eta").textContent = "Error al conectar con el servidor de rastreo.";
    }
  }

  $("#tf").onsubmit = function (e) {
    e.preventDefault();
    track();
  };

  // 12. Marquesina Botánica Infinita y Fluida
  function updateMarquee(customText) {
    var el = $("#mq");
    if (!el) return;
    var baseText = customText || "🍃 ¡Granifresh! Refresca tu día con granizados 100% fruta natural artesanal a domicilio · ⚡ Entrega en 35 min con empaque térmico antifusión · 🥭 Mango Biche Cítrico · 🍊 Maracuyá Silvestre · 🍓 Fresa Campesina · 🍈 Lulo Valluno · ";
    if (baseText.indexOf("FROST") !== -1) {
      baseText = "🍃 ¡Granifresh! Granizados 100% fruta natural artesanal a domicilio · ⚡ Entrega en 35 min con empaque térmico antifusión";
    }
    var chunk = baseText + " &nbsp;&nbsp;·&nbsp;&nbsp; ";
    // Generamos dos mitades idénticas para un loop infinito perfecto sin saltos ni espacios vacíos
    var half = chunk + chunk + chunk;
    el.innerHTML = half + half;
  }
  window.updateMarquee = updateMarquee;
  updateMarquee();

  // 13. Micro-Burbujas SVG Dinámicas en el Vaso
  var NS = "http://www.w3.org/2000/svg";
  var bu = $("#bubs");
  if (bu) {
    for (var i = 0; i < 14; i++) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", 92 + Math.random() * 136);
      c.setAttribute("cy", 340);
      c.setAttribute("r", 2 + Math.random() * 3.5);
      c.setAttribute("class", "bub");
      c.style.setProperty("--d", (2.8 + Math.random() * 3) + "s");
      c.style.setProperty("--l", (-Math.random() * 5) + "s");
      bu.appendChild(c);
    }
  }

  // 14. Motor Canvas 2D Ultra Ligero y Sedoso: "Aurora Néctar & Hielo Glacial"
  // Optimizado con texturas pre-renderizadas en GPU para flujo continuo a 60 FPS
  function initAmbientCanvas() {
    var canvas = document.getElementById("ambient-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var width = 0, height = 0;
    var animId = null;
    var isRunning = true;

    // Pre-renderizar orbes de néctar en un lienzo fuera de pantalla (0% cálculo de gradientes en vivo)
    function createGlowSprite(colorInner, colorMid) {
      var sc = document.createElement("canvas");
      sc.width = 256;
      sc.height = 256;
      var sctx = sc.getContext("2d");
      var g = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, colorInner);
      g.addColorStop(0.45, colorMid);
      g.addColorStop(1, "transparent");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 256, 256);
      return sc;
    }

    var spriteMango = createGlowSprite("rgba(255, 183, 3, 0.22)", "rgba(251, 133, 0, 0.12)");
    var spriteBerry = createGlowSprite("rgba(255, 30, 86, 0.20)", "rgba(201, 24, 74, 0.10)");
    var spriteMint = createGlowSprite("rgba(16, 185, 129, 0.18)", "rgba(52, 211, 153, 0.08)");

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // 16 Micro-cristales suaves de hielo (consumo de CPU prácticamente nulo)
    var bubbles = [];
    var bubbleColors = ["rgba(216, 251, 255, ", "rgba(255, 230, 0, ", "rgba(255, 117, 143, ", "rgba(167, 243, 208, "];
    for (var i = 0; i < 16; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.5 + Math.random() * 2,
        speedY: 0.35 + Math.random() * 0.45,
        swaySpeed: 0.001 + Math.random() * 0.0015,
        swayAmp: 12 + Math.random() * 15,
        alpha: 0.2 + Math.random() * 0.35,
        color: bubbleColors[i % bubbleColors.length],
        seed: Math.random() * 1000
      });
    }

    var startTime = performance.now();

    function render(now) {
      if (!isRunning) return;

      var t = now - startTime;

      // 1. Fondo base verde selva esmeralda
      ctx.fillStyle = "#04140B";
      ctx.fillRect(0, 0, width, height);

      // 2. Orbes de néctar flotante con dibujo directo de textura (GPU hardware blit)
      var size1 = Math.max(width, height) * 0.85;
      var x1 = width * 0.65 + Math.sin(t * 0.0004) * (width * 0.1);
      var y1 = height * 0.25 + Math.cos(t * 0.0003) * (height * 0.08);
      ctx.drawImage(spriteMango, x1 - size1 * 0.5, y1 - size1 * 0.5, size1, size1);

      var size2 = Math.max(width, height) * 0.8;
      var x2 = width * 0.2 + Math.cos(t * 0.0004) * (width * 0.08);
      var y2 = height * 0.7 + Math.sin(t * 0.0003) * (height * 0.1);
      ctx.drawImage(spriteBerry, x2 - size2 * 0.5, y2 - size2 * 0.5, size2, size2);

      var size3 = Math.max(width, height) * 0.7;
      var x3 = width * 0.5 + Math.sin(t * 0.0003 + 1) * (width * 0.08);
      var y3 = height * 0.5 + Math.cos(t * 0.0003 + 1) * (height * 0.08);
      ctx.drawImage(spriteMint, x3 - size3 * 0.5, y3 - size3 * 0.5, size3, size3);

      // 3. Cristales suaves ascendentes
      for (var b = 0; b < bubbles.length; b++) {
        var p = bubbles[b];
        p.y -= p.speedY;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        var curX = p.x + Math.sin(t * p.swaySpeed + p.seed) * p.swayAmp;
        ctx.beginPath();
        ctx.arc(curX, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ")";
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
      } else {
        isRunning = true;
        startTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    });

    animId = requestAnimationFrame(render);
  }

  // 15. Modal Helpers
  window.cerrarModales = function () {
    $$(".modal-overlay").forEach(function (m) { m.classList.remove("active"); });
  };

  $$(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) cerrarModales();
    });
  });

  // Acceso Secreto al Panel Admin (4 toques seguidos en el logo del header)
  var logoClicks = 0;
  var logoClickTimer = null;
  var headerLogo = document.getElementById("header-brand-logo");

  if (headerLogo) {
    headerLogo.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      logoClicks++;
      clearTimeout(logoClickTimer);

      if (logoClicks >= 4) {
        logoClicks = 0;
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([40, 50, 40]);
        }
        var token = localStorage.getItem("frost_admin_token");
        if (token && window.abrirPanelAdmin) {
          window.abrirPanelAdmin();
        } else {
          var modal = document.getElementById("modal-admin-login");
          if (modal) {
            var uInput = document.getElementById("admin-user-input");
            var pInput = document.getElementById("admin-pass-input");
            var errEl = document.getElementById("admin-login-error");
            if (uInput) uInput.value = "";
            if (pInput) pInput.value = "";
            if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }
            modal.classList.add("active");
          }
        }
      } else {
        logoClickTimer = setTimeout(function () {
          logoClicks = 0;
        }, 2200);
      }
    });
  }

  var btnAdmin = document.getElementById("btn-admin-modal-open");
  if (btnAdmin) {
    btnAdmin.addEventListener("click", function (e) {
      e.preventDefault();
      var token = localStorage.getItem("frost_admin_token");
      if (token && window.abrirPanelAdmin) {
        window.abrirPanelAdmin();
      } else {
        var modal = document.getElementById("modal-admin-login");
        if (modal) modal.classList.add("active");
      }
    });
  }

  window.cargarCatalogoPublico = cargarCatalogo;

  // Inicializar
  document.addEventListener("DOMContentLoaded", function () {
    renderCatalog();
    initAmbientCanvas();
    cargarCatalogo();
    loadSavedCart();
    actualizarBotonFlotanteWhatsapp();
    if (window.aplicarColoresGranizadoHero) window.aplicarColoresGranizadoHero();
  });
})();
