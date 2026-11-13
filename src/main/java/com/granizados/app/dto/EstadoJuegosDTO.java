package com.granizados.app.dto;

import com.granizados.app.model.PremioJuego;
import java.util.List;

public class EstadoJuegosDTO {
    private boolean ruletaActiva;
    private boolean raspaActivo;
    private boolean puedeGirarHoy;
    private boolean puedeRasparHoy;
    private int girosExtras;
    private int raspasExtras;
    private int totalGirosDisponibles;
    private int totalRaspasDisponibles;
    private int saldoPuntos;
    private double valorPesosPorPunto;
    private int puntosMinimosCanje;
    private List<PremioJuego> premiosRuleta;
    private List<PremioJuego> premiosRaspa;

    public boolean isRuletaActiva() { return ruletaActiva; }
    public void setRuletaActiva(boolean ruletaActiva) { this.ruletaActiva = ruletaActiva; }

    public boolean isRaspaActivo() { return raspaActivo; }
    public void setRaspaActivo(boolean raspaActivo) { this.raspaActivo = raspaActivo; }

    public boolean isPuedeGirarHoy() { return puedeGirarHoy; }
    public void setPuedeGirarHoy(boolean puedeGirarHoy) { this.puedeGirarHoy = puedeGirarHoy; }

    public boolean isPuedeRasparHoy() { return puedeRasparHoy; }
    public void setPuedeRasparHoy(boolean puedeRasparHoy) { this.puedeRasparHoy = puedeRasparHoy; }

    public int getGirosExtras() { return girosExtras; }
    public void setGirosExtras(int girosExtras) { this.girosExtras = girosExtras; }

    public int getRaspasExtras() { return raspasExtras; }
    public void setRaspasExtras(int raspasExtras) { this.raspasExtras = raspasExtras; }

    public int getTotalGirosDisponibles() { return totalGirosDisponibles; }
    public void setTotalGirosDisponibles(int totalGirosDisponibles) { this.totalGirosDisponibles = totalGirosDisponibles; }

    public int getTotalRaspasDisponibles() { return totalRaspasDisponibles; }
    public void setTotalRaspasDisponibles(int totalRaspasDisponibles) { this.totalRaspasDisponibles = totalRaspasDisponibles; }

    public int getSaldoPuntos() { return saldoPuntos; }
    public void setSaldoPuntos(int saldoPuntos) { this.saldoPuntos = saldoPuntos; }

    public double getValorPesosPorPunto() { return valorPesosPorPunto; }
    public void setValorPesosPorPunto(double valorPesosPorPunto) { this.valorPesosPorPunto = valorPesosPorPunto; }

    public int getPuntosMinimosCanje() { return puntosMinimosCanje; }
    public void setPuntosMinimosCanje(int puntosMinimosCanje) { this.puntosMinimosCanje = puntosMinimosCanje; }

    public List<PremioJuego> getPremiosRuleta() { return premiosRuleta; }
    public void setPremiosRuleta(List<PremioJuego> premiosRuleta) { this.premiosRuleta = premiosRuleta; }

    public List<PremioJuego> getPremiosRaspa() { return premiosRaspa; }
    public void setPremiosRaspa(List<PremioJuego> premiosRaspa) { this.premiosRaspa = premiosRaspa; }

    private int diasIntervaloIntentos = 1;
    public int getDiasIntervaloIntentos() { return diasIntervaloIntentos; }
    public void setDiasIntervaloIntentos(int diasIntervaloIntentos) { this.diasIntervaloIntentos = diasIntervaloIntentos; }
}

