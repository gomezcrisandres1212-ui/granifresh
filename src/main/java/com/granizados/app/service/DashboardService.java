package com.granizados.app.service;

import com.granizados.app.dto.DashboardResumenDTO;
import com.granizados.app.model.ItemPedido;
import com.granizados.app.model.Pedido;
import com.granizados.app.repository.PedidoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final PedidoRepository pedidoRepository;

    public DashboardService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    public DashboardResumenDTO obtenerResumen() {
        DashboardResumenDTO dto = new DashboardResumenDTO();
        List<Pedido> pedidos = pedidoRepository.findAll();

        dto.setTotalPedidos(pedidos.size());

        double ventasTotales = 0.0;
        double ventasHoy = 0.0;
        double ventasSemana = 0.0;
        double ventasMes = 0.0;
        double subtotalProductos = 0.0;
        double totalEnvios = 0.0;
        long pedidosHoy = 0;
        long pendientes = 0;
        long enPreparacion = 0;
        long enCamino = 0;
        long entregados = 0;
        long cancelados = 0;
        long noCanceladosCount = 0;

        Map<String, Integer> saboresConteo = new HashMap<>();
        Map<String, Double> ingresosPorMetodo = new HashMap<>();
        Map<String, Integer> pedidosPorMetodo = new HashMap<>();

        LocalDate hoy = LocalDate.now();
        int mesActual = hoy.getMonthValue();
        int anioActual = hoy.getYear();
        LocalDate inicioSemana = hoy.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));

        // Inicializar estructura para últimos 7 días
        Map<LocalDate, Double> ventasDiarias = new HashMap<>();
        for (int i = 6; i >= 0; i--) {
            ventasDiarias.put(hoy.minusDays(i), 0.0);
        }

        for (Pedido p : pedidos) {
            String estado = p.getEstado() != null ? p.getEstado().toUpperCase() : "RECIBIDO";
            boolean noCancelado = !"CANCELADO".equalsIgnoreCase(estado);

            if (noCancelado) {
                noCanceladosCount++;
                ventasTotales += p.getTotal();
                subtotalProductos += p.getSubtotal();
                totalEnvios += p.getCostoEnvio();

                // Registro por método de pago
                String metodo = p.getMetodoPago() != null && !p.getMetodoPago().isBlank() 
                        ? p.getMetodoPago().toUpperCase() : "NEQUI";
                ingresosPorMetodo.put(metodo, ingresosPorMetodo.getOrDefault(metodo, 0.0) + p.getTotal());
                pedidosPorMetodo.put(metodo, pedidosPorMetodo.getOrDefault(metodo, 0) + 1);

                if (p.getFechaCreacion() != null) {
                    LocalDate fechaPedido = p.getFechaCreacion().toInstant()
                            .atZone(ZoneId.systemDefault()).toLocalDate();
                    if (hoy.equals(fechaPedido)) {
                        ventasHoy += p.getTotal();
                        pedidosHoy++;
                    }
                    if (!fechaPedido.isBefore(inicioSemana) && !fechaPedido.isAfter(hoy)) {
                        ventasSemana += p.getTotal();
                    }
                    if (fechaPedido.getMonthValue() == mesActual && fechaPedido.getYear() == anioActual) {
                        ventasMes += p.getTotal();
                    }
                    if (ventasDiarias.containsKey(fechaPedido)) {
                        ventasDiarias.put(fechaPedido, ventasDiarias.get(fechaPedido) + p.getTotal());
                    }
                }
            }

            if ("RECIBIDO".equalsIgnoreCase(estado) || "PENDIENTE_VALIDACION".equalsIgnoreCase(estado)) pendientes++;
            else if ("EN_PREPARACION".equalsIgnoreCase(estado)) enPreparacion++;
            else if ("EN_CAMINO".equalsIgnoreCase(estado)) enCamino++;
            else if ("ENTREGADO".equalsIgnoreCase(estado)) entregados++;
            else if ("CANCELADO".equalsIgnoreCase(estado)) cancelados++;

            if (p.getItems() != null && noCancelado) {
                for (ItemPedido item : p.getItems()) {
                    String nombre = item.getGranizadoNombre();
                    if (nombre == null || nombre.isBlank()) nombre = item.getNombreGranizado();
                    if (nombre != null && !nombre.isBlank()) {
                        saboresConteo.put(nombre, saboresConteo.getOrDefault(nombre, 0) + Math.max(item.getCantidad(), 1));
                    }
                }
            }
        }

        // Armar lista de los últimos 7 días con nombres en español
        String[] diasNombres = {"Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"};
        List<Map<String, Object>> ultimos7Dias = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = hoy.minusDays(i);
            int dayOfWeekIdx = d.getDayOfWeek().getValue() - 1; // 1 (Mon) - 7 (Sun)
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("dia", diasNombres[dayOfWeekIdx]);
            dayMap.put("fecha", d.toString());
            dayMap.put("total", ventasDiarias.getOrDefault(d, 0.0));
            ultimos7Dias.add(dayMap);
        }

        double ticketPromedio = noCanceladosCount > 0 ? (ventasTotales / noCanceladosCount) : 0.0;

        dto.setVentasTotales(ventasTotales);
        dto.setVentasHoy(ventasHoy);
        dto.setVentasSemana(ventasSemana);
        dto.setVentasMes(ventasMes);
        dto.setTicketPromedio(ticketPromedio);
        dto.setSubtotalProductos(subtotalProductos);
        dto.setTotalEnvios(totalEnvios);
        dto.setPedidosHoy(pedidosHoy);
        dto.setPedidosPendientes(pendientes);
        dto.setPedidosEnPreparacion(enPreparacion);
        dto.setPedidosEnCamino(enCamino);
        dto.setPedidosEntregados(entregados);
        dto.setPedidosCancelados(cancelados);
        dto.setTopGranizados(saboresConteo);
        dto.setIngresosPorMetodo(ingresosPorMetodo);
        dto.setPedidosPorMetodo(pedidosPorMetodo);
        dto.setVentasUltimos7Dias(ultimos7Dias);

        return dto;
    }
}

