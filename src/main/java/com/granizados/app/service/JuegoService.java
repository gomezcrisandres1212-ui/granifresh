package com.granizados.app.service;

import com.granizados.app.dto.EstadoJuegosDTO;
import com.granizados.app.dto.ResultadoJuegoDTO;
import com.granizados.app.model.Cliente;
import com.granizados.app.model.ConfiguracionJuegos;
import com.granizados.app.model.PremioJuego;
import com.granizados.app.model.TransaccionPuntos;
import com.granizados.app.repository.ClienteRepository;
import com.granizados.app.repository.ConfiguracionJuegosRepository;
import com.granizados.app.repository.TransaccionPuntosRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
public class JuegoService {

    private final ClienteRepository clienteRepository;
    private final ConfiguracionJuegosRepository configJuegosRepository;
    private final TransaccionPuntosRepository transaccionRepository;
    private final SecureRandom random = new SecureRandom();

    public JuegoService(ClienteRepository clienteRepository,
                        ConfiguracionJuegosRepository configJuegosRepository,
                        TransaccionPuntosRepository transaccionRepository) {
        this.clienteRepository = clienteRepository;
        this.configJuegosRepository = configJuegosRepository;
        this.transaccionRepository = transaccionRepository;
    }

    public ConfiguracionJuegos obtenerConfiguracion() {
        return configJuegosRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> configJuegosRepository.save(new ConfiguracionJuegos()));
    }

    public ConfiguracionJuegos guardarConfiguracion(ConfiguracionJuegos config) {
        ConfiguracionJuegos existente = obtenerConfiguracion();
        config.setId(existente.getId());
        return configJuegosRepository.save(config);
    }

    private boolean haJugadoEnPeriodo(Date ultimaFecha, Date ahora, int intervaloDias) {
        if (ultimaFecha == null || ahora == null) return false;
        ZoneId zone = ZoneId.of("America/Bogota");
        LocalDate dUltima = ultimaFecha.toInstant().atZone(zone).toLocalDate();
        LocalDate dAhora = ahora.toInstant().atZone(zone).toLocalDate();
        if (intervaloDias <= 1) {
            return dUltima.isEqual(dAhora);
        }
        long dias = java.time.temporal.ChronoUnit.DAYS.between(dUltima, dAhora);
        return dias < intervaloDias;
    }

    public EstadoJuegosDTO obtenerEstadoJuegos(String telefono) {
        ConfiguracionJuegos config = obtenerConfiguracion();
        String telLimpio = telefono.replaceAll("[^0-9]", "").trim();
        Cliente cliente = clienteRepository.findByTelefono(telLimpio)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Date ahora = new Date();
        int intervalo = config.getDiasIntervaloIntentos();
        boolean yaGiro = haJugadoEnPeriodo(cliente.getUltimaTiradaRuleta(), ahora, intervalo);
        boolean yaRaspo = haJugadoEnPeriodo(cliente.getUltimoRaspaGana(), ahora, intervalo);

        boolean puedeGirarHoy = config.isRuletaActiva() && (!yaGiro && config.getIntentosGratisRuletaDiarios() > 0);
        boolean puedeRasparHoy = config.isRaspaActivo() && (!yaRaspo && config.getIntentosGratisRaspaDiarios() > 0);

        int totalGiros = (puedeGirarHoy ? 1 : 0) + cliente.getGirosExtrasDisponibles();
        int totalRaspas = (puedeRasparHoy ? 1 : 0) + cliente.getRaspasExtrasDisponibles();

        EstadoJuegosDTO estado = new EstadoJuegosDTO();
        estado.setRuletaActiva(config.isRuletaActiva());
        estado.setRaspaActivo(config.isRaspaActivo());
        estado.setPuedeGirarHoy(puedeGirarHoy);
        estado.setPuedeRasparHoy(puedeRasparHoy);
        estado.setGirosExtras(cliente.getGirosExtrasDisponibles());
        estado.setRaspasExtras(cliente.getRaspasExtrasDisponibles());
        estado.setTotalGirosDisponibles(totalGiros);
        estado.setTotalRaspasDisponibles(totalRaspas);
        estado.setSaldoPuntos(cliente.getGranipoints());
        estado.setValorPesosPorPunto(config.getValorPesosPorPunto());
        estado.setPuntosMinimosCanje(config.getPuntosMinimosCanje());
        estado.setPremiosRuleta(config.getPremiosRuleta());
        estado.setPremiosRaspa(config.getPremiosRaspa());
        estado.setDiasIntervaloIntentos(intervalo);

        return estado;
    }

    public synchronized ResultadoJuegoDTO girarRuleta(String telefono) {
        ConfiguracionJuegos config = obtenerConfiguracion();
        if (!config.isRuletaActiva()) {
            return new ResultadoJuegoDTO(false, "La Ruleta Glacial está pausada temporalmente por mantenimiento.");
        }

        String telLimpio = telefono.replaceAll("[^0-9]", "").trim();
        Cliente cliente = clienteRepository.findByTelefono(telLimpio)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Date ahora = new Date();
        int intervalo = config.getDiasIntervaloIntentos();
        boolean yaGiro = haJugadoEnPeriodo(cliente.getUltimaTiradaRuleta(), ahora, intervalo);
        boolean tieneGiroPeriodico = !yaGiro && config.getIntentosGratisRuletaDiarios() > 0;
        int extras = cliente.getGirosExtrasDisponibles();

        if (!tieneGiroPeriodico && extras <= 0) {
            String msg = (intervalo > 1)
                    ? "No tienes más giros disponibles. ¡Las tiradas gratuitas se renuevan cada " + intervalo + " días! También puedes ganar giros extra con tus pedidos."
                    : "No tienes más giros hoy. ¡Vuelve mañana por tu tiro gratis o gana giros con tus pedidos!";
            return new ResultadoJuegoDTO(false, msg);
        }

        // Consumir intento
        if (tieneGiroPeriodico) {
            cliente.setUltimaTiradaRuleta(ahora);
        } else {
            cliente.setGirosExtrasDisponibles(extras - 1);
        }

        List<PremioJuego> sectores = config.getPremiosRuleta();
        if (sectores == null || sectores.isEmpty()) {
            config.inicializarPremiosPorDefecto();
            config = configJuegosRepository.save(config);
            sectores = config.getPremiosRuleta();
        }

        // Selección ponderada por peso
        int totalPeso = 0;
        for (PremioJuego p : sectores) {
            totalPeso += Math.max(1, p.getPesoProbabilidad());
        }

        int randPeso = random.nextInt(totalPeso);
        int acumulado = 0;
        int indiceGanador = 0;
        PremioJuego premioGanador = sectores.get(0);

        for (int i = 0; i < sectores.size(); i++) {
            acumulado += Math.max(1, sectores.get(i).getPesoProbabilidad());
            if (randPeso < acumulado) {
                indiceGanador = i;
                premioGanador = sectores.get(i);
                break;
            }
        }

        // Otorgar premio si contiene puntos
        int puntosGanados = premioGanador.getPuntos();
        if (puntosGanados > 0) {
            cliente.setGranipoints(cliente.getGranipoints() + puntosGanados);
            TransaccionPuntos trans = new TransaccionPuntos(
                    cliente.getId(),
                    cliente.getTelefono(),
                    cliente.getNombre(),
                    "RULETA",
                    puntosGanados,
                    cliente.getGranipoints(),
                    "🎡 Premio Ruleta Glacial: " + premioGanador.getTitulo(),
                    null
            );
            transaccionRepository.save(trans);
        }

        clienteRepository.save(cliente);

        ResultadoJuegoDTO res = new ResultadoJuegoDTO();
        res.setExito(true);
        res.setIndiceSector(indiceGanador);
        res.setPremio(premioGanador);
        res.setPuntosGanados(puntosGanados);
        res.setSaldoActual(cliente.getGranipoints());
        boolean puedeGirarProximo = !haJugadoEnPeriodo(cliente.getUltimaTiradaRuleta(), ahora, intervalo);
        res.setIntentosRestantes((puedeGirarProximo ? 1 : 0) + cliente.getGirosExtrasDisponibles());
        res.setMensaje(puntosGanados > 0
                ? "¡Felicidades! Has ganado " + premioGanador.getTitulo() + " (" + puntosGanados + " GraniPoints)."
                : "¡Casi! " + premioGanador.getTitulo() + ". ¡Vuelve pronto a probar tu suerte!");

        return res;
    }

    public synchronized ResultadoJuegoDTO jugarRaspaGana(String telefono) {
        ConfiguracionJuegos config = obtenerConfiguracion();
        if (!config.isRaspaActivo()) {
            return new ResultadoJuegoDTO(false, "El Raspa y Gana Glacial está pausado temporalmente.");
        }

        String telLimpio = telefono.replaceAll("[^0-9]", "").trim();
        Cliente cliente = clienteRepository.findByTelefono(telLimpio)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Date ahora = new Date();
        int intervalo = config.getDiasIntervaloIntentos();
        boolean yaRaspo = haJugadoEnPeriodo(cliente.getUltimoRaspaGana(), ahora, intervalo);
        boolean tieneRaspaPeriodica = !yaRaspo && config.getIntentosGratisRaspaDiarios() > 0;
        int extras = cliente.getRaspasExtrasDisponibles();

        if (!tieneRaspaPeriodica && extras <= 0) {
            String msg = (intervalo > 1)
                    ? "No tienes más raspadas disponibles. ¡Las raspas se renuevan cada " + intervalo + " días! También puedes ganar raspas extras con tus pedidos."
                    : "No tienes más raspadas hoy. ¡Vuelve mañana por tu raspa gratis o con tus pedidos!";
            return new ResultadoJuegoDTO(false, msg);
        }

        // Consumir intento
        if (tieneRaspaPeriodica) {
            cliente.setUltimoRaspaGana(ahora);
        } else {
            cliente.setRaspasExtrasDisponibles(extras - 1);
        }

        List<PremioJuego> premios = config.getPremiosRaspa();
        if (premios == null || premios.isEmpty()) {
            config.inicializarPremiosPorDefecto();
            config = configJuegosRepository.save(config);
            premios = config.getPremiosRaspa();
        }

        // Selección ponderada por peso
        int totalPeso = 0;
        for (PremioJuego p : premios) {
            totalPeso += Math.max(1, p.getPesoProbabilidad());
        }

        int randPeso = random.nextInt(totalPeso);
        int acumulado = 0;
        PremioJuego premioGanador = premios.get(0);

        for (PremioJuego p : premios) {
            acumulado += Math.max(1, p.getPesoProbabilidad());
            if (randPeso < acumulado) {
                premioGanador = p;
                break;
            }
        }

        int puntosGanados = premioGanador.getPuntos();
        if (puntosGanados > 0) {
            cliente.setGranipoints(cliente.getGranipoints() + puntosGanados);
            TransaccionPuntos trans = new TransaccionPuntos(
                    cliente.getId(),
                    cliente.getTelefono(),
                    cliente.getNombre(),
                    "RASPA_GANA",
                    puntosGanados,
                    cliente.getGranipoints(),
                    "🎫 Premio Raspa y Gana: " + premioGanador.getTitulo(),
                    null
            );
            transaccionRepository.save(trans);
        }

        clienteRepository.save(cliente);

        ResultadoJuegoDTO res = new ResultadoJuegoDTO();
        res.setExito(true);
        res.setPremio(premioGanador);
        res.setPuntosGanados(puntosGanados);
        res.setSaldoActual(cliente.getGranipoints());
        boolean puedeRasparProximo = !haJugadoEnPeriodo(cliente.getUltimoRaspaGana(), ahora, intervalo);
        res.setIntentosRestantes((puedeRasparProximo ? 1 : 0) + cliente.getRaspasExtrasDisponibles());
        res.setMensaje(puntosGanados > 0
                ? "¡Raspaste y Ganaste! " + premioGanador.getTitulo() + " (" + puntosGanados + " GraniPoints)."
                : premioGanador.getTitulo() + (intervalo > 1 ? ". ¡Inténtalo de nuevo en la próxima ronda!" : ". ¡Inténtalo de nuevo mañana!"));

        return res;
    }
}

