package com.granizados.app.controller;

import com.granizados.app.model.Categoria;
import com.granizados.app.repository.CategoriaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/categorias")
@CrossOrigin(origins = "*")
public class AdminCategoriaController {

    private final CategoriaRepository categoriaRepository;

    public AdminCategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public ResponseEntity<List<Categoria>> listarCategorias() {
        List<Categoria> lista = categoriaRepository.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<?> guardarCategoria(@RequestBody Categoria categoria) {
        if (categoria.getNombre() == null || categoria.getNombre().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre de la categoría es obligatorio"));
        }
        if (categoria.getSlug() == null || categoria.getSlug().isBlank()) {
            String slug = categoria.getNombre().toLowerCase()
                    .replaceAll("[^a-z0-9\\s-]", "")
                    .replaceAll("\\s+", "-");
            categoria.setSlug(slug);
        }

        Optional<Categoria> existente = categoriaRepository.findBySlug(categoria.getSlug());
        if (existente.isPresent()) {
            Categoria c = existente.get();
            c.setNombre(categoria.getNombre());
            c.setActivo(true);
            Categoria guardada = categoriaRepository.save(c);
            return ResponseEntity.ok(Map.of("exito", true, "categoria", guardada));
        }

        categoria.setActivo(true);
        if (categoria.getOrden() == 0) {
            categoria.setOrden((int) categoriaRepository.count() + 1);
        }
        Categoria guardada = categoriaRepository.save(categoria);
        return ResponseEntity.ok(Map.of("exito", true, "categoria", guardada));
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<?> eliminarCategoria(@PathVariable String slug) {
        Optional<Categoria> existente = categoriaRepository.findBySlug(slug);
        if (existente.isPresent()) {
            categoriaRepository.delete(existente.get());
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Categoría eliminada"));
        }
        return ResponseEntity.notFound().build();
    }
}

