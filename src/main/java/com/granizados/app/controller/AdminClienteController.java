package com.granizados.app.controller;

import com.granizados.app.dto.AjustePuntosDTO;
import com.granizados.app.model.Cliente;
import com.granizados.app.model.TransaccionPuntos;
import com.granizados.app.service.ClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/clientes")
@CrossOrigin(origins = "*")
public class AdminClienteController {

    private final ClienteService clienteService;

    public AdminClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarClientes(@RequestParam(required = false) String buscar) {
        return ResponseEntity.ok(clienteService.listarClientesAdmin(buscar));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerCliente(@PathVariable String id) {
        return clienteService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/puntos")
    public ResponseEntity<?> ajustarPuntos(@PathVariable String id, @RequestBody AjustePuntosDTO dto) {
        try {
            Cliente actualizado = clienteService.ajustarPuntosAdmin(id, dto);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<List<TransaccionPuntos>> obtenerHistorialCliente(@PathVariable String id) {
        return ResponseEntity.ok(clienteService.obtenerHistorialPuntos(id));
    }

    @GetMapping("/transacciones")
    public ResponseEntity<List<TransaccionPuntos>> listarTodasTransacciones() {
        return ResponseEntity.ok(clienteService.listarTodasTransaccionesAdmin());
    }

    @GetMapping("/resumen")
    public ResponseEntity<?> obtenerResumen() {
        List<Cliente> clientes = clienteService.listarClientesAdmin(null);
        int totalClientes = clientes.size();
        int totalPuntos = clientes.stream().mapToInt(Cliente::getGranipoints).sum();

        List<TransaccionPuntos> trans = clienteService.listarTodasTransaccionesAdmin();
        long totalTransacciones = trans.size();
        int totalCanjeados = trans.stream()
                .filter(t -> "CANJE_CHECKOUT".equals(t.getTipo()))
                .mapToInt(t -> Math.abs(t.getPuntos()))
                .sum();

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalClientes", totalClientes);
        resumen.put("totalPuntosCirculacion", totalPuntos);
        resumen.put("totalTransacciones", totalTransacciones);
        resumen.put("totalPuntosCanjeados", totalCanjeados);

        return ResponseEntity.ok(resumen);
    }
}

