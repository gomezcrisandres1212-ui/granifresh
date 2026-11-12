package com.granizados.app.repository;

import com.granizados.app.model.TransaccionPuntos;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransaccionPuntosRepository extends MongoRepository<TransaccionPuntos, String> {
    List<TransaccionPuntos> findByClienteIdOrderByFechaDesc(String clienteId);
    List<TransaccionPuntos> findAllByOrderByFechaDesc();
}

