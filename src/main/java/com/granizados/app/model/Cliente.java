package com.granizados.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "clientes")
public class Cliente {

    @Id
    private String id;

    @Indexed(unique = true)
    private String telefono; // Usado como identificador principal / WhatsApp

    private String nombre;
    private String email;
    private String contrasenaHash;

    private int granipoints; // Saldo actual de puntos

    // Datos predeterminados para auto-completar checkout
    private String direccionPredeterminada;
    private String barrioPredeterminado;
    private String indicacionesPredeterminadas;
    private Double latitud;
    private Double longitud;

    private Date fechaRegistro;
    private Date ultimoLogin;
    private Date ultimaTiradaRuleta;
    private Date ultimoRaspaGana;

    private int girosExtrasDisponibles; // Giros extra ganados por compras o dados por el admin
    private int raspasExtrasDisponibles; // Raspas extra ganados por compras o dados por el admin

    private boolean activo;

    public Cliente() {
        this.fechaRegistro = new Date();
        this.ultimoLogin = new Date();
        this.granipoints = 0;
        this.girosExtrasDisponibles = 0;
        this.raspasExtrasDisponibles = 0;
        this.activo = true;
    }

    public Cliente(String telefono, String nombre, String contrasenaHash) {
        this();
        this.telefono = telefono;
        this.nombre = nombre;
        this.contrasenaHash = contrasenaHash;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContrasenaHash() { return contrasenaHash; }
    public void setContrasenaHash(String contrasenaHash) { this.contrasenaHash = contrasenaHash; }

    public int getGranipoints() { return granipoints; }
    public void setGranipoints(int granipoints) { this.granipoints = granipoints; }

    public String getDireccionPredeterminada() { return direccionPredeterminada; }
    public void setDireccionPredeterminada(String direccionPredeterminada) { this.direccionPredeterminada = direccionPredeterminada; }

    public String getBarrioPredeterminado() { return barrioPredeterminado; }
    public void setBarrioPredeterminado(String barrioPredeterminado) { this.barrioPredeterminado = barrioPredeterminado; }

    public String getIndicacionesPredeterminadas() { return indicacionesPredeterminadas; }
    public void setIndicacionesPredeterminadas(String indicacionesPredeterminadas) { this.indicacionesPredeterminadas = indicacionesPredeterminadas; }

    public Date getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(Date fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public Date getUltimoLogin() { return ultimoLogin; }
    public void setUltimoLogin(Date ultimoLogin) { this.ultimoLogin = ultimoLogin; }

    public Date getUltimaTiradaRuleta() { return ultimaTiradaRuleta; }
    public void setUltimaTiradaRuleta(Date ultimaTiradaRuleta) { this.ultimaTiradaRuleta = ultimaTiradaRuleta; }

    public Date getUltimoRaspaGana() { return ultimoRaspaGana; }
    public void setUltimoRaspaGana(Date ultimoRaspaGana) { this.ultimoRaspaGana = ultimoRaspaGana; }

    public int getGirosExtrasDisponibles() { return girosExtrasDisponibles; }
    public void setGirosExtrasDisponibles(int girosExtrasDisponibles) { this.girosExtrasDisponibles = girosExtrasDisponibles; }

    public int getRaspasExtrasDisponibles() { return raspasExtrasDisponibles; }
    public void setRaspasExtrasDisponibles(int raspasExtrasDisponibles) { this.raspasExtrasDisponibles = raspasExtrasDisponibles; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }
}

