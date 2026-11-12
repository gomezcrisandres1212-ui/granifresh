package com.granizados.app.dto;

import com.granizados.app.model.Cliente;

public class ClienteResponseDTO {
    private boolean exito;
    private String token;
    private String mensaje;
    private Cliente cliente;

    public ClienteResponseDTO() {}

    public ClienteResponseDTO(boolean exito, String token, String mensaje, Cliente cliente) {
        this.exito = exito;
        this.token = token;
        this.mensaje = mensaje;
        this.cliente = cliente;
    }

    public boolean isExito() { return exito; }
    public void setExito(boolean exito) { this.exito = exito; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
}

