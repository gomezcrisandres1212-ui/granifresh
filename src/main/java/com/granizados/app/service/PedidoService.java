package com.granizados.app.service;

import com.granizados.app.model.Cliente;
import com.granizados.app.model.ConfiguracionJuegos;
import com.granizados.app.model.ConfiguracionNegocio;
import com.granizados.app.model.Granizado;
import com.granizados.app.model.ItemPedido;
import com.granizados.app.model.Pedido;
import com.granizados.app.model.TransaccionPuntos;
import com.granizados.app.repository.ClienteRepository;
import com.granizados.app.repository.ConfiguracionJuegosRepository;
import com.granizados.app.repository.ConfiguracionNegocioRepository;
import com.granizados.app.repository.GranizadoRepository;
import com.granizados.app.repository.PedidoRepository;
import com.granizados.app.repository.TransaccionPuntosRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ConfiguracionNegocioRepository configRepository;
    private final ClienteRepository clienteRepository;
    private final ConfiguracionJuegosRepository configJuegosRepository;
    private final TransaccionPuntosRepository transaccionRepository;
    private final GranizadoRepository granizadoRepository;
    private final SecureRandom random = new SecureRandom();

    public PedidoService(PedidoRepository pedidoRepository,
                         ConfiguracionNegocioRepository configRepository,
                         ClienteRepository clienteRepository,
                         ConfiguracionJuegosRepository configJuegosRepository,
                         TransaccionPuntosRepository transaccionRepository,
                         GranizadoRepository granizadoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.configRepository = configRepository;
        this.clienteRepository = clienteRepository;
        this.configJuegosRepository = configJuegosRepository;
        this.transaccionRepository = transaccionRepository;
        this.granizadoRepository = granizadoRepository;
    }

    public Pedido crearPedido(Pedido pedido) {
        // Generar código único no repetido
        String codigo;
        do {
            int num = 10000 + random.nextInt(90000);
            codigo = "GRZ-" + num;
        } while (pedidoRepository.findByCodigoPedido(codigo).isPresent());

        pedido.setCodigoPedido(codigo);
        pedido.setEstado("PENDIENTE_VALIDACION");
        pedido.setFechaCreacion(new Date());
        pedido.setFechaActualizacion(new Date());
        pedido.setTiempoEstimadoMinutos(35);

        // Recalcular subtotal con precios oficiales desde la base de datos (Blindaje contra manipulación de precios)
        double subtotal = 0.0;
        if (pedido.getItems() != null) {
            for (ItemPedido item : pedido.getItems()) {
                if (item != null) {
                    double precioReal = item.getPrecioUnitario();
                    if (item.getGranizadoId() != null && !item.getGranizadoId().isBlank()) {
                        Optional<Granizado> granOpt = granizadoRepository.findById(item.getGranizadoId());
                        if (granOpt.isPresent()) {
                            Granizado g = granOpt.get();
                            precioReal = g.getPrecioBase();
                            if (g.getPreciosPorTamano() != null && item.getTamano() != null && g.getPreciosPorTamano().containsKey(item.getTamano())) {
                                Double pTam = g.getPreciosPorTamano().get(item.getTamano());
                                if (pTam != null && pTam > 0) {
                                    precioReal = pTam;
                                }
                            }
                            item.setGranizadoNombre(g.getNombre());
                        }
                    }
                    int cant = Math.max(1, Math.min(item.getCantidad(), 100));
                    item.setCantidad(cant);
                    item.setPrecioUnitario(precioReal);

                    double costoToppings = Math.max(0.0, item.getCostoToppings());
                    item.setCostoToppings(costoToppings);

                    double itemSubtotal = (precioReal + costoToppings) * cant;
                    item.setSubtotal(itemSubtotal);
                    subtotal += itemSubtotal;
                }
            }
        }
        pedido.setSubtotal(subtotal);

        // Determinar si es recogida en el local o domicilio express
        boolean esRecogida = "RECOGIDA".equalsIgnoreCase(pedido.getTipoEntrega())
                || (pedido.getCostoEnvio() == 0.0 && (pedido.getTipoEntrega() == null || !pedido.getTipoEntrega().equalsIgnoreCase("DOMICILIO")))
                || (pedido.getBarrio() != null && pedido.getBarrio().toUpperCase().contains("RECOGIDA"))
                || (pedido.getClienteDireccion() != null && pedido.getClienteDireccion().toUpperCase().contains("RECOGIDA"))
                || (pedido.getIndicaciones() != null && pedido.getIndicaciones().toUpperCase().contains("RECOGIDA"));

        double costoEnvio = 0.0;
        if (esRecogida) {
            pedido.setTipoEntrega("RECOGIDA");
            costoEnvio = 0.0;
        } else {
            pedido.setTipoEntrega("DOMICILIO");
            costoEnvio = 5000.0;
            Optional<ConfiguracionNegocio> configOpt = configRepository.findFirstByOrderByIdAsc();
            if (configOpt.isPresent()) {
                costoEnvio = configOpt.get().getCostoEnvioBase();
            }
        }

        pedido.setCostoEnvio(costoEnvio);

        // Manejo de GraniPoints para clientes registrados
        double descuentoPuntos = 0.0;
        int puntosUsados = Math.max(0, pedido.getPuntosUsados());
        int puntosGanados = 0;

        ConfiguracionJuegos configJuegos = configJuegosRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> configJuegosRepository.save(new ConfiguracionJuegos()));

        Optional<Cliente> clienteOpt = Optional.empty();
        if (pedido.getClienteId() != null && !pedido.getClienteId().isBlank()) {
            clienteOpt = clienteRepository.findById(pedido.getClienteId());
        } else if (pedido.getClienteTelefono() != null) {
            String telLimpio = pedido.getClienteTelefono().replaceAll("[^0-9]", "").trim();
            clienteOpt = clienteRepository.findByTelefono(telLimpio);
        }

        // Blindaje contra consumo no autorizado de puntos ajenos:
        // Si se intenta usar puntos, verificar que la petición provenga de una sesión autenticada con dicho teléfono
        if (puntosUsados > 0) {
            boolean autenticado = false;
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String usuarioAuth = auth.getName();
                boolean esAdmin = auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
                if (esAdmin) {
                    autenticado = true;
                } else if (clienteOpt.isPresent()) {
                    Cliente cl = clienteOpt.get();
                    if (usuarioAuth != null && (usuarioAuth.equals(cl.getTelefono()) || usuarioAuth.equals(cl.getId()))) {
                        autenticado = true;
                    }
                }
            }

            if (!autenticado) {
                puntosUsados = 0;
                descuentoPuntos = 0.0;
                pedido.setTipoCanje(null);
            }
        }

        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            pedido.setClienteId(cliente.getId());

            // 1. Canje de puntos: o 1 Granizado Gratis o Descuento en Dinero
            int ptsGranizadoGratis = configJuegos.getPuntosParaGranizadoGratis() > 0 ? configJuegos.getPuntosParaGranizadoGratis() : 120;
            boolean esCanjeGranizadoGratis = "GRANIZADO_GRATIS".equalsIgnoreCase(pedido.getTipoCanje())
                    || (configJuegos.isCanjePorGranizadoHabilitado() && puntosUsados == ptsGranizadoGratis && pedido.getDescuentoPuntos() > (puntosUsados * configJuegos.getValorPesosPorPunto()));

            if (puntosUsados > 0 && cliente.getGranipoints() >= puntosUsados) {
                if (esCanjeGranizadoGratis && configJuegos.isCanjePorGranizadoHabilitado()) {
                    // El canje de 1 Granizado Gratis descuenta el 100% del valor de 1 granizado sin tope de porcentaje
                    double precioPrimerGranizado = subtotal;
                    if (pedido.getItems() != null && !pedido.getItems().isEmpty()) {
                        precioPrimerGranizado = pedido.getItems().get(0).getPrecioUnitario();
                    }
                    descuentoPuntos = Math.min(subtotal, precioPrimerGranizado);
                    cliente.setGranipoints(cliente.getGranipoints() - puntosUsados);

                    TransaccionPuntos transGasto = new TransaccionPuntos(
                            cliente.getId(),
                            cliente.getTelefono(),
                            cliente.getNombre(),
                            "CANJE_GRANIZADO_GRATIS",
                            -puntosUsados,
                            cliente.getGranipoints(),
                            "🥤 Canje de 1 Granizado 100% Gratis por " + puntosUsados + " GraniPoints en pedido " + codigo,
                            codigo
                    );
                    transaccionRepository.save(transGasto);
                    pedido.setTipoCanje("GRANIZADO_GRATIS");

                } else if (configJuegos.isCanjePuntosHabilitado()) {
                    // Canje tradicional por dinero COP (con límite de porcentaje configurable)
                    double valCalculado = puntosUsados * configJuegos.getValorPesosPorPunto();
                    double maxPorcentaje = configJuegos.getMaximoPorcentajeDescuentoPedido() > 0 ? configJuegos.getMaximoPorcentajeDescuentoPedido() : 50;
                    double maxDescuento = subtotal * (maxPorcentaje / 100.0);
                    descuentoPuntos = Math.min(valCalculado, maxDescuento);

                    cliente.setGranipoints(cliente.getGranipoints() - puntosUsados);

                    TransaccionPuntos transGasto = new TransaccionPuntos(
                            cliente.getId(),
                            cliente.getTelefono(),
                            cliente.getNombre(),
                            "CANJE_CHECKOUT",
                            -puntosUsados,
                            cliente.getGranipoints(),
                            "🛒 Canje de " + puntosUsados + " GraniPoints por descuento de $" + String.format("%.0f", descuentoPuntos) + " en pedido " + codigo,
                            codigo
                    );
                    transaccionRepository.save(transGasto);
                    pedido.setTipoCanje("DESCUENTO_DINERO");
                } else {
                    puntosUsados = 0;
                    descuentoPuntos = 0.0;
                }
            } else {
                puntosUsados = 0;
                descuentoPuntos = 0.0;
            }

            // 2. Acumulación por compra (según decida el admin: por valor o puntos fijos)
            double baseParaPuntos = Math.max(0, subtotal - descuentoPuntos);
            if (configJuegos.isAcumularPuntosPorCompra() && baseParaPuntos > 0) {
                if ("FIJO".equalsIgnoreCase(configJuegos.getModoPuntosCompra())) {
                    puntosGanados = Math.max(0, configJuegos.getPuntosFijosPorCompra());
                } else if (configJuegos.getPesosPorPuntoAcumulado() > 0) {
                    puntosGanados = (int) (baseParaPuntos / configJuegos.getPesosPorPuntoAcumulado());
                }

                if (puntosGanados > 0) {
                    cliente.setGranipoints(cliente.getGranipoints() + puntosGanados);

                    TransaccionPuntos transGanancia = new TransaccionPuntos(
                            cliente.getId(),
                            cliente.getTelefono(),
                            cliente.getNombre(),
                            "COMPRA",
                            puntosGanados,
                            cliente.getGranipoints(),
                            "🥤 +" + puntosGanados + " GraniPoints ganados por tu compra en orden " + codigo,
                            codigo
                    );
                    transaccionRepository.save(transGanancia);
                }
            }

            // 3. Giros extras por compra
            if (configJuegos.isOtorgarGirosPorCompra() && baseParaPuntos > 0) {
                cliente.setGirosExtrasDisponibles(cliente.getGirosExtrasDisponibles() + 1);
                cliente.setRaspasExtrasDisponibles(cliente.getRaspasExtrasDisponibles() + 1);
            }

            clienteRepository.save(cliente);
        } else {
            puntosUsados = 0;
            descuentoPuntos = 0.0;
        }

        pedido.setPuntosUsados(puntosUsados);
        pedido.setDescuentoPuntos(descuentoPuntos);
        pedido.setPuntosGanados(puntosGanados);

        double totalFinal = Math.max(0, (subtotal - descuentoPuntos) + costoEnvio);
        pedido.setTotal(totalFinal);

        // Si el total final es 0 COP por canje de puntos, el método de pago oficial es GRANIPOINTS
        if (totalFinal == 0 && puntosUsados > 0) {
            pedido.setMetodoPago("GRANIPOINTS");
        }

        return pedidoRepository.save(pedido);
    }

    public Optional<Pedido> buscarPorCodigo(String codigoPedido) {
        if (codigoPedido == null) return Optional.empty();
        return pedidoRepository.findByCodigoPedido(codigoPedido.trim().toUpperCase());
    }

    public List<Pedido> listarTodos() {
        return pedidoRepository.findAllByOrderByFechaCreacionDesc();
    }

    public List<Pedido> listarPorEstado(String estado) {
        return pedidoRepository.findByEstadoOrderByFechaCreacionDesc(estado);
    }

    public Optional<Pedido> actualizarEstado(String id, String nuevoEstado, String notasAdmin) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setEstado(nuevoEstado);
            pedido.setFechaActualizacion(new Date());
            if (notasAdmin != null && !notasAdmin.isBlank()) {
                pedido.setNotasAdmin(notasAdmin);
            }
            return pedidoRepository.save(pedido);
        });
    }

    public boolean eliminarPedido(String id) {
        if (pedidoRepository.existsById(id)) {
            pedidoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

