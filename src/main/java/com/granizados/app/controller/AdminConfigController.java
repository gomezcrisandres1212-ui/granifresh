package com.granizados.app.controller;

import com.granizados.app.model.ConfiguracionNegocio;
import com.granizados.app.repository.ConfiguracionNegocioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/configuracion")
@CrossOrigin(origins = "*")
public class AdminConfigController {

    private final ConfiguracionNegocioRepository configRepository;

    public AdminConfigController(ConfiguracionNegocioRepository configRepository) {
        this.configRepository = configRepository;
    }

    @GetMapping
    public ResponseEntity<ConfiguracionNegocio> obtenerConfiguracion() {
        return ResponseEntity.ok(configRepository.findFirstByOrderByIdAsc()
                .orElseGet(ConfiguracionNegocio::new));
    }

    @PutMapping
    public ResponseEntity<?> guardarConfiguracion(@RequestBody ConfiguracionNegocio datos) {
        ConfiguracionNegocio config = configRepository.findFirstByOrderByIdAsc()
                .orElseGet(ConfiguracionNegocio::new);

        config.setNombreNegocio(datos.getNombreNegocio());
        config.setSlogan(datos.getSlogan());
        config.setWhatsappPedidos(datos.getWhatsappPedidos());
        config.setTelefonoContacto(datos.getTelefonoContacto());
        config.setDireccionSede(datos.getDireccionSede());
        config.setHorarioAtencion(datos.getHorarioAtencion());
        config.setAbiertoParaPedidos(datos.isAbiertoParaPedidos());
        config.setCostoEnvioBase(datos.getCostoEnvioBase());
        config.setPedidoMinimo(datos.getPedidoMinimo());
        config.setNumeroNequi(datos.getNumeroNequi());
        config.setNumeroDaviplata(datos.getNumeroDaviplata());
        config.setCuentaBancolombia(datos.getCuentaBancolombia());
        config.setMensajeAlertaSuperior(datos.getMensajeAlertaSuperior());
        config.setInstagramUrl(datos.getInstagramUrl());
        config.setFacebookUrl(datos.getFacebookUrl());
        if (datos.getLatitud() != null) config.setLatitud(datos.getLatitud());
        if (datos.getLongitud() != null) config.setLongitud(datos.getLongitud());
        if (datos.getZoomMapa() != null) config.setZoomMapa(datos.getZoomMapa());
        if (datos.getHistoriaNosotros() != null) config.setHistoriaNosotros(datos.getHistoriaNosotros());

        ConfiguracionNegocio guardado = configRepository.save(config);
        return ResponseEntity.ok(Map.of("exito", true, "configuracion", guardado));
    }
}

