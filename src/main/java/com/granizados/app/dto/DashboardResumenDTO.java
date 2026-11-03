package com.granizados.app.dto;

import java.util.HashMap;
import java.util.Map;

public class DashboardResumenDTO {

    private double ventasTotales;
    private double ventasHoy;
    private double ventasSemana;
    private double ventasMes;
    private double ticketPromedio;
    private double subtotalProductos;
    private double totalEnvios;
    private long totalPedidos;
    private long pedidosHoy;
    private long pedidosPendientes;
    private long pedidosEnPreparacion;
    private long pedidosEnCamino;
    private long pedidosEntregados;
    private long pedidosCancelados;
    private long totalConAlcohol;
    private long totalSinAlcohol;
    private Map<String, Integer> topGranizados = new HashMap<>();
    private Map<String, Double> ingresosPorMetodo = new HashMap<>();
    private Map<String, Integer> pedidosPorMetodo = new HashMap<>();
    private java.util.List<Map<String, Object>> ventasUltimos7Dias = new java.util.ArrayList<>();

    public DashboardResumenDTO() {}

    public double getVentasTotales() { return ventasTotales; }
    public void setVentasTotales(double ventasTotales) { this.ventasTotales = ventasTotales; }

    public double getVentasHoy() { return ventasHoy; }
    public void setVentasHoy(double ventasHoy) { this.ventasHoy = ventasHoy; }

    public double getVentasSemana() { return ventasSemana; }
    public void setVentasSemana(double ventasSemana) { this.ventasSemana = ventasSemana; }

    public double getVentasMes() { return ventasMes; }
    public void setVentasMes(double ventasMes) { this.ventasMes = ventasMes; }

    public double getTicketPromedio() { return ticketPromedio; }
    public void setTicketPromedio(double ticketPromedio) { this.ticketPromedio = ticketPromedio; }

    public double getSubtotalProductos() { return subtotalProductos; }
    public void setSubtotalProductos(double subtotalProductos) { this.subtotalProductos = subtotalProductos; }

    public double getTotalEnvios() { return totalEnvios; }
    public void setTotalEnvios(double totalEnvios) { this.totalEnvios = totalEnvios; }

    public java.util.List<Map<String, Object>> getVentasUltimos7Dias() { return ventasUltimos7Dias; }
    public void setVentasUltimos7Dias(java.util.List<Map<String, Object>> ventasUltimos7Dias) { this.ventasUltimos7Dias = ventasUltimos7Dias; }

    public long getTotalPedidos() { return totalPedidos; }
    public void setTotalPedidos(long totalPedidos) { this.totalPedidos = totalPedidos; }

    public long getPedidosHoy() { return pedidosHoy; }
    public void setPedidosHoy(long pedidosHoy) { this.pedidosHoy = pedidosHoy; }

    public long getPedidosPendientes() { return pedidosPendientes; }
    public void setPedidosPendientes(long pedidosPendientes) { this.pedidosPendientes = pedidosPendientes; }

    public long getPedidosEnPreparacion() { return pedidosEnPreparacion; }
    public void setPedidosEnPreparacion(long pedidosEnPreparacion) { this.pedidosEnPreparacion = pedidosEnPreparacion; }

    public long getPedidosEnCamino() { return pedidosEnCamino; }
    public void setPedidosEnCamino(long pedidosEnCamino) { this.pedidosEnCamino = pedidosEnCamino; }

    public long getPedidosEntregados() { return pedidosEntregados; }
    public void setPedidosEntregados(long pedidosEntregados) { this.pedidosEntregados = pedidosEntregados; }

    public long getPedidosCancelados() { return pedidosCancelados; }
    public void setPedidosCancelados(long pedidosCancelados) { this.pedidosCancelados = pedidosCancelados; }

    public long getTotalConAlcohol() { return totalConAlcohol; }
    public void setTotalConAlcohol(long totalConAlcohol) { this.totalConAlcohol = totalConAlcohol; }

    public long getTotalSinAlcohol() { return totalSinAlcohol; }
    public void setTotalSinAlcohol(long totalSinAlcohol) { this.totalSinAlcohol = totalSinAlcohol; }

    public Map<String, Integer> getTopGranizados() { return topGranizados; }
    public void setTopGranizados(Map<String, Integer> topGranizados) { this.topGranizados = topGranizados; }

    public Map<String, Double> getIngresosPorMetodo() { return ingresosPorMetodo; }
    public void setIngresosPorMetodo(Map<String, Double> ingresosPorMetodo) { this.ingresosPorMetodo = ingresosPorMetodo; }

    public Map<String, Integer> getPedidosPorMetodo() { return pedidosPorMetodo; }
    public void setPedidosPorMetodo(Map<String, Integer> pedidosPorMetodo) { this.pedidosPorMetodo = pedidosPorMetodo; }
}

