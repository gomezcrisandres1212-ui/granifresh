package com.granizados.app.model;

import java.util.ArrayList;
import java.util.List;

public class ItemPedido {

    private String granizadoId;
    private String granizadoNombre;
    private String tamano; // 12oz, 16oz, 24oz, Pack
    private double precioUnitario;
    private int cantidad;
    private String escarchado;
    private List<String> toppingsSeleccionados = new ArrayList<>();
    private double costoToppings;
    private String notas;
    private double subtotal;

    public ItemPedido() {}

    public ItemPedido(String granizadoId, String granizadoNombre, String tamano,
                      double precioUnitario, int cantidad, String escarchado,
                      List<String> toppingsSeleccionados, double costoToppings, String notas) {
        this.granizadoId = granizadoId;
        this.granizadoNombre = granizadoNombre;
        this.tamano = tamano;
        this.precioUnitario = precioUnitario;
        this.cantidad = cantidad;
        this.escarchado = escarchado;
        this.toppingsSeleccionados = toppingsSeleccionados != null ? toppingsSeleccionados : new ArrayList<>();
        this.costoToppings = costoToppings;
        this.notas = notas;
        this.subtotal = (precioUnitario + costoToppings) * cantidad;
    }

    public String getGranizadoId() { return granizadoId; }
    public void setGranizadoId(String granizadoId) { this.granizadoId = granizadoId; }

    public String getGranizadoNombre() { return granizadoNombre; }
    public void setGranizadoNombre(String granizadoNombre) { this.granizadoNombre = granizadoNombre; }
    public String getNombreGranizado() { return granizadoNombre; }
    public void setNombreGranizado(String nombreGranizado) { this.granizadoNombre = nombreGranizado; }

    public String getTamano() { return tamano; }
    public void setTamano(String tamano) { this.tamano = tamano; }

    public double getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(double precioUnitario) { this.precioUnitario = precioUnitario; }

    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }

    public String getEscarchado() { return escarchado; }
    public void setEscarchado(String escarchado) { this.escarchado = escarchado; }

    public List<String> getToppingsSeleccionados() { return toppingsSeleccionados; }
    public void setToppingsSeleccionados(List<String> toppingsSeleccionados) { this.toppingsSeleccionados = toppingsSeleccionados; }

    public double getCostoToppings() { return costoToppings; }
    public void setCostoToppings(double costoToppings) { this.costoToppings = costoToppings; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
}

