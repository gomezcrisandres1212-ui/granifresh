package com.granizados.app.service;

import com.granizados.app.model.ConfiguracionNegocio;
import com.granizados.app.model.ItemPedido;
import com.granizados.app.model.Pedido;
import com.granizados.app.repository.ConfiguracionNegocioRepository;
import com.granizados.app.repository.PedidoRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ConfiguracionNegocioRepository configRepository;
    private final SecureRandom random = new SecureRandom();

    public PedidoService(PedidoRepository pedidoRepository, ConfiguracionNegocioRepository configRepository) {
        this.pedidoRepository = pedidoRepository;
        this.configRepository = configRepository;
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
        pedido.setTotal(subtotal + costoEnvio);

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

