package com.granizados.app.service;

import com.granizados.app.model.Cliente;
import com.granizados.app.model.ConfiguracionJuegos;
import com.granizados.app.model.ConfiguracionNegocio;
import com.granizados.app.model.ItemPedido;
import com.granizados.app.model.Pedido;
import com.granizados.app.model.TransaccionPuntos;
import com.granizados.app.repository.ClienteRepository;
import com.granizados.app.repository.ConfiguracionJuegosRepository;
import com.granizados.app.repository.ConfiguracionNegocioRepository;
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
    private final SecureRandom random = new SecureRandom();

    public PedidoService(PedidoRepository pedidoRepository,
                         ConfiguracionNegocioRepository configRepository,
                         ClienteRepository clienteRepository,
                         ConfiguracionJuegosRepository configJuegosRepository,
                         TransaccionPuntosRepository transaccionRepository) {
        this.pedidoRepository = pedidoRepository;
        this.configRepository = configRepository;
        this.clienteRepository = clienteRepository;
        this.configJuegosRepository = configJuegosRepository;
        this.transaccionRepository = transaccionRepository;
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

        // Recalcular subtotal
        double subtotal = 0.0;
        if (pedido.getItems() != null) {
            for (ItemPedido item : pedido.getItems()) {
                if (item != null) {
                    double itemSubtotal = (item.getPrecioUnitario() + item.getCostoToppings()) * Math.max(item.getCantidad(), 1);
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

        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            pedido.setClienteId(cliente.getId());

            // 1. Canje de puntos
            if (configJuegos.isCanjePuntosHabilitado() && puntosUsados >= configJuegos.getPuntosMinimosCanje() && cliente.getGranipoints() >= puntosUsados) {
                double valCalculado = puntosUsados * configJuegos.getValorPesosPorPunto();
                double maxDescuento = subtotal * (configJuegos.getMaximoPorcentajeDescuentoPedido() / 100.0);
                descuentoPuntos = Math.min(valCalculado, maxDescuento);

                cliente.setGranipoints(cliente.getGranipoints() - puntosUsados);

                TransaccionPuntos transGasto = new TransaccionPuntos(
                        cliente.getId(),
                        cliente.getTelefono(),
                        cliente.getNombre(),
                        "CANJE_CHECKOUT",
                        -puntosUsados,
                        cliente.getGranipoints(),
                        "🛒 Canje de GraniPoints por descuento de $" + String.format("%.0f", descuentoPuntos) + " en pedido " + codigo,
                        codigo
                );
                transaccionRepository.save(transGasto);
            } else {
                puntosUsados = 0;
            }

            // 2. Acumulación por compra
            if (configJuegos.isAcumularPuntosPorCompra() && configJuegos.getPesosPorPuntoAcumulado() > 0) {
                double baseParaPuntos = Math.max(0, subtotal - descuentoPuntos);
                puntosGanados = (int) (baseParaPuntos / configJuegos.getPesosPorPuntoAcumulado());

                if (puntosGanados > 0) {
                    cliente.setGranipoints(cliente.getGranipoints() + puntosGanados);

                    TransaccionPuntos transGanancia = new TransaccionPuntos(
                            cliente.getId(),
                            cliente.getTelefono(),
                            cliente.getNombre(),
                            "COMPRA",
                            puntosGanados,
                            cliente.getGranipoints(),
                            "🥤 GraniPoints ganados por tu compra en orden " + codigo,
                            codigo
                    );
                    transaccionRepository.save(transGanancia);
                }
            }

            // 3. Giros extras por compra
            if (configJuegos.isOtorgarGirosPorCompra()) {
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

