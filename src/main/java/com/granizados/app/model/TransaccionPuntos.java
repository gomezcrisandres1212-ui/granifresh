package com.granizados.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "transacciones_puntos")
public class TransaccionPuntos {

    @Id
    private String id;
    private String clienteId;
    private String clienteTelefono;
    private String clienteNombre;

    // RULETA, RASPA_GANA, COMPRA, CANJE_CHECKOUT, AJUSTE_ADMIN, REGALO_BIENVENIDA
    private String tipo;

    private int puntos; // Positivo (ganó) o negativo (canjeó / ajuste)
    private int saldoPosterior;
    private String motivo;
    private String codigoPedido;
    private Date fecha;

    public TransaccionPuntos() {
        this.fecha = new Date();
    }

    public TransaccionPuntos(String clienteId, String clienteTelefono, String clienteNombre,
                             String tipo, int puntos, int saldoPosterior, String motivo, String codigoPedido) {
        this();
        this.clienteId = clienteId;
        this.clienteTelefono = clienteTelefono;
        this.clienteNombre = clienteNombre;
        this.tipo = tipo;
        this.puntos = puntos;
        this.saldoPosterior = saldoPosterior;
        this.motivo = motivo;
        this.codigoPedido = codigoPedido;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClienteId() { return clienteId; }
    public void setClienteId(String clienteId) { this.clienteId = clienteId; }

    public String getClienteTelefono() { return clienteTelefono; }
    public void setClienteTelefono(String clienteTelefono) { this.clienteTelefono = clienteTelefono; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public int getPuntos() { return puntos; }
    public void setPuntos(int puntos) { this.puntos = puntos; }

    public int getSaldoPosterior() { return saldoPosterior; }
    public void setSaldoPosterior(int saldoPosterior) { this.saldoPosterior = saldoPosterior; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getCodigoPedido() { return codigoPedido; }
    public void setCodigoPedido(String codigoPedido) { this.codigoPedido = codigoPedido; }

    public Date getFecha() { return fecha; }
    public void setFecha(Date fecha) { this.fecha = fecha; }
}

