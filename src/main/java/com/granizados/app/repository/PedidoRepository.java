package com.granizados.app.repository;

import com.granizados.app.model.Pedido;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends MongoRepository<Pedido, String> {
    Optional<Pedido> findByCodigoPedido(String codigoPedido);
    List<Pedido> findByEstadoOrderByFechaCreacionDesc(String estado);
    List<Pedido> findAllByOrderByFechaCreacionDesc();
    List<Pedido> findByClienteTelefonoOrderByFechaCreacionDesc(String clienteTelefono);
    List<Pedido> findByFechaCreacionBetween(Date fechaInicio, Date fechaFin);
    long countByEstado(String estado);
}

