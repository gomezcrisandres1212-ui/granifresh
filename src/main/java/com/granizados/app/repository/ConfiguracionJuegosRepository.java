package com.granizados.app.repository;

import com.granizados.app.model.ConfiguracionJuegos;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionJuegosRepository extends MongoRepository<ConfiguracionJuegos, String> {
    Optional<ConfiguracionJuegos> findFirstByOrderByIdAsc();
}

