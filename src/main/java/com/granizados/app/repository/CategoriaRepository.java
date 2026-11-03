package com.granizados.app.repository;

import com.granizados.app.model.Categoria;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends MongoRepository<Categoria, String> {
    Optional<Categoria> findBySlug(String slug);
    List<Categoria> findByActivoTrueOrderByOrdenAsc();
}

