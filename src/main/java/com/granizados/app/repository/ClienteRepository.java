package com.granizados.app.repository;

import com.granizados.app.model.Cliente;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends MongoRepository<Cliente, String> {
    Optional<Cliente> findByTelefono(String telefono);
    boolean existsByTelefono(String telefono);
    List<Cliente> findAllByOrderByFechaRegistroDesc();
    List<Cliente> findByNombreContainingIgnoreCaseOrTelefonoContaining(String nombre, String telefono);
}

