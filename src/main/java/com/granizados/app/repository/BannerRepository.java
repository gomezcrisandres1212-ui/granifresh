package com.granizados.app.repository;

import com.granizados.app.model.Banner;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends MongoRepository<Banner, String> {
    List<Banner> findByActivoTrueOrderByOrdenAsc();
}

