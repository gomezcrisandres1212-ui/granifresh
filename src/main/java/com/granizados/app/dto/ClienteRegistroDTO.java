package com.granizados.app.dto;

public class ClienteRegistroDTO {
    private String telefono;
    private String nombre;
    private String email;
    private String contrasena;
    private String direccion;
    private String barrio;
    private String indicaciones;
    private Double latitud;
    private Double longitud;

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public String getIndicaciones() { return indicaciones; }
    public void setIndicaciones(String indicaciones) { this.indicaciones = indicaciones; }

    public Double getLatitud() { return latitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }

    public Double getLongitud() { return longitud; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }
}

