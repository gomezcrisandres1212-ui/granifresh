package com.granizados.app.service;

import com.granizados.app.dto.AjustePuntosDTO;
import com.granizados.app.dto.ClienteLoginDTO;
import com.granizados.app.dto.ClienteRegistroDTO;
import com.granizados.app.dto.ClienteResponseDTO;
import com.granizados.app.model.Cliente;
import com.granizados.app.model.ConfiguracionJuegos;
import com.granizados.app.model.TransaccionPuntos;
import com.granizados.app.repository.ClienteRepository;
import com.granizados.app.repository.ConfiguracionJuegosRepository;
import com.granizados.app.repository.TransaccionPuntosRepository;
import com.granizados.app.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final TransaccionPuntosRepository transaccionRepository;
    private final ConfiguracionJuegosRepository configJuegosRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ClienteService(ClienteRepository clienteRepository,
                          TransaccionPuntosRepository transaccionRepository,
                          ConfiguracionJuegosRepository configJuegosRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.clienteRepository = clienteRepository;
        this.transaccionRepository = transaccionRepository;
        this.configJuegosRepository = configJuegosRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public ClienteResponseDTO registrar(ClienteRegistroDTO dto) {
        if (dto.getTelefono() == null || dto.getTelefono().trim().length() < 7) {
            return new ClienteResponseDTO(false, null, "Por favor ingresa un número de WhatsApp / teléfono válido.", null);
        }
        if (dto.getNombre() == null || dto.getNombre().trim().length() < 2) {
            return new ClienteResponseDTO(false, null, "Por favor ingresa tu nombre completo.", null);
        }
        if (dto.getContrasena() == null || dto.getContrasena().trim().length() < 4) {
            return new ClienteResponseDTO(false, null, "La contraseña debe tener al menos 4 caracteres.", null);
        }

        String telLimpio = dto.getTelefono().replaceAll("[^0-9]", "").trim();
        if (clienteRepository.existsByTelefono(telLimpio)) {
            return new ClienteResponseDTO(false, null, "Ya existe una cuenta con este número de WhatsApp. ¡Inicia sesión!", null);
        }

        ConfiguracionJuegos config = configJuegosRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> configJuegosRepository.save(new ConfiguracionJuegos()));

        Cliente cliente = new Cliente();
        cliente.setTelefono(telLimpio);
        cliente.setNombre(dto.getNombre().trim());
        cliente.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
        cliente.setContrasenaHash(passwordEncoder.encode(dto.getContrasena().trim()));
        cliente.setDireccionPredeterminada(dto.getDireccion() != null ? dto.getDireccion().trim() : null);
        cliente.setBarrioPredeterminado(dto.getBarrio() != null ? dto.getBarrio().trim() : null);
        cliente.setIndicacionesPredeterminadas(dto.getIndicaciones() != null ? dto.getIndicaciones().trim() : null);

        int puntosBienvenida = config.getPuntosBienvenidaRegistro();
        cliente.setGranipoints(puntosBienvenida);

        Cliente guardado = clienteRepository.save(cliente);

        if (puntosBienvenida > 0) {
            TransaccionPuntos trans = new TransaccionPuntos(
                    guardado.getId(),
                    guardado.getTelefono(),
                    guardado.getNombre(),
                    "REGALO_BIENVENIDA",
                    puntosBienvenida,
                    puntosBienvenida,
                    "🎉 ¡Bienvenido a GraniFresh! Regalo inicial de bienvenida en GraniPoints.",
                    null
            );
            transaccionRepository.save(trans);
        }

        String token = jwtService.generarToken(guardado.getTelefono(), "ROLE_CLIENTE");
        guardado.setContrasenaHash(null); // Ocultar hash

        return new ClienteResponseDTO(true, token, "¡Cuenta creada exitosamente! Has recibido tus GraniPoints de bienvenida.", guardado);
    }

    public ClienteResponseDTO login(ClienteLoginDTO dto) {
        if (dto.getTelefono() == null || dto.getContrasena() == null) {
            return new ClienteResponseDTO(false, null, "Número y contraseña requeridos.", null);
        }

        String telLimpio = dto.getTelefono().replaceAll("[^0-9]", "").trim();
        Optional<Cliente> opt = clienteRepository.findByTelefono(telLimpio);

        if (opt.isEmpty() || !passwordEncoder.matches(dto.getContrasena(), opt.get().getContrasenaHash())) {
            return new ClienteResponseDTO(false, null, "Número o contraseña incorrectos.", null);
        }

        Cliente cliente = opt.get();
        if (!cliente.isActivo()) {
            return new ClienteResponseDTO(false, null, "Esta cuenta ha sido pausada. Contacta al administrador.", null);
        }

        cliente.setUltimoLogin(new Date());
        clienteRepository.save(cliente);

        String token = jwtService.generarToken(cliente.getTelefono(), "ROLE_CLIENTE");
        cliente.setContrasenaHash(null);

        return new ClienteResponseDTO(true, token, "¡Bienvenido de vuelta a GraniFresh!", cliente);
    }

    public Optional<Cliente> obtenerPorTelefono(String telefono) {
        if (telefono == null) return Optional.empty();
        String telLimpio = telefono.replaceAll("[^0-9]", "").trim();
        return clienteRepository.findByTelefono(telLimpio).map(c -> {
            c.setContrasenaHash(null);
            return c;
        });
    }

    public Optional<Cliente> obtenerPorId(String id) {
        return clienteRepository.findById(id).map(c -> {
            c.setContrasenaHash(null);
            return c;
        });
    }

    public Cliente actualizarPerfil(String telefono, ClienteRegistroDTO dto) {
        String telLimpio = telefono.replaceAll("[^0-9]", "").trim();
        Cliente cliente = clienteRepository.findByTelefono(telLimpio)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) cliente.setNombre(dto.getNombre().trim());
        if (dto.getEmail() != null) cliente.setEmail(dto.getEmail().trim());
        if (dto.getDireccion() != null) cliente.setDireccionPredeterminada(dto.getDireccion().trim());
        if (dto.getBarrio() != null) cliente.setBarrioPredeterminado(dto.getBarrio().trim());
        if (dto.getIndicaciones() != null) cliente.setIndicacionesPredeterminadas(dto.getIndicaciones().trim());

        if (dto.getContrasena() != null && dto.getContrasena().trim().length() >= 4) {
            cliente.setContrasenaHash(passwordEncoder.encode(dto.getContrasena().trim()));
        }

        Cliente guardado = clienteRepository.save(cliente);
        guardado.setContrasenaHash(null);
        return guardado;
    }

    // ==========================================
    // MÉTODOS EXCLUSIVOS DE ADMINISTRACIÓN
    // ==========================================
    public List<Cliente> listarClientesAdmin(String buscar) {
        List<Cliente> lista;
        if (buscar != null && !buscar.isBlank()) {
            lista = clienteRepository.findByNombreContainingIgnoreCaseOrTelefonoContaining(buscar.trim(), buscar.trim());
        } else {
            lista = clienteRepository.findAllByOrderByFechaRegistroDesc();
        }
        lista.forEach(c -> c.setContrasenaHash(null));
        return lista;
    }

    public Cliente ajustarPuntosAdmin(String clienteId, AjustePuntosDTO dto) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + clienteId));

        int puntosAjuste = dto.getPuntos();
        int saldoActual = cliente.getGranipoints();
        int nuevoSaldo = Math.max(0, saldoActual + puntosAjuste);
        int deltaReal = nuevoSaldo - saldoActual;

        cliente.setGranipoints(nuevoSaldo);
        Cliente guardado = clienteRepository.save(cliente);

        String motivo = dto.getMotivo() != null && !dto.getMotivo().isBlank()
                ? dto.getMotivo().trim()
                : "Ajuste manual de GraniPoints por el Administrador";

        TransaccionPuntos trans = new TransaccionPuntos(
                guardado.getId(),
                guardado.getTelefono(),
                guardado.getNombre(),
                "AJUSTE_ADMIN",
                deltaReal,
                nuevoSaldo,
                "⚙️ " + motivo,
                null
        );
        transaccionRepository.save(trans);

        guardado.setContrasenaHash(null);
        return guardado;
    }

    public List<TransaccionPuntos> obtenerHistorialPuntos(String clienteId) {
        return transaccionRepository.findByClienteIdOrderByFechaDesc(clienteId);
    }

    public List<TransaccionPuntos> listarTodasTransaccionesAdmin() {
        return transaccionRepository.findAllByOrderByFechaDesc();
    }
}

