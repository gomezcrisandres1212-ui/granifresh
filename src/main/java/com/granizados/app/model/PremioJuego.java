package com.granizados.app.model;

public class PremioJuego {

    private String id;
    private String titulo;         // ej: "+20 GraniPoints", "Granizado Gratis", "Sigue Intentando"
    private String subtitulo;      // ej: "¡Puntos sumados!", "¡Canjeable en tu orden!"
    private String tipo;           // PUNTOS, GRANIZADO_GRATIS, TOPPING_GRATIS, VACIO
    private int puntos;            // Puntos a sumar si tipo es PUNTOS
    private String color;          // Hex color para la ruleta
    private String icono;          // Emoji o icono visual
    private int pesoProbabilidad;  // Peso relativo (ej: 40 para común, 5 para raro)

    public PremioJuego() {}

    public PremioJuego(String id, String titulo, String subtitulo, String tipo, int puntos, String color, String icono, int pesoProbabilidad) {
        this.id = id;
        this.titulo = titulo;
        this.subtitulo = subtitulo;
        this.tipo = tipo;
        this.puntos = puntos;
        this.color = color;
        this.icono = icono;
        this.pesoProbabilidad = pesoProbabilidad;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getSubtitulo() { return subtitulo; }
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public int getPuntos() { return puntos; }
    public void setPuntos(int puntos) { this.puntos = puntos; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getIcono() { return icono; }
    public void setIcono(String icono) { this.icono = icono; }

    public int getPesoProbabilidad() { return pesoProbabilidad; }
    public void setPesoProbabilidad(int pesoProbabilidad) { this.pesoProbabilidad = pesoProbabilidad; }
}

