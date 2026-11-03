package com.granizados.app.controller;

import com.granizados.app.model.Pedido;
import com.granizados.app.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/pedidos")
@CrossOrigin(origins = "*")
public class AdminPedidoController {

    private final PedidoService pedidoService;

    public AdminPedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> listarPedidos(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.isBlank() && !"TODOS".equalsIgnoreCase(estado)) {
            return ResponseEntity.ok(pedidoService.listarPorEstado(estado.toUpperCase()));
        }
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String nuevoEstado = payload.get("estado");
        String notasAdmin = payload.get("notasAdmin");

        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El campo estado es obligatorio"));
        }

        return pedidoService.actualizarEstado(id, nuevoEstado.toUpperCase(), notasAdmin)
                .map(p -> ResponseEntity.ok(Map.of(
                        "exito", true,
                        "mensaje", "Estado del pedido actualizado a " + nuevoEstado,
                        "pedido", p
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPedido(@PathVariable String id) {
        if (pedidoService.eliminarPedido(id)) {
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Pedido eliminado correctamente"));
        }
        return ResponseEntity.notFound().build();
    }
}

