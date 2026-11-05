package com.granizados.app.controller;

import com.granizados.app.model.Administrador;
import com.granizados.app.repository.AdministradorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/usuarios")
@CrossOrigin(origins = "*")
public class AdminUsuarioController {

    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUsuarioController(AdministradorRepository administradorRepository,
                                  PasswordEncoder passwordEncoder) {
        this.administradorRepository = administradorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarAdministradores() {
        List<Map<String, Object>> lista = administradorRepository.findAll().stream().map(admin -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", admin.getId());
            dto.put("usuario", admin.getUsuario());
            dto.put("nombreCompleto", admin.getNombreCompleto());
            dto.put("rol", admin.getRol());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<?> crearAdministrador(@RequestBody Map<String, String> body) {
        String usuario = body.get("usuario") != null ? body.get("usuario").trim() : "";
        String contrasena = body.get("contrasena") != null ? body.get("contrasena").trim() : "";
        String nombreCompleto = body.get("nombreCompleto") != null ? body.get("nombreCompleto").trim() : "";

        if (usuario.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El usuario es obligatorio."));
        }
        if (contrasena.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña es obligatoria."));
        }
        if (contrasena.length() < 4) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 4 caracteres."));
        }
        if (administradorRepository.findByUsuario(usuario).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un administrador con el usuario '" + usuario + "'."));
        }

        if (nombreCompleto.isEmpty()) {
            nombreCompleto = "Administrador " + usuario;
        }

        Administrador nuevo = new Administrador(usuario, passwordEncoder.encode(contrasena), nombreCompleto);
        administradorRepository.save(nuevo);

        return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "Administrador '" + usuario + "' creado exitosamente."
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarAdministrador(@PathVariable String id) {
        if (administradorRepository.count() <= 1) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes eliminar el único administrador del sistema."));
        }

        return administradorRepository.findById(id).map(admin -> {
            administradorRepository.delete(admin);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Administrador eliminado correctamente."));
        }).orElse(ResponseEntity.notFound().build());
    }
}

