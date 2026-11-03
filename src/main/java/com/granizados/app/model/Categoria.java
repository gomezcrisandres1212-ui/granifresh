package com.granizados.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "categorias")
public class Categoria {

    @Id
    private String id;
    private String slug;
    private String nombre;
    private String descripcion;
    private String icono; // emoji o icono clase
    private int orden;
    private boolean activo;

    public Categoria() {
        this.activo = true;
    }

    public Categoria(String slug, String nombre, String descripcion, String icono, int orden) {
        this.slug = slug;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.icono = icono;
        this.orden = orden;
        this.activo = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getIcono() { return icono; }
    public void setIcono(String icono) { this.icono = icono; }

    public int getOrden() { return orden; }
    public void setOrden(int orden) { this.orden = orden; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}

