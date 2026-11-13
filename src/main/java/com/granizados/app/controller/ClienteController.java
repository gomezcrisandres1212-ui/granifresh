package com.granizados.app.controller;

import com.granizados.app.dto.ClienteLoginDTO;
import com.granizados.app.dto.ClienteRegistroDTO;
import com.granizados.app.dto.ClienteResponseDTO;
import com.granizados.app.dto.EstadoJuegosDTO;
import com.granizados.app.dto.ResultadoJuegoDTO;
import com.granizados.app.model.Cliente;
import com.granizados.app.model.ConfiguracionJuegos;
import com.granizados.app.model.TransaccionPuntos;
import com.granizados.app.service.ClienteService;
import com.granizados.app.service.JuegoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cliente")
@CrossOrigin(origins = "*")
public class ClienteController {

    private final ClienteService clienteService;
    private final JuegoService juegoService;

    public ClienteController(ClienteService clienteService, JuegoService juegoService) {
        this.clienteService = clienteService;
        this.juegoService = juegoService;
    }

    private String obtenerTelefonoAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return auth.getName();
    }

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    @PostMapping("/auth/registro")
    public ResponseEntity<ClienteResponseDTO> registrar(@RequestBody ClienteRegistroDTO dto) {
        ClienteResponseDTO res = clienteService.registrar(dto);
        if (!res.isExito()) {
            return ResponseEntity.badRequest().body(res);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ClienteResponseDTO> login(@RequestBody ClienteLoginDTO dto) {
        ClienteResponseDTO res = clienteService.login(dto);
        if (!res.isExito()) {
            return ResponseEntity.status(401).body(res);
        }
        return ResponseEntity.ok(res);
    }

    // ==========================================
    // PERFIL & PUNTOS
    // ==========================================
    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil() {
        String telefono = obtenerTelefonoAutenticado();
        if (telefono == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        }
        return clienteService.obtenerPorTelefono(telefono)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/perfil")
    public ResponseEntity<?> actualizarPerfil(@RequestBody ClienteRegistroDTO dto) {
        String telefono = obtenerTelefonoAutenticado();
        if (telefono == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        }
        try {
            Cliente actualizado = clienteService.actualizarPerfil(telefono, dto);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/historial-puntos")
    public ResponseEntity<?> obtenerHistorialPuntos() {
        String telefono = obtenerTelefonoAutenticado();
        if (telefono == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        }
        return clienteService.obtenerPorTelefono(telefono)
                .map(c -> {
                    List<TransaccionPuntos> hist = clienteService.obtenerHistorialPuntos(c.getId());
                    return ResponseEntity.ok(hist);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // JUEGOS Y DINÁMICAS (RULETA & RASPA Y GANA)
    // ==========================================
    @GetMapping("/config-publica")
    public ResponseEntity<?> obtenerConfigPublica() {
        ConfiguracionJuegos config = juegoService.obtenerConfiguracion();
        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("ruletaActiva", config.isRuletaActiva());
        resp.put("raspaActivo", config.isRaspaActivo());
        resp.put("premiosRuleta", config.getPremiosRuleta());
        resp.put("premiosRaspa", config.getPremiosRaspa());
        resp.put("puntosBienvenida", config.getPuntosBienvenidaRegistro());
        resp.put("valorPesosPorPunto", config.getValorPesosPorPunto());
        resp.put("puntosMinimosCanje", config.getPuntosMinimosCanje());
        resp.put("maximoPorcentajeDescuentoPedido", config.getMaximoPorcentajeDescuentoPedido());
        resp.put("canjePorGranizadoHabilitado", config.isCanjePorGranizadoHabilitado());
        resp.put("puntosParaGranizadoGratis", config.getPuntosParaGranizadoGratis());
        resp.put("canjePorToppingHabilitado", config.isCanjePorToppingHabilitado());
        resp.put("puntosParaToppingGratis", config.getPuntosParaToppingGratis());
        resp.put("acumularPuntosPorCompra", config.isAcumularPuntosPorCompra());
        resp.put("modoPuntosCompra", config.getModoPuntosCompra());
        resp.put("pesosPorPuntoAcumulado", config.getPesosPorPuntoAcumulado());
        resp.put("puntosFijosPorCompra", config.getPuntosFijosPorCompra());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/juegos/estado")
    public ResponseEntity<?> obtenerEstadoJuegos() {
        String telefono = obtenerTelefonoAutenticado();
        if (telefono == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Debes iniciar sesión para jugar."));
        }
        try {
            EstadoJuegosDTO estado = juegoService.obtenerEstadoJuegos(telefono);
            return ResponseEntity.ok(estado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/juegos/ruleta/girar")
    public ResponseEntity<?> girarRuleta() {
        String telefono = obtenerTelefonoAutenticado();
        if (telefono == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Inicia sesión para girar la Ruleta Glacial."));
        }
        ResultadoJuegoDTO res = juegoService.girarRuleta(telefono);
        if (!res.isExito()) {
            return ResponseEntity.badRequest().body(res);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/juegos/raspa/jugar")
    public ResponseEntity<?> jugarRaspa() {
        String telefono = obtenerTelefonoAutenticado();
        if (telefono == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Inicia sesión para raspar tu tarjeta."));
        }
        ResultadoJuegoDTO res = juegoService.jugarRaspaGana(telefono);
        if (!res.isExito()) {
            return ResponseEntity.badRequest().body(res);
        }
        return ResponseEntity.ok(res);
    }
}

