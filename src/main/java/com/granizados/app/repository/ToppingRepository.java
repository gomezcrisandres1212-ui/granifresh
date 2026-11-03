package com.granizados.app.repository;

import com.granizados.app.model.Topping;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToppingRepository extends MongoRepository<Topping, String> {
    List<Topping> findByActivoTrue();
    List<Topping> findByCategoriaAndActivoTrue(String categoria);
}

