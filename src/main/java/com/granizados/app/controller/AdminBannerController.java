package com.granizados.app.controller;

import com.granizados.app.model.Banner;
import com.granizados.app.repository.BannerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/banners")
@CrossOrigin(origins = "*")
public class AdminBannerController {

    private final BannerRepository bannerRepository;

    public AdminBannerController(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    @GetMapping
    public ResponseEntity<List<Banner>> listarBanners() {
        return ResponseEntity.ok(bannerRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> crearBanner(@RequestBody Banner banner) {
        Banner guardado = bannerRepository.save(banner);
        return ResponseEntity.ok(Map.of("exito", true, "banner", guardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarBanner(@PathVariable String id, @RequestBody Banner datos) {
        return bannerRepository.findById(id).map(b -> {
            b.setTitulo(datos.getTitulo());
            b.setSubtitulo(datos.getSubtitulo());
            b.setEtiquetaBadge(datos.getEtiquetaBadge());
            b.setImagenUrl(datos.getImagenUrl());
            b.setTextoBoton(datos.getTextoBoton());
            b.setEnlace(datos.getEnlace());
            b.setActivo(datos.isActivo());
            b.setOrden(datos.getOrden());
            Banner guardado = bannerRepository.save(b);
            return ResponseEntity.ok(Map.of("exito", true, "banner", guardado));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarBanner(@PathVariable String id) {
        if (bannerRepository.existsById(id)) {
            bannerRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Banner eliminado"));
        }
        return ResponseEntity.notFound().build();
    }
}

