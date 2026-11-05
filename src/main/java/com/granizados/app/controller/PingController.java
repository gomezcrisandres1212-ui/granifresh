package com.granizados.app.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PingController {

    @RequestMapping(value = "/ping", method = { RequestMethod.GET, RequestMethod.HEAD })
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_PLAIN_VALUE)
                .contentLength(4)
                .body("pong");
    }

    @RequestMapping(value = "/health", method = { RequestMethod.GET, RequestMethod.HEAD })
    public ResponseEntity<Void> health() {
        return ResponseEntity.noContent().build();
    }
}
