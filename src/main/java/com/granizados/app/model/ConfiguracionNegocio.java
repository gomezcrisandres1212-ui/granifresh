package com.granizados.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "configuracion_negocio")
public class ConfiguracionNegocio {

    @Id
    private String id;
    private String nombreNegocio;
    private String slogan;
    private String whatsappPedidos;
    private String telefonoContacto;
    private String direccionSede;
    private String horarioAtencion; // ej: "Martes a Domingo: 1:00 PM - 11:30 PM"
    private boolean abiertoParaPedidos;
    private double costoEnvioBase;
    private double pedidoMinimo;
    private String numeroNequi;
    private String numeroDaviplata;
    private String cuentaBancolombia;
    private String mensajeAlertaSuperior; // ej: "🧊 ¡ENVÍOS SUB-CERO! Empaque térmico antifusión garantizado."
    private String instagramUrl;
    private String facebookUrl;
    private Double latitud;
    private Double longitud;
    private Integer zoomMapa;
    private String historiaNosotros;
    private String colorGranizado1;
    private String colorGranizado2;

    public ConfiguracionNegocio() {
        this.nombreNegocio = "GRANIFRESH";
        this.slogan = "FULL SABOR, FULL FRESCURA";
        this.whatsappPedidos = "573013557467";
        this.telefonoContacto = "+57 301 355 7467";
        this.direccionSede = "Cra. 50 #31b, Olaya Herrera";
        this.horarioAtencion = "Lunes a Domingo: 12:00 PM - 11:30 PM";
        this.abiertoParaPedidos = true;
        this.costoEnvioBase = 5000.0;
        this.pedidoMinimo = 15000.0;
        this.numeroNequi = "3013557467";
        this.numeroDaviplata = "3013557467";
        this.cuentaBancolombia = "Ahorros 245-883921-04";
        this.mensajeAlertaSuperior = "🧊 ¡100% Fruta Natural Cosechada! Pura pulpa en textura frappé glacial a domicilio.";
        this.instagramUrl = "https://instagram.com/granifresh";
        this.facebookUrl = "https://facebook.com/granifresh";
        this.latitud = 10.4075;
        this.longitud = -75.5255;
        this.zoomMapa = 16;
        this.historiaNosotros = "En Granifresh transformamos la mejor fruta 100% natural en una experiencia glacial inolvidable. Cero concentrados artificiales, puro sabor y frescura en cada vaso.";
        this.colorGranizado1 = "#FFB703";
        this.colorGranizado2 = "#FB8500";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombreNegocio() { return nombreNegocio; }
    public void setNombreNegocio(String nombreNegocio) { this.nombreNegocio = nombreNegocio; }

    public String getSlogan() { return slogan; }
    public void setSlogan(String slogan) { this.slogan = slogan; }

    public String getWhatsappPedidos() { return whatsappPedidos; }
    public void setWhatsappPedidos(String whatsappPedidos) { this.whatsappPedidos = whatsappPedidos; }

    public String getTelefonoContacto() { return telefonoContacto; }
    public void setTelefonoContacto(String telefonoContacto) { this.telefonoContacto = telefonoContacto; }

    public String getDireccionSede() { return direccionSede; }
    public void setDireccionSede(String direccionSede) { this.direccionSede = direccionSede; }

    public String getHorarioAtencion() { return horarioAtencion; }
    public void setHorarioAtencion(String horarioAtencion) { this.horarioAtencion = horarioAtencion; }

    public boolean isAbiertoParaPedidos() { return abiertoParaPedidos; }
    public void setAbiertoParaPedidos(boolean abiertoParaPedidos) { this.abiertoParaPedidos = abiertoParaPedidos; }

    public double getCostoEnvioBase() { return costoEnvioBase; }
    public void setCostoEnvioBase(double costoEnvioBase) { this.costoEnvioBase = costoEnvioBase; }

    public double getPedidoMinimo() { return pedidoMinimo; }
    public void setPedidoMinimo(double pedidoMinimo) { this.pedidoMinimo = pedidoMinimo; }

    public String getNumeroNequi() { return numeroNequi; }
    public void setNumeroNequi(String numeroNequi) { this.numeroNequi = numeroNequi; }

    public String getNumeroDaviplata() { return numeroDaviplata; }
    public void setNumeroDaviplata(String numeroDaviplata) { this.numeroDaviplata = numeroDaviplata; }

    public String getCuentaBancolombia() { return cuentaBancolombia; }
    public void setCuentaBancolombia(String cuentaBancolombia) { this.cuentaBancolombia = cuentaBancolombia; }

    public String getMensajeAlertaSuperior() { return mensajeAlertaSuperior; }
    public void setMensajeAlertaSuperior(String mensajeAlertaSuperior) { this.mensajeAlertaSuperior = mensajeAlertaSuperior; }

    public String getInstagramUrl() { return instagramUrl; }
    public void setInstagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; }

    public String getFacebookUrl() { return facebookUrl; }
    public void setFacebookUrl(String facebookUrl) { this.facebookUrl = facebookUrl; }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }

    public Integer getZoomMapa() { return zoomMapa; }
    public void setZoomMapa(Integer zoomMapa) { this.zoomMapa = zoomMapa; }

    public String getHistoriaNosotros() { return historiaNosotros; }
    public void setHistoriaNosotros(String historiaNosotros) { this.historiaNosotros = historiaNosotros; }

    public String getColorGranizado1() { return colorGranizado1; }
    public void setColorGranizado1(String colorGranizado1) { this.colorGranizado1 = colorGranizado1; }

    public String getColorGranizado2() { return colorGranizado2; }
    public void setColorGranizado2(String colorGranizado2) { this.colorGranizado2 = colorGranizado2; }
}

