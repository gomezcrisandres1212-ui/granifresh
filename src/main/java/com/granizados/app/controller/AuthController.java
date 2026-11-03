package com.granizados.app.controller;

import com.granizados.app.dto.LoginRequest;
import com.granizados.app.dto.LoginResponse;
import com.granizados.app.repository.AdministradorRepository;
import com.granizados.app.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(AdministradorRepository administradorRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.administradorRepository = administradorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String usuario = request.getUsuario() != null ? request.getUsuario().trim() : "";
        String contrasena = request.getContrasena() != null ? request.getContrasena() : "";

        return administradorRepository.findByUsuario(usuario)
                .filter(admin -> passwordEncoder.matches(contrasena, admin.getContrasenaHash()))
                .map(admin -> {
                    String token = jwtService.generarToken(admin.getUsuario());
                    return ResponseEntity.ok(new LoginResponse(
                            true,
                            token,
                            admin.getUsuario(),
                            admin.getNombreCompleto(),
                            "Autenticación exitosa. ¡Bienvenido al panel FROST!"
                    ));
                })
                .orElse(ResponseEntity.ok(new LoginResponse(
                        false,
                        null,
                        null,
                        null,
                        "Usuario o contraseña incorrectos."
                )));
    }

    @GetMapping("/me")
    public ResponseEntity<?> obtenerUsuarioActual(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        }
        String token = authHeader.substring(7);
        if (!jwtService.validarToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Token inválido o expirado"));
        }
        String username = jwtService.extraerUsuario(token);
        return administradorRepository.findByUsuario(username)
                .map(admin -> ResponseEntity.ok(Map.of(
                        "usuario", admin.getUsuario(),
                        "nombreCompleto", admin.getNombreCompleto(),
                        "rol", admin.getRol()
                )))
                .orElse(ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado")));
    }
}

