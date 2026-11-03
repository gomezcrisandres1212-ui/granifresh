package com.granizados.app.repository;

import com.granizados.app.model.Granizado;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GranizadoRepository extends MongoRepository<Granizado, String> {
    List<Granizado> findByActivoTrueOrderByOrdenAsc();
    List<Granizado> findByCategoriaSlugAndActivoTrueOrderByOrdenAsc(String categoriaSlug);
    List<Granizado> findByTipoAndActivoTrueOrderByOrdenAsc(String tipo);
    List<Granizado> findByDestacadoTrueAndActivoTrueOrderByOrdenAsc();
}

