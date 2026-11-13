// @ts-nocheck
/**
 * GRANIFRESH - Panel de Administración Ejecutivo & Centro de Control Maestro
 * Dashboard interactivo, KPIs en tiempo real, control de pedidos en vivo, finanzas,
 * catálogo con formulario integrado (INLINE - sin modales externos), historial y auditoría.
 */

const AdminState = {
    token: localStorage.getItem('frost_admin_token') || null,
    pedidos: [],
    granizados: [],
    categorias: JSON.parse(localStorage.getItem('grani_admin_categorias') || 'null') || [
        { slug: 'tropical', nombre: '🥭 Tropicales', tipo: 'Granizado' },
        { slug: 'berries', nombre: '🍓 Frutos Rojos', tipo: 'Granizado' },
        { slug: 'citrus', nombre: '🍋 Cítricos & Exóticos', tipo: 'Granizado' },
        { slug: 'especial', nombre: '⭐ Especiales Frappé', tipo: 'Especial' }
    ],
    configuracion: {},
    kpis: {},
    pestañaActiva: 'dashboard',
    filtroEstadoPedido: 'TODOS',
    busquedaPedido: '',
    filtroCategoriaGranizado: 'TODOS',
    busquedaGranizado: '',
    busquedaHistorial: '',
    admins: [],
    pollingTimer: null
};

// Formato de moneda colombiana
function fmtMoney(n) {
    return '$' + Number(n || 0).toLocaleString('es-CO');
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AdminState.token}`
    };
}

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    initAdminEvents();
    actualizarSaludoYFechaAdmin();
    const contTamanos = document.getElementById('contenedor-filas-tamanos');
    if (contTamanos && contTamanos.children.length === 0) {
        renderizarFilasTamanos({ "12oz": 13000, "16oz": 16500, "24oz": 22000 });
    }
});

function initAdminEvents() {
    // 1. Formulario de Login Admin
    const formLogin = document.getElementById('form-admin-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuario = document.getElementById('admin-user-input').value.trim();
            const contrasena = document.getElementById('admin-pass-input').value;
            const errorMsg = document.getElementById('admin-login-error');
            const submitBtn = formLogin.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Ingresar al Panel';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Verificando... ⏳';
            }
            if (errorMsg) {
                errorMsg.style.display = 'none';
                errorMsg.textContent = '';
            }

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario, contrasena })
                });
                const data = await res.json();

                if (data.autenticado && data.token) {
                    AdminState.token = data.token;
                    localStorage.setItem('frost_admin_token', data.token);

                    const displayUser = document.getElementById('admin-display-username');
                    if (displayUser) displayUser.textContent = data.nombreCompleto || data.usuario || 'Admin';

                    // 1. Cerrar modal de login instantáneamente
                    if (window.cerrarModales) window.cerrarModales();

                    // 2. Abrir panel admin de inmediato con transición fluida
                    document.getElementById('admin-view').classList.add('active');
                    cambiarPestanaAdmin(AdminState.pestañaActiva || 'dashboard');
                    iniciarAdminPolling();

                    if (window.showToast) window.showToast('¡Bienvenido al Panel de Administración! 🥭', 'success');
                } else {
                    if (errorMsg) {
                        errorMsg.style.display = 'block';
                        errorMsg.textContent = data.mensaje || 'Credenciales incorrectas.';
                    }
                }
            } catch (err) {
                if (errorMsg) {
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = 'Error al conectar con el servidor de autenticación.';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    // 2. Cerrar sesión
    const btnLogout = document.getElementById('btn-admin-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            detenerAdminPolling();
            localStorage.removeItem('frost_admin_token');
            AdminState.token = null;
            document.getElementById('admin-view').classList.remove('active');
            const uInput = document.getElementById('admin-user-input');
            const pInput = document.getElementById('admin-pass-input');
            if (uInput) uInput.value = '';
            if (pInput) pInput.value = '';
            if (window.showToast) window.showToast('Sesión administrativa cerrada', 'info');
        });
    }

    // 3. Volver a la tienda
    const btnVolver = document.getElementById('btn-admin-volver-tienda');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            detenerAdminPolling();
            document.getElementById('admin-view').classList.remove('active');
        });
    }

    // 4. Botón Refrescar datos con giro suave
    const btnRefresh = document.getElementById('btn-refresh-admin');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            const icon = document.getElementById('admin-refresh-icon');
            if (icon) icon.style.transform = 'rotate(360deg)';
            actualizarDatosAdmin();
            setTimeout(() => { if (icon) icon.style.transform = 'none'; }, 600);
            if (window.showToast) window.showToast('Datos sincronizados con MongoDB en vivo', 'info');
        });
    }

    // 5. Navegación entre pestañas de la Barra Superior Horizontal
    document.querySelectorAll('.admin-nav-item button, .admin-nav-pill[data-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnTarget = e.currentTarget;
            const tab = btnTarget.getAttribute('data-tab');
            if (tab) {
                document.querySelectorAll('.admin-nav-pill[data-tab], .admin-nav-item button').forEach(b => b.classList.remove('active'));
                btnTarget.classList.add('active');
                cambiarPestanaAdmin(tab);
            }
        });
    });

    // 6. Buscador y Filtros de Pedidos en Vivo
    const inputSearchPedidos = document.getElementById('filtro-pedidos-search');
    if (inputSearchPedidos) {
        inputSearchPedidos.addEventListener('input', (e) => {
            AdminState.busquedaPedido = e.target.value.toLowerCase().trim();
            renderizarTablaPedidos();
        });
    }

    document.querySelectorAll('#orders-status-filters .filter-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#orders-status-filters .filter-pill').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            AdminState.filtroEstadoPedido = e.currentTarget.getAttribute('data-status');
            renderizarTablaPedidos();
        });
    });

    // 7. Buscador y Filtros de Granizados
    const inputSearchGranizados = document.getElementById('filtro-granizados-search');
    if (inputSearchGranizados) {
        inputSearchGranizados.addEventListener('input', (e) => {
            AdminState.busquedaGranizado = e.target.value.toLowerCase().trim();
            renderizarTablaGranizados();
        });
    }

    document.querySelectorAll('#products-category-filters .filter-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#products-category-filters .filter-pill').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            AdminState.filtroCategoriaGranizado = e.currentTarget.getAttribute('data-cat');
            renderizarTablaGranizados();
        });
    });

    // 8. Buscador en Historial & Auditoría
    const inputSearchHist = document.getElementById('filtro-historial-search');
    if (inputSearchHist) {
        inputSearchHist.addEventListener('input', (e) => {
            AdminState.busquedaHistorial = e.target.value.toLowerCase().trim();
            cargarHistorialAdmin();
        });
    }

    // 9. Formulario y Estación de Trabajo de Granizados
    const formGranizado = document.getElementById('form-modal-granizado');
    if (formGranizado) {
        formGranizado.addEventListener('submit', guardarGranizadoAdmin);
    }

    // Reactividad en vivo para la vista previa de cliente (100% idéntica)
    const inputsLiveSync = [
        'granizado-form-nombre',
        'granizado-form-desc',
        'granizado-form-precio',
        'granizado-form-precio-regular',
        'granizado-form-insignia',
        'granizado-form-img',
        'granizado-form-tipo'
    ];
    inputsLiveSync.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => window.actualizarPreviewCliente());
            el.addEventListener('change', () => window.actualizarPreviewCliente());
        }
    });

    // Sliders de encuadre en tiempo real
    const slidersLiveSync = ['slider-img-zoom', 'slider-img-posx', 'slider-img-posy', 'slider-img-fit'];
    slidersLiveSync.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => window.actualizarPreviewCliente());
            el.addEventListener('change', () => window.actualizarPreviewCliente());
        }
    });

    // Subida local de archivos de imagen con FileReader
    const fileInputGranizado = document.getElementById('granizado-form-file');
    if (fileInputGranizado) {
        fileInputGranizado.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    const inputImgUrl = document.getElementById('granizado-form-img');
                    if (inputImgUrl) inputImgUrl.value = evt.target.result;
                    window.actualizarPreviewCliente();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 10. Formulario Configuración Negocio
    const formConfig = document.getElementById('form-admin-config');
    if (formConfig) {
        formConfig.addEventListener('submit', guardarConfiguracionAdmin);
    }

    // 11. Formulario Crear Administrador
    const formCrearAdmin = document.getElementById('form-crear-admin');
    if (formCrearAdmin) {
        formCrearAdmin.addEventListener('submit', guardarNuevoAdministradorAdmin);
    }
}

// Saludo dinámico según la hora y fecha colombiana
function actualizarSaludoYFechaAdmin() {
    const now = new Date();
    const hours = now.getHours();
    let saludo = '¡Buenas tardes, Administrador! 🥭';
    if (hours >= 5 && hours < 12) saludo = '¡Buenos días, Administrador! ☕🥭';
    else if (hours >= 19 || hours < 5) saludo = '¡Buenas noches, Administrador! 🌙🥤';

    const greetingEl = document.getElementById('admin-greeting-text');
    if (greetingEl) greetingEl.textContent = saludo;

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = new Intl.DateTimeFormat('es-CO', dateOptions).format(now);
    const dateLabel = document.getElementById('admin-current-date');
    if (dateLabel) dateLabel.textContent = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
}

// Abrir Modal de Login Admin con campos limpios
function abrirModalLoginAdmin() {
    const modal = document.getElementById('modal-admin-login');
    const uInput = document.getElementById('admin-user-input');
    const pInput = document.getElementById('admin-pass-input');
    const errorMsg = document.getElementById('admin-login-error');
    if (uInput) uInput.value = '';
    if (pInput) pInput.value = '';
    if (errorMsg) { errorMsg.style.display = 'none'; errorMsg.textContent = ''; }
    if (modal) modal.classList.add('active');
}
window.abrirModalLoginAdmin = abrirModalLoginAdmin;

// Abrir el Panel Administrativo
window.abrirPanelAdmin = async function () {
    if (!AdminState.token) {
        abrirModalLoginAdmin();
        return;
    }

    // 1. Mostrar de inmediato el panel para respuesta instantánea
    document.getElementById('admin-view').classList.add('active');
    cambiarPestanaAdmin(AdminState.pestañaActiva || 'dashboard');
    iniciarAdminPolling();

    try {
        const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
        if (!res.ok) {
            localStorage.removeItem('frost_admin_token');
            AdminState.token = null;
            document.getElementById('admin-view').classList.remove('active');
            abrirModalLoginAdmin();
            return;
        }

        const user = await res.json();
        const displayUser = document.getElementById('admin-display-username');
        if (displayUser) displayUser.textContent = user.nombreCompleto || user.usuario || 'Admin';

    } catch (e) {
        document.getElementById('admin-view').classList.remove('active');
        abrirModalLoginAdmin();
    }
};

// Polling en tiempo real (cada 15 segundos mientras el panel esté activo)
function iniciarAdminPolling() {
    detenerAdminPolling();
    AdminState.pollingTimer = setInterval(() => {
        const adminView = document.getElementById('admin-view');
        if (adminView && adminView.classList.contains('active')) {
            actualizarDatosAdminSilencioso();
        }
    }, 15000);
}

function detenerAdminPolling() {
    if (AdminState.pollingTimer) {
        clearInterval(AdminState.pollingTimer);
        AdminState.pollingTimer = null;
    }
}

async function actualizarDatosAdminSilencioso() {
    try {
        const [resKpis, resPedidos, resGranizados] = await Promise.all([
            fetch('/api/admin/dashboard/resumen', { headers: getAuthHeaders() }),
            fetch('/api/admin/pedidos', { headers: getAuthHeaders() }),
            fetch('/api/admin/granizados', { headers: getAuthHeaders() })
        ]);
        if (resKpis.ok) {
            AdminState.kpis = await resKpis.json();
            renderizarKPIsDashboard(AdminState.kpis);
        }
        if (resPedidos.ok) {
            AdminState.pedidos = await resPedidos.json();
            actualizarConteosFiltrosPedidos();
            actualizarBadgesNavegacion();
            if (AdminState.pestañaActiva === 'dashboard') renderizarPedidosUrgentesDashboard();
            if (AdminState.pestañaActiva === 'pedidos') renderizarTablaPedidos();
            if (AdminState.pestañaActiva === 'historial') cargarHistorialAdmin();
        }
        if (resGranizados.ok) {
            AdminState.granizados = await resGranizados.json();
            actualizarBadgesNavegacion();
            renderizarAlertasStockDashboard();
            if (AdminState.pestañaActiva === 'catalogo') renderizarTablaGranizados();
        }
    } catch (e) {
        // Silencioso
    }
}

function cambiarPestanaAdmin(tabName) {
    AdminState.pestañaActiva = tabName;
    document.querySelectorAll('.admin-tab-pane').forEach(p => p.style.display = 'none');

    const pane = document.getElementById(`tab-content-${tabName}`);
    if (pane) pane.style.display = 'block';

    document.querySelectorAll('.admin-nav-item button, .admin-nav-pill[data-tab]').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });

    if (tabName === 'dashboard') cargarDashboard();
    else if (tabName === 'pedidos') cargarPedidosAdmin();
    else if (tabName === 'catalogo') cargarGranizadosAdmin();
    else if (tabName === 'historial') cargarHistorialAdmin();
    else if (tabName === 'config') {
        cargarConfiguracionAdmin();
        setTimeout(() => { if (adminMap) adminMap.invalidateSize(); }, 250);
    }
    else if (tabName === 'admins') {
        cargarAdministradoresAdmin();
    }
    else if (tabName === 'clientes') {
        cargarClientesAdmin();
    }
    else if (tabName === 'juegos') {
        cargarConfigJuegosAdmin();
    }
}

async function actualizarDatosAdmin() {
    await cargarDashboard();
}

// ==========================================================
// 1. DASHBOARD & FINANZAS EJECUTIVAS
// ==========================================================
async function cargarDashboard() {
    actualizarSaludoYFechaAdmin();

    try {
        const [resKpis, resPedidos, resGranizados, resAdmins] = await Promise.all([
            fetch('/api/admin/dashboard/resumen', { headers: getAuthHeaders() }),
            fetch('/api/admin/pedidos', { headers: getAuthHeaders() }),
            fetch('/api/admin/granizados', { headers: getAuthHeaders() }),
            fetch('/api/admin/usuarios', { headers: getAuthHeaders() })
        ]);

        if (resKpis.ok) {
            AdminState.kpis = await resKpis.json();
        }
        if (resPedidos.ok) {
            AdminState.pedidos = await resPedidos.json();
            actualizarConteosFiltrosPedidos();
        }
        if (resGranizados.ok) {
            AdminState.granizados = await resGranizados.json();
            renderizarAlertasStockDashboard();
        }
        if (resAdmins.ok) {
            AdminState.admins = await resAdmins.json();
        }

        actualizarBadgesNavegacion();
        renderizarKPIsDashboard(AdminState.kpis);
        renderizarPedidosUrgentesDashboard();

    } catch (err) {
        console.error('Error al cargar dashboard:', err);
    }
}

function renderizarKPIsDashboard(kpis) {
    // 1. Ventas de Hoy
    const ventasHoy = kpis.ventasHoy || 0;
    const pedidosHoy = kpis.pedidosHoy || 0;
    const ticketPromedio = kpis.ticketPromedio || (pedidosHoy > 0 ? Math.round(ventasHoy / pedidosHoy) : 0);

    const elVentasHoy = document.getElementById('kpi-ventas-hoy');
    if (elVentasHoy) elVentasHoy.textContent = fmtMoney(ventasHoy);

    const elPedidosHoyBadge = document.getElementById('kpi-pedidos-hoy-badge');
    if (elPedidosHoyBadge) elPedidosHoyBadge.textContent = `⚡ ${pedidosHoy} pedido${pedidosHoy !== 1 ? 's' : ''} hoy`;

    const elTicket = document.getElementById('kpi-ticket-promedio');
    if (elTicket) elTicket.textContent = `Ticket: ${fmtMoney(ticketPromedio)}`;

    // 2. Ventas Totales y Mes
    const elVentasTotales = document.getElementById('kpi-ventas-totales');
    if (elVentasTotales) elVentasTotales.textContent = fmtMoney(kpis.ventasTotales || 0);

    const elVentasMes = document.getElementById('kpi-ventas-mes-badge');
    if (elVentasMes) elVentasMes.textContent = `Mes: ${fmtMoney(kpis.ventasMes || 0)}`;

    const elTotalCount = document.getElementById('kpi-total-pedidos-count');
    if (elTotalCount) elTotalCount.textContent = `${kpis.totalPedidos || AdminState.pedidos.length} órdenes`;

    // 3. Pedidos Activos (Recibidos + En Preparación + En Camino)
    const activos = (kpis.pedidosPendientes || 0) + (kpis.pedidosEnPreparacion || 0) + (kpis.pedidosEnCamino || 0);
    const elActivos = document.getElementById('kpi-pedidos-activos-count');
    if (elActivos) elActivos.textContent = activos;

    const elPendientesSub = document.getElementById('kpi-pendientes-sub');
    if (elPendientesSub) elPendientesSub.textContent = `${kpis.pedidosPendientes || 0} por batir`;

    const elCaminoSub = document.getElementById('kpi-camino-sub');
    if (elCaminoSub) elCaminoSub.textContent = `${kpis.pedidosEnCamino || 0} en ruta`;

    // 4. Stock Bajo Alertas
    const stockBajoCount = (AdminState.granizados || []).filter(g => (g.stockDisponible ?? 25) <= 10).length;
    const elStockAlerta = document.getElementById('kpi-stock-alerta-count');
    if (elStockAlerta) elStockAlerta.textContent = stockBajoCount;

    // 5. Resumen de Ventas con Gráfica de 7 Días (Imagen 4)
    renderizarResumenVentasDashboard(kpis);

    // 6. Stock Bajo / Reponer (Imagen 5)
    renderizarStockBajoDashboard();

    // 7. Ranking Real de Sabores Más Vendidos (Imagen 2)
    renderizarTopSabores();
}

function renderizarResumenVentasDashboard(kpis) {
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setTxt('dash-res-hoy', fmtMoney(kpis.ventasHoy || 0));
    setTxt('dash-res-semana', fmtMoney(kpis.ventasSemana || kpis.ventasHoy || 0));
    setTxt('dash-res-mes', fmtMoney(kpis.ventasMes || kpis.ventasTotales || 0));
    setTxt('dash-ticket-prom-pill', `Ticket prom: ${fmtMoney(kpis.ticketPromedio || 0)}`);
    setTxt('dash-res-subtotal-prod', fmtMoney(kpis.subtotalProductos || 0));
    setTxt('dash-res-total-envios', fmtMoney(kpis.totalEnvios || 0));

    // Gráfica de barras Últimos 7 Días
    const chartContainer = document.getElementById('dash-chart-7days');
    if (!chartContainer) return;

    let dias = kpis.ventasUltimos7Dias || [];
    if (!dias || dias.length === 0) {
        const hoy = new Date();
        const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dias = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(hoy);
            d.setDate(hoy.getDate() - i);
            dias.push({ dia: diasNombres[d.getDay()], total: 0 });
        }
    }

    const maxVal = Math.max(...dias.map(d => d.total || 0), 10000);

    chartContainer.innerHTML = dias.map(d => {
        const tot = d.total || 0;
        const pct = tot > 0 ? Math.max(Math.round((tot / maxVal) * 100), 20) : 14;
        return `
            <div class="dash-chart-col" title="${d.dia}: ${fmtMoney(tot)}">
                <div class="dash-chart-capsule" style="height: ${pct}%;"></div>
                <span class="dash-chart-day-label">${d.dia}</span>
            </div>
        `;
    }).join('');
}

function renderizarStockBajoDashboard() {
    const container = document.getElementById('dash-low-stock-items-container');
    if (!container) return;

    const bajos = (AdminState.granizados || []).filter(g => (g.stockDisponible ?? 25) <= 3);

    if (bajos.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:28px 16px; color:var(--mut); background:rgba(255,255,255,0.02); border-radius:14px;">
                <div style="font-size:1.8rem; margin-bottom:6px;">✨🥤</div>
                <div style="font-weight:700; color:#fff;">¡Inventario Abastecido!</div>
                <small>Todos los granizados cuentan con más de 3 existencias disponibles.</small>
            </div>
        `;
        return;
    }

    container.innerHTML = bajos.map(g => {
        const esAgotado = (g.stockDisponible ?? 0) <= 0;
        const badgeClass = esAgotado ? 'dash-stock-badge-low empty' : 'dash-stock-badge-low';
        const badgeText = esAgotado ? 'Agotado' : `${g.stockDisponible} rest.`;
        const imgUrl = g.imagen || 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=150&q=80';

        return `
            <div class="dash-stock-item-card">
                <img src="${imgUrl}" class="dash-stock-thumb" alt="${g.nombre}">
                <div class="dash-stock-info">
                    <div class="dash-stock-name">${g.nombre}</div>
                    <small class="dash-stock-meta">${fmtMoney(g.precio)} · ${g.categoria || 'Granizado'}</small>
                </div>
                <span class="${badgeClass}">${badgeText}</span>
                <button onclick="editarGranizadoInline('${g.id}')" class="btn-stock-quick-edit" title="Editar stock en catálogo">
                    ✏️
                </button>
            </div>
        `;
    }).join('');
}

function renderizarPedidosUrgentesDashboard() {
    const container = document.getElementById('dash-urgent-orders-list');
    if (!container) return;

    // En el Dashboard SOLO se muestran solicitudes web pendientes de validación de comprobante WhatsApp
    const solicitudesAccion = (AdminState.pedidos || []).filter(p => p.estado === 'PENDIENTE_VALIDACION');

    if (solicitudesAccion.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:36px 20px; color:var(--mut); background:rgba(255,255,255,0.02); border-radius:16px; border:1px dashed rgba(255,255,255,0.08);">
                <div style="font-size:2.2rem; margin-bottom:8px;">✨📱</div>
                <div style="font-weight:800; color:#fff; font-size:1.05rem;">¡Sin solicitudes pendientes por validar!</div>
                <small style="color:var(--mut);">No hay compras web que requieran verificación de comprobante. Las órdenes en curso están en la pestaña <b>Pedidos en Vivo</b>.</small>
            </div>
        `;
        return;
    }

    container.innerHTML = solicitudesAccion.map(p => {
        const fecha = new Date(p.fechaCreacion);
        const horaStr = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const itemsStr = (p.items || []).map(i => `${i.cantidad}x ${i.granizadoNombre || i.nombreGranizado || 'Granizado'} (${i.tamano || '12oz'})`).join(' · ');

        let telLimpio = (p.clienteTelefono || '').replace(/[^0-9]/g, '');
        if (!telLimpio.startsWith('57') && telLimpio.length === 10) telLimpio = '57' + telLimpio;

        const esEfectivo = p.metodoPago === 'EFECTIVO';
        const msgWpValidar = esEfectivo
            ? encodeURIComponent(`¡Hola ${p.clienteNombre}! 🥤 Te contactamos de GRANIFRESH sobre tu pedido ${p.codigoPedido} con pago en efectivo para recoger en el local. ¿Nos confirmas a qué hora pasas por tus granizados para tenerlos listos y recién batidos?`)
            : encodeURIComponent(`¡Hola ${p.clienteNombre}! 🥤 Te contactamos de GRANIFRESH sobre tu solicitud web ${p.codigoPedido}. ¿Nos puedes compartir tu comprobante de pago por aquí para validar tu pedido e iniciar el batido?`);

        return `
            <div class="dash-urgent-card">
                <div class="dash-urgent-header">
                    <span class="dash-urgent-code">${p.codigoPedido}</span>
                    <span class="dash-urgent-time">🕒 ${horaStr}</span>
                </div>
                <div>
                    <div class="dash-urgent-client">${p.clienteNombre}</div>
                    <div class="dash-urgent-addr">${(p.tipoEntrega === 'RECOGIDA' || p.costoEnvio === 0) ? '🛍️ Recogida en Local' : `📍 ${p.clienteDireccion} ${p.barrio ? `(${p.barrio})` : ''}`}</div>
                </div>
                <div class="dash-urgent-items">
                    🥤 ${itemsStr}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); border-radius:8px; padding:6px 10px; margin:4px 0 10px 0;">
                    <span style="font-size:0.8rem; color:var(--mut);">${esEfectivo ? 'Pago:' : 'Transferencia:'} <strong style="color:${esEfectivo ? '#34D399' : '#fff'};">${p.metodoPago || 'NEQUI'}</strong></span>
                    <strong style="color:var(--li); font-size:1.05rem;">${fmtMoney(p.total)}</strong>
                </div>
                <div class="dash-urgent-footer" style="flex-wrap:wrap; gap:8px;">
                    <a href="https://wa.me/${telLimpio}?text=${msgWpValidar}" target="_blank" title="${esEfectivo ? 'Abrir Chat de WhatsApp con el Cliente' : 'Abrir Chat de WhatsApp para Comprobante'}" style="background:#25D366; text-decoration:none; display:inline-flex; align-items:center; gap:5px; color:#fff; border-radius:8px; padding:7px 11px; font-weight:800; font-size:0.8rem;">
                        ${esEfectivo ? '💬 Contactar Cliente' : '💬 Ver Comprobante'}
                    </a>
                    <div style="display:flex; gap:6px; margin-left:auto;">
                        <button onclick="cambiarEstadoPedido('${p.id}', 'RECIBIDO')" class="btn-approve-req" title="Comprobante válido: Aprobar solicitud y enviar a cocina para batido">
                            ✅ Aprobar Solicitud
                        </button>
                        <button onclick="eliminarPedidoAdmin('${p.id}', '${p.codigoPedido}')" class="btn-reject-req" title="Descartar o rechazar solicitud no pagada">
                            🗑️ Rechazar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderizarTopSabores() {
    const container = document.getElementById('dash-top-flavors-container');
    if (!container) return;

    // Contar ventas reales de pedidos no cancelados
    const conteo = {};
    (AdminState.pedidos || []).forEach(p => {
        if (p.estado !== 'CANCELADO') {
            (p.items || []).forEach(it => {
                const nombre = it.granizadoNombre || it.nombreGranizado || it.nombre;
                if (nombre) {
                    conteo[nombre] = (conteo[nombre] || 0) + (it.cantidad || 1);
                }
            });
        }
    });

    const items = Object.entries(conteo)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);

    if (items.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:32px 16px; color:var(--mut); background:rgba(255,255,255,0.02); border-radius:14px;">
                <div style="font-size:2rem; margin-bottom:6px;">🥤📊</div>
                <div style="font-weight:700; color:#fff;">Aún no hay compras completadas</div>
                <small>En cuanto los clientes compren granizados desde la web, aquí verás el ranking real de sabores más vendidos.</small>
            </div>
        `;
        return;
    }

    const maxCant = Math.max(...items.map(i => i.cantidad), 1);

    container.innerHTML = items.slice(0, 5).map((it, idx) => {
        const pct = Math.round((it.cantidad / maxCant) * 100);
        return `
            <div class="top-flavor-row">
                <div class="top-flavor-info">
                    <span style="color:#fff; font-weight:800;">#${idx + 1} ${it.nombre}</span>
                    <span style="color:var(--cy); font-weight:900;">${it.cantidad} ${it.cantidad === 1 ? 'vaso' : 'vasos'}</span>
                </div>
                <div class="top-flavor-bar-wrap">
                    <div class="top-flavor-bar-fill" style="width: ${pct}%;"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderizarAlertasStockDashboard() {
    const stockBajos = (AdminState.granizados || []).filter(g => (g.stockDisponible ?? 25) <= 10);
    const elStockAlerta = document.getElementById('kpi-stock-alerta-count');
    if (elStockAlerta) elStockAlerta.textContent = stockBajos.length;
}

function actualizarBadgesNavegacion() {
    const pedidos = AdminState.pedidos || [];
    const granizados = AdminState.granizados || [];

    // 1. Contador del Dashboard: Solicitudes Web pendientes de acción / validación (PENDIENTE_VALIDACION)
    const solicitudesPendientes = pedidos.filter(p => p.estado === 'PENDIENTE_VALIDACION').length;
    const badgeDashboard = document.getElementById('badge-nav-dashboard') || document.getElementById('badge-nav-alertas');
    if (badgeDashboard) {
        badgeDashboard.textContent = solicitudesPendientes;
        badgeDashboard.classList.remove('hidden');
        if (solicitudesPendientes > 0) {
            badgeDashboard.style.background = '#FF0055';
            badgeDashboard.style.color = '#FFFFFF';
            badgeDashboard.style.boxShadow = '0 0 12px rgba(255, 0, 85, 0.7)';
        } else {
            badgeDashboard.style.background = 'rgba(255, 255, 255, 0.12)';
            badgeDashboard.style.color = 'var(--mut)';
            badgeDashboard.style.boxShadow = 'none';
        }
    }

    // 2. Contador de Pedidos: Todos los pedidos en proceso en vivo (excluye solo los archivados ENTREGADO y CANCELADO)
    const pedidosActivos = pedidos.filter(p => p.estado !== 'ENTREGADO' && p.estado !== 'CANCELADO').length;
    const badgePedidos = document.getElementById('badge-nav-pedidos-activos');
    if (badgePedidos) {
        badgePedidos.textContent = pedidosActivos;
        if (pedidosActivos > 0) {
            badgePedidos.style.background = '#00FF87';
            badgePedidos.style.color = '#04140B';
            badgePedidos.style.boxShadow = '0 0 10px rgba(0, 255, 135, 0.4)';
        } else {
            badgePedidos.style.background = 'rgba(255, 255, 255, 0.12)';
            badgePedidos.style.color = 'var(--mut)';
            badgePedidos.style.boxShadow = 'none';
        }
    }

    // 3. Contador de Productos & Inventario
    const badgeTotalProds = document.getElementById('badge-nav-total-productos');
    if (badgeTotalProds) {
        badgeTotalProds.textContent = granizados.length;
    }

    // 4. Contador de Historial (Pedidos completados/archivados)
    const badgeHistorial = document.getElementById('badge-nav-historial');
    if (badgeHistorial) {
        const historialCount = pedidos.filter(p => p.estado === 'ENTREGADO' || p.estado === 'CANCELADO').length;
        badgeHistorial.textContent = historialCount;
    }

    // 5. Contador de Administradores
    const badgeAdmins = document.getElementById('badge-nav-admins');
    if (badgeAdmins) {
        const countAdmins = (AdminState.admins && AdminState.admins.length) ? AdminState.admins.length : 1;
        badgeAdmins.textContent = countAdmins;
    }
}

// ==========================================================
// 2. GESTOR DE PEDIDOS A DOMICILIO (TABLA & FILTROS)
// ==========================================================
async function cargarPedidosAdmin() {
    try {
        const res = await fetch('/api/admin/pedidos', { headers: getAuthHeaders() });
        if (!res.ok) return;
        AdminState.pedidos = await res.json();
        actualizarConteosFiltrosPedidos();
        renderizarTablaPedidos();
        actualizarBadgesNavegacion();
    } catch (err) {
        console.error('Error al cargar pedidos:', err);
    }
}

function actualizarConteosFiltrosPedidos() {
    const p = AdminState.pedidos || [];
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const activos = p.filter(x => x.estado !== 'ENTREGADO' && x.estado !== 'CANCELADO');
    setTxt('count-order-todos', activos.length);
    setTxt('count-order-recibido', p.filter(x => x.estado === 'RECIBIDO' || x.estado === 'PENDIENTE_VALIDACION').length);
    setTxt('count-order-prep', p.filter(x => x.estado === 'EN_PREPARACION').length);
    setTxt('count-order-camino', p.filter(x => x.estado === 'EN_CAMINO').length);
}

function renderizarTablaPedidos() {
    const tbody = document.getElementById('tabla-pedidos-body');
    if (!tbody) return;

    // Solo se muestran pedidos activos en vivo (los entregados pasan automáticamente a Historial)
    let lista = (AdminState.pedidos || []).filter(p => p.estado !== 'ENTREGADO');

    // Filtro por Estado en Vivo
    if (AdminState.filtroEstadoPedido !== 'TODOS') {
        if (AdminState.filtroEstadoPedido === 'RECIBIDO') {
            lista = lista.filter(p => p.estado === 'RECIBIDO' || p.estado === 'PENDIENTE_VALIDACION');
        } else {
            lista = lista.filter(p => p.estado === AdminState.filtroEstadoPedido);
        }
    }

    // Buscador reactivo
    const q = AdminState.busquedaPedido;
    if (q) {
        lista = lista.filter(p => {
            const cod = (p.codigoPedido || '').toLowerCase();
            const nom = (p.clienteNombre || '').toLowerCase();
            const tel = (p.clienteTelefono || '').toLowerCase();
            const dir = (p.clienteDireccion || '').toLowerCase();
            const bar = (p.barrio || '').toLowerCase();
            return cod.includes(q) || nom.includes(q) || tel.includes(q) || dir.includes(q) || bar.includes(q);
        });
    }

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:40px; color:var(--mut);">
                    <div style="font-size:2rem; margin-bottom:8px;">✨🛵</div>
                    <div style="font-weight:700; color:#fff;">No hay pedidos en este estado en cocina ni ruta</div>
                    <small>Los pedidos completados se archivan automáticamente en la pestaña <b>Historial & Auditoría</b>.</small>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(p => {
        const fecha = new Date(p.fechaCreacion);
        const fechaStr = fecha.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const horaStr = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const itemsResumen = (p.items || []).map(it => `<b>${it.cantidad}x</b> ${it.granizadoNombre} <small style="color:var(--cy);">(${it.tamano || '12oz'})</small>`).join('<br>');

        // Botón progresivo de estado: avanza solo al siguiente estado lógico
        let btnSiguiente = '';
        if (p.estado === 'PENDIENTE_VALIDACION') {
            btnSiguiente = `
                <button onclick="cambiarEstadoPedido('${p.id}', 'RECIBIDO')" class="btn-step-next prep" style="background:#10B981;" title="Validar comprobante y pasar orden a cocina">
                    ✅ Aprobar
                </button>
            `;
        } else if (p.estado === 'RECIBIDO') {
            btnSiguiente = `
                <button onclick="cambiarEstadoPedido('${p.id}', 'EN_PREPARACION')" class="btn-step-next prep" title="Iniciar batido artesanal en cocina">
                    🧊 Iniciar Batido
                </button>
            `;
        } else if (p.estado === 'EN_PREPARACION') {
            btnSiguiente = `
                <button onclick="cambiarEstadoPedido('${p.id}', 'EN_CAMINO')" class="btn-step-next route" title="Despachar en ruta con domiciliario express">
                    🛵 Despachar
                </button>
            `;
        } else if (p.estado === 'EN_CAMINO') {
            btnSiguiente = `
                <button onclick="cambiarEstadoPedido('${p.id}', 'ENTREGADO')" class="btn-step-next done" title="Marcar como entregado (se archivará en Historial)">
                    ✅ Marcar Entregado
                </button>
            `;
        }

        return `
            <tr>
                <td>
                    <strong style="color:var(--cy); font-size:0.95rem;">${p.codigoPedido}</strong>
                    <div style="font-size:0.75rem; color:var(--mut);">${fechaStr} · ${horaStr}</div>
                </td>
                <td>
                    <div style="font-weight:800; color:#fff;">${p.clienteNombre}</div>
                    <a href="https://wa.me/${p.clienteTelefono.replace(/[^0-9]/g, '')}" target="_blank" style="font-size:0.8rem; color:#25D366; text-decoration:none; font-weight:700;">
                        📱 ${p.clienteTelefono}
                    </a>
                </td>
                <td>
                    <div style="color:#fff;">${(p.tipoEntrega === 'RECOGIDA' || p.costoEnvio === 0) ? '🛍️ Recogida en Local' : p.clienteDireccion}</div>
                    <small style="color:var(--mut);">${p.barrio ? `Barrio: ${p.barrio}` : ''} ${p.indicaciones ? `· ${p.indicaciones}` : ''}</small>
                </td>
                <td style="font-size:0.84rem; line-height:1.4;">${itemsResumen}</td>
                <td>
                    <div style="font-weight:900; color:var(--li); font-size:1.05rem;">${fmtMoney(p.total)}</div>
                    <small style="color:var(--mut); font-weight:700;">${p.metodoPago || 'NEQUI'}</small>
                </td>
                <td>
                    <span class="status-badge status-${p.estado}">
                        ${p.estado.replace('_', ' ')}
                    </span>
                </td>
                <td style="text-align:right;">
                    <div style="display:flex; justify-content:flex-end; align-items:center; gap:8px;">
                        ${btnSiguiente}
                        <button onclick="abrirModalDetallePedido('${p.id}')" class="btn-icon-action btn-icon-view" title="Inspeccionar Ticket Digital">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </button>
                        <button onclick="notificarClienteWhatsApp('${p.id}')" class="btn-icon-action btn-icon-wa" title="Enviar Notificación por WhatsApp">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        </button>
                        <button onclick="eliminarPedidoAdmin('${p.id}', '${p.codigoPedido}')" class="btn-icon-action btn-icon-del" title="Eliminar pedido permanentemente">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function cambiarEstadoPedido(id, nuevoEstado) {
    try {
        const res = await fetch(`/api/admin/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ estado: nuevoEstado, notasAdmin: '' })
        });
        if (res.ok) {
            let msgToast = `Pedido actualizado a ${nuevoEstado.replace('_', ' ')}`;
            if (nuevoEstado === 'ENTREGADO') {
                msgToast = '🎉 Pedido entregado: Archivado en Historial & Auditoría';
            } else if (nuevoEstado === 'EN_PREPARACION') {
                msgToast = '🧊 Pedido en batido artesanal en cocina';
            } else if (nuevoEstado === 'EN_CAMINO') {
                msgToast = '🛵 Pedido despachado en ruta con domiciliario';
            }
            if (window.showToast) window.showToast(msgToast, 'success');
            await cargarPedidosAdmin();
            await cargarDashboard();
            if (AdminState.pestañaActiva === 'historial') cargarHistorialAdmin();
        }
    } catch (e) {
        alert('Error al actualizar estado del pedido');
    }
}

window.eliminarPedidoAdmin = async function (id, codigo) {
    if (!confirm(`¿Estás seguro de eliminar el pedido ${codigo || ''}? Esta acción lo borrará permanentemente de los registros.`)) {
        return;
    }
    try {
        const res = await fetch(`/api/admin/pedidos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) {
            if (window.showToast) window.showToast(`Pedido ${codigo || ''} eliminado permanentemente 🗑️`, 'info');
            await cargarPedidosAdmin();
            await cargarDashboard();
            if (AdminState.pestañaActiva === 'historial') cargarHistorialAdmin();
        } else {
            alert('No se pudo eliminar el pedido');
        }
    } catch (err) {
        console.error('Error al eliminar pedido:', err);
        alert('Error al conectar con el servidor para eliminar el pedido');
    }
};

function notificarClienteWhatsApp(id) {
    const pedido = AdminState.pedidos.find(p => p.id === id);
    if (!pedido) return;

    let tel = (pedido.clienteTelefono || '').replace(/[^0-9]/g, '');
    if (!tel.startsWith('57') && tel.length === 10) tel = '57' + tel;

    const msgs = {
        'RECIBIDO': `¡Hola ${pedido.clienteNombre}! 👋 En GRANIFRESH hemos recibido tu orden *${pedido.codigoPedido}*. Tus granizados 100% fruta natural entrarán a batido a -4°C de inmediato.`,
        'EN_PREPARACION': `¡Hola ${pedido.clienteNombre}! 🥤 Tu orden *${pedido.codigoPedido}* está en batido artesanal con fruta pura en este instante. ¡Textura frappé glacial garantizada!`,
        'EN_CAMINO': `¡Tu pedido va en camino! 🛵💨 El repartidor lleva tus granizados en maletín térmico antifusión. Código: *${pedido.codigoPedido}*. Tiempo estimado: unos ${pedido.tiempoEstimadoMinutos || 35} min.`,
        'ENTREGADO': `¡Que disfrutes tu granizado! ❄️🎉 Gracias por elegir GRANIFRESH. Fruta 100% natural sin jarabes artificiales.`
    };

    const texto = msgs[pedido.estado] || `Hola ${pedido.clienteNombre}, actualización de tu pedido *${pedido.codigoPedido}*: Estado ${pedido.estado}`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`, '_blank');
}

// Modal Detalle / Ticket Digital con z-index superior
window.abrirModalDetallePedido = function (id) {
    const p = AdminState.pedidos.find(x => x.id === id);
    if (!p) return;

    document.getElementById('modal-ped-codigo').textContent = p.codigoPedido;
    const body = document.getElementById('modal-ped-body');

    const itemsHtml = (p.items || []).map(it => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px dashed rgba(255,255,255,0.1);">
            <div>
                <strong style="color:#fff;">${it.cantidad}x ${it.granizadoNombre}</strong>
                <div style="font-size:0.8rem; color:var(--cy);">Tamaño: ${it.tamano || '12oz'} ${it.escarchado ? `· Escarchado: ${it.escarchado}` : ''}</div>
            </div>
            <strong style="color:var(--li);">${fmtMoney(it.precioUnitario * it.cantidad)}</strong>
        </div>
    `).join('');

    body.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; background:rgba(255,255,255,0.03); padding:16px; border-radius:16px; border:1px solid rgba(255,255,255,0.08);">
            <div>
                <small style="color:var(--mut);">Cliente:</small>
                <div style="font-weight:800; color:#fff; font-size:1.05rem;">${p.clienteNombre}</div>
                <div style="color:#25D366; font-weight:700;">📱 ${p.clienteTelefono}</div>
            </div>
            <div>
                <small style="color:var(--mut);">Destino de Entrega:</small>
                <div style="color:#fff; font-weight:700;">${(p.tipoEntrega === 'RECOGIDA' || p.costoEnvio === 0) ? '🛍️ Recogida en Local' : p.clienteDireccion}</div>
                <div style="font-size:0.85rem; color:var(--cy);">${p.barrio ? `Barrio: ${p.barrio}` : ''} ${p.indicaciones ? `· ${p.indicaciones}` : ''}</div>
            </div>
        </div>

        <div style="margin-top:14px;">
            <h5 style="color:var(--cy); text-transform:uppercase; font-size:0.8rem; letter-spacing:1px; margin-bottom:8px;">Granizados en la Orden</h5>
            ${itemsHtml}
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; background:rgba(0,240,255,0.06); padding:14px 18px; border-radius:14px; border:1px solid rgba(0,240,255,0.2); margin-top:14px;">
            <div>
                <span style="color:var(--mut); font-size:0.85rem;">Método de Pago:</span>
                <strong style="color:#fff; display:block; font-size:1.05rem;">${p.metodoPago || 'EFECTIVO'}</strong>
                <span style="color:var(--mut); font-size:0.8rem;">Subtotal: ${fmtMoney(p.subtotal)} · Envío: ${(p.tipoEntrega === 'RECOGIDA' || p.costoEnvio === 0) ? '$0 (Recogida en Local)' : fmtMoney(p.costoEnvio)}</span>
            </div>
            <div style="text-align:right;">
                <span style="color:var(--mut); font-size:0.85rem;">Total a Cobrar:</span>
                <strong style="color:var(--li); font-size:1.45rem; display:block;">${fmtMoney(p.total)}</strong>
            </div>
        </div>

        <div style="margin-top:16px; display:flex; align-items:center; justify-content:space-between; gap:12px; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:0.88rem; font-weight:700; color:var(--mut);">Estado del Pedido:</span>
            <span class="status-badge status-${p.estado}" style="font-size:0.92rem; padding:4px 14px; font-weight:800;">
                ${p.estado.replace('_', ' ')}
            </span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; gap:10px;">
            <button onclick="notificarClienteWhatsApp('${p.id}')" style="flex:1; background:#25D366; border:none; color:#fff; font-weight:800; padding:12px; border-radius:12px; cursor:pointer;">
                💬 Enviar WhatsApp al Cliente
            </button>
            <button onclick="cerrarModales()" class="btn-sidebar-secondary" style="padding:12px 20px;">
                Cerrar
            </button>
        </div>
    `;

    const modal = document.getElementById('modal-detalle-pedido');
    if (modal) modal.classList.add('active');
};

// ==========================================================
// 3. INVENTARIO & GRANIZADOS (ESTACIÓN PERMANENTE & CATEGORÍAS)
// ==========================================================
async function cargarGranizadosAdmin() {
    try {
        const res = await fetch('/api/admin/granizados', { headers: getAuthHeaders() });
        if (!res.ok) return;
        AdminState.granizados = await res.json();
        await cargarCategoriasAdmin();
        renderizarTablaGranizados();
        renderizarAlertasStockDashboard();
        renderizarCategoriasChipsAdmin();
        actualizarPreviewCliente();
        const badgeTotal = document.getElementById('badge-nav-total-productos');
        if (badgeTotal) badgeTotal.textContent = AdminState.granizados.length;
    } catch (err) {
        console.error('Error al cargar granizados:', err);
    }
}

// Cargar categorías reales desde la base de datos
window.cargarCategoriasAdmin = async function () {
    try {
        const res = await fetch('/api/admin/categorias', { headers: getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                AdminState.categorias = data;
                localStorage.setItem('grani_admin_categorias', JSON.stringify(data));
            }
        }
    } catch (e) {
        console.warn('Usando categorías locales:', e);
    }
    renderizarCategoriasChipsAdmin();
    renderizarFiltrosInventarioAdmin();
};

// Renderizado de Chips de Categorías con conteos reales (Imagen 3)
window.renderizarCategoriasChipsAdmin = function () {
    const contenedor = document.getElementById('contenedor-chips-categorias');
    const selectCat = document.getElementById('granizado-form-tipo');
    if (!contenedor) return;

    // Calcular conteos por categoría
    const conteos = {};
    (AdminState.granizados || []).forEach(g => {
        const slug = (g.categoriaSlug || 'tropical').toLowerCase();
        conteos[slug] = (conteos[slug] || 0) + 1;
    });

    contenedor.innerHTML = AdminState.categorias.map(cat => {
        const count = conteos[cat.slug.toLowerCase()] || 0;
        return `
            <div class="cat-chip-pill">
                <span>${cat.nombre}</span>
                <span class="cat-chip-count">(${count})</span>
                <button type="button" class="btn-del-cat-chip" onclick="eliminarCategoriaAdmin('${cat.slug}')" title="Eliminar categoría ${cat.nombre}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </div>
        `;
    }).join('');

    // Actualizar también el select del formulario si existe
    if (selectCat) {
        const valActual = selectCat.value;
        selectCat.innerHTML = AdminState.categorias.map(cat => {
            return `<option value="${cat.slug}">${cat.nombre}</option>`;
        }).join('');
        if (valActual && AdminState.categorias.some(c => c.slug === valActual)) {
            selectCat.value = valActual;
        }
    }
};

// Renderizar dinámicamente los botones de filtro de la tabla de inventario
window.renderizarFiltrosInventarioAdmin = function () {
    const cont = document.getElementById('products-category-filters');
    if (!cont) return;

    const catActual = AdminState.filtroCategoriaGranizado || 'TODOS';
    let html = `<button class="filter-pill ${catActual === 'TODOS' ? 'active' : ''}" data-cat="TODOS">Todos</button>`;
    (AdminState.categorias || []).forEach(c => {
        html += `<button class="filter-pill ${catActual === c.slug ? 'active' : ''}" data-cat="${c.slug}">${c.nombre}</button>`;
    });
    html += `
        <button class="filter-pill ${catActual === 'STOCK_BAJO' ? 'active' : ''}" data-cat="STOCK_BAJO">⚠️ Stock Bajo (&lt;10)</button>
        <button class="filter-pill ${catActual === 'AGOTADO' ? 'active' : ''}" data-cat="AGOTADO">❌ Agotados</button>
    `;
    cont.innerHTML = html;

    cont.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            cont.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            AdminState.filtroCategoriaGranizado = e.currentTarget.getAttribute('data-cat');
            renderizarTablaGranizados();
        });
    });
};

// Agregar nueva categoría
window.agregarCategoriaAdmin = async function () {
    const inputNombre = document.getElementById('cat-nueva-nombre');
    if (!inputNombre || !inputNombre.value.trim()) {
        if (window.showToast) window.showToast('Escribe un nombre para la nueva categoría 🏷️', 'warning');
        else alert('Escribe un nombre para la nueva categoría.');
        if (inputNombre) inputNombre.focus();
        return;
    }

    const nombreRaw = inputNombre.value.trim();
    const slug = nombreRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

    // Agregar emoji inicial amigable si no tiene
    let nombreFinal = nombreRaw;
    if (!/[\u{1F300}-\u{1F9FF}]/u.test(nombreFinal)) {
        nombreFinal = '🥤 ' + nombreFinal;
    }

    try {
        const res = await fetch('/api/admin/categorias', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ slug: slug, nombre: nombreFinal, activo: true })
        });
        if (res.ok) {
            const data = await res.json();
            const catGuardada = data.categoria || { slug, nombre: nombreFinal };
            if (!AdminState.categorias.some(c => c.slug === catGuardada.slug)) {
                AdminState.categorias.push(catGuardada);
            } else {
                const idx = AdminState.categorias.findIndex(c => c.slug === catGuardada.slug);
                AdminState.categorias[idx] = catGuardada;
            }
            localStorage.setItem('grani_admin_categorias', JSON.stringify(AdminState.categorias));
            inputNombre.value = '';
            renderizarCategoriasChipsAdmin();
            renderizarFiltrosInventarioAdmin();
            actualizarPreviewCliente();
            if (window.cargarCatalogoPublico) window.cargarCatalogoPublico();
            if (window.showToast) window.showToast(`¡Categoría "${nombreFinal}" guardada y sincronizada! 🏷️`, 'success');
        } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || 'Error al guardar categoría en el servidor.');
        }
    } catch (e) {
        // Fallback local
        AdminState.categorias.push({ slug: slug, nombre: nombreFinal });
        localStorage.setItem('grani_admin_categorias', JSON.stringify(AdminState.categorias));
        inputNombre.value = '';
        renderizarCategoriasChipsAdmin();
        renderizarFiltrosInventarioAdmin();
        if (window.showToast) window.showToast(`Categoría "${nombreFinal}" guardada 🏷️`, 'success');
    }
};

// Eliminar categoría
window.eliminarCategoriaAdmin = async function (slug) {
    if (AdminState.categorias.length <= 1) {
        if (window.showToast) window.showToast('Debes mantener al menos una categoría en el catálogo', 'warning');
        else alert('Debes mantener al menos una categoría en el catálogo.');
        return;
    }
    const cat = AdminState.categorias.find(c => c.slug === slug);
    if (!confirm(`¿Eliminar la categoría "${cat ? cat.nombre : slug}"?`)) return;

    try {
        await fetch(`/api/admin/categorias/${slug}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
    } catch (e) { }

    AdminState.categorias = AdminState.categorias.filter(c => c.slug !== slug);
    localStorage.setItem('grani_admin_categorias', JSON.stringify(AdminState.categorias));
    renderizarCategoriasChipsAdmin();
    renderizarFiltrosInventarioAdmin();
    actualizarPreviewCliente();
    if (window.cargarCatalogoPublico) window.cargarCatalogoPublico();
    if (window.showToast) window.showToast('Categoría eliminada 🗑️', 'info');
};

// GESTIÓN DINÁMICA DE MEDIDAS DE VASO (OZ) Y PRECIOS
window.obtenerTamanosFormulario = function () {
    const contenedor = document.getElementById('contenedor-filas-tamanos');
    const resultado = {};
    if (!contenedor) return { '12oz': 13000 };

    const filas = contenedor.querySelectorAll('.tamano-item-row');
    filas.forEach((fila, idx) => {
        const ozInput = fila.querySelector('.tamano-oz-input');
        const precioInput = fila.querySelector('.tamano-precio-input');
        const oz = (ozInput ? ozInput.value.trim() : '') || (idx === 0 ? '12oz' : `${(idx + 1) * 8}oz`);
        const precio = parseFloat(precioInput ? precioInput.value : 0) || 0;
        resultado[oz] = precio;
    });

    if (Object.keys(resultado).length === 0) {
        resultado['12oz'] = 13000;
    }
    return resultado;
};

window.renderizarFilasTamanos = function (preciosPorTamano) {
    const contenedor = document.getElementById('contenedor-filas-tamanos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const entries = preciosPorTamano && Object.keys(preciosPorTamano).length > 0
        ? Object.entries(preciosPorTamano)
        : [['12oz', 13000], ['16oz', 16500], ['24oz', 22000]];

    entries.forEach(([oz, precio]) => {
        agregarFilaTamano(oz, precio);
    });
};

window.agregarFilaTamano = function (oz = '', precio = '') {
    const contenedor = document.getElementById('contenedor-filas-tamanos');
    if (!contenedor) return;

    if (!oz) {
        const count = contenedor.querySelectorAll('.tamano-item-row').length;
        oz = count === 0 ? '12oz' : (count === 1 ? '16oz' : (count === 2 ? '24oz' : '32oz'));
    }
    if (precio === '' || precio === undefined || precio === null) {
        const count = contenedor.querySelectorAll('.tamano-item-row').length;
        precio = count === 0 ? 13000 : (count === 1 ? 16500 : (count === 2 ? 22000 : 28000));
    }

    const row = document.createElement('div');
    row.className = 'tamano-item-row';
    row.style.cssText = 'display:grid; grid-template-columns: 1fr 1fr auto; gap:12px; align-items:center; background:rgba(2,12,7,0.7); border:1px solid rgba(52,211,153,0.18); padding:10px 14px; border-radius:10px; transition:all 0.2s ease;';
    row.innerHTML = `
        <div>
            <label style="font-size:0.74rem; font-weight:700; color:#A7F3D0; margin-bottom:4px; display:block;">Medida / Tamaño (oz o nombre)</label>
            <input type="text" class="form-control tamano-oz-input" value="${oz}" placeholder="Ej: 10oz, 12oz, 16oz, 24oz, 32oz..." oninput="actualizarPreviewCliente()">
        </div>
        <div>
            <label style="font-size:0.74rem; font-weight:700; color:#A7F3D0; margin-bottom:4px; display:block;">Precio ($ COP)</label>
            <input type="number" class="form-control tamano-precio-input" value="${precio}" placeholder="Ej: 13000" min="0" oninput="actualizarPreviewCliente()">
        </div>
        <div style="padding-top:18px;">
            <button type="button" class="btn-icon-action btn-icon-del" onclick="eliminarFilaTamano(this)" title="Eliminar este tamaño">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
        </div>
    `;
    contenedor.appendChild(row);
    actualizarPreviewCliente();
};

window.eliminarFilaTamano = function (btn) {
    const contenedor = document.getElementById('contenedor-filas-tamanos');
    if (!contenedor) return;
    const filas = contenedor.querySelectorAll('.tamano-item-row');
    if (filas.length <= 1) {
        if (window.showToast) window.showToast('El producto debe tener al menos un tamaño de vaso configurado', 'error');
        else alert('El producto debe tener al menos un tamaño de vaso configurado.');
        return;
    }
    const row = btn.closest('.tamano-item-row');
    if (row) {
        row.remove();
        actualizarPreviewCliente();
    }
};

window.seleccionarTamanoPreview = function (btn, precio) {
    const parent = btn.parentElement;
    if (parent) {
        parent.querySelectorAll('button').forEach(b => b.classList.remove('on'));
    }
    btn.classList.add('on');
    const elPrice = document.getElementById('preview-price');
    if (elPrice) elPrice.textContent = fmtMoney(precio);
};

// Presets de encuadre rápido
window.setEncuadrePreset = function (preset) {
    const sFit = document.getElementById('slider-img-fit');
    const sZoom = document.getElementById('slider-img-zoom');
    const sPosX = document.getElementById('slider-img-posx');
    const sPosY = document.getElementById('slider-img-posy');

    if (preset === 'completo') {
        if (sFit) sFit.value = 'contain';
        if (sZoom) sZoom.value = '1.0';
        if (sPosX) sPosX.value = '50';
        if (sPosY) sPosY.value = '50';
    } else if (preset === 'cover') {
        if (sFit) sFit.value = 'cover';
        if (sZoom) sZoom.value = '1.05';
        if (sPosX) sPosX.value = '50';
        if (sPosY) sPosY.value = '50';
    } else {
        if (sFit) sFit.value = 'cover';
        if (sZoom) sZoom.value = '1.0';
        if (sPosX) sPosX.value = '50';
        if (sPosY) sPosY.value = '50';
    }
    actualizarPreviewCliente();
};

// Eliminar foto activa y volver a ilustración vectorial
window.eliminarFotoGranizado = function () {
    const imgInput = document.getElementById('granizado-form-img');
    if (imgInput) imgInput.value = '';
    const fileInput = document.getElementById('granizado-form-file');
    if (fileInput) fileInput.value = '';
    actualizarPreviewCliente();
    if (window.showToast) window.showToast('Foto removida. Se mostrará el vaso ilustrado neón 🥤', 'info');
};

// Limpiar formulario y preparar creación de nuevo producto
window.limpiarFormularioGranizado = function () {
    const form = document.getElementById('form-modal-granizado');
    if (form) form.reset();
    document.getElementById('granizado-form-id').value = '';
    document.getElementById('granizado-form-icon').textContent = '➕';
    document.getElementById('granizado-form-title-text').innerHTML = '<span id="granizado-form-icon">➕</span> CREAR NUEVO PRODUCTO O GRANIZADO';
    document.getElementById('granizado-form-stock').value = '25';
    const regularInput = document.getElementById('granizado-form-precio-regular');
    if (regularInput) regularInput.value = '';
    const insInput = document.getElementById('granizado-form-insignia');
    if (insInput) insInput.value = '';
    document.getElementById('granizado-form-color1').value = '#FFB703';
    document.getElementById('granizado-form-color2').value = '#FB8500';
    document.getElementById('granizado-form-color1-picker').value = '#FFB703';
    document.getElementById('granizado-form-color2-picker').value = '#FB8500';
    document.getElementById('granizado-form-activo').checked = true;
    document.getElementById('granizado-form-destacado').checked = true;
    setEncuadrePreset('reset');
    renderizarFilasTamanos({ "12oz": 13000, "16oz": 16500, "24oz": 22000 });
    actualizarPreviewCliente();
    const workstation = document.getElementById('granizado-workstation-card');
    if (workstation) workstation.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Abrir para Editar (cargando datos en la estación permanente)
window.editarGranizadoInline = function (id) {
    const g = AdminState.granizados.find(item => item.id === id);
    if (!g) return;

    if (AdminState.pestañaActiva !== 'catalogo') {
        cambiarPestanaAdmin('catalogo');
    }

    const workstation = document.getElementById('granizado-workstation-card');

    document.getElementById('granizado-form-id').value = g.id;
    document.getElementById('granizado-form-nombre').value = g.nombre || '';
    document.getElementById('granizado-form-desc').value = g.descripcion || '';
    document.getElementById('granizado-form-tipo').value = g.categoriaSlug || 'tropical';

    const pz = g.preciosPorTamano && Object.keys(g.preciosPorTamano).length > 0
        ? g.preciosPorTamano
        : { "12oz": g.precioBase || 13000 };
    renderizarFilasTamanos(pz);

    document.getElementById('granizado-form-stock').value = g.stockDisponible ?? 25;
    document.getElementById('granizado-form-img').value = g.imagenUrl || '';
    document.getElementById('granizado-form-insignia').value = g.insignia || '';

    // Cargar ajustes de encuadre guardados
    const aj = g.ajusteImagen || {};
    const sFit = document.getElementById('slider-img-fit');
    const sZoom = document.getElementById('slider-img-zoom');
    const sPosX = document.getElementById('slider-img-posx');
    const sPosY = document.getElementById('slider-img-posy');
    if (sFit) sFit.value = aj.fit || 'cover';
    if (sZoom) sZoom.value = (aj.zoom !== undefined && aj.zoom !== null) ? aj.zoom : '1.0';
    if (sPosX) sPosX.value = (aj.posX !== undefined && aj.posX !== null) ? aj.posX : '50';
    if (sPosY) sPosY.value = (aj.posY !== undefined && aj.posY !== null) ? aj.posY : '50';

    const lblZoom = document.getElementById('val-img-zoom');
    if (lblZoom) lblZoom.textContent = (sZoom ? parseFloat(sZoom.value).toFixed(2) : '1.00') + 'x';
    const lblPosX = document.getElementById('val-img-posx');
    if (lblPosX) lblPosX.textContent = (sPosX ? sPosX.value : '50') + '%';
    const lblPosY = document.getElementById('val-img-posy');
    if (lblPosY) lblPosY.textContent = (sPosY ? sPosY.value : '50') + '%';

    const c1 = (g.coloresGradiente && g.coloresGradiente[0]) || '#FFB703';
    const c2 = (g.coloresGradiente && g.coloresGradiente[1]) || '#FB8500';
    document.getElementById('granizado-form-color1').value = c1;
    document.getElementById('granizado-form-color1-picker').value = c1;
    document.getElementById('granizado-form-color2').value = c2;
    document.getElementById('granizado-form-color2-picker').value = c2;

    document.getElementById('granizado-form-activo').checked = g.activo !== false;
    document.getElementById('granizado-form-destacado').checked = g.destacado !== false;

    document.getElementById('granizado-form-title-text').innerHTML = `<span id="granizado-form-icon">✏️</span> EDITANDO: ${g.nombre}`;

    actualizarPreviewCliente();

    if (workstation) {
        workstation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// VISTA PREVIA DE CLIENTE 100% IDÉNTICA (Reacción en tiempo real)
window.actualizarPreviewCliente = function () {
    const nombre = document.getElementById('granizado-form-nombre')?.value || 'Nombre de Ejemplo';
    const desc = document.getElementById('granizado-form-desc')?.value || 'Pura fruta fresca batida a -4°C con textura frappé subcero artesanal.';
    const precio = parseFloat(document.getElementById('granizado-form-precio')?.value) || 13000;
    const precioReg = parseFloat(document.getElementById('granizado-form-precio-regular')?.value);
    const insignia = document.getElementById('granizado-form-insignia')?.value;
    const catSelect = document.getElementById('granizado-form-tipo');
    const catText = catSelect?.options[catSelect.selectedIndex]?.text || '🥭 Tropicales';
    const c1 = document.getElementById('granizado-form-color1')?.value || '#FFB703';
    const c2 = document.getElementById('granizado-form-color2')?.value || '#FB8500';

    // Título y Descripción
    const elTitle = document.getElementById('preview-title');
    if (elTitle) elTitle.textContent = nombre;
    const elDesc = document.getElementById('preview-desc');
    if (elDesc) elDesc.textContent = desc;

    // Badges
    const elBadgeTag = document.getElementById('preview-badge-tag');
    if (elBadgeTag) {
        const insClean = (insignia || '').trim();
        if (insClean) {
            elBadgeTag.textContent = insClean.toUpperCase();
            elBadgeTag.style.display = '';
        } else {
            elBadgeTag.textContent = '';
            elBadgeTag.style.display = 'none';
        }
    }

    // Tamaños y Precios configurados dinámicamente
    const tamanosMap = typeof obtenerTamanosFormulario === 'function' ? obtenerTamanosFormulario() : { '12oz': 13000 };
    const sizeKeys = Object.keys(tamanosMap);
    const sizeValues = Object.values(tamanosMap);
    const primerPrecio = sizeValues[0] || 13000;

    const elHiddenPrice = document.getElementById('granizado-form-precio');
    if (elHiddenPrice) elHiddenPrice.value = primerPrecio;

    // Renderizar botones de tamaño en la tarjeta de previsualización
    const previewSizesRow = document.getElementById('preview-sizes-row');
    if (previewSizesRow) {
        previewSizesRow.innerHTML = sizeKeys.map((s, idx) => {
            return `<button class="${idx === 0 ? 'on' : ''}" type="button" onclick="seleccionarTamanoPreview(this, ${sizeValues[idx]})" style="padding:6px 6px; font-size:11px; white-space:nowrap;">${s}</button>`;
        }).join('');
    }

    // Precios
    const elPrice = document.getElementById('preview-price');
    if (elPrice) elPrice.textContent = fmtMoney(primerPrecio);
    const elOldPrice = document.getElementById('preview-old-price');
    if (elOldPrice) {
        if (precioReg && precioReg > primerPrecio) {
            elOldPrice.textContent = fmtMoney(precioReg);
            elOldPrice.style.display = 'inline';
        } else {
            elOldPrice.style.display = 'none';
        }
    }

    // Colores de gradiente de respaldo
    const elArt = document.getElementById('preview-art');
    if (elArt) {
        elArt.style.setProperty('--a', c1);
        elArt.style.setProperty('--b', c2);
    }

    // Sliders de encuadre y valores
    const fitMode = document.getElementById('slider-img-fit')?.value || 'cover';
    const zoom = parseFloat(document.getElementById('slider-img-zoom')?.value || '1.0');
    const posX = document.getElementById('slider-img-posx')?.value || '50';
    const posY = document.getElementById('slider-img-posy')?.value || '50';

    const lblZoom = document.getElementById('val-img-zoom');
    if (lblZoom) lblZoom.textContent = zoom.toFixed(2) + 'x';
    const lblPosX = document.getElementById('val-img-posx');
    if (lblPosX) lblPosX.textContent = posX + '%';
    const lblPosY = document.getElementById('val-img-posy');
    if (lblPosY) lblPosY.textContent = posY + '%';

    // Manejo de Imagen
    const imgTag = document.getElementById('preview-img-tag');
    const cupwFallback = document.getElementById('preview-cupw-fallback');
    const thumbImg = document.getElementById('granizado-thumb-img');
    const thumbPlaceholder = document.getElementById('granizado-thumb-placeholder');
    const currentImgUrl = document.getElementById('granizado-form-img')?.value?.trim();

    if (currentImgUrl && currentImgUrl !== '') {
        if (imgTag) {
            imgTag.src = currentImgUrl;
            imgTag.style.display = 'block';
            imgTag.style.objectFit = fitMode;
            imgTag.style.objectPosition = `${posX}% ${posY}%`;
            imgTag.style.transform = `scale(${zoom})`;
        }
        if (cupwFallback) cupwFallback.style.display = 'none';

        if (thumbImg) {
            thumbImg.src = currentImgUrl;
            thumbImg.style.display = 'block';
        }
        if (thumbPlaceholder) thumbPlaceholder.style.display = 'none';
    } else {
        if (imgTag) imgTag.style.display = 'none';
        if (cupwFallback) cupwFallback.style.display = 'block';

        if (thumbImg) thumbImg.style.display = 'none';
        if (thumbPlaceholder) thumbPlaceholder.style.display = 'block';
    }
};

function renderizarTablaGranizados() {
    const tbody = document.getElementById('tabla-granizados-body');
    if (!tbody) return;

    let lista = AdminState.granizados || [];

    // Filtro por categoría o stock
    const cat = AdminState.filtroCategoriaGranizado;
    if (cat === 'tropical') lista = lista.filter(g => (g.categoriaSlug || '').toLowerCase().includes('tropical'));
    else if (cat === 'berries') lista = lista.filter(g => (g.categoriaSlug || '').toLowerCase().includes('berries') || (g.nombre || '').toLowerCase().includes('fresa') || (g.nombre || '').toLowerCase().includes('mora'));
    else if (cat === 'citrus') lista = lista.filter(g => (g.categoriaSlug || '').toLowerCase().includes('citrus') || (g.nombre || '').toLowerCase().includes('lulo') || (g.nombre || '').toLowerCase().includes('limon'));
    else if (cat === 'STOCK_BAJO') lista = lista.filter(g => (g.stockDisponible ?? 25) <= 10 && (g.stockDisponible ?? 25) > 0);
    else if (cat === 'AGOTADO') lista = lista.filter(g => (g.stockDisponible ?? 25) === 0);

    // Buscador
    const q = AdminState.busquedaGranizado;
    if (q) {
        lista = lista.filter(g => {
            const nom = (g.nombre || '').toLowerCase();
            const lic = (g.licorBase || '').toLowerCase();
            const desc = (g.descripcion || '').toLowerCase();
            return nom.includes(q) || lic.includes(q) || desc.includes(q);
        });
    }

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:34px; color:var(--mut);">No hay sabores en esta categoría o filtro.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(g => {
        const stock = g.stockDisponible ?? 25;
        let stockClass = 'stock-badge-ok';
        if (stock === 0) stockClass = 'stock-badge-out';
        else if (stock <= 10) stockClass = 'stock-badge-low';

        const precios = g.preciosPorTamano || { "12oz": g.precioBase };
        const preciosStr = Object.entries(precios).map(([sz, pr]) => `${sz}: ${fmtMoney(pr)}`).join(' · ');

        const imgTag = g.imagenUrl && g.imagenUrl.trim() !== ''
            ? `<img src="${g.imagenUrl}" style="width:48px; height:48px; border-radius:12px; object-fit:cover; border:1px solid rgba(255,255,255,0.1);">`
            : `<div style="width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg, ${g.coloresGradiente ? g.coloresGradiente[0] : '#FFB703'}, ${g.coloresGradiente ? g.coloresGradiente[1] : '#10B981'}); display:grid; place-items:center; font-size:1.3rem;">🥤</div>`;

        return `
            <tr>
                <td>${imgTag}</td>
                <td>
                    <div style="font-weight:800; color:#fff; font-size:0.95rem;">${g.nombre}</div>
                    <small style="color:var(--cy); font-weight:700;">
                        🍃 100% Pulpa Frutal Natural
                    </small>
                    ${g.insignia ? `<span style="background:rgba(255,255,255,0.08); font-size:0.68rem; padding:1px 6px; border-radius:6px; margin-left:4px;">${g.insignia}</span>` : ''}
                </td>
                <td>
                    <div style="color:#fff;">${g.licorBase || 'Cosecha Selección'}</div>
                    <small style="color:var(--mut);">${g.graduacionAlcohol || 'Dulzor 100% Natural'}</small>
                </td>
                <td style="font-size:0.82rem; color:#d2e4ff;">${preciosStr}</td>
                <td>
                    <!-- Control Inline de Stock -->
                    <div class="stock-inline-control">
                        <button class="stock-btn" onclick="ajustarStockInline('${g.id}', -5)" title="-5 unidades">-</button>
                        <span class="stock-val-badge ${stockClass}">${stock}</span>
                        <button class="stock-btn" onclick="ajustarStockInline('${g.id}', 5)" title="+5 unidades">+</button>
                    </div>
                </td>
                <td>
                    <button onclick="toggleActivoGranizado('${g.id}')" style="background:${g.activo ? 'rgba(0,245,160,0.12)' : 'rgba(255,0,127,0.12)'}; border:1px solid ${g.activo ? 'var(--li)' : 'var(--mg)'}; color:#fff; padding:5px 12px; border-radius:99px; font-size:0.75rem; font-weight:800; cursor:pointer;">
                        ${g.activo ? '✅ A la Venta' : '❌ Pausado'}
                    </button>
                </td>
                <td style="text-align:right;">
                    <div style="display:flex; justify-content:flex-end; gap:8px;">
                        <button onclick="editarGranizadoInline('${g.id}')" class="btn-icon-action btn-icon-edit" title="Editar sabor">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button onclick="eliminarGranizadoAdmin('${g.id}')" class="btn-icon-action btn-icon-del" title="Eliminar sabor">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Ajuste rápido de stock con 1 clic desde la tabla
window.ajustarStockInline = async function (id, delta) {
    const g = AdminState.granizados.find(item => item.id === id);
    if (!g) return;

    const actual = g.stockDisponible ?? 25;
    const nuevoStock = Math.max(0, actual + delta);
    g.stockDisponible = nuevoStock;

    renderizarTablaGranizados();

    try {
        const payload = Object.assign({}, g, { stockDisponible: nuevoStock });
        const res = await fetch(`/api/admin/granizados/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            if (window.showToast) window.showToast(`Stock de ${g.nombre}: ${nuevoStock} unidades`, 'info');
            cargarDashboard();
        }
    } catch (err) {
        console.error('Error al actualizar stock:', err);
    }
};

window.toggleActivoGranizado = async function (id) {
    try {
        const res = await fetch(`/api/admin/granizados/${id}/toggle-activo`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });
        if (res.ok) {
            await cargarGranizadosAdmin();
            if (window.cargarCatalogoPublico) window.cargarCatalogoPublico();
        }
    } catch (e) {
        alert('Error al pausar o activar granizado');
    }
};

async function guardarGranizadoAdmin(e) {
    if (e && e.preventDefault) e.preventDefault();

    const saveBtn = document.querySelector('.btn-save-granizado-master');
    const originalBtnHtml = saveBtn ? saveBtn.innerHTML : '💾 Guardar Granizado / Producto';

    try {
        const id = document.getElementById('granizado-form-id')?.value || '';
        const nombreInput = document.getElementById('granizado-form-nombre');
        const nombre = nombreInput?.value?.trim() || '';

        if (!nombre) {
            if (window.showToast) window.showToast('⚠️ Por favor escribe el nombre del granizado', 'warning');
            else alert('Por favor escribe el nombre del granizado');
            if (nombreInput) {
                nombreInput.focus();
                nombreInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const categoriaSlug = document.getElementById('granizado-form-tipo')?.value || 'tropical';

        const preciosPorTamano = (typeof window.obtenerTamanosFormulario === 'function')
            ? window.obtenerTamanosFormulario()
            : { '12oz': 13000 };

        const sizeValues = Object.values(preciosPorTamano);
        if (sizeValues.length === 0 || sizeValues.every(v => !v || v <= 0)) {
            if (window.showToast) window.showToast('⚠️ Agrega al menos un tamaño con su precio (ej: 12oz -> $13.000)', 'warning');
            else alert('Agrega al menos un tamaño con su precio.');
            return;
        }
        const precioBase = sizeValues[0] || 13000;

        const stock = parseInt(document.getElementById('granizado-form-stock')?.value) || 25;
        const desc = document.getElementById('granizado-form-desc')?.value?.trim() || '';
        const img = document.getElementById('granizado-form-img')?.value?.trim() || '';
        const insignia = document.getElementById('granizado-form-insignia')?.value?.trim() || '';
        const color1 = document.getElementById('granizado-form-color1')?.value || '#FFB703';
        const color2 = document.getElementById('granizado-form-color2')?.value || '#FB8500';
        const activo = document.getElementById('granizado-form-activo') ? document.getElementById('granizado-form-activo').checked : true;
        const destacado = document.getElementById('granizado-form-destacado') ? document.getElementById('granizado-form-destacado').checked : true;

        const fitMode = document.getElementById('slider-img-fit')?.value || 'cover';
        const zoom = parseFloat(document.getElementById('slider-img-zoom')?.value || '1.0');
        const posX = parseFloat(document.getElementById('slider-img-posx')?.value || '50');
        const posY = parseFloat(document.getElementById('slider-img-posy')?.value || '50');

        const payload = {
            nombre: nombre,
            descripcion: desc,
            tipo: 'SIN_ALCOHOL',
            categoriaSlug: categoriaSlug,
            precioBase: precioBase,
            preciosPorTamano: preciosPorTamano,
            stockDisponible: stock,
            imagenUrl: img,
            licorBase: 'Fruta 100% Natural',
            graduacionAlcohol: '0.0% Alcohol',
            insignia: insignia,
            coloresGradiente: [color1, color2],
            activo: activo,
            destacado: destacado,
            ajusteImagen: {
                fit: fitMode,
                zoom: zoom,
                posX: posX,
                posY: posY
            }
        };

        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '⏳ Guardando producto...';
        }

        const url = id ? `/api/admin/granizados/${id}` : '/api/admin/granizados';
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            limpiarFormularioGranizado();
            if (window.showToast) window.showToast(`¡Granizado "${payload.nombre}" guardado con éxito! 🥭`, 'success');
            else alert(`¡Granizado "${payload.nombre}" guardado con éxito!`);
            await cargarGranizadosAdmin();
            await cargarDashboard();
            if (window.cargarCatalogoPublico) window.cargarCatalogoPublico();
        } else if (res.status === 401 || res.status === 403) {
            if (window.showToast) window.showToast('🔒 Sesión expirada o no autorizada. Inicia sesión nuevamente.', 'error');
            else alert('Sesión de administrador no autorizada. Por favor vuelve a iniciar sesión.');
            if (window.abrirModalLoginAdmin) window.abrirModalLoginAdmin();
            else {
                const modalLogin = document.getElementById('modal-admin-login');
                if (modalLogin) modalLogin.classList.add('active');
            }
        } else {
            const errData = await res.json().catch(() => ({}));
            const msg = errData.error || errData.mensaje || 'Error al guardar el granizado en la base de datos.';
            if (window.showToast) window.showToast('❌ ' + msg, 'error');
            else alert('Error: ' + msg);
        }
    } catch (err) {
        console.error('Error al guardar granizado:', err);
        if (window.showToast) window.showToast('❌ Error de conexión al guardar: ' + err.message, 'error');
        else alert('Error de conexión al guardar: ' + err.message);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalBtnHtml;
        }
    }
}
window.guardarGranizadoAdmin = guardarGranizadoAdmin;

window.eliminarGranizadoAdmin = async function (id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este sabor del catálogo?')) return;

    try {
        const res = await fetch(`/api/admin/granizados/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) {
            if (window.showToast) window.showToast('Granizado eliminado del catálogo', 'info');
            await cargarGranizadosAdmin();
            await cargarDashboard();
            if (window.cargarCatalogoPublico) window.cargarCatalogoPublico();
        }
    } catch (e) {
        alert('Error al eliminar producto');
    }
};

// ==========================================================
// 4. HISTORIAL DE REGISTROS & AUDITORÍA
// ==========================================================
function cargarHistorialAdmin() {
    const tbody = document.getElementById('tabla-historial-body');
    if (!tbody) return;

    const pedidos = AdminState.pedidos || [];
    const entregados = pedidos.filter(p => p.estado === 'ENTREGADO');
    const cancelados = pedidos.filter(p => p.estado === 'CANCELADO');

    const totalRecaudado = entregados.reduce((a, b) => a + (b.total || 0), 0);
    const subtotalProd = entregados.reduce((a, b) => a + (b.subtotal || 0), 0);
    const totalEnvios = entregados.reduce((a, b) => a + (b.costoEnvio || 0), 0);
    const tasaCancel = pedidos.length > 0 ? Math.round((cancelados.length / pedidos.length) * 100) : 0;

    // Actualizar KPIs de Historial
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setTxt('hist-pedidos-entregados-count', entregados.length);
    setTxt('hist-total-recaudado', fmtMoney(totalRecaudado));
    setTxt('hist-pedidos-cancelados-count', cancelados.length);
    setTxt('hist-tasa-cancelacion', `${tasaCancel}%`);
    setTxt('hist-subtotal-productos', fmtMoney(subtotalProd));
    setTxt('hist-total-envios', fmtMoney(totalEnvios));

    // Filtrar por búsqueda
    let lista = pedidos.filter(p => ['ENTREGADO', 'CANCELADO'].includes(p.estado));
    if (lista.length === 0) lista = pedidos;

    const q = AdminState.busquedaHistorial || '';
    if (q) {
        lista = lista.filter(p => {
            const cod = (p.codigoPedido || '').toLowerCase();
            const nom = (p.clienteNombre || '').toLowerCase();
            return cod.includes(q.toLowerCase()) || nom.includes(q.toLowerCase());
        });
    }

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:34px; color:var(--mut);">No hay registros en el historial.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(p => {
        const fecha = new Date(p.fechaCreacion);
        const fechaStr = fecha.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        const horaStr = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const itemsStr = (p.items || []).map(i => `${i.cantidad}x ${i.granizadoNombre} (${i.tamano || '12oz'})`).join(', ');

        return `
            <tr>
                <td style="font-size:0.8rem; color:var(--mut);">${fechaStr} · ${horaStr}</td>
                <td><strong style="color:var(--cy); font-size:0.95rem;">${p.codigoPedido}</strong></td>
                <td>
                    <div style="font-weight:800; color:#fff;">${p.clienteNombre}</div>
                    <small style="color:#25D366;">📱 ${p.clienteTelefono}</small>
                </td>
                <td style="font-size:0.82rem; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${itemsStr}
                </td>
                <td><span style="font-size:0.8rem; color:var(--mut);">${p.metodoPago || 'EFECTIVO'}</span></td>
                <td><strong style="color:var(--li); font-size:1rem;">${fmtMoney(p.total)}</strong></td>
                <td>
                    <span class="status-badge status-${p.estado}">
                        ${p.estado.replace('_', ' ')}
                    </span>
                </td>
                <td style="text-align:right;">
                    <div style="display:flex; justify-content:flex-end; align-items:center; gap:8px;">
                        <button onclick="abrirModalDetallePedido('${p.id}')" class="btn-icon-action btn-icon-view" title="Ver ticket completo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </button>
                        <button onclick="eliminarPedidoAdmin('${p.id}', '${p.codigoPedido}')" class="btn-icon-action btn-icon-del" title="Eliminar registro permanentemente">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ==========================================================
// 5. CONFIGURACIÓN DEL NEGOCIO & MAPA INTERACTIVO CON LOGO
// ==========================================================
let adminMap = null;
let adminMarker = null;

function crearLogoPinIcon() {
    return L.divIcon({
        className: 'custom-map-pin-badge',
        html: `
            <div class="map-brand-pin-marker">
                <div class="pin-radar-ripple"></div>
                <div class="pin-logo-bubble">
                    <img src="/img/granifresh-logo.jpg" alt="Granifresh Logo" />
                </div>
                <div class="pin-pointer-tip"></div>
                <div class="pin-name-tag">GRANIFRESH</div>
            </div>
        `,
        iconSize: [64, 82],
        iconAnchor: [32, 68],
        popupAnchor: [0, -68]
    });
}

let geocodeTimer = null;

async function geocodificarDireccionAdmin(query) {
    if (!query || query.trim().length < 3) return;
    const statusEl = document.getElementById('cfg-direccion-geocoding-status');
    if (statusEl) statusEl.style.display = 'inline-flex';

    try {
        let q = query.trim();
        // Si no incluye país o Colombia, agregar para mayor precisión geográfica
        if (!q.toLowerCase().includes('colombia')) {
            q += ', Colombia';
        }
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                actualizarCoordenadasEnFormulario(lat, lng);
                if (adminMap && adminMarker) {
                    adminMarker.setLatLng([lat, lng]);
                    adminMap.setView([lat, lng], 16);
                }
                const badgeTxt = document.getElementById('admin-map-coords-txt');
                if (badgeTxt) badgeTxt.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)} (${data[0].display_name.split(',')[0]})`;
            }
        }
    } catch (e) {
        console.warn('Error al geocodificar dirección:', e);
    } finally {
        if (statusEl) statusEl.style.display = 'none';
    }
}

function inicializarMapaAdminConfig(lat, lng) {
    const latNum = parseFloat(lat) || 10.4075;
    const lngNum = parseFloat(lng) || -75.5255;

    const mapContainer = document.getElementById('admin-map-preview');
    if (!mapContainer || typeof L === 'undefined') return;

    if (!adminMap) {
        adminMap = L.map('admin-map-preview', {
            center: [latNum, lngNum],
            zoom: 16,
            zoomControl: true
        });

        // Capa Google Maps Tiles
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            attribution: 'Leaflet | &copy; Google Maps'
        }).addTo(adminMap);

        // Marcador Draggable con el logo de Granifresh
        adminMarker = L.marker([latNum, lngNum], {
            icon: crearLogoPinIcon(),
            draggable: true
        }).addTo(adminMap);

        adminMarker.bindPopup('<b>🍃 Sede Principal GRANIFRESH</b><br>Arrastra este pin con el logo para mover la sede').openPopup();

        // Evento dragend
        adminMarker.on('dragend', function (e) {
            const pos = e.target.getLatLng();
            actualizarCoordenadasEnFormulario(pos.lat, pos.lng);
        });

        // Evento clic en mapa
        adminMap.on('click', function (e) {
            adminMarker.setLatLng(e.latlng);
            actualizarCoordenadasEnFormulario(e.latlng.lat, e.latlng.lng);
        });

        // Escuchar cambios de escritura en el campo de dirección para reposicionar el mapa automáticamente
        const inputDir = document.getElementById('cfg-direccion');
        if (inputDir && !inputDir.dataset.geolisten) {
            inputDir.dataset.geolisten = "true";
            inputDir.addEventListener('input', (e) => {
                clearTimeout(geocodeTimer);
                geocodeTimer = setTimeout(() => {
                    geocodificarDireccionAdmin(e.target.value);
                }, 550);
            });
            inputDir.addEventListener('change', (e) => {
                clearTimeout(geocodeTimer);
                geocodificarDireccionAdmin(e.target.value);
            });
        }
    } else {
        adminMarker.setLatLng([latNum, lngNum]);
        adminMap.setView([latNum, lngNum], 16);
    }

    actualizarCoordenadasBadge(latNum, lngNum);
    setTimeout(() => { if (adminMap) adminMap.invalidateSize(); }, 250);
}

function actualizarCoordenadasEnFormulario(lat, lng) {
    const elLat = document.getElementById('cfg-lat');
    const elLng = document.getElementById('cfg-lng');
    if (elLat) elLat.value = Number(lat).toFixed(6);
    if (elLng) elLng.value = Number(lng).toFixed(6);
    actualizarCoordenadasBadge(lat, lng);
}

function actualizarCoordenadasBadge(lat, lng) {
    const elBadge = document.getElementById('admin-map-coords-txt');
    if (elBadge) elBadge.textContent = `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
}

window.localizarSedeAdminActual = function () {
    if (!navigator.geolocation) {
        if (window.showToast) window.showToast('Tu navegador no soporta geolocalización', 'warning');
        return;
    }
    if (window.showToast) window.showToast('Obteniendo coordenadas GPS... 🛰️', 'info');
    navigator.geolocation.getCurrentPosition(
        async function (pos) {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            if (adminMap && adminMarker) {
                adminMarker.setLatLng([lat, lng]);
                adminMap.setView([lat, lng], 17);
            }
            actualizarCoordenadasEnFormulario(lat, lng);

            // Reverse geocode para rellenar la dirección amigable
            try {
                const resRev = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                    headers: { 'Accept-Language': 'es' }
                });
                if (resRev.ok) {
                    const dataRev = await resRev.json();
                    if (dataRev && dataRev.display_name) {
                        const partes = dataRev.display_name.split(',');
                        const dirCorta = partes.slice(0, 3).join(',').trim();
                        const elDir = document.getElementById('cfg-direccion');
                        if (elDir) elDir.value = dirCorta;
                    }
                }
            } catch (errRev) {
                console.warn('Reverse geocode error:', errRev);
            }

            if (window.showToast) window.showToast('Ubicación GPS establecida con éxito 📍', 'success');
        },
        function (err) {
            console.warn('Error geolocalización:', err);
            if (window.showToast) window.showToast('No se pudo obtener el GPS actual. Revisa los permisos de ubicación.', 'warning');
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
};

async function cargarConfiguracionAdmin() {
    try {
        const res = await fetch('/api/admin/configuracion', { headers: getAuthHeaders() });
        if (!res.ok) return;
        const cfg = await res.json();
        AdminState.configuracion = cfg;

        let nombreNeg = cfg.nombreNegocio || 'GRANIFRESH';
        if (nombreNeg.toUpperCase().includes('FROST')) nombreNeg = 'GRANIFRESH';
        document.getElementById('cfg-nombre').value = nombreNeg;
        document.getElementById('cfg-slogan').value = cfg.slogan || 'FULL SABOR, FULL FRESCURA';
        document.getElementById('cfg-whatsapp').value = cfg.whatsappPedidos || '573013557467';
        document.getElementById('cfg-envio').value = cfg.costoEnvioBase || 5000;
        document.getElementById('cfg-minimo').value = cfg.pedidoMinimo || 15000;
        document.getElementById('cfg-horario').value = cfg.horarioAtencion || 'Lunes a Domingo 12:00 PM - 11:30 PM';
        document.getElementById('cfg-abierto').value = String(cfg.abiertoParaPedidos !== false);
        let msgAlerta = cfg.mensajeAlertaSuperior || '🍃 ¡Granifresh! Granizados 100% fruta natural artesanal a domicilio · ⚡ Entrega en 35 min con empaque térmico antifusión';
        if (msgAlerta.includes('FROST')) {
            msgAlerta = '🍃 ¡Granifresh! Granizados 100% fruta natural artesanal a domicilio · ⚡ Entrega en 35 min con empaque térmico antifusión';
        }
        document.getElementById('cfg-alerta').value = msgAlerta;
        document.getElementById('cfg-nequi').value = cfg.numeroNequi || '301 355 7467';
        document.getElementById('cfg-daviplata').value = cfg.numeroDaviplata || '301 355 7467';
        document.getElementById('cfg-bancolombia').value = cfg.cuentaBancolombia || 'Ahorros 245-883921-04';

        const elIg = document.getElementById('cfg-instagram');
        if (elIg) elIg.value = cfg.instagramUrl || 'https://instagram.com/granifresh';
        const elFb = document.getElementById('cfg-facebook');
        if (elFb) elFb.value = cfg.facebookUrl || 'https://facebook.com/granifresh';
        const elDir = document.getElementById('cfg-direccion');
        if (elDir) elDir.value = cfg.direccionSede || 'Cra. 50 #31b, Olaya Herrera';
        const elLat = document.getElementById('cfg-lat');
        if (elLat) elLat.value = cfg.latitud !== undefined && cfg.latitud !== null ? cfg.latitud : 10.4075;
        const elLng = document.getElementById('cfg-lng');
        if (elLng) elLng.value = cfg.longitud !== undefined && cfg.longitud !== null ? cfg.longitud : -75.5255;
        const elHist = document.getElementById('cfg-historia');
        if (elHist) elHist.value = cfg.historiaNosotros || 'En Granifresh transformamos la mejor fruta 100% natural en una experiencia glacial inolvidable. Cero concentrados artificiales, puro sabor y frescura en cada vaso.';

        // Colores del Trío de Granizados
        const col1 = cfg.colorGranizado1 || '#E11D48';
        const col2 = cfg.colorGranizado2 || '#FF007F';
        const col1Izq = cfg.colorGranizado1Izq || '#10B981';
        const col2Izq = cfg.colorGranizado2Izq || '#00E5FF';
        const col1Der = cfg.colorGranizado1Der || '#FFB703';
        const col2Der = cfg.colorGranizado2Der || '#FB8500';

        if (document.getElementById('cfg-color1')) document.getElementById('cfg-color1').value = col1;
        if (document.getElementById('cfg-color1-picker')) document.getElementById('cfg-color1-picker').value = col1;
        if (document.getElementById('cfg-color2')) document.getElementById('cfg-color2').value = col2;
        if (document.getElementById('cfg-color2-picker')) document.getElementById('cfg-color2-picker').value = col2;

        if (document.getElementById('cfg-color1-izq')) document.getElementById('cfg-color1-izq').value = col1Izq;
        if (document.getElementById('cfg-color1-izq-picker')) document.getElementById('cfg-color1-izq-picker').value = col1Izq;
        if (document.getElementById('cfg-color2-izq')) document.getElementById('cfg-color2-izq').value = col2Izq;
        if (document.getElementById('cfg-color2-izq-picker')) document.getElementById('cfg-color2-izq-picker').value = col2Izq;

        if (document.getElementById('cfg-color1-der')) document.getElementById('cfg-color1-der').value = col1Der;
        if (document.getElementById('cfg-color1-der-picker')) document.getElementById('cfg-color1-der-picker').value = col1Der;
        if (document.getElementById('cfg-color2-der')) document.getElementById('cfg-color2-der').value = col2Der;
        if (document.getElementById('cfg-color2-der-picker')) document.getElementById('cfg-color2-der-picker').value = col2Der;

        inicializarMapaAdminConfig(cfg.latitud, cfg.longitud);

    } catch (e) {
        console.error('Error al cargar configuración:', e);
    }
}

window.sincronizarColorAdmin = function(targetId, value) {
    const el = document.getElementById(targetId);
    if (el) el.value = value;
    if (window.aplicarColoresGranizadoHero) {
        window.aplicarColoresGranizadoHero(
            document.getElementById('cfg-color1')?.value,
            document.getElementById('cfg-color2')?.value,
            document.getElementById('cfg-color1-izq')?.value,
            document.getElementById('cfg-color2-izq')?.value,
            document.getElementById('cfg-color1-der')?.value,
            document.getElementById('cfg-color2-der')?.value
        );
    }
};

window.sincronizarColorAdminPicker = function(pickerId, value) {
    const el = document.getElementById(pickerId);
    if (el && /^#[0-9A-Fa-f]{6}$/.test(value)) el.value = value;
    if (window.aplicarColoresGranizadoHero) {
        window.aplicarColoresGranizadoHero(
            document.getElementById('cfg-color1')?.value,
            document.getElementById('cfg-color2')?.value,
            document.getElementById('cfg-color1-izq')?.value,
            document.getElementById('cfg-color2-izq')?.value,
            document.getElementById('cfg-color1-der')?.value,
            document.getElementById('cfg-color2-der')?.value
        );
    }
};

async function guardarConfiguracionAdmin(e) {
    e.preventDefault();

    const payload = {
        nombreNegocio: document.getElementById('cfg-nombre').value.trim(),
        slogan: document.getElementById('cfg-slogan').value.trim(),
        whatsappPedidos: document.getElementById('cfg-whatsapp').value.trim(),
        costoEnvioBase: parseFloat(document.getElementById('cfg-envio').value) || 5000,
        pedidoMinimo: parseFloat(document.getElementById('cfg-minimo').value) || 15000,
        horarioAtencion: document.getElementById('cfg-horario').value.trim(),
        abiertoParaPedidos: document.getElementById('cfg-abierto').value === 'true',
        mensajeAlertaSuperior: document.getElementById('cfg-alerta').value.trim(),
        numeroNequi: document.getElementById('cfg-nequi').value.trim(),
        numeroDaviplata: document.getElementById('cfg-daviplata').value.trim(),
        cuentaBancolombia: document.getElementById('cfg-bancolombia').value.trim(),
        instagramUrl: document.getElementById('cfg-instagram').value.trim(),
        facebookUrl: document.getElementById('cfg-facebook').value.trim(),
        direccionSede: document.getElementById('cfg-direccion').value.trim(),
        latitud: parseFloat(document.getElementById('cfg-lat').value) || 10.4075,
        longitud: parseFloat(document.getElementById('cfg-lng').value) || -75.5255,
        historiaNosotros: document.getElementById('cfg-historia').value.trim(),
        colorGranizado1: document.getElementById('cfg-color1') ? document.getElementById('cfg-color1').value.trim() : '#E11D48',
        colorGranizado2: document.getElementById('cfg-color2') ? document.getElementById('cfg-color2').value.trim() : '#FF007F',
        colorGranizado1Izq: document.getElementById('cfg-color1-izq') ? document.getElementById('cfg-color1-izq').value.trim() : '#10B981',
        colorGranizado2Izq: document.getElementById('cfg-color2-izq') ? document.getElementById('cfg-color2-izq').value.trim() : '#00E5FF',
        colorGranizado1Der: document.getElementById('cfg-color1-der') ? document.getElementById('cfg-color1-der').value.trim() : '#FFB703',
        colorGranizado2Der: document.getElementById('cfg-color2-der') ? document.getElementById('cfg-color2-der').value.trim() : '#FB8500'
    };

    try {
        const res = await fetch('/api/admin/configuracion', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            if (window.showToast) window.showToast('¡Configuración comercial y ubicación actualizadas con éxito! ⚙️📍', 'success');
            // Actualizar marquesina pública en vivo
            if (typeof window.updateMarquee === 'function' && payload.mensajeAlertaSuperior) {
                window.updateMarquee(payload.mensajeAlertaSuperior);
            } else {
                const mq = document.getElementById('mq');
                if (mq && payload.mensajeAlertaSuperior) {
                    mq.innerHTML = Array(6).join(payload.mensajeAlertaSuperior + ' &nbsp;·&nbsp; ');
                }
            }
            // Actualizar botón flotante de WhatsApp en vivo
            if (typeof window.actualizarBotonFlotanteWhatsapp === 'function' && payload.whatsappPedidos) {
                window.actualizarBotonFlotanteWhatsapp(payload.whatsappPedidos);
            }
            // Sincronizar sección Nosotros pública en vivo
            if (typeof window.renderizarSeccionNosotros === 'function') {
                window.renderizarSeccionNosotros(payload);
            }
        }
    } catch (err) {
        alert('Error al guardar la configuración.');
    }
}

// ==========================================================
// 8. GESTIÓN DE ADMINISTRADORES (USUARIOS Y CONTRASEÑAS)
// ==========================================================
async function cargarAdministradoresAdmin() {
    const contenedor = document.getElementById('contenedor-lista-admins');
    const badge = document.getElementById('badge-total-admins');
    if (!contenedor) return;

    try {
        const res = await fetch('/api/admin/usuarios', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Error al consultar administradores');
        const admins = await res.json();
        AdminState.admins = admins;
        actualizarBadgesNavegacion();

        if (badge) badge.textContent = `${admins.length} Usuario${admins.length === 1 ? '' : 's'}`;

        if (!admins || admins.length === 0) {
            contenedor.innerHTML = '<div style="text-align:center; padding:30px; color:var(--mut);">No se encontraron administradores registrados.</div>';
            return;
        }

        const usuarioActual = document.getElementById('admin-display-username')?.textContent?.trim() || '';

        contenedor.innerHTML = admins.map(adm => {
            const esUsuarioActual = usuarioActual && adm.usuario.toLowerCase() === usuarioActual.toLowerCase();
            return `
                <div class="admin-item-row" style="display:flex; justify-content:space-between; align-items:center; background:rgba(4,20,11,0.65); border:1px solid rgba(52,211,153,0.18); border-radius:12px; padding:14px 18px; gap:14px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:14px;">
                        <div style="width:42px; height:42px; border-radius:10px; background:linear-gradient(135deg, rgba(16,185,129,0.2), rgba(0,240,255,0.15)); border:1px solid rgba(52,211,153,0.3); display:grid; place-items:center; font-size:1.25rem;">
                            👤
                        </div>
                        <div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <strong style="color:#fff; font-size:0.95rem;">@${adm.usuario}</strong>
                                ${esUsuarioActual ? '<span style="background:rgba(0,240,255,0.15); border:1px solid rgba(0,240,255,0.3); color:#00F0FF; font-size:0.7rem; font-weight:800; padding:1px 8px; border-radius:99px;">Tú (Sesión actual)</span>' : ''}
                                <span style="background:rgba(52,211,153,0.12); color:#34D399; font-size:0.72rem; font-weight:800; padding:1px 8px; border-radius:99px;">${adm.rol || 'ROLE_ADMIN'}</span>
                            </div>
                            <span style="color:var(--mut); font-size:0.8rem; display:block; margin-top:2px;">${adm.nombreCompleto || 'Administrador General'}</span>
                        </div>
                    </div>
                    <div>
                        ${admins.length > 1 ? `
                            <button type="button" onclick="eliminarAdministradorAdmin('${adm.id}', '${adm.usuario}')" class="btn-cancel-action" style="padding:7px 14px; font-size:0.8rem; font-weight:700; background:rgba(239,68,68,0.12); color:#EF4444; border:1px solid rgba(239,68,68,0.3); border-radius:8px; cursor:pointer;" title="Eliminar acceso de @${adm.usuario}">
                                🗑️ Eliminar
                            </button>
                        ` : '<span style="color:var(--mut); font-size:0.75rem;">Administrador Principal</span>'}
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Error al cargar administradores:', e);
        contenedor.innerHTML = '<div style="text-align:center; padding:20px; color:#EF4444;">Error al cargar lista de administradores.</div>';
    }
}

async function guardarNuevoAdministradorAdmin(e) {
    e.preventDefault();
    const usuarioEl = document.getElementById('nuevo-admin-usuario');
    const passwordEl = document.getElementById('nuevo-admin-password');
    const nombreEl = document.getElementById('nuevo-admin-nombre');

    const usuario = usuarioEl ? usuarioEl.value.trim() : '';
    const contrasena = passwordEl ? passwordEl.value.trim() : '';
    const nombreCompleto = nombreEl ? nombreEl.value.trim() : '';

    if (!usuario || !contrasena) {
        if (window.showToast) window.showToast('Debes ingresar usuario y contraseña', 'error');
        return;
    }

    try {
        const res = await fetch('/api/admin/usuarios', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ usuario, contrasena, nombreCompleto })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            alert(data.error || 'Error al crear administrador');
            return;
        }

        if (window.showToast) window.showToast(`¡Administrador @${usuario} creado exitosamente! 👥✨`, 'success');
        if (usuarioEl) usuarioEl.value = '';
        if (passwordEl) passwordEl.value = '';
        if (nombreEl) nombreEl.value = '';

        cargarAdministradoresAdmin();

    } catch (err) {
        console.error('Error al crear administrador:', err);
        alert('Error al comunicarse con el servidor.');
    }
}

window.eliminarAdministradorAdmin = async function (id, usuario) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el acceso al administrador @${usuario}?`)) return;

    try {
        const res = await fetch(`/api/admin/usuarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            alert(data.error || 'No fue posible eliminar el administrador');
            return;
        }

        if (window.showToast) window.showToast(`Administrador @${usuario} eliminado.`, 'success');
        cargarAdministradoresAdmin();

    } catch (e) {
        console.error('Error al eliminar admin:', e);
        alert('Error al eliminar el administrador.');
    }
};


// ==========================================================
// 7. GESTOR DE CLIENTES & GRANIPOINTS (ADMIN)
// ==========================================================
AdminState.clientes = [];
AdminState.configJuegos = null;

async function cargarClientesAdmin() {
    try {
        const [resClientes, resResumen] = await Promise.all([
            fetch('/api/admin/clientes', { headers: getAuthHeaders() }),
            fetch('/api/admin/clientes/resumen', { headers: getAuthHeaders() })
        ]);

        if (resClientes.ok) {
            AdminState.clientes = await resClientes.json();
            renderizarTablaClientes(AdminState.clientes);

            const badgeClientes = document.getElementById('badge-nav-clientes');
            if (badgeClientes) badgeClientes.textContent = AdminState.clientes.length;
        }

        if (resResumen.ok) {
            const resumen = await resResumen.json();
            const elTotCl = document.getElementById('kpi-total-clientes');
            if (elTotCl) elTotCl.textContent = resumen.totalClientes || 0;
            const elPtsCirc = document.getElementById('kpi-total-puntos-circulacion');
            if (elPtsCirc) elPtsCirc.textContent = (resumen.totalPuntosCirculacion || 0).toLocaleString('es-CO');
            const elPtsCanj = document.getElementById('kpi-total-puntos-canjeados');
            if (elPtsCanj) elPtsCanj.textContent = (resumen.totalPuntosCanjeados || 0).toLocaleString('es-CO');
            const elTotTrans = document.getElementById('kpi-total-transacciones');
            if (elTotTrans) elTotTrans.textContent = resumen.totalTransacciones || 0;
        }
    } catch (err) {
        console.error('Error al cargar clientes:', err);
    }
}

function renderizarTablaClientes(clientes) {
    const tbody = document.getElementById('tabla-clientes-body');
    if (!tbody) return;

    if (!clientes || clientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--mut);">No se encontraron clientes registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = clientes.map(c => {
        const fechaReg = c.fechaRegistro ? new Date(c.fechaRegistro).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Reciente';
        const extras = (c.girosExtrasDisponibles || 0) + ' giros / ' + (c.raspasExtrasDisponibles || 0) + ' raspas';
        const pts = (c.granipoints || 0).toLocaleString('es-CO');
        const dir = c.direccionPredeterminada ? escapeHtmlAdmin(c.direccionPredeterminada) : 'Sin dirección';
        const barrio = c.barrioPredeterminado ? escapeHtmlAdmin(c.barrioPredeterminado) : '';

        return `
            <tr>
                <td>
                    <div style="font-weight:800; color:#FFFFFF;">${escapeHtmlAdmin(c.nombre || 'Sin nombre')}</div>
                    <small style="color:var(--mut);">${c.email ? escapeHtmlAdmin(c.email) : 'Cliente Registrado'}</small>
                </td>
                <td>
                    <a href="https://wa.me/57${c.telefono}" target="_blank" rel="noopener noreferrer" style="color:#10B981; font-weight:700; text-decoration:none;">
                        📱 +57 ${escapeHtmlAdmin(c.telefono || '')}
                    </a>
                </td>
                <td>
                    <div style="color:#FFFFFF; font-weight:600; font-size:0.85rem;">📍 ${dir}</div>
                    ${barrio ? `<small style="color:#38BDF8; font-weight:700;">🏘️ ${barrio}</small>` : ''}
                </td>
                <td>
                    <span class="admin-badge-granipoints">🌟 ${pts} pts</span>
                </td>
                <td>
                    <span style="font-size:0.8rem; color:#A7F3D0;">${extras}</span>
                </td>
                <td>
                    <small style="color:var(--mut);">${fechaReg}</small>
                </td>
                <td style="text-align:center;">
                    <div style="display:inline-flex; gap:6px; flex-wrap:wrap; justify-content:center;">
                        <button type="button" class="btn-action-small" style="background:rgba(14,165,233,0.18); border:1px solid rgba(14,165,233,0.4); color:#38BDF8;" onclick="abrirModalDetalleClienteAdmin('${c.id}')" title="Ver ficha completa y ubicación en mapa">
                            📍 Ficha &amp; Mapa
                        </button>
                        <button type="button" class="btn-action-small btn-action-adjust" onclick="abrirModalAjustarPuntosAdmin('${c.id}')" title="Sumar o restar GraniPoints">
                            ⚙️ Puntos
                        </button>
                        <button type="button" class="btn-action-small btn-action-historial" onclick="abrirModalHistorialClienteAdmin('${c.id}')" title="Ver movimientos">
                            📜 Historial
                        </button>
                        <button type="button" class="btn-action-small" style="background:rgba(239,68,68,0.18); border:1px solid rgba(239,68,68,0.45); color:#EF4444;" onclick="eliminarClienteAdmin('${c.id}', '${escapeHtmlAdmin(c.nombre || '')}', '${escapeHtmlAdmin(c.telefono || '')}')" title="Eliminar cliente">
                            🗑️ Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

let adminClienteMap = null;
let adminClienteMarker = null;

window.abrirModalDetalleClienteAdmin = function (clienteId) {
    const cliente = (AdminState.clientes || []).find(c => c.id === clienteId);
    if (!cliente) return;

    document.getElementById('adm-det-nombre').textContent = cliente.nombre || 'Cliente';
    document.getElementById('adm-det-telefono').textContent = '+57 ' + (cliente.telefono || '');
    
    const wspLink = document.getElementById('adm-det-wsp-link');
    if (wspLink) {
        wspLink.href = 'https://wa.me/57' + (cliente.telefono || '') + '?text=' + encodeURIComponent('¡Hola ' + (cliente.nombre || '') + '! Te saludamos de Granifresh.');
    }

    document.getElementById('adm-det-puntos').textContent = (cliente.granipoints || 0).toLocaleString('es-CO') + ' pts';
    document.getElementById('adm-det-extras').textContent = (cliente.girosExtrasDisponibles || 0) + ' giros / ' + (cliente.raspasExtrasDisponibles || 0) + ' raspas';

    const fechaReg = cliente.fechaRegistro ? new Date(cliente.fechaRegistro).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Reciente';
    document.getElementById('adm-det-fecha').textContent = fechaReg;

    document.getElementById('adm-det-direccion').textContent = cliente.direccionPredeterminada || 'No registrada';
    document.getElementById('adm-det-barrio').textContent = cliente.barrioPredeterminado || 'No registrado';
    document.getElementById('adm-det-indicaciones').textContent = cliente.indicacionesPredeterminadas || 'Sin indicaciones registradas';

    // Coordenadas para el mapa (default Cartagena si no hay o son 0)
    const lat = (cliente.latitud !== null && cliente.latitud !== undefined && Number(cliente.latitud) !== 0) ? Number(cliente.latitud) : 10.4075;
    const lng = (cliente.longitud !== null && cliente.longitud !== undefined && Number(cliente.longitud) !== 0) ? Number(cliente.longitud) : -75.5255;

    const gmapsLink = document.getElementById('adm-det-gmaps-link');
    if (gmapsLink) {
        gmapsLink.href = 'https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng;
    }

    // Botones de acción rápida
    const btnAjustar = document.getElementById('adm-det-btn-ajustar');
    if (btnAjustar) {
        btnAjustar.onclick = function () {
            cerrarModales();
            abrirModalAjustarPuntosAdmin(cliente.id);
        };
    }
    const btnHistorial = document.getElementById('adm-det-btn-historial');
    if (btnHistorial) {
        btnHistorial.onclick = function () {
            cerrarModales();
            abrirModalHistorialClienteAdmin(cliente.id);
        };
    }
    const btnEliminar = document.getElementById('adm-det-btn-eliminar');
    if (btnEliminar) {
        btnEliminar.onclick = function () {
            eliminarClienteAdmin(cliente.id, cliente.nombre, cliente.telefono);
        };
    }

    const modal = document.getElementById('modal-admin-detalle-cliente');
    if (modal) modal.classList.add('active');

    // Inicializar o centrar mapa Leaflet con Google Maps tiles
    setTimeout(function () {
        const container = document.getElementById('admin-mapa-cliente');
        if (!container || typeof L === 'undefined') return;

        if (!adminClienteMap) {
            adminClienteMap = L.map('admin-mapa-cliente', {
                center: [lat, lng],
                zoom: 16,
                scrollWheelZoom: true
            });

            L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                attribution: 'Leaflet | &copy; Google Maps'
            }).addTo(adminClienteMap);

            adminClienteMarker = L.marker([lat, lng]).addTo(adminClienteMap);
        } else {
            adminClienteMap.setView([lat, lng], 16);
            adminClienteMarker.setLatLng([lat, lng]);
        }

        adminClienteMarker.bindPopup(
            '<div style="text-align:center; font-family:Outfit,sans-serif; padding:4px;">' +
            '<b style="color:#00B4D8; font-size:1rem;">👤 ' + escapeHtmlAdmin(cliente.nombre || 'Cliente') + '</b><br>' +
            '<span style="font-size:0.85rem; color:#222;">' + escapeHtmlAdmin(cliente.direccionPredeterminada || 'Cartagena') + '</span><br>' +
            '<small style="color:#059669; font-weight:700;">Barrio: ' + escapeHtmlAdmin(cliente.barrioPredeterminado || 'Centro') + '</small>' +
            '</div>'
        ).openPopup();

        adminClienteMap.invalidateSize();
    }, 250);
};

window.filtrarClientesAdmin = function () {
    const input = document.getElementById('admin-busqueda-clientes');
    const q = input ? input.value.trim().toLowerCase() : '';
    if (!q) {
        renderizarTablaClientes(AdminState.clientes);
        return;
    }
    const filtrados = (AdminState.clientes || []).filter(c => {
        const nom = (c.nombre || '').toLowerCase();
        const tel = (c.telefono || '').toLowerCase();
        const dir = (c.direccionPredeterminada || '').toLowerCase();
        const bar = (c.barrioPredeterminado || '').toLowerCase();
        return nom.includes(q) || tel.includes(q) || dir.includes(q) || bar.includes(q);
    });
    renderizarTablaClientes(filtrados);
};

window.abrirModalAjustarPuntosAdmin = function (clienteId) {
    const cliente = (AdminState.clientes || []).find(c => c.id === clienteId);
    if (!cliente) return;

    document.getElementById('adm-ajuste-cliente-id').value = cliente.id;
    document.getElementById('adm-ajuste-cliente-nombre').textContent = cliente.nombre || 'Cliente';
    document.getElementById('adm-ajuste-cliente-saldo').textContent = 'Saldo actual: ' + (cliente.granipoints || 0).toLocaleString('es-CO') + ' pts';
    document.getElementById('adm-ajuste-cantidad').value = '';
    document.getElementById('adm-ajuste-motivo').value = '';

    const modal = document.getElementById('modal-admin-ajustar-puntos');
    if (modal) modal.classList.add('active');
};

window.guardarAjustePuntosAdmin = async function (e) {
    e.preventDefault();
    const clienteId = document.getElementById('adm-ajuste-cliente-id').value;
    const operacion = document.getElementById('adm-ajuste-operacion').value;
    const cantVal = parseInt(document.getElementById('adm-ajuste-cantidad').value, 10);
    const motivo = document.getElementById('adm-ajuste-motivo').value.trim();

    if (isNaN(cantVal) || cantVal <= 0) {
        alert('Por favor ingresa una cantidad de puntos válida mayor a cero.');
        return;
    }

    const puntosFinales = operacion === 'RESTAR' ? -cantVal : cantVal;

    try {
        const res = await fetch(`/api/admin/clientes/${clienteId}/puntos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ puntos: puntosFinales, motivo: motivo })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            alert(errData.error || 'Error al ajustar los puntos.');
            return;
        }

        if (window.showToast) window.showToast('¡GraniPoints actualizados con éxito! 🌟', 'success');
        if (window.cerrarModales) window.cerrarModales();
        cargarClientesAdmin();

    } catch (err) {
        console.error('Error al guardar ajuste:', err);
        alert('Error de conexión al servidor.');
    }
};

window.abrirModalHistorialClienteAdmin = async function (clienteId) {
    const cliente = (AdminState.clientes || []).find(c => c.id === clienteId);
    const nom = cliente ? cliente.nombre : 'Cliente';
    document.getElementById('adm-historial-cliente-nombre').textContent = nom;

    const tbody = document.getElementById('tabla-admin-historial-body');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--mut);">Cargando historial de movimientos...</td></tr>';

    const modal = document.getElementById('modal-admin-historial-puntos');
    if (modal) modal.classList.add('active');

    try {
        const res = await fetch(`/api/admin/clientes/${clienteId}/historial`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const transacciones = await res.json();

        if (!transacciones || transacciones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--mut);">Este cliente no registra movimientos de puntos aún.</td></tr>';
            return;
        }

        tbody.innerHTML = transacciones.map(t => {
            const fechaStr = t.fecha ? new Date(t.fecha).toLocaleString('es-CO') : '-';
            const esPositivo = t.puntos >= 0;
            const ptsColor = esPositivo ? '#10B981' : '#EF4444';
            const ptsSigno = esPositivo ? '+' : '';

            return `
                <tr>
                    <td><small style="color:var(--mut);">${fechaStr}</small></td>
                    <td><span style="font-weight:700; color:#FFF;">${escapeHtmlAdmin(t.tipo || '')}</span></td>
                    <td><b style="color:${ptsColor}; font-size:0.95rem;">${ptsSigno}${t.puntos}</b></td>
                    <td><span class="admin-badge-granipoints">${(t.saldoPosterior || 0).toLocaleString('es-CO')} pts</span></td>
                    <td><span style="font-size:0.82rem; color:#CBD5E1;">${escapeHtmlAdmin(t.motivo || '')}</span></td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error('Error al cargar historial:', err);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#EF4444;">Error al cargar historial.</td></tr>';
    }
};

window.eliminarClienteAdmin = async function (clienteId, nombre, telefono) {
    const ident = nombre ? `"${nombre}" (${telefono ? '+57 ' + telefono : ''})` : `con ID ${clienteId}`;
    if (!confirm(`⚠️ ¿Estás COMPLETAMENTE SEGURO de eliminar la cuenta del cliente ${ident}?\n\nEsta acción borrará definitivamente al usuario y todo su saldo e historial de GraniPoints de la base de datos de forma irreversible.`)) {
        return;
    }

    try {
        const res = await fetch(`/api/admin/clientes/${clienteId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok) {
            if (window.showToast) window.showToast('✅ Cuenta de cliente eliminada con éxito', 'success');
            if (window.cerrarModales) window.cerrarModales();
            await cargarClientesAdmin();
        } else {
            alert('Error al eliminar cliente: ' + (data.error || 'No se pudo completar la operación.'));
        }
    } catch (err) {
        console.error('Error al eliminar cliente:', err);
        alert('Error de conexión con el servidor al intentar eliminar cliente.');
    }
};

// ==========================================================
// 8. CONTROL MAESTRO DE DINÁMICAS (RULETA & RASPA Y GANA)
// ==========================================================
async function cargarConfigJuegosAdmin() {
    try {
        const res = await fetch('/api/admin/juegos/config', { headers: getAuthHeaders() });
        if (!res.ok) return;
        const cfg = await res.json();
        AdminState.configJuegos = cfg;

        // Llenar switches generales
        const chkRul = document.getElementById('cfg-ruleta-activa');
        if (chkRul) chkRul.checked = !!cfg.ruletaActiva;

        const chkRas = document.getElementById('cfg-raspa-activo');
        if (chkRas) chkRas.checked = !!cfg.raspaActivo;

        const chkComp = document.getElementById('cfg-puntos-por-compra');
        if (chkComp) chkComp.checked = !!cfg.acumularPuntosPorCompra;

        const chkGiroComp = document.getElementById('cfg-giros-por-compra');
        if (chkGiroComp) chkGiroComp.checked = !!cfg.otorgarGirosPorCompra;

        // Modalidad de asignación al comprar
        const elModo = document.getElementById('cfg-modo-puntos-compra');
        if (elModo) {
            elModo.value = cfg.modoPuntosCompra || 'POR_VALOR';
            elModo.onchange = function() {
                toggleModoPuntosCompraUI();
                actualizarLiveHelpAdmin();
            };
            toggleModoPuntosCompraUI();
        }
        const elPesosPto = document.getElementById('cfg-pesos-por-punto');
        if (elPesosPto) elPesosPto.value = cfg.pesosPorPuntoAcumulado || 1000;

        const elPtsFijos = document.getElementById('cfg-puntos-fijos-compra');
        if (elPtsFijos) elPtsFijos.value = cfg.puntosFijosPorCompra || 15;

        // Canje por Descuento en Dinero
        const elCanjeDesc = document.getElementById('cfg-canje-descuento-habilitado');
        if (elCanjeDesc) elCanjeDesc.checked = cfg.canjePuntosHabilitado !== undefined ? !!cfg.canjePuntosHabilitado : true;

        const elValCanje = document.getElementById('cfg-valor-peso-punto');
        if (elValCanje) elValCanje.value = (cfg.valorPesosPorPunto && cfg.valorPesosPorPunto > 0) ? cfg.valorPesosPorPunto : 20;

        const elMinCanje = document.getElementById('cfg-puntos-minimos-canje');
        if (elMinCanje) elMinCanje.value = cfg.puntosMinimosCanje || 50;

        const elMaxDesc = document.getElementById('cfg-max-porcentaje-descuento');
        if (elMaxDesc) elMaxDesc.value = cfg.maximoPorcentajeDescuentoPedido || 50;

        // Canje por Granizado Gratis
        const elCanjeGran = document.getElementById('cfg-canje-granizado-habilitado');
        if (elCanjeGran) elCanjeGran.checked = !!cfg.canjePorGranizadoHabilitado;

        const elPtsGran = document.getElementById('cfg-puntos-para-granizado');
        if (elPtsGran) elPtsGran.value = cfg.puntosParaGranizadoGratis || 120;

        // Intentos, frecuencia y bienvenida
        const elBienv = document.getElementById('cfg-puntos-bienvenida');
        if (elBienv) elBienv.value = cfg.puntosBienvenidaRegistro !== undefined ? cfg.puntosBienvenidaRegistro : 20;

        const elIntervalo = document.getElementById('cfg-dias-intervalo-intentos');
        if (elIntervalo) elIntervalo.value = cfg.diasIntervaloIntentos !== undefined ? cfg.diasIntervaloIntentos : 1;

        const elIntGratis = document.getElementById('cfg-intentos-gratis-diarios');
        if (elIntGratis) elIntGratis.value = cfg.intentosGratisRuletaDiarios !== undefined ? cfg.intentosGratisRuletaDiarios : 1;

        const elIntRaspa = document.getElementById('cfg-intentos-gratis-raspa');
        if (elIntRaspa) elIntRaspa.value = cfg.intentosGratisRaspaDiarios !== undefined ? cfg.intentosGratisRaspaDiarios : 1;

        // Actualizar explicaciones interactivas
        actualizarLiveHelpAdmin();

        // Renderizar Tablas de Premios
        renderizarTablaPremiosRuletaAdmin(cfg.premiosRuleta || []);
        renderizarTablaPremiosRaspaAdmin(cfg.premiosRaspa || []);

    } catch (err) {
        console.error('Error al cargar config juegos:', err);
    }
}

window.actualizarLiveHelpAdmin = function () {
    // 1. Bienvenida e Intentos
    const ptsBienv = parseInt(document.getElementById('cfg-puntos-bienvenida')?.value, 10) || 0;
    const intervalo = parseInt(document.getElementById('cfg-dias-intervalo-intentos')?.value, 10) || 1;
    const intRul = parseInt(document.getElementById('cfg-intentos-gratis-diarios')?.value, 10) || 0;
    const intRas = parseInt(document.getElementById('cfg-intentos-gratis-raspa')?.value, 10) || 0;
    const txtFrecuencia = intervalo === 1 ? 'cada 24 horas (diario)' : ('cada ' + intervalo + ' días');

    const elHelpBienv = document.getElementById('live-help-bienvenida');
    if (elHelpBienv) {
        elHelpBienv.innerHTML = `
            <strong>💡 Vista en vivo para el administrador:</strong><br>
            • Cada nuevo cliente recibirá automáticamente <b style="color:#FFD166;">+${ptsBienv} GraniPoints</b> de regalo al registrarse. Este valor se actualiza en vivo en el anuncio emergente y botones de la tienda.<br>
            • <b>Frecuencia configurada:</b> <b style="color:#38BDF8;">${txtFrecuencia}</b>. El anuncio del Hero y los textos del GraniClub se actualizan automáticamente.<br>
            • Cada cliente tendrá <b style="color:#34D399;">${intRul} tiro(s) gratis</b> de ruleta y <b style="color:#34D399;">${intRas} raspa(s) gratis</b> ${intervalo === 1 ? 'cada día' : ('cada ' + intervalo + ' días')}.
        `;
    }

    // 2. Acumulación por compra
    const modo = document.getElementById('cfg-modo-puntos-compra')?.value || 'POR_VALOR';
    const pesosPto = parseInt(document.getElementById('cfg-pesos-por-punto')?.value, 10) || 1000;
    const ptsFijos = parseInt(document.getElementById('cfg-puntos-fijos-compra')?.value, 10) || 15;
    const elHelpComp = document.getElementById('live-help-compra');
    if (elHelpComp) {
        if (modo === 'POR_VALOR') {
            const ejPts = Math.floor(25000 / (pesosPto || 1));
            elHelpComp.innerHTML = `
                <strong>💡 Modo Proporcional activo:</strong><br>
                El cliente gana 1 punto por cada <b style="color:#34D399;">$${pesosPto.toLocaleString('es-CO')} COP</b> gastados.<br>
                <em>Ejemplo en vivo:</em> En un pedido de <b>$25.000 COP</b>, el cliente recibirá automáticamente <b style="color:#FFD166;">${ejPts} GraniPoints</b>.
            `;
        } else {
            elHelpComp.innerHTML = `
                <strong>💡 Modo Puntos Fijos activo:</strong><br>
                Sin importar el monto de la orden (sea $12.000 o $50.000), el cliente recibirá exactamente <b style="color:#34D399;">${ptsFijos} GraniPoints</b> fijos al terminar su compra.
            `;
        }
    }

    // 3. Canjes y beneficios
    const canjeDesc = document.getElementById('cfg-canje-descuento-habilitado')?.checked ?? true;
    const valPeso = parseFloat(document.getElementById('cfg-valor-peso-punto')?.value) || 20;
    const minCanje = parseInt(document.getElementById('cfg-puntos-minimos-canje')?.value, 10) || 50;
    const maxPorc = parseInt(document.getElementById('cfg-max-porcentaje-descuento')?.value, 10) || 50;
    const canjeGran = document.getElementById('cfg-canje-granizado-habilitado')?.checked ?? false;
    const ptsGran = parseInt(document.getElementById('cfg-puntos-para-granizado')?.value, 10) || 120;
    const elHelpCanje = document.getElementById('live-help-canje');
    if (elHelpCanje) {
        let txt = `<strong>💡 Resumen en vivo de beneficios para el cliente:</strong><br>`;
        if (canjeDesc) {
            const ejDesc100 = 100 * valPeso;
            const ejMaxDesc = (30000 * maxPorc) / 100;
            txt += `• <b>Descuento en Dinero:</b> Cada punto descuenta <b style="color:#FFD166;">$${valPeso} COP</b> (100 puntos = <b>-$${ejDesc100.toLocaleString('es-CO')} COP</b>). Requiere mínimo <b>${minCanje} puntos</b> para canjear y puede cubrir hasta el <b>${maxPorc}%</b> de la orden (en un pedido de $30.000 COP descuenta máx <b>$${ejMaxDesc.toLocaleString('es-CO')} COP</b>).<br>`;
        } else {
            txt += `• <b>Descuento en Dinero:</b> Desactivado.<br>`;
        }
        if (canjeGran) {
            txt += `• <b>Granizado Gratis:</b> Activo. El cliente puede canjear 1 Granizado gratis en checkout si tiene <b style="color:#34D399;">${ptsGran} GraniPoints</b>.`;
        } else {
            txt += `• <b>Granizado Gratis:</b> Desactivado.`;
        }
        elHelpCanje.innerHTML = txt;
    }
};

function toggleModoPuntosCompraUI() {
    const modo = document.getElementById('cfg-modo-puntos-compra') ? document.getElementById('cfg-modo-puntos-compra').value : 'POR_VALOR';
    const grpPesos = document.getElementById('grp-pesos-por-punto');
    const grpFijos = document.getElementById('grp-puntos-fijos-compra');
    if (grpPesos && grpFijos) {
        if (modo === 'FIJO') {
            grpPesos.style.display = 'none';
            grpFijos.style.display = 'block';
        } else {
            grpPesos.style.display = 'block';
            grpFijos.style.display = 'none';
        }
    }
}

function renderizarTablaPremiosRuletaAdmin(premios) {
    const tbody = document.getElementById('tabla-admin-premios-ruleta');
    if (!tbody) return;

    tbody.innerHTML = (premios || []).map((p, idx) => `
        <tr data-idx="${idx}">
            <td><input type="text" class="form-control inp-rul-titulo" value="${escapeHtmlAdmin(p.titulo || '')}" style="font-size:0.85rem;" required></td>
            <td><input type="text" class="form-control inp-rul-sub" value="${escapeHtmlAdmin(p.subtitulo || '')}" style="font-size:0.85rem;"></td>
            <td>
                <select class="form-control inp-rul-tipo" style="font-size:0.85rem;">
                    <option value="PUNTOS" ${p.tipo === 'PUNTOS' ? 'selected' : ''}>Puntos Directos</option>
                    <option value="GRANIZADO_GRATIS" ${p.tipo === 'GRANIZADO_GRATIS' ? 'selected' : ''}>Granizado Gratis</option>
                    <option value="VACIO" ${p.tipo === 'VACIO' ? 'selected' : ''}>Sin Premio (Vacio)</option>
                </select>
            </td>
            <td><input type="number" class="form-control inp-rul-puntos" value="${p.puntos || 0}" min="0" step="5" style="width:80px; font-size:0.85rem;" required></td>
            <td><input type="color" class="form-control inp-rul-color" value="${p.color || '#FFB703'}" style="width:60px; height:36px; padding:2px; cursor:pointer;"></td>
            <td><input type="number" class="form-control inp-rul-peso" value="${p.pesoProbabilidad || 10}" min="1" step="1" style="width:75px; font-size:0.85rem;" title="Mayor peso = mayor probabilidad"></td>
            <td style="text-align:center;">
                <button type="button" class="btn-action-small" onclick="quitarSectorRuletaAdmin(${idx})" style="background:rgba(239,68,68,0.2); color:#FCA5A5;">✕</button>
            </td>
        </tr>
    `).join('');
}

function renderizarTablaPremiosRaspaAdmin(premios) {
    const tbody = document.getElementById('tabla-admin-premios-raspa');
    if (!tbody) return;

    tbody.innerHTML = (premios || []).map((p, idx) => `
        <tr data-idx="${idx}">
            <td><input type="text" class="form-control inp-ras-titulo" value="${escapeHtmlAdmin(p.titulo || '')}" style="font-size:0.85rem;" required></td>
            <td><input type="text" class="form-control inp-ras-sub" value="${escapeHtmlAdmin(p.subtitulo || '')}" style="font-size:0.85rem;"></td>
            <td><input type="text" class="form-control inp-ras-icono" value="${escapeHtmlAdmin(p.icono || '🍓')}" style="width:60px; font-size:1.1rem; text-align:center;" required></td>
            <td><input type="number" class="form-control inp-ras-puntos" value="${p.puntos || 0}" min="0" step="5" style="width:85px; font-size:0.85rem;" required></td>
            <td><input type="number" class="form-control inp-ras-peso" value="${p.pesoProbabilidad || 10}" min="1" step="1" style="width:80px; font-size:0.85rem;" title="Mayor peso = mayor probabilidad"></td>
            <td style="text-align:center;">
                <button type="button" class="btn-action-small" onclick="quitarPremioRaspaAdmin(${idx})" style="background:rgba(239,68,68,0.2); color:#FCA5A5;">✕</button>
            </td>
        </tr>
    `).join('');
}

window.agregarSectorRuletaAdmin = function () {
    if (!AdminState.configJuegos) AdminState.configJuegos = { premiosRuleta: [] };
    if (!AdminState.configJuegos.premiosRuleta) AdminState.configJuegos.premiosRuleta = [];

    AdminState.configJuegos.premiosRuleta.push({
        id: 'rul-' + (Date.now() % 10000),
        titulo: '+20 GraniPoints',
        subtitulo: '¡Suma puntos!',
        tipo: 'PUNTOS',
        puntos: 20,
        color: '#10B981',
        icono: '❄️',
        pesoProbabilidad: 20
    });
    renderizarTablaPremiosRuletaAdmin(AdminState.configJuegos.premiosRuleta);
};

window.quitarSectorRuletaAdmin = function (idx) {
    if (!AdminState.configJuegos || !AdminState.configJuegos.premiosRuleta) return;
    if (AdminState.configJuegos.premiosRuleta.length <= 3) {
        alert('La ruleta debe tener al menos 3 sectores.');
        return;
    }
    AdminState.configJuegos.premiosRuleta.splice(idx, 1);
    renderizarTablaPremiosRuletaAdmin(AdminState.configJuegos.premiosRuleta);
};

window.agregarPremioRaspaAdmin = function () {
    if (!AdminState.configJuegos) AdminState.configJuegos = { premiosRaspa: [] };
    if (!AdminState.configJuegos.premiosRaspa) AdminState.configJuegos.premiosRaspa = [];

    AdminState.configJuegos.premiosRaspa.push({
        id: 'ras-' + (Date.now() % 10000),
        titulo: '+25 GraniPoints',
        subtitulo: '¡Fruta Glacial!',
        tipo: 'PUNTOS',
        puntos: 25,
        icono: '🍉',
        pesoProbabilidad: 20
    });
    renderizarTablaPremiosRaspaAdmin(AdminState.configJuegos.premiosRaspa);
};

window.quitarPremioRaspaAdmin = function (idx) {
    if (!AdminState.configJuegos || !AdminState.configJuegos.premiosRaspa) return;
    if (AdminState.configJuegos.premiosRaspa.length <= 2) {
        alert('Debe haber al menos 2 premios configurados para Raspa y Gana.');
        return;
    }
    AdminState.configJuegos.premiosRaspa.splice(idx, 1);
    renderizarTablaPremiosRaspaAdmin(AdminState.configJuegos.premiosRaspa);
};

window.guardarConfigJuegosAdmin = async function (e) {
    if (e) e.preventDefault();

    // Extraer sectores de la ruleta desde la tabla
    const filasRuleta = document.querySelectorAll('#tabla-admin-premios-ruleta tr');
    const nuevosSectores = [];
    filasRuleta.forEach((row, i) => {
        const tit = row.querySelector('.inp-rul-titulo').value.trim();
        const sub = row.querySelector('.inp-rul-sub').value.trim();
        const tipo = row.querySelector('.inp-rul-tipo').value;
        const pts = parseInt(row.querySelector('.inp-rul-puntos').value, 10) || 0;
        const col = row.querySelector('.inp-rul-color').value;
        const peso = parseInt(row.querySelector('.inp-rul-peso').value, 10) || 10;
        nuevosSectores.push({
            id: 'rul-' + (i + 1),
            titulo: tit,
            subtitulo: sub,
            tipo: tipo,
            puntos: pts,
            color: col,
            icono: '❄️',
            pesoProbabilidad: peso
        });
    });

    // Extraer premios de raspa desde la tabla
    const filasRaspa = document.querySelectorAll('#tabla-admin-premios-raspa tr');
    const nuevosPremiosRaspa = [];
    filasRaspa.forEach((row, i) => {
        const tit = row.querySelector('.inp-ras-titulo').value.trim();
        const sub = row.querySelector('.inp-ras-sub').value.trim();
        const ico = row.querySelector('.inp-ras-icono').value.trim() || '🍓';
        const pts = parseInt(row.querySelector('.inp-ras-puntos').value, 10) || 0;
        const peso = parseInt(row.querySelector('.inp-ras-peso').value, 10) || 10;
        nuevosPremiosRaspa.push({
            id: 'ras-' + (i + 1),
            titulo: tit,
            subtitulo: sub,
            tipo: pts > 0 ? 'PUNTOS' : 'VACIO',
            puntos: pts,
            color: '#10B981',
            icono: ico,
            pesoProbabilidad: peso
        });
    });

    const payload = {
        ruletaActiva: document.getElementById('cfg-ruleta-activa')?.checked ?? true,
        raspaActivo: document.getElementById('cfg-raspa-activo')?.checked ?? true,
        acumularPuntosPorCompra: document.getElementById('cfg-puntos-por-compra')?.checked ?? true,
        otorgarGirosPorCompra: document.getElementById('cfg-giros-por-compra')?.checked ?? true,
        modoPuntosCompra: document.getElementById('cfg-modo-puntos-compra')?.value || 'POR_VALOR',
        pesosPorPuntoAcumulado: parseInt(document.getElementById('cfg-pesos-por-punto')?.value, 10) || 1000,
        puntosFijosPorCompra: parseInt(document.getElementById('cfg-puntos-fijos-compra')?.value, 10) || 15,
        canjePuntosHabilitado: document.getElementById('cfg-canje-descuento-habilitado')?.checked ?? true,
        valorPesosPorPunto: parseFloat(document.getElementById('cfg-valor-peso-punto')?.value) || 20,
        puntosMinimosCanje: parseInt(document.getElementById('cfg-puntos-minimos-canje')?.value, 10) || 50,
        maximoPorcentajeDescuentoPedido: parseInt(document.getElementById('cfg-max-porcentaje-descuento')?.value, 10) || 50,
        canjePorGranizadoHabilitado: document.getElementById('cfg-canje-granizado-habilitado')?.checked ?? false,
        puntosParaGranizadoGratis: parseInt(document.getElementById('cfg-puntos-para-granizado')?.value, 10) || 120,
        puntosBienvenidaRegistro: !isNaN(parseInt(document.getElementById('cfg-puntos-bienvenida')?.value, 10)) ? parseInt(document.getElementById('cfg-puntos-bienvenida')?.value, 10) : 20,
        intentosGratisRuletaDiarios: parseInt(document.getElementById('cfg-intentos-gratis-diarios')?.value, 10) || 1,
        intentosGratisRaspaDiarios: parseInt(document.getElementById('cfg-intentos-gratis-raspa')?.value, 10) || 1,
        diasIntervaloIntentos: parseInt(document.getElementById('cfg-dias-intervalo-intentos')?.value, 10) || 1,
        premiosRuleta: nuevosSectores,
        premiosRaspa: nuevosPremiosRaspa
    };

    try {
        const res = await fetch('/api/admin/juegos/config', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            alert('Error al guardar configuración de juegos.');
            return;
        }

        const guardado = await res.json();
        AdminState.configJuegos = guardado;
        if (window.showToast) window.showToast('¡Configuración de GraniPoints y Dinámicas guardada! 🎮', 'success');

    } catch (err) {
        console.error('Error al guardar config juegos:', err);
        alert('Error al comunicarse con el servidor.');
    }
};

function escapeHtmlAdmin(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
