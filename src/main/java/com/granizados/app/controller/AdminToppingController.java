package com.granizados.app.controller;

import com.granizados.app.model.Topping;
import com.granizados.app.repository.ToppingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/toppings")
@CrossOrigin(origins = "*")
public class AdminToppingController {

    private final ToppingRepository toppingRepository;

    public AdminToppingController(ToppingRepository toppingRepository) {
        this.toppingRepository = toppingRepository;
    }

    @GetMapping
    public ResponseEntity<List<Topping>> listarTodos() {
        return ResponseEntity.ok(toppingRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> crearTopping(@RequestBody Topping topping) {
        Topping guardado = toppingRepository.save(topping);
        return ResponseEntity.ok(Map.of("exito", true, "topping", guardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarTopping(@PathVariable String id, @RequestBody Topping datos) {
        return toppingRepository.findById(id).map(t -> {
            t.setNombre(datos.getNombre());
            t.setCategoria(datos.getCategoria());
            t.setPrecio(datos.getPrecio());
            t.setDescripcion(datos.getDescripcion());
            t.setActivo(datos.isActivo());
            t.setAptoParaTodo(datos.isAptoParaTodo());
            Topping actualizado = toppingRepository.save(t);
            return ResponseEntity.ok(Map.of("exito", true, "topping", actualizado));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarTopping(@PathVariable String id) {
        if (toppingRepository.existsById(id)) {
            toppingRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Topping eliminado"));
        }
        return ResponseEntity.notFound().build();
    }
}

