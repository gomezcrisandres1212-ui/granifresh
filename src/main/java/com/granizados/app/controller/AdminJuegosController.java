package com.granizados.app.controller;

import com.granizados.app.model.ConfiguracionJuegos;
import com.granizados.app.service.JuegoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/juegos")
@CrossOrigin(origins = "*")
public class AdminJuegosController {

    private final JuegoService juegoService;

    public AdminJuegosController(JuegoService juegoService) {
        this.juegoService = juegoService;
    }

    @GetMapping("/config")
    public ResponseEntity<ConfiguracionJuegos> obtenerConfiguracion() {
        return ResponseEntity.ok(juegoService.obtenerConfiguracion());
    }

    @PutMapping("/config")
    public ResponseEntity<ConfiguracionJuegos> guardarConfiguracion(@RequestBody ConfiguracionJuegos config) {
        return ResponseEntity.ok(juegoService.guardarConfiguracion(config));
    }
}

