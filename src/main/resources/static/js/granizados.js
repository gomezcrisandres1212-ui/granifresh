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

  // 1. Aplicación de Colores de Marca al Trío de Granizados Hero (desde Configuración del Negocio)
  function aplicarColoresGranizadoHero(c1, c2, c1Izq, c2Izq, c1Der, c2Der) {
    var col1 = c1 || "#E11D48";
    var col2 = c2 || "#FF007F";
    var col1Izq = c1Izq || "#10B981";
    var col2Izq = c2Izq || "#00E5FF";
    var col1Der = c1Der || "#FFB703";
    var col2Der = c2Der || "#FB8500";
    if (R) {
      // Vaso Central
      R.style.setProperty("--t1", col1);
      R.style.setProperty("--t2", col1);
      R.style.setProperty("--t3", col1);
      R.style.setProperty("--t4", col2);
      R.style.setProperty("--t5", col2);
      R.style.setProperty("--t6", col2);

      // Vaso Izquierdo
      R.style.setProperty("--t1-izq", col1Izq);
      R.style.setProperty("--t2-izq", col1Izq);
      R.style.setProperty("--t3-izq", col1Izq);
      R.style.setProperty("--t4-izq", col2Izq);
      R.style.setProperty("--t5-izq", col2Izq);
      R.style.setProperty("--t6-izq", col2Izq);

      // Vaso Derecho
      R.style.setProperty("--t1-der", col1Der);
      R.style.setProperty("--t2-der", col1Der);
      R.style.setProperty("--t3-der", col1Der);
      R.style.setProperty("--t4-der", col2Der);
      R.style.setProperty("--t5-der", col2Der);
      R.style.setProperty("--t6-der", col2Der);
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
    var dirPickupEl = $("#chk-pickup-direccion-desc");
    if (dirPickupEl && config.direccionSede) {
      dirPickupEl.textContent = "Recoge inmediatamente sin costo en " + config.direccionSede + ".";
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
        if (data.configuracion) {
          aplicarColoresGranizadoHero(
            data.configuracion.colorGranizado1,
            data.configuracion.colorGranizado2,
            data.configuracion.colorGranizado1Izq,
            data.configuracion.colorGranizado2Izq,
            data.configuracion.colorGranizado1Der,
            data.configuracion.colorGranizado2Der
          );
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

    var dirPickupEl = $("#chk-pickup-direccion-desc");
    if (dirPickupEl && rawCatalog.configuracion && rawCatalog.configuracion.direccionSede) {
      dirPickupEl.textContent = "Recoge inmediatamente sin costo en " + rawCatalog.configuracion.direccionSede + ".";
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

    var descPuntos = (window.GraniClubState && window.GraniClubState.descuentoCalculado) || 0;
    var total = Math.max(0, (subtotal - descPuntos) + costoEnvio);

    var elSub = $("#checkout-subtotal-val");
    if (elSub) elSub.textContent = fmt(subtotal);
    var elStep1Sub = $("#chk-step1-subtotal");
    if (elStep1Sub) elStep1Sub.textContent = fmt(subtotal);

    var elDescRow = $("#chk-row-descuento-puntos");
    var elDescVal = $("#checkout-descuento-puntos-val");
    if (elDescRow && elDescVal) {
      if (descPuntos > 0) {
        elDescRow.style.display = "flex";
        elDescVal.textContent = "-" + fmt(descPuntos);
      } else {
        elDescRow.style.display = "none";
      }
    }

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
        var dirSede = (rawCatalog.configuracion && rawCatalog.configuracion.direccionSede) || "nuestro punto físico";
        resDir.textContent = checkoutState.metodoEntrega === "DOMICILIO"
          ? dir
          : ("Recogida en " + dirSede);
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
      if (window.sincronizarCheckoutGraniPoints) window.sincronizarCheckoutGraniPoints();
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
    var dirPickupEl = $("#chk-pickup-direccion-desc");
    if (dirPickupEl && rawCatalog.configuracion && rawCatalog.configuracion.direccionSede) {
      dirPickupEl.textContent = "Recoge inmediatamente sin costo en " + rawCatalog.configuracion.direccionSede + ".";
    }

    if (window.GraniClubState && window.GraniClubState.cliente) {
      var cl = window.GraniClubState.cliente;
      var elN = $("#checkout-nombre"); if (elN && !elN.value) elN.value = cl.nombre || "";
      var elT = $("#checkout-telefono"); if (elT && !elT.value) elT.value = cl.telefono || "";
      var elD = $("#checkout-direccion"); if (elD && !elD.value && cl.direccionPredeterminada) elD.value = cl.direccionPredeterminada;
      var elB = $("#checkout-barrio"); if (elB && !elB.value && cl.barrioPredeterminado) elB.value = cl.barrioPredeterminado;
      var elI = $("#checkout-indicaciones"); if (elI && !elI.value && cl.indicacionesPredeterminadas) elI.value = cl.indicacionesPredeterminadas;
    }

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

    var descPuntos = (window.GraniClubState && window.GraniClubState.descuentoCalculado) || 0;
    var puntosUsados = (window.GraniClubState && window.GraniClubState.puntosAUsar) || 0;
    var clienteId = (window.GraniClubState && window.GraniClubState.cliente && window.GraniClubState.cliente.id) || null;
    var total = Math.max(0, (subtotal - descPuntos) + costoEnvio);

    var dirSede = (rawCatalog.configuracion && rawCatalog.configuracion.direccionSede) || "el local comercial";
    var dirFinal = isDom
      ? $("#checkout-direccion").value.trim()
      : ("Recogida en " + dirSede);

    var payload = {
      clienteNombre: $("#checkout-nombre").value.trim(),
      clienteTelefono: $("#checkout-telefono").value.trim(),
      clienteDireccion: dirFinal,
      tipoEntrega: isDom ? "DOMICILIO" : "RECOGIDA",
      barrio: isDom ? "Domicilio Express" : "Recogida Local",
      indicaciones: $("#checkout-indicaciones").value.trim() + (!isDom ? " [RECOGIDA EN LOCAL FÍSICO]" : ""),
      metodoPago: checkoutState.metodoPago,
      clienteId: clienteId,
      puntosUsados: puntosUsados,
      descuentoPuntos: descPuntos,
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

      // Resetear canje de puntos
      if (window.GraniClubState) {
        window.GraniClubState.puntosAUsar = 0;
        window.GraniClubState.descuentoCalculado = 0;
      }
      if (window.recargarPerfilClienteSiExiste) {
        window.recargarPerfilClienteSiExiste();
      }

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

      var entregaTxt = isDom ? "🛵 Domicilio Express a " + payload.clienteDireccion : ("🏪 Recogida en punto físico (" + dirSede + ")");

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

  // 13. Micro-Burbujas SVG Dinámicas en el Trío de Vasos
  var NS = "http://www.w3.org/2000/svg";
  ["#bubs", "#bubs-left", "#bubs-right"].forEach(function(sel) {
    var bu = $(sel);
    if (bu) {
      for (var i = 0; i < 10; i++) {
        var c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", 92 + Math.random() * 136);
        c.setAttribute("cy", 340);
        c.setAttribute("r", 1.8 + Math.random() * 3);
        c.setAttribute("class", "bub");
        c.style.setProperty("--d", (2.8 + Math.random() * 3) + "s");
        c.style.setProperty("--l", (-Math.random() * 5) + "s");
        bu.appendChild(c);
      }
    }
  });

  // 14. Motor Canvas 2D Ultra Ligero y Sedoso: "Aurora Néctar & Hielo Glacial"
  // Optimizado con texturas pre-renderizadas en GPU para flujo continuo a 60 FPS
  function initAmbientCanvas() {
    var canvas = document.getElementById("ambient-canvas");
    if (!canvas) return;
    // En móviles apagamos el canvas de 60fps para 0% de uso de CPU y desplazamiento ultra fluido
    if (window.innerWidth <= 768) return;
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
      if (window.innerWidth <= 768) {
        if (animId) cancelAnimationFrame(animId);
        isRunning = false;
        return;
      }
      if (!isRunning) {
        isRunning = true;
        startTime = performance.now();
        animId = requestAnimationFrame(render);
      }
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

  // ==========================================================
  // 16. CLUB GRANIPOINTS & DINÁMICAS (RULETA & RASPA Y GANA)
  // ==========================================================
  var GraniClubState = {
    token: localStorage.getItem("granifresh_cliente_token") || null,
    cliente: null,
    configPublica: null,
    estadoJuegos: null,
    puntosAUsar: 0,
    descuentoCalculado: 0,
    ruletaGirando: false,
    ruletaAnguloActual: 0,
    raspaPremioActual: null,
    raspaCompletado: false
  };
  window.GraniClubState = GraniClubState;

  async function cargarConfigPublicaJuegos() {
    try {
      var res = await fetch("/api/cliente/config-publica");
      if (res.ok) {
        GraniClubState.configPublica = await res.json();
        var pts = (GraniClubState.configPublica.puntosBienvenidaRegistro !== undefined)
          ? GraniClubState.configPublica.puntosBienvenidaRegistro
          : GraniClubState.configPublica.puntosBienvenida;
        aplicarTextosPuntosBienvenida(pts);
      }
    } catch (e) {
      console.warn("No se pudo cargar la config pública de juegos:", e);
    }
  }

  function aplicarTextosPuntosBienvenida(pts) {
    var num = (pts !== undefined && pts !== null) ? pts : 20;
    try { localStorage.setItem("grani_pts_bienvenida", num); } catch(e){}
    var elPromoTxt = document.getElementById("promo-pts-regalo-txt");
    if (elPromoTxt) elPromoTxt.textContent = "+" + num + " GraniPoints";
    var elPerkTxt = document.getElementById("promo-perk-pts-txt");
    if (elPerkTxt) elPerkTxt.textContent = "+" + num + " pts Regalo";
    var elTabBadge = document.getElementById("tab-auth-pts-badge");
    if (elTabBadge) elTabBadge.textContent = "+" + num + " pts";
    var elBtnRegTxt = document.getElementById("btn-reg-pts-txt");
    if (elBtnRegTxt) elBtnRegTxt.textContent = num;
  }

  async function inicializarGraniClub() {
    try {
      var cachedPts = localStorage.getItem("grani_pts_bienvenida");
      aplicarTextosPuntosBienvenida(cachedPts !== null ? parseInt(cachedPts, 10) : 20);
    } catch (e) {
      aplicarTextosPuntosBienvenida(20);
    }
    await cargarConfigPublicaJuegos();

    // Eventos de botones abrir club
    var btnClub = document.getElementById("btn-open-graniclub");
    if (btnClub) btnClub.addEventListener("click", abrirModalGraniClub);

    var bannerHero = document.getElementById("hero-granipoints-banner");
    if (bannerHero) bannerHero.addEventListener("click", abrirModalGraniClub);

    if (GraniClubState.token) {
      try {
        var res = await fetch("/api/cliente/perfil", {
          headers: { "Authorization": "Bearer " + GraniClubState.token }
        });
        if (res.ok) {
          GraniClubState.cliente = await res.json();
          actualizarUIPerfilCliente();
        } else {
          // Token inválido o expirado
          GraniClubState.token = null;
          GraniClubState.cliente = null;
          localStorage.removeItem("granifresh_cliente_token");
          actualizarUIPerfilCliente();
        }
      } catch (err) {
        console.warn("Error al verificar perfil cliente:", err);
      }
    } else {
      actualizarUIPerfilCliente();
    }
  }
  window.inicializarGraniClub = inicializarGraniClub;
  window.recargarPerfilClienteSiExiste = inicializarGraniClub;

  function actualizarUIPerfilCliente() {
    var cl = GraniClubState.cliente;
    var badgeNav = document.getElementById("nav-points-badge");
    var labelNav = document.getElementById("nav-club-label");
    var viewAuth = document.getElementById("club-view-auth");
    var viewPerfil = document.getElementById("club-view-perfil");

    if (cl) {
      if (labelNav) {
        var primNombre = cl.nombre ? cl.nombre.split(" ")[0] : "Mi Perfil";
        labelNav.textContent = primNombre;
      }
      if (badgeNav) {
        badgeNav.style.display = "inline-block";
        badgeNav.textContent = (cl.granipoints || 0).toLocaleString("es-CO") + " pts";
      }

      if (viewAuth) viewAuth.style.display = "none";
      if (viewPerfil) viewPerfil.style.display = "block";

      var elNom = document.getElementById("cl-perfil-nombre");
      if (elNom) elNom.textContent = cl.nombre || "Cliente";

      var elTel = document.getElementById("cl-perfil-telefono");
      if (elTel) elTel.textContent = "WhatsApp: +57 " + (cl.telefono || "");

      var elPts = document.getElementById("cl-perfil-puntos");
      if (elPts) elPts.textContent = (cl.granipoints || 0).toLocaleString("es-CO");

      var elPtsVal = document.getElementById("cl-perfil-puntos-valor");
      if (elPtsVal) {
        var valPunto = (GraniClubState.configPublica && GraniClubState.configPublica.valorPesosPorPunto) || 20;
        var equiv = (cl.granipoints || 0) * valPunto;
        elPtsVal.textContent = "Equivale a ~" + fmt(equiv) + " COP en pedidos";
      }

      refrescarEstadoJuegosCliente();

    } else {
      if (labelNav) labelNav.textContent = "GraniPoints";
      if (badgeNav) badgeNav.style.display = "none";
      if (viewAuth) viewAuth.style.display = "block";
      if (viewPerfil) viewPerfil.style.display = "none";
    }
  }

  async function refrescarEstadoJuegosCliente() {
    if (!GraniClubState.token) return;
    try {
      var res = await fetch("/api/cliente/juegos/estado", {
        headers: { "Authorization": "Bearer " + GraniClubState.token }
      });
      if (res.ok) {
        var est = await res.json();
        GraniClubState.estadoJuegos = est;

        var bRul = document.getElementById("badge-giros-disp");
        if (bRul) {
          var totG = est.totalGirosDisponibles || 0;
          bRul.textContent = totG > 0 ? (totG + " disponible" + (totG > 1 ? "s" : "")) : "0 giros hoy";
          bRul.className = "cgc-badge" + (totG > 0 ? " available" : "");
        }

        var bRas = document.getElementById("badge-raspas-disp");
        if (bRas) {
          var totR = est.totalRaspasDisponibles || 0;
          bRas.textContent = totR > 0 ? (totR + " disponible" + (totR > 1 ? "s" : "")) : "0 raspas hoy";
          bRas.className = "cgc-badge" + (totR > 0 ? " available" : "");
        }
      }
    } catch (e) {
      console.warn("Error al cargar estado de juegos:", e);
    }
  }

  window.abrirModalGraniClub = function () {
    var modal = document.getElementById("modal-graniclub");
    if (modal) modal.classList.add("active");
    if (GraniClubState.cliente) {
      actualizarUIPerfilCliente();
      cargarHistorialCliente();
    }
  };

  window.cambiarAuthTab = function (tab) {
    var btnL = document.getElementById("tab-auth-login");
    var btnR = document.getElementById("tab-auth-registro");
    var formL = document.getElementById("form-cliente-login");
    var formR = document.getElementById("form-cliente-registro");

    if (tab === "registro") {
      if (btnL) btnL.classList.remove("active");
      if (btnR) btnR.classList.add("active");
      if (formL) formL.style.display = "none";
      if (formR) formR.style.display = "block";
      setTimeout(function () {
        if (window.inicializarMapaRegistroCliente) window.inicializarMapaRegistroCliente();
      }, 150);
    } else {
      if (btnR) btnR.classList.remove("active");
      if (btnL) btnL.classList.add("active");
      if (formR) formR.style.display = "none";
      if (formL) formL.style.display = "block";
    }
  };

  var clienteRegMap = null;
  var clienteRegMarker = null;
  var regGeocodeTimer = null;

  window.inicializarMapaRegistroCliente = function () {
    var mapContainer = document.getElementById("mapa-registro-cliente");
    if (!mapContainer || typeof L === "undefined") return;

    var lat = parseFloat(document.getElementById("cl-reg-lat") ? document.getElementById("cl-reg-lat").value : "10.4075") || 10.4075;
    var lng = parseFloat(document.getElementById("cl-reg-lng") ? document.getElementById("cl-reg-lng").value : "-75.5255") || -75.5255;

    if (!clienteRegMap) {
      clienteRegMap = L.map("mapa-registro-cliente", {
        center: [lat, lng],
        zoom: 15,
        scrollWheelZoom: true
      });

      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        attribution: "Leaflet | &copy; Google Maps"
      }).addTo(clienteRegMap);

      clienteRegMarker = L.marker([lat, lng], { draggable: true }).addTo(clienteRegMap);

      clienteRegMarker.bindPopup('<b style="color:#00B4D8;">📍 Tu Ubicación de Entrega</b><br><small>Arrastra este pin para marcar tu casa exacta</small>').openPopup();

      clienteRegMarker.on("dragend", function (e) {
        var pos = e.target.getLatLng();
        var elLat = document.getElementById("cl-reg-lat");
        var elLng = document.getElementById("cl-reg-lng");
        if (elLat) elLat.value = pos.lat.toFixed(6);
        if (elLng) elLng.value = pos.lng.toFixed(6);
        reverseGeocodeRegistro(pos.lat, pos.lng);
      });

      clienteRegMap.on("click", function (e) {
        clienteRegMarker.setLatLng(e.latlng);
        var elLat = document.getElementById("cl-reg-lat");
        var elLng = document.getElementById("cl-reg-lng");
        if (elLat) elLat.value = e.latlng.lat.toFixed(6);
        if (elLng) elLng.value = e.latlng.lng.toFixed(6);
        reverseGeocodeRegistro(e.latlng.lat, e.latlng.lng);
      });

      // Escuchar cambios de escritura en los campos de Dirección y Barrio para mover el pin automáticamente
      var inpDir = document.getElementById("cl-reg-dir");
      var inpBar = document.getElementById("cl-reg-barrio");
      var onDirInput = function () {
        if (isReverseGeocodingRegistro) return;
        clearTimeout(regGeocodeTimer);
        regGeocodeTimer = setTimeout(function () {
          geocodificarDireccionRegistro();
        }, 550);
      };
      if (inpDir) inpDir.addEventListener("input", onDirInput);
      if (inpBar) inpBar.addEventListener("input", onDirInput);
    } else {
      clienteRegMap.setView([lat, lng], 15);
      clienteRegMarker.setLatLng([lat, lng]);
    }

    setTimeout(function () {
      if (clienteRegMap) clienteRegMap.invalidateSize();
    }, 250);
  };

  var isReverseGeocodingRegistro = false;

  async function geocodificarDireccionRegistro() {
    var dir = document.getElementById("cl-reg-dir") ? document.getElementById("cl-reg-dir").value.trim() : "";
    var bar = document.getElementById("cl-reg-barrio") ? document.getElementById("cl-reg-barrio").value.trim() : "";
    if (!dir && !bar) return;

    var query = dir + (bar ? ", " + bar : "") + ", Cartagena, Colombia";
    try {
      var url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(query) + "&limit=1";
      var res = await fetch(url, { headers: { "Accept-Language": "es" } });
      if (res.ok) {
        var data = await res.json();
        if (data && data.length > 0) {
          var lat = parseFloat(data[0].lat);
          var lon = parseFloat(data[0].lon);
          var elLat = document.getElementById("cl-reg-lat");
          var elLng = document.getElementById("cl-reg-lng");
          if (elLat) elLat.value = lat.toFixed(6);
          if (elLng) elLng.value = lon.toFixed(6);
          if (clienteRegMap && clienteRegMarker) {
            clienteRegMap.setView([lat, lon], 16);
            clienteRegMarker.setLatLng([lat, lon]);
            clienteRegMarker.setPopupContent('<b style="color:#00B4D8;">📍 ' + escapeHtmlText(dir) + '</b><br><small>Barrio: ' + escapeHtmlText(bar) + '</small>').openPopup();
          }
        }
      }
    } catch (e) {
      console.warn("Geocodificación registro error:", e);
    }
  }

  async function reverseGeocodeRegistro(lat, lng) {
    try {
      var url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lng;
      var res = await fetch(url, { headers: { "Accept-Language": "es" } });
      if (res.ok) {
        var data = await res.json();
        if (data) {
          var addr = data.address || {};
          // Extraer la vía principal y número
          var via = addr.road || addr.pedestrian || addr.footway || addr.street || addr.avenue || "";
          var num = addr.house_number ? " #" + addr.house_number : "";
          var dirTexto = "";
          if (via) {
            dirTexto = (via + num).trim();
          } else if (data.display_name) {
            var partes = data.display_name.split(",");
            dirTexto = partes[0] ? partes[0].trim() : "";
          }

          // Extraer el barrio o sector
          var barrioTexto = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.city_district || "";
          if (!barrioTexto && data.display_name) {
            var partes = data.display_name.split(",");
            if (partes.length > 1) barrioTexto = partes[1].trim();
          }

          var inpDir = document.getElementById("cl-reg-dir");
          var inpBar = document.getElementById("cl-reg-barrio");

          isReverseGeocodingRegistro = true;
          if (inpDir && dirTexto) {
            inpDir.value = dirTexto;
            inpDir.dispatchEvent(new Event('input', { bubbles: true }));
          }
          if (inpBar && barrioTexto) {
            inpBar.value = barrioTexto;
            inpBar.dispatchEvent(new Event('input', { bubbles: true }));
          }
          setTimeout(function () {
            isReverseGeocodingRegistro = false;
          }, 350);

          if (clienteRegMarker) {
            clienteRegMarker.setPopupContent(
              '<b style="color:#00B4D8;">📍 ' + escapeHtmlText(dirTexto || "Ubicación fijada") + '</b><br>' +
              '<small style="color:#10B981; font-weight:700;">Barrio: ' + escapeHtmlText(barrioTexto || "Cartagena") + '</small>'
            ).openPopup();
          }
        }
      }
    } catch (e) {
      console.warn("Error en reverseGeocodeRegistro:", e);
    }
  }

  window.obtenerUbicacionGPSRegistro = function () {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      var elLat = document.getElementById("cl-reg-lat");
      var elLng = document.getElementById("cl-reg-lng");
      if (elLat) elLat.value = lat.toFixed(6);
      if (elLng) elLng.value = lng.toFixed(6);
      if (clienteRegMap && clienteRegMarker) {
        clienteRegMap.setView([lat, lng], 17);
        clienteRegMarker.setLatLng([lat, lng]);
        clienteRegMarker.setPopupContent('<b style="color:#10B981;">📍 Tu Ubicación GPS Actual</b>').openPopup();
      }
      reverseGeocodeRegistro(lat, lng);
      if (window.showToast) window.showToast("Ubicación GPS establecida 📍", "success");
    }, function (err) {
      alert("No pudimos acceder a tu GPS. Por favor escribe tu dirección.");
    }, { enableHighAccuracy: true, timeout: 8000 });
  };

  window.registrarCliente = async function (e) {
    e.preventDefault();
    var nombre = document.getElementById("cl-reg-nombre").value.trim();
    var telefono = document.getElementById("cl-reg-tel").value.trim();
    var contrasena = document.getElementById("cl-reg-pass").value;
    var direccion = document.getElementById("cl-reg-dir").value.trim();
    var barrio = document.getElementById("cl-reg-barrio") ? document.getElementById("cl-reg-barrio").value.trim() : "";
    var indicaciones = document.getElementById("cl-reg-indicaciones") ? document.getElementById("cl-reg-indicaciones").value.trim() : "";
    var latitud = parseFloat(document.getElementById("cl-reg-lat") ? document.getElementById("cl-reg-lat").value : "10.4075") || 10.4075;
    var longitud = parseFloat(document.getElementById("cl-reg-lng") ? document.getElementById("cl-reg-lng").value : "-75.5255") || -75.5255;

    if (!nombre || !telefono || !contrasena || !direccion || !barrio || !indicaciones) {
      window.showToast("Por favor completa todos los campos obligatorios.", "error");
      return;
    }

    try {
      var res = await fetch("/api/cliente/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre,
          telefono: telefono,
          contrasena: contrasena,
          direccion: direccion,
          barrio: barrio,
          indicaciones: indicaciones,
          latitud: latitud,
          longitud: longitud
        })
      });
      var data = await res.json();
      if (!res.ok || !data.exito) {
        window.showToast(data.mensaje || "Error al crear la cuenta", "error");
        return;
      }

      GraniClubState.token = data.token;
      GraniClubState.cliente = data.cliente;
      localStorage.setItem("granifresh_cliente_token", data.token);

      // Auto rellenar checkout con los datos del perfil
      var chkNom = document.getElementById("checkout-nombre");
      if (chkNom && !chkNom.value) chkNom.value = data.cliente.nombre || "";
      var chkTel = document.getElementById("checkout-telefono");
      if (chkTel && !chkTel.value) chkTel.value = data.cliente.telefono || "";
      var chkDir = document.getElementById("checkout-direccion");
      if (chkDir && !chkDir.value) chkDir.value = data.cliente.direccionPredeterminada || "";
      var chkBar = document.getElementById("checkout-barrio");
      if (chkBar && !chkBar.value && data.cliente.barrioPredeterminado) chkBar.value = data.cliente.barrioPredeterminado;

      window.showToast("¡Bienvenido al Club GraniPoints! 🎉 Has recibido 30 puntos de regalo.", "success");
      lanzarConfetiCelebracion();
      actualizarUIPerfilCliente();
      sincronizarCheckoutGraniPoints();

    } catch (err) {
      console.error("Error al registrar cliente:", err);
      window.showToast("Error de conexión al servidor.", "error");
    }
  };

  window.loginCliente = async function (e) {
    e.preventDefault();
    var telefono = document.getElementById("cl-login-tel").value.trim();
    var contrasena = document.getElementById("cl-login-pass").value;

    try {
      var res = await fetch("/api/cliente/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono: telefono, contrasena: contrasena })
      });
      var data = await res.json();
      if (!res.ok || !data.exito) {
        window.showToast(data.mensaje || "Número o contraseña incorrectos.", "error");
        return;
      }

      GraniClubState.token = data.token;
      GraniClubState.cliente = data.cliente;
      localStorage.setItem("granifresh_cliente_token", data.token);

      window.showToast("¡Hola de nuevo " + (data.cliente.nombre ? data.cliente.nombre.split(" ")[0] : "") + "! 🥤", "success");
      actualizarUIPerfilCliente();

    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      window.showToast("Error al conectar con el servidor.", "error");
    }
  };

  window.cerrarSesionCliente = function () {
    GraniClubState.token = null;
    GraniClubState.cliente = null;
    GraniClubState.puntosAUsar = 0;
    GraniClubState.descuentoCalculado = 0;
    localStorage.removeItem("granifresh_cliente_token");
    actualizarUIPerfilCliente();
    actualizarValoresTotales();
    window.showToast("Sesión cerrada correctamente.", "info");
  };

  window.cargarHistorialCliente = async function () {
    var cont = document.getElementById("cl-historial-lista");
    if (!cont || !GraniClubState.token) return;

    try {
      var res = await fetch("/api/cliente/historial-puntos", {
        headers: { "Authorization": "Bearer " + GraniClubState.token }
      });
      if (!res.ok) return;
      var lista = await res.json();

      if (!lista || lista.length === 0) {
        cont.innerHTML = '<small style="color:var(--mut); text-align:center; padding:10px;">Aún no registras movimientos de puntos.</small>';
        return;
      }

      cont.innerHTML = lista.map(function (t) {
        var fechaStr = t.fecha ? new Date(t.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short" }) : "";
        var esPos = t.puntos >= 0;
        var ptsColor = esPos ? "#10B981" : "#EF4444";
        var signo = esPos ? "+" : "";

        return `
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <div>
              <div style="font-size:0.82rem; font-weight:700; color:#FFF;">${escapeHtmlText(t.motivo || t.tipo)}</div>
              <small style="color:var(--mut); font-size:0.72rem;">${fechaStr}</small>
            </div>
            <strong style="color:${ptsColor}; font-size:0.95rem;">${signo}${t.puntos}</strong>
          </div>
        `;
      }).join("");

    } catch (e) {
      console.warn("Error cargando historial de puntos:", e);
    }
  };

  // ==========================================
  // RULETA GLACIAL INTERACTIVA
  // ==========================================
  window.abrirRuletaGlacial = async function () {
    if (!GraniClubState.cliente) {
      abrirModalGraniClub();
      return;
    }

    await refrescarEstadoJuegosCliente();
    var est = GraniClubState.estadoJuegos;
    var sectores = (est && est.premiosRuleta) || (GraniClubState.configPublica && GraniClubState.configPublica.premiosRuleta) || [];

    dibujarRuletaGlacial(sectores, GraniClubState.ruletaAnguloActual || 0);

    var resBox = document.getElementById("ruleta-result-box");
    if (resBox) resBox.style.display = "none";

    var txtInt = document.getElementById("ruleta-intentos-txt");
    var tot = (est && est.totalGirosDisponibles) || 0;
    if (txtInt) txtInt.textContent = "Giros disponibles: " + tot;

    var btn = document.getElementById("btn-spin-wheel");
    if (btn) {
      btn.disabled = tot <= 0;
      btn.style.opacity = tot <= 0 ? "0.5" : "1";
    }

    var modal = document.getElementById("modal-ruleta");
    if (modal) modal.classList.add("active");
  };

  function dibujarRuletaGlacial(sectores, anguloRad) {
    var canvas = document.getElementById("canvas-ruleta");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var cx = width / 2;
    var cy = height / 2;
    var radius = cx - 10;
    var numSectores = sectores.length || 8;
    var arc = (2 * Math.PI) / numSectores;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(anguloRad);

    // Gajos de la ruleta
    for (var i = 0; i < numSectores; i++) {
      var sAngle = i * arc;
      var eAngle = sAngle + arc;
      var sec = sectores[i] || {};

      // Segmento
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, sAngle, eAngle);
      ctx.closePath();
      ctx.fillStyle = sec.color || (i % 2 === 0 ? "#FFB703" : "#10B981");
      ctx.fill();

      // Borde y separador del gajo
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(5, 26, 16, 0.85)";
      ctx.stroke();

      // Línea de brillo radial interno
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sAngle) * radius, Math.sin(sAngle) * radius);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Texto de alta legibilidad con contorno negro
      ctx.save();
      ctx.rotate(sAngle + arc / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      var tit = sec.titulo || ("+" + (sec.puntos || 10));
      ctx.font = "800 13px 'Outfit', sans-serif";

      // Contorno oscuro para legibilidad 100% sobre cualquier color
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "rgba(5, 26, 16, 0.95)";
      ctx.strokeText(tit, radius - 22, 0);

      // Relleno blanco brillante
      ctx.fillStyle = (sec.tipo === "VACIO") ? "#E2E8F0" : "#FFFFFF";
      ctx.fillText(tit, radius - 22, 0);

      ctx.restore();
    }

    // Aro exterior dorado decorativo con remaches
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#FFB703";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius + 2.5, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#051A10";
    ctx.stroke();

    // Remaches metálicos en el perímetro
    for (var j = 0; j < numSectores; j++) {
      var dotAngle = j * arc;
      var dotX = Math.cos(dotAngle) * radius;
      var dotY = Math.sin(dotAngle) * radius;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#051A10";
      ctx.stroke();
    }

    ctx.restore();
  }

  window.ejecutarGiroRuleta = async function () {
    if (GraniClubState.ruletaGirando) return;
    var btn = document.getElementById("btn-spin-wheel");
    if (btn) btn.disabled = true;

    try {
      var res = await fetch("/api/cliente/juegos/ruleta/girar", {
        method: "POST",
        headers: { "Authorization": "Bearer " + GraniClubState.token }
      });
      var data = await res.json();
      if (!res.ok || !data.exito) {
        window.showToast(data.mensaje || "No tienes más giros disponibles hoy.", "info");
        if (btn) btn.disabled = false;
        return;
      }

      GraniClubState.ruletaGirando = true;
      var sectores = GraniClubState.estadoJuegos ? GraniClubState.estadoJuegos.premiosRuleta : [];
      var numSectores = sectores.length || 8;
      var arc = (2 * Math.PI) / numSectores;

      // Calcular ángulo final para que el sector ganador quede en la aguja (arriba = 270 grados = 1.5 * PI)
      var indiceGanador = data.indiceSector || 0;
      var anguloSectorCentro = (indiceGanador * arc) + (arc / 2);
      var anguloAguja = 1.5 * Math.PI;
      var anguloDestino = (anguloAguja - anguloSectorCentro) + (Math.PI * 2 * 6); // 6 vueltas completas

      var anguloInicial = GraniClubState.ruletaAnguloActual || 0;
      var distancia = anguloDestino - (anguloInicial % (Math.PI * 2));
      var duracion = 4200; // 4.2 segundos
      var inicio = null;

      function animar(timestamp) {
        if (!inicio) inicio = timestamp;
        var progreso = (timestamp - inicio) / duracion;

        if (progreso < 1) {
          // Curva cubic ease-out
          var t = 1 - Math.pow(1 - progreso, 3);
          var anguloActual = anguloInicial + (distancia * t);
          dibujarRuletaGlacial(sectores, anguloActual);
          requestAnimationFrame(animar);
        } else {
          GraniClubState.ruletaAnguloActual = anguloInicial + distancia;
          dibujarRuletaGlacial(sectores, GraniClubState.ruletaAnguloActual);
          GraniClubState.ruletaGirando = false;

          // Actualizar puntos
          if (GraniClubState.cliente) {
            GraniClubState.cliente.granipoints = data.saldoActual;
            actualizarUIPerfilCliente();
          }

          // Mostrar resultado
          var resBox = document.getElementById("ruleta-result-box");
          var resIcon = document.getElementById("ruleta-res-icon");
          var resTitle = document.getElementById("ruleta-res-title");
          var resDesc = document.getElementById("ruleta-res-desc");

          if (resBox && resTitle && resDesc) {
            if (resIcon) resIcon.textContent = data.premio ? (data.premio.icono || "🎉") : "🎉";
            resTitle.textContent = data.premio ? data.premio.titulo : "¡Felicidades!";
            resDesc.textContent = data.mensaje;
            resBox.style.display = "block";
          }

          var txtInt = document.getElementById("ruleta-intentos-txt");
          if (txtInt) txtInt.textContent = "Giros restantes: " + (data.intentosRestantes || 0);

          if (data.puntosGanados > 0) {
            lanzarConfetiCelebracion();
          }
        }
      }

      requestAnimationFrame(animar);

    } catch (err) {
      console.error("Error al girar ruleta:", err);
      GraniClubState.ruletaGirando = false;
      if (btn) btn.disabled = false;
    }
  };

  window.continuarDespuesDeRuleta = function () {
    var modal = document.getElementById("modal-ruleta");
    if (modal) modal.classList.remove("active");
    abrirModalGraniClub();
  };

  // ==========================================
  // RASPA Y GANA GLACIAL INTERACTIVO
  // ==========================================
  window.abrirRaspaGlacial = async function () {
    if (!GraniClubState.cliente) {
      abrirModalGraniClub();
      return;
    }

    await refrescarEstadoJuegosCliente();
    var est = GraniClubState.estadoJuegos;
    var tot = (est && est.totalRaspasDisponibles) || 0;

    if (tot <= 0) {
      window.showToast("No tienes más raspadas hoy. ¡Vuelve mañana por tu raspa gratis!", "info");
      return;
    }

    try {
      var res = await fetch("/api/cliente/juegos/raspa/jugar", {
        method: "POST",
        headers: { "Authorization": "Bearer " + GraniClubState.token }
      });
      var data = await res.json();
      if (!res.ok || !data.exito) {
        window.showToast(data.mensaje || "No se pudo iniciar la partida de raspa.", "info");
        return;
      }

      GraniClubState.raspaPremioActual = data;
      GraniClubState.raspaCompletado = false;

      // Inyectar datos del premio debajo de la escarcha
      var premio = data.premio || {};
      var elIco = document.getElementById("raspa-icon");
      if (elIco) elIco.textContent = premio.icono || "🍓";
      var elTit = document.getElementById("raspa-title");
      if (elTit) elTit.textContent = premio.titulo || "+25 GraniPoints";
      var elSub = document.getElementById("raspa-sub");
      if (elSub) elSub.textContent = premio.subtitulo || "¡Fruta natural artesanal!";

      var resBox = document.getElementById("raspa-result-box");
      if (resBox) resBox.style.display = "none";

      var txtInt = document.getElementById("raspa-intentos-txt");
      if (txtInt) txtInt.textContent = "Raspas restantes: " + (data.intentosRestantes || 0);

      prepararCanvasRaspa();

      var modal = document.getElementById("modal-raspa");
      if (modal) modal.classList.add("active");

    } catch (err) {
      console.error("Error al preparar raspa:", err);
      window.showToast("Error de conexión al servidor.", "error");
    }
  };

  function prepararCanvasRaspa() {
    var canvas = document.getElementById("canvas-raspa");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;

    ctx.globalCompositeOperation = "source-over";

    // Textura de Escarcha / Hielo Plateado Glacial
    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#94A3B8");
    grad.addColorStop(0.3, "#E2E8F0");
    grad.addColorStop(0.6, "#38BDF8");
    grad.addColorStop(1, "#0284C7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Patrón decorativo de escarcha
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    for (var i = 0; i < 200; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#0F172A";
    ctx.font = "900 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("❄️ RASPA Y GANA AQUÍ ❄️", w / 2, h / 2 - 6);
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#1E293B";
    ctx.fillText("Pasa tu dedo o cursor sobre la escarcha", w / 2, h / 2 + 18);

    // Eventos de raspado
    var isRaspando = false;

    function raspar(x, y) {
      if (GraniClubState.raspaCompletado) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      // Chequear porcentaje raspado cada 10 raspadas
      if (Math.random() < 0.25) {
        verificarPorcentajeRaspado(ctx, w, h);
      }
    }

    function getCoords(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (w / rect.width),
        y: (clientY - rect.top) * (h / rect.height)
      };
    }

    canvas.onmousedown = function (e) { isRaspando = true; var c = getCoords(e); raspar(c.x, c.y); };
    canvas.onmousemove = function (e) { if (isRaspando) { var c = getCoords(e); raspar(c.x, c.y); } };
    window.onmouseup = function () { isRaspando = false; };

    canvas.ontouchstart = function (e) { isRaspando = true; var c = getCoords(e); raspar(c.x, c.y); };
    canvas.ontouchmove = function (e) { if (isRaspando) { var c = getCoords(e); raspar(c.x, c.y); } };
    canvas.ontouchend = function () { isRaspando = false; };
  }

  function verificarPorcentajeRaspado(ctx, w, h) {
    if (GraniClubState.raspaCompletado) return;
    try {
      var imgData = ctx.getImageData(0, 0, w, h);
      var pix = imgData.data;
      var total = pix.length / 4;
      var transparentes = 0;

      // Muestrear cada 16 pixeles para máxima fluidez
      for (var i = 3; i < pix.length; i += 16) {
        if (pix[i] === 0) transparentes += 4;
      }

      var ratio = transparentes / total;
      if (ratio > 0.40) {
        completarRaspaGlacial(ctx, w, h);
      }
    } catch (e) {}
  }

  function completarRaspaGlacial(ctx, w, h) {
    GraniClubState.raspaCompletado = true;
    ctx.clearRect(0, 0, w, h);

    var data = GraniClubState.raspaPremioActual;
    if (!data) return;

    if (GraniClubState.cliente) {
      GraniClubState.cliente.granipoints = data.saldoActual;
      actualizarUIPerfilCliente();
    }

    var resBox = document.getElementById("raspa-result-box");
    var resTitle = document.getElementById("raspa-res-title");
    var resDesc = document.getElementById("raspa-res-desc");

    if (resBox && resTitle && resDesc) {
      resTitle.textContent = data.premio ? data.premio.titulo : "¡Premio Revelado!";
      resDesc.textContent = data.mensaje;
      resBox.style.display = "block";
    }

    if (data.puntosGanados > 0) {
      lanzarConfetiCelebracion();
    }
  }

  window.continuarDespuesDeRaspa = function () {
    var modal = document.getElementById("modal-raspa");
    if (modal) modal.classList.remove("active");
    abrirModalGraniClub();
  };

  // ==========================================
  // CANJE DE PUNTOS EN EL CHECKOUT
  // ==========================================
  window.sincronizarCheckoutGraniPoints = function () {
    var boxLogueado = document.getElementById("co-box-cliente-logueado");
    var boxDeslogueado = document.getElementById("co-box-cliente-deslogueado");
    var elPuntosDisp = document.getElementById("co-puntos-disponibles-txt");
    var chkUsar = document.getElementById("co-check-usar-puntos");
    var wrapExact = document.getElementById("co-exact-points-wrap");
    var bloqueGranizado = document.getElementById("co-bloque-granizado-gratis");
    var chkGranizado = document.getElementById("co-check-granizado-gratis");

    var cl = GraniClubState.cliente;
    var subtotal = cart.reduce(function (a, b) { return a + (b.p * (b.qty || 1)); }, 0);

    if (cl && cl.id) {
      if (boxLogueado) boxLogueado.style.display = "block";
      if (boxDeslogueado) boxDeslogueado.style.display = "none";
      if (elPuntosDisp) elPuntosDisp.textContent = (cl.granipoints || 0).toLocaleString("es-CO");

      var cfg = GraniClubState.configPublica || {};
      var canjeDescHabilitado = cfg.canjePuntosHabilitado !== undefined ? cfg.canjePuntosHabilitado : true;
      var canjeGranHabilitado = !!cfg.canjePorGranizadoHabilitado;
      var ptsGranizado = cfg.puntosParaGranizadoGratis || 120;
      var minPuntos = cfg.puntosMinimosCanje || 20;
      var valPunto = cfg.valorPesosPorPunto || 20;
      var maxPorc = (cfg.maximoPorcentajeDescuentoPedido || 50) / 100.0;
      var maxPesosDesc = subtotal * maxPorc;
      var maxPuntosUsables = Math.floor(maxPesosDesc / valPunto);
      var maxFinal = Math.min(cl.granipoints || 0, maxPuntosUsables);

      // Bloque Descuento en Dinero
      var bloqueDesc = document.getElementById("co-bloque-canje-descuento");
      if (bloqueDesc) {
        bloqueDesc.style.display = canjeDescHabilitado ? "block" : "none";
      }

      if (maxFinal < minPuntos || !canjeDescHabilitado) {
        if (chkUsar) {
          chkUsar.disabled = true;
          chkUsar.checked = false;
        }
        if (wrapExact) wrapExact.style.display = "none";
      } else {
        if (chkUsar) chkUsar.disabled = false;
      }

      // Bloque Granizado Gratis
      if (bloqueGranizado) {
        if (canjeGranHabilitado && cart.length > 0) {
          bloqueGranizado.style.display = "block";
          var txtPtsGran = document.getElementById("co-txt-granizado-gratis-pts");
          if (cl.granipoints >= ptsGranizado) {
            if (chkGranizado) chkGranizado.disabled = false;
            if (txtPtsGran) txtPtsGran.textContent = "Cuesta " + ptsGranizado + " GraniPoints. Tienes " + cl.granipoints + " pts disponibles.";
          } else {
            if (chkGranizado) {
              chkGranizado.disabled = true;
              chkGranizado.checked = false;
            }
            if (txtPtsGran) txtPtsGran.textContent = "Cuesta " + ptsGranizado + " GraniPoints (Tienes " + cl.granipoints + " pts, te faltan " + (ptsGranizado - cl.granipoints) + " pts).";
          }
        } else {
          bloqueGranizado.style.display = "none";
          if (chkGranizado) chkGranizado.checked = false;
        }
      }

      // Re-evaluar valores actuales
      if (chkGranizado && chkGranizado.checked) {
        toggleGranizadoGratisCanjeCheckout();
      } else if (chkUsar && chkUsar.checked) {
        actualizarInputPuntosExactosCheckout();
      } else {
        GraniClubState.puntosAUsar = 0;
        GraniClubState.descuentoCalculado = 0;
      }

    } else {
      if (boxLogueado) boxLogueado.style.display = "none";
      if (boxDeslogueado) boxDeslogueado.style.display = "block";
      if (elPuntosDisp) elPuntosDisp.textContent = "0";
      GraniClubState.puntosAUsar = 0;
      GraniClubState.descuentoCalculado = 0;
    }

    actualizarValoresTotales();
  };

  window.toggleUsarPuntosCheckout = function () {
    var chk = document.getElementById("co-check-usar-puntos");
    var wrap = document.getElementById("co-exact-points-wrap");
    var chkGranizado = document.getElementById("co-check-granizado-gratis");

    if (chk && chk.checked) {
      if (chkGranizado) chkGranizado.checked = false; // Mutuamente excluyentes
      if (wrap) wrap.style.display = "block";
      setExactPointsPreset('max');
    } else {
      if (wrap) wrap.style.display = "none";
      GraniClubState.puntosAUsar = 0;
      GraniClubState.descuentoCalculado = 0;
      actualizarValoresTotales();
    }
  };

  window.toggleGranizadoGratisCanjeCheckout = function () {
    var chkGranizado = document.getElementById("co-check-granizado-gratis");
    var chkUsar = document.getElementById("co-check-usar-puntos");
    var wrap = document.getElementById("co-exact-points-wrap");

    if (chkGranizado && chkGranizado.checked) {
      if (chkUsar) chkUsar.checked = false; // Apagar descuento por dinero
      if (wrap) wrap.style.display = "none";

      var cfg = GraniClubState.configPublica || {};
      var ptsGranizado = cfg.puntosParaGranizadoGratis || 120;
      var precio1Granizado = (cart.length > 0 && cart[0].p) ? cart[0].p : 12000;

      GraniClubState.puntosAUsar = ptsGranizado;
      GraniClubState.descuentoCalculado = precio1Granizado;
    } else {
      GraniClubState.puntosAUsar = 0;
      GraniClubState.descuentoCalculado = 0;
    }
    actualizarValoresTotales();
  };

  window.setExactPointsPreset = function (preset) {
    var input = document.getElementById("co-input-puntos-exactos");
    var cl = GraniClubState.cliente;
    if (!input || !cl) return;

    var subtotal = cart.reduce(function (a, b) { return a + (b.p * (b.qty || 1)); }, 0);
    var cfg = GraniClubState.configPublica || {};
    var valPunto = cfg.valorPesosPorPunto || 20;
    var maxPorc = (cfg.maximoPorcentajeDescuentoPedido || 50) / 100.0;
    var maxPesosDesc = subtotal * maxPorc;
    var maxPuntosUsables = Math.floor(maxPesosDesc / valPunto);
    var maxFinal = Math.min(cl.granipoints || 0, maxPuntosUsables);

    var puntos = 0;
    if (preset === 'max') {
      puntos = maxFinal;
    } else if (preset === 'half') {
      puntos = Math.floor(maxFinal / 2);
    } else if (typeof preset === 'number') {
      puntos = Math.min(preset, maxFinal);
    }

    input.value = puntos;
    actualizarInputPuntosExactosCheckout();
  };

  window.actualizarInputPuntosExactosCheckout = function () {
    var input = document.getElementById("co-input-puntos-exactos");
    var txtDesc = document.getElementById("co-descuento-pesos-txt");
    var txtHint = document.getElementById("co-exact-hint");
    var cl = GraniClubState.cliente;

    if (!input || !cl) return;

    var subtotal = cart.reduce(function (a, b) { return a + (b.p * (b.qty || 1)); }, 0);
    var cfg = GraniClubState.configPublica || {};
    var valPunto = cfg.valorPesosPorPunto || 20;
    var maxPorc = (cfg.maximoPorcentajeDescuentoPedido || 50) / 100.0;
    var maxPesosDesc = subtotal * maxPorc;
    var maxPuntosUsables = Math.floor(maxPesosDesc / valPunto);
    var maxFinal = Math.min(cl.granipoints || 0, maxPuntosUsables);

    var puntos = parseInt(input.value, 10) || 0;
    if (puntos < 0) puntos = 0;
    if (puntos > maxFinal) {
      puntos = maxFinal;
      input.value = puntos;
    }

    var descPesos = puntos * valPunto;
    GraniClubState.puntosAUsar = puntos;
    GraniClubState.descuentoCalculado = descPesos;

    if (txtDesc) txtDesc.textContent = "-" + fmt(descPesos);
    if (txtHint) {
      var restantes = Math.max(0, (cl.granipoints || 0) - puntos);
      txtHint.textContent = "Aplicando " + puntos + " pts (-" + fmt(descPesos) + "). Te quedarán " + restantes + " pts.";
    }

    actualizarValoresTotales();
  };

  function lanzarConfetiCelebracion() {
    var duration = 2500;
    var end = Date.now() + duration;
    var colors = ["#FFB703", "#10B981", "#38BDF8", "#EC4899", "#FFFFFF"];

    (function frame() {
      var canvas = document.getElementById("ambient-canvas");
      if (canvas) {
        var ctx = canvas.getContext("2d");
        for (var i = 0; i < 6; i++) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.beginPath();
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height * 0.4, Math.random() * 5 + 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  function escapeHtmlText(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ==========================================================
  // 17. VENTANA PROMOCIONAL DE BIENVENIDA / REGISTRO
  // ==========================================================
  window.cerrarPromoRegistro = function (motivo) {
    var modal = document.getElementById("modal-promo-registro");
    if (modal) modal.classList.remove("active");
    try {
      sessionStorage.setItem("grani_promo_vista", "1");
    } catch (e) {}
  };

  window.irARegistroDesdePromo = function () {
    window.cerrarPromoRegistro("registro");
    abrirModalGraniClub();
    cambiarAuthTab("registro");
  };

  function evaluarMostrarPromoBienvenida() {
    if (GraniClubState.cliente || localStorage.getItem("granifresh_cliente_token")) {
      return;
    }

    // Actualizar textos de inmediato con caché si aún no ha llegado la respuesta del servidor
    try {
      var cachedPts = localStorage.getItem("grani_pts_bienvenida");
      if (cachedPts !== null) aplicarTextosPuntosBienvenida(parseInt(cachedPts, 10));
    } catch(e) {}

    // Actualizar textos con la cantidad configurada por el admin si ya cargó
    if (GraniClubState.configPublica) {
      var pts = (GraniClubState.configPublica.puntosBienvenidaRegistro !== undefined)
        ? GraniClubState.configPublica.puntosBienvenidaRegistro
        : GraniClubState.configPublica.puntosBienvenida;
      aplicarTextosPuntosBienvenida(pts);
    }

    setTimeout(function () {
      if (GraniClubState.cliente || localStorage.getItem("granifresh_cliente_token")) return;
      if (GraniClubState.configPublica) {
        var pts = (GraniClubState.configPublica.puntosBienvenidaRegistro !== undefined)
          ? GraniClubState.configPublica.puntosBienvenidaRegistro
          : GraniClubState.configPublica.puntosBienvenida;
        aplicarTextosPuntosBienvenida(pts);
      }
      var modal = document.getElementById("modal-promo-registro");
      if (modal && !modal.classList.contains("active")) {
        modal.classList.add("active");
      }
    }, 1200);
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
    if (window.inicializarGraniClub) window.inicializarGraniClub();
    evaluarMostrarPromoBienvenida();
  });
})();
