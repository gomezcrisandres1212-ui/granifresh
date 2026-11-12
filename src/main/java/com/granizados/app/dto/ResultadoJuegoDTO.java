package com.granizados.app.dto;

import com.granizados.app.model.PremioJuego;

public class ResultadoJuegoDTO {
    private boolean exito;
    private String mensaje;
    private int puntosGanados;
    private int saldoActual;
    private PremioJuego premio;
    private int indiceSector; // Para la ruleta (índice 0..N-1)
    private int intentosRestantes;

    public ResultadoJuegoDTO() {}

    public ResultadoJuegoDTO(boolean exito, String mensaje) {
        this.exito = exito;
        this.mensaje = mensaje;
    }

    public boolean isExito() { return exito; }
    public void setExito(boolean exito) { this.exito = exito; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public int getPuntosGanados() { return puntosGanados; }
    public void setPuntosGanados(int puntosGanados) { this.puntosGanados = puntosGanados; }

    public int getSaldoActual() { return saldoActual; }
    public void setSaldoActual(int saldoActual) { this.saldoActual = saldoActual; }

    public PremioJuego getPremio() { return premio; }
    public void setPremio(PremioJuego premio) { this.premio = premio; }

    public int getIndiceSector() { return indiceSector; }
    public void setIndiceSector(int indiceSector) { this.indiceSector = indiceSector; }

    public int getIntentosRestantes() { return intentosRestantes; }
    public void setIntentosRestantes(int intentosRestantes) { this.intentosRestantes = intentosRestantes; }
}

