package com.granizados.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "banners")
public class Banner {

    @Id
    private String id;
    private String titulo;
    private String subtitulo;
    private String etiquetaBadge;
    private String imagenUrl;
    private String textoBoton;
    private String enlace;
    private boolean activo;
    private int orden;

    public Banner() {
        this.activo = true;
    }

    public Banner(String titulo, String subtitulo, String etiquetaBadge, String imagenUrl,
                  String textoBoton, String enlace, int orden, boolean activo) {
        this.titulo = titulo;
        this.subtitulo = subtitulo;
        this.etiquetaBadge = etiquetaBadge;
        this.imagenUrl = imagenUrl;
        this.textoBoton = textoBoton;
        this.enlace = enlace;
        this.orden = orden;
        this.activo = activo;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getSubtitulo() { return subtitulo; }
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }

    public String getEtiquetaBadge() { return etiquetaBadge; }
    public void setEtiquetaBadge(String etiquetaBadge) { this.etiquetaBadge = etiquetaBadge; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public String getTextoBoton() { return textoBoton; }
    public void setTextoBoton(String textoBoton) { this.textoBoton = textoBoton; }

    public String getEnlace() { return enlace; }
    public void setEnlace(String enlace) { this.enlace = enlace; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public int getOrden() { return orden; }
    public void setOrden(int orden) { this.orden = orden; }
}

