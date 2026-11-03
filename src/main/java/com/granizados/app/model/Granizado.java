package com.granizados.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "granizados")
public class Granizado {

    @Id
    private String id;
    private String nombre;
    private String descripcion;
    private String categoriaSlug; // con-alcohol, sin-alcohol, combos-party
    private String tipo;          // CON_ALCOHOL, SIN_ALCOHOL, COMBO
    private String graduacionAlcohol; // e.g., "5.5% Alc/Vol", "0.0% Alcohol Free"
    private String licorBase;          // e.g., "Ron Blanco Bacardí", "Tequila Reposado", "Ninguno"
    private double precioBase;        // Precio referencia (normalmente de 12oz)
    private Map<String, Double> preciosPorTamano = new HashMap<>(); // "12oz": 14000, "16oz": 18000, "24oz": 24000
    private String imagenUrl;
    private String insignia;          // "🔥 MÁS VENDIDO", "❄️ SUB-CERO", "🍸 COCKTAIL", "🍓 100% NATURAL"
    private List<String> coloresGradiente; // Para renderizar el vaso visual con efectos de hielo
    private List<String> ingredientes;
    private boolean destacado;
    private boolean activo;
    private int stockDisponible;
    private int orden;
    private Map<String, Object> ajusteImagen = new HashMap<>(); // fit: "cover"|"contain", zoom: double, posX: int, posY: int

    public Granizado() {
        this.activo = true;
        this.destacado = false;
        this.stockDisponible = 99;
    }

    public Granizado(String nombre, String descripcion, String categoriaSlug, String tipo,
                     String graduacionAlcohol, String licorBase, double precioBase,
                     Map<String, Double> preciosPorTamano, String imagenUrl, String insignia,
                     List<String> coloresGradiente, List<String> ingredientes, boolean destacado) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoriaSlug = categoriaSlug;
        this.tipo = tipo;
        this.graduacionAlcohol = graduacionAlcohol;
        this.licorBase = licorBase;
        this.precioBase = precioBase;
        this.preciosPorTamano = preciosPorTamano;
        this.imagenUrl = imagenUrl;
        this.insignia = insignia;
        this.coloresGradiente = coloresGradiente;
        this.ingredientes = ingredientes;
        this.destacado = destacado;
        this.activo = true;
        this.stockDisponible = 99;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getCategoriaSlug() { return categoriaSlug; }
    public void setCategoriaSlug(String categoriaSlug) { this.categoriaSlug = categoriaSlug; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getGraduacionAlcohol() { return graduacionAlcohol; }
    public void setGraduacionAlcohol(String graduacionAlcohol) { this.graduacionAlcohol = graduacionAlcohol; }

    public String getLicorBase() { return licorBase; }
    public void setLicorBase(String licorBase) { this.licorBase = licorBase; }

    public double getPrecioBase() { return precioBase; }
    public void setPrecioBase(double precioBase) { this.precioBase = precioBase; }

    public Map<String, Double> getPreciosPorTamano() { return preciosPorTamano; }
    public void setPreciosPorTamano(Map<String, Double> preciosPorTamano) { this.preciosPorTamano = preciosPorTamano; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public String getInsignia() { return insignia; }
    public void setInsignia(String insignia) { this.insignia = insignia; }

    public List<String> getColoresGradiente() { return coloresGradiente; }
    public void setColoresGradiente(List<String> coloresGradiente) { this.coloresGradiente = coloresGradiente; }

    public List<String> getIngredientes() { return ingredientes; }
    public void setIngredientes(List<String> ingredientes) { this.ingredientes = ingredientes; }

    public boolean isDestacado() { return destacado; }
    public void setDestacado(boolean destacado) { this.destacado = destacado; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public int getStockDisponible() { return stockDisponible; }
    public void setStockDisponible(int stockDisponible) { this.stockDisponible = stockDisponible; }

    public int getOrden() { return orden; }
    public void setOrden(int orden) { this.orden = orden; }

    public Map<String, Object> getAjusteImagen() { return ajusteImagen; }
    public void setAjusteImagen(Map<String, Object> ajusteImagen) { this.ajusteImagen = ajusteImagen; }
}

