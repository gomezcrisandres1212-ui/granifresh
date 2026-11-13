package com.granizados.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "configuracion_juegos")
public class ConfiguracionJuegos {

    @Id
    private String id;

    // Activación global
    private boolean ruletaActiva;
    private boolean raspaActivo;

    // Límites de intentos diarios gratuitos
    private int intentosGratisRuletaDiarios;
    private int intentosGratisRaspaDiarios;

    // Puntos de bienvenida por registro
    private int puntosBienvenidaRegistro;

    // Reglas de negocio para compras
    private boolean acumularPuntosPorCompra;
    private String modoPuntosCompra; // "POR_VALOR" o "FIJO"
    private int pesosPorPuntoAcumulado; // ej: 1 punto por cada $1.000 COP gastados
    private int puntosFijosPorCompra; // ej: 10 puntos fijos por orden
    private boolean otorgarGirosPorCompra; // ej: 1 giro de ruleta extra por cada pedido

    // Canje de puntos en el checkout
    private boolean canjePuntosHabilitado;
    private double valorPesosPorPunto;  // ej: 1 GraniPoint = $20 COP de descuento (100 pts = $2.000)
    private int puntosMinimosCanje;     // ej: mínimo 50 GraniPoints para poder canjear
    private int maximoPorcentajeDescuentoPedido; // ej: máximo 50% del total puede pagarse con puntos
    private boolean canjePorGranizadoHabilitado; // ¿Se puede canjear por 1 granizado gratis?
    private int puntosParaGranizadoGratis;       // ej: 120 GraniPoints = 1 Granizado Gratis
    private boolean canjePorToppingHabilitado;   // ¿Se puede canjear por topping gratis?
    private int puntosParaToppingGratis;         // ej: 30 GraniPoints = 1 Topping Gratis

    // Catálogo de premios de la Ruleta Glacial
    private List<PremioJuego> premiosRuleta = new ArrayList<>();

    // Catálogo de premios de Raspa y Gana
    private List<PremioJuego> premiosRaspa = new ArrayList<>();

    public ConfiguracionJuegos() {
        this.ruletaActiva = true;
        this.raspaActivo = true;
        this.intentosGratisRuletaDiarios = 1;
        this.intentosGratisRaspaDiarios = 1;
        this.puntosBienvenidaRegistro = 20; // 20 GraniPoints de bienvenida por defecto
        this.acumularPuntosPorCompra = true;
        this.modoPuntosCompra = "POR_VALOR";
        this.pesosPorPuntoAcumulado = 1000; // 1 punto x $1.000
        this.puntosFijosPorCompra = 15;
        this.otorgarGirosPorCompra = true;
        this.canjePuntosHabilitado = true;
        this.valorPesosPorPunto = 20.0; // 100 pts = $2.000 COP
        this.puntosMinimosCanje = 50;
        this.maximoPorcentajeDescuentoPedido = 50;
        this.canjePorGranizadoHabilitado = true;
        this.puntosParaGranizadoGratis = 120; // 120 pts = 1 granizado
        this.canjePorToppingHabilitado = true;
        this.puntosParaToppingGratis = 30; // 30 pts = 1 topping

        inicializarPremiosPorDefecto();
    }

    public void inicializarPremiosPorDefecto() {
        this.premiosRuleta = new ArrayList<>();
        this.premiosRuleta.add(new PremioJuego("rul-1", "+10 Puntos", "¡Sumas a tu cuenta!", "PUNTOS", 10, "#00E5FF", "❄️", 35));
        this.premiosRuleta.add(new PremioJuego("rul-2", "+25 Puntos", "¡Gran botín helado!", "PUNTOS", 25, "#FF007F", "🍧", 25));
        this.premiosRuleta.add(new PremioJuego("rul-3", "Sigue intentando", "¡Mañana hay revancha!", "VACIO", 0, "#334155", "💨", 20));
        this.premiosRuleta.add(new PremioJuego("rul-4", "+50 Puntos", "¡Premio Mayor!", "PUNTOS", 50, "#FFB703", "⭐", 12));
        this.premiosRuleta.add(new PremioJuego("rul-5", "+15 Puntos", "¡Poder Sub-Cero!", "PUNTOS", 15, "#10B981", "🍃", 30));
        this.premiosRuleta.add(new PremioJuego("rul-6", "+100 Puntos", "¡JACKPOT GLACIAL!", "PUNTOS", 100, "#FB8500", "👑", 5));
        this.premiosRuleta.add(new PremioJuego("rul-7", "+5 Puntos", "¡Poco a poco sumas!", "PUNTOS", 5, "#8B5CF6", "🧊", 40));
        this.premiosRuleta.add(new PremioJuego("rul-8", "Topping Gratis", "En tu próximo pedido", "TOPPING_GRATIS", 15, "#EC4899", "🍒", 15));

        this.premiosRaspa = new ArrayList<>();
        this.premiosRaspa.add(new PremioJuego("ras-1", "+15 Puntos", "¡Fresa Glacial!", "PUNTOS", 15, "#EF4444", "🍓", 35));
        this.premiosRaspa.add(new PremioJuego("ras-2", "+30 Puntos", "¡Mango Cítrico!", "PUNTOS", 30, "#F59E0B", "🥭", 25));
        this.premiosRaspa.add(new PremioJuego("ras-3", "+60 Puntos", "¡Maracuyá Salvaje!", "PUNTOS", 60, "#84CC16", "🍋", 15));
        this.premiosRaspa.add(new PremioJuego("ras-4", "+120 Puntos", "¡Copa Glacial Suprema!", "PUNTOS", 120, "#06B6D4", "🏆", 5));
        this.premiosRaspa.add(new PremioJuego("ras-5", "Sigue Raspando", "¡Casi lo logras!", "VACIO", 0, "#64748B", "❄️", 20));
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public boolean isRuletaActiva() { return ruletaActiva; }
    public void setRuletaActiva(boolean ruletaActiva) { this.ruletaActiva = ruletaActiva; }

    public boolean isRaspaActivo() { return raspaActivo; }
    public void setRaspaActivo(boolean raspaActivo) { this.raspaActivo = raspaActivo; }

    public int getIntentosGratisRuletaDiarios() { return intentosGratisRuletaDiarios; }
    public void setIntentosGratisRuletaDiarios(int intentosGratisRuletaDiarios) { this.intentosGratisRuletaDiarios = intentosGratisRuletaDiarios; }

    public int getIntentosGratisRaspaDiarios() { return intentosGratisRaspaDiarios; }
    public void setIntentosGratisRaspaDiarios(int intentosGratisRaspaDiarios) { this.intentosGratisRaspaDiarios = intentosGratisRaspaDiarios; }

    public int getPuntosBienvenidaRegistro() { return puntosBienvenidaRegistro; }
    public void setPuntosBienvenidaRegistro(int puntosBienvenidaRegistro) { this.puntosBienvenidaRegistro = puntosBienvenidaRegistro; }

    public boolean isAcumularPuntosPorCompra() { return acumularPuntosPorCompra; }
    public void setAcumularPuntosPorCompra(boolean acumularPuntosPorCompra) { this.acumularPuntosPorCompra = acumularPuntosPorCompra; }

    public int getPesosPorPuntoAcumulado() { return pesosPorPuntoAcumulado; }
    public void setPesosPorPuntoAcumulado(int pesosPorPuntoAcumulado) { this.pesosPorPuntoAcumulado = pesosPorPuntoAcumulado; }

    public boolean isOtorgarGirosPorCompra() { return otorgarGirosPorCompra; }
    public void setOtorgarGirosPorCompra(boolean otorgarGirosPorCompra) { this.otorgarGirosPorCompra = otorgarGirosPorCompra; }

    public boolean isCanjePuntosHabilitado() { return canjePuntosHabilitado; }
    public void setCanjePuntosHabilitado(boolean canjePuntosHabilitado) { this.canjePuntosHabilitado = canjePuntosHabilitado; }

    public double getValorPesosPorPunto() { return valorPesosPorPunto; }
    public void setValorPesosPorPunto(double valorPesosPorPunto) { this.valorPesosPorPunto = valorPesosPorPunto; }

    public int getPuntosMinimosCanje() { return puntosMinimosCanje; }
    public void setPuntosMinimosCanje(int puntosMinimosCanje) { this.puntosMinimosCanje = puntosMinimosCanje; }

    public int getMaximoPorcentajeDescuentoPedido() { return maximoPorcentajeDescuentoPedido; }
    public void setMaximoPorcentajeDescuentoPedido(int maximoPorcentajeDescuentoPedido) { this.maximoPorcentajeDescuentoPedido = maximoPorcentajeDescuentoPedido; }

    public List<PremioJuego> getPremiosRuleta() { return premiosRuleta; }
    public void setPremiosRuleta(List<PremioJuego> premiosRuleta) { this.premiosRuleta = premiosRuleta; }

    public List<PremioJuego> getPremiosRaspa() { return premiosRaspa; }
    public void setPremiosRaspa(List<PremioJuego> premiosRaspa) { this.premiosRaspa = premiosRaspa; }

    public String getModoPuntosCompra() { return modoPuntosCompra; }
    public void setModoPuntosCompra(String modoPuntosCompra) { this.modoPuntosCompra = modoPuntosCompra; }

    public int getPuntosFijosPorCompra() { return puntosFijosPorCompra; }
    public void setPuntosFijosPorCompra(int puntosFijosPorCompra) { this.puntosFijosPorCompra = puntosFijosPorCompra; }

    public boolean isCanjePorGranizadoHabilitado() { return canjePorGranizadoHabilitado; }
    public void setCanjePorGranizadoHabilitado(boolean canjePorGranizadoHabilitado) { this.canjePorGranizadoHabilitado = canjePorGranizadoHabilitado; }

    public int getPuntosParaGranizadoGratis() { return puntosParaGranizadoGratis; }
    public void setPuntosParaGranizadoGratis(int puntosParaGranizadoGratis) { this.puntosParaGranizadoGratis = puntosParaGranizadoGratis; }

    public boolean isCanjePorToppingHabilitado() { return canjePorToppingHabilitado; }
    public void setCanjePorToppingHabilitado(boolean canjePorToppingHabilitado) { this.canjePorToppingHabilitado = canjePorToppingHabilitado; }

    public int getPuntosParaToppingGratis() { return puntosParaToppingGratis; }
    public void setPuntosParaToppingGratis(int puntosParaToppingGratis) { this.puntosParaToppingGratis = puntosParaToppingGratis; }
}

