package com.granizados.app.controller;

import com.granizados.app.model.Granizado;
import com.granizados.app.repository.GranizadoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/granizados")
@CrossOrigin(origins = "*")
public class AdminGranizadoController {

    private final GranizadoRepository granizadoRepository;

    public AdminGranizadoController(GranizadoRepository granizadoRepository) {
        this.granizadoRepository = granizadoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Granizado>> listarTodos() {
        return ResponseEntity.ok(granizadoRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> crearGranizado(@RequestBody Granizado granizado) {
        if (granizado.getNombre() == null || granizado.getNombre().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre es obligatorio"));
        }
        if (granizado.getPreciosPorTamano() == null || granizado.getPreciosPorTamano().isEmpty()) {
            if (granizado.getPrecioBase() > 0) {
                granizado.setPreciosPorTamano(Map.of("12oz", granizado.getPrecioBase()));
            }
        }
        Granizado guardado = granizadoRepository.save(granizado);
        return ResponseEntity.ok(Map.of("exito", true, "granizado", guardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarGranizado(@PathVariable String id, @RequestBody Granizado datos) {
        return granizadoRepository.findById(id).map(g -> {
            g.setNombre(datos.getNombre());
            g.setDescripcion(datos.getDescripcion());
            g.setCategoriaSlug(datos.getCategoriaSlug());
            g.setTipo(datos.getTipo());
            g.setGraduacionAlcohol(datos.getGraduacionAlcohol());
            g.setLicorBase(datos.getLicorBase());
            g.setPrecioBase(datos.getPrecioBase());
            g.setPreciosPorTamano(datos.getPreciosPorTamano());
            g.setImagenUrl(datos.getImagenUrl());
            g.setInsignia(datos.getInsignia());
            g.setColoresGradiente(datos.getColoresGradiente());
            g.setIngredientes(datos.getIngredientes());
            g.setDestacado(datos.isDestacado());
            g.setActivo(datos.isActivo());
            g.setStockDisponible(datos.getStockDisponible());
            g.setOrden(datos.getOrden());
            g.setAjusteImagen(datos.getAjusteImagen());
            Granizado actualizado = granizadoRepository.save(g);
            return ResponseEntity.ok(Map.of("exito", true, "granizado", actualizado));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle-activo")
    public ResponseEntity<?> toggleActivo(@PathVariable String id) {
        return granizadoRepository.findById(id).map(g -> {
            g.setActivo(!g.isActivo());
            granizadoRepository.save(g);
            return ResponseEntity.ok(Map.of("exito", true, "activo", g.isActivo()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarGranizado(@PathVariable String id) {
        if (granizadoRepository.existsById(id)) {
            granizadoRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Granizado eliminado"));
        }
        return ResponseEntity.notFound().build();
    }
}

