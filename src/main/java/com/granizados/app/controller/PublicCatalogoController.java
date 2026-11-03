package com.granizados.app.controller;

import com.granizados.app.model.ConfiguracionNegocio;
import com.granizados.app.model.Granizado;
import com.granizados.app.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicCatalogoController {

    private final GranizadoRepository granizadoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ToppingRepository toppingRepository;
    private final BannerRepository bannerRepository;
    private final ConfiguracionNegocioRepository configuracionNegocioRepository;

    public PublicCatalogoController(GranizadoRepository granizadoRepository,
                                    CategoriaRepository categoriaRepository,
                                    ToppingRepository toppingRepository,
                                    BannerRepository bannerRepository,
                                    ConfiguracionNegocioRepository configuracionNegocioRepository) {
        this.granizadoRepository = granizadoRepository;
        this.categoriaRepository = categoriaRepository;
        this.toppingRepository = toppingRepository;
        this.bannerRepository = bannerRepository;
        this.configuracionNegocioRepository = configuracionNegocioRepository;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @GetMapping("/catalogo")
    public ResponseEntity<Map<String, Object>> obtenerCatalogoCompleto() {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("granizados", granizadoRepository.findByActivoTrueOrderByOrdenAsc());
        respuesta.put("categorias", categoriaRepository.findByActivoTrueOrderByOrdenAsc());
        respuesta.put("toppings", toppingRepository.findByActivoTrue());
        respuesta.put("banners", bannerRepository.findByActivoTrueOrderByOrdenAsc());
        respuesta.put("configuracion", configuracionNegocioRepository.findFirstByOrderByIdAsc()
                .orElseGet(ConfiguracionNegocio::new));
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/granizados")
    public ResponseEntity<List<Granizado>> listarGranizados(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String categoria) {
        if (tipo != null && !tipo.isBlank()) {
            return ResponseEntity.ok(granizadoRepository.findByTipoAndActivoTrueOrderByOrdenAsc(tipo.toUpperCase()));
        }
        if (categoria != null && !categoria.isBlank()) {
            return ResponseEntity.ok(granizadoRepository.findByCategoriaSlugAndActivoTrueOrderByOrdenAsc(categoria.toLowerCase()));
        }
        return ResponseEntity.ok(granizadoRepository.findByActivoTrueOrderByOrdenAsc());
    }

    @GetMapping("/toppings")
    public ResponseEntity<?> listarToppings() {
        return ResponseEntity.ok(toppingRepository.findByActivoTrue());
    }

    @GetMapping("/configuracion")
    public ResponseEntity<ConfiguracionNegocio> obtenerConfiguracion() {
        return ResponseEntity.ok(configuracionNegocioRepository.findFirstByOrderByIdAsc()
                .orElseGet(ConfiguracionNegocio::new));
    }
}

