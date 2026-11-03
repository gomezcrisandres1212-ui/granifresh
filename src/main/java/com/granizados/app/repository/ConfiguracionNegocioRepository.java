package com.granizados.app.repository;

import com.granizados.app.model.ConfiguracionNegocio;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionNegocioRepository extends MongoRepository<ConfiguracionNegocio, String> {
    Optional<ConfiguracionNegocio> findFirstByOrderByIdAsc();
}

