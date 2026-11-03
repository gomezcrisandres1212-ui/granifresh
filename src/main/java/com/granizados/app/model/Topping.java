package com.granizados.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "toppings")
public class Topping {

    @Id
    private String id;
    private String nombre;
    private String categoria; // TOPPING, ESCARCHADO, SHOT_LICOR, SALSA
    private double precio;
    private String descripcion;
    private boolean activo;
    private boolean aptoParaTodo; // Si puede ir en con o sin alcohol

    public Topping() {
        this.activo = true;
        this.aptoParaTodo = true;
    }

    public Topping(String nombre, String categoria, double precio, String descripcion) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.descripcion = descripcion;
        this.activo = true;
        this.aptoParaTodo = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public boolean isAptoParaTodo() { return aptoParaTodo; }
    public void setAptoParaTodo(boolean aptoParaTodo) { this.aptoParaTodo = aptoParaTodo; }
}

