package com.granizados.app.controller;

import com.granizados.app.model.Pedido;
import com.granizados.app.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/pedidos")
@CrossOrigin(origins = "*")
public class PublicPedidoController {

    private final PedidoService pedidoService;

    public PublicPedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<?> registrarPedido(@RequestBody Pedido pedido) {
        if (pedido.getClienteNombre() == null || pedido.getClienteNombre().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre del cliente es obligatorio"));
        }
        if (pedido.getClienteTelefono() == null || pedido.getClienteTelefono().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El teléfono de contacto es obligatorio"));
        }
        if (pedido.getClienteDireccion() == null || pedido.getClienteDireccion().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "La dirección de entrega es obligatoria"));
        }
        if (pedido.getItems() == null || pedido.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El pedido debe contener al menos un granizado"));
        }

        Pedido guardado = pedidoService.crearPedido(pedido);
        return ResponseEntity.ok(Map.of(
                "exito", true,
                "mensaje", "¡Pedido recibido con éxito! Tus granizados entrarán a congelador y batido de inmediato.",
                "codigoPedido", guardado.getCodigoPedido(),
                "pedido", guardado
        ));
    }

    @GetMapping("/rastreo/{codigo}")
    public ResponseEntity<?> rastrearPedido(@PathVariable String codigo) {
        return pedidoService.buscarPorCodigo(codigo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

