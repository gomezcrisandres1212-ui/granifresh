package com.granizados.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "administradores")
public class Administrador {

    @Id
    private String id;
    private String usuario;
    private String contrasenaHash;
    private String nombreCompleto;
    private String rol;

    public Administrador() {
        this.rol = "ROLE_ADMIN";
    }

    public Administrador(String usuario, String contrasenaHash, String nombreCompleto) {
        this.usuario = usuario;
        this.contrasenaHash = contrasenaHash;
        this.nombreCompleto = nombreCompleto;
        this.rol = "ROLE_ADMIN";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }

    public String getContrasenaHash() { return contrasenaHash; }
    public void setContrasenaHash(String contrasenaHash) { this.contrasenaHash = contrasenaHash; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}

