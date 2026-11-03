package com.granizados.app.dto;

public class LoginResponse {
    private boolean autenticado;
    private String token;
    private String usuario;
    private String nombreCompleto;
    private String mensaje;

    public LoginResponse() {}

    public LoginResponse(boolean autenticado, String token, String usuario, String nombreCompleto, String mensaje) {
        this.autenticado = autenticado;
        this.token = token;
        this.usuario = usuario;
        this.nombreCompleto = nombreCompleto;
        this.mensaje = mensaje;
    }

    public boolean isAutenticado() { return autenticado; }
    public void setAutenticado(boolean autenticado) { this.autenticado = autenticado; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
}

