package com.granizados.app.config;

import com.granizados.app.model.*;
import com.granizados.app.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Value("${granizados.admin.initial-password:admin123}")
    private String adminPassword;

    @Value("${granizados.seed.demo-data:true}")
    private boolean seedDemoData;

    @Bean
    public CommandLineRunner initData(
            AdministradorRepository adminRepo,
            CategoriaRepository categoriaRepo,
            GranizadoRepository granizadoRepo,
            ToppingRepository toppingRepo,
            BannerRepository bannerRepo,
            ConfiguracionNegocioRepository configRepo,
            PedidoRepository pedidoRepo,
            PasswordEncoder passwordEncoder) {

        return args -> {
            log.info("--- INICIALIZANDO DATOS FROST GLACIAL (100% FRUTA NATURAL) ---");

            // 1. Administrador Inicial
            if (adminRepo.findByUsuario("admin").isEmpty()) {
                Administrador admin = new Administrador("admin", passwordEncoder.encode(adminPassword), "Administrador Maestro");
                adminRepo.save(admin);
                log.info("-> Administrador creado: 'admin' con clave inicial.");
            }

            // 2. Configuración de Negocio Inicial (SOLO SI NO EXISTE)
            Optional<ConfiguracionNegocio> optConfig = configRepo.findFirstByOrderByIdAsc();
            if (optConfig.isEmpty()) {
                ConfiguracionNegocio config = new ConfiguracionNegocio();
                config.setNombreNegocio("GRANIFRESH");
                config.setSlogan("FULL SABOR, FULL FRESCURA");
                config.setWhatsappPedidos("573013557467");
                config.setMensajeAlertaSuperior("🍃 ¡Granifresh! Granizados 100% fruta natural artesanal a domicilio · ⚡ Entrega en 35 min con empaque térmico antifusión");
                configRepo.save(config);
                log.info("-> Configuración de negocio inicial creada.");
            } else {
                log.info("-> Configuración de negocio existente detectada. Se respeta 100% sin modificaciones.");
            }

            if (!seedDemoData) {
                return;
            }

            // 3. Categorías (SOLO SI LA COLECCIÓN ESTÁ VACÍA)
            if (categoriaRepo.count() == 0) {
                categoriaRepo.save(new Categoria("tropical", "🥭 Tropicales & Dulces", "Pura pulpa de mango, maracuyá y frutas de cosecha tropical", "sun", 1));
                categoriaRepo.save(new Categoria("berries", "🍓 Frutos Rojos del Bosque", "Fresas campesinas, moras silvestres y arándanos frescos", "heart", 2));
                categoriaRepo.save(new Categoria("citrus", "🍋 Cítricos & Exóticos", "Lulo valluno, limón mandarino y menta silvestre", "leaf", 3));
                log.info("-> Categorías base iniciales creadas.");
            } else {
                log.info("-> Categorías existentes detectadas (" + categoriaRepo.count() + "). Se respetan 100% sin modificaciones.");
            }

            // 4. Toppings y Escarchados 100% Naturales (SOLO SI NO HAY TOPPINGS)
            if (toppingRepo.count() == 0) {
                // Escarchados
                toppingRepo.save(new Topping("Escarchado Artesanal Chamoy & Tajín", "ESCARCHADO", 1500.0, "Borde ácido y picante suave"));
                toppingRepo.save(new Topping("Escarchado Sal Marina con Limón Mandarino", "ESCARCHADO", 1200.0, "Sal marina en grano con ralladura fresca"));
                toppingRepo.save(new Topping("Escarchado Azúcar Orgánico con Lima", "ESCARCHADO", 1200.0, "Cristales de azúcar rubio y lima fresca"));
                toppingRepo.save(new Topping("Borde de Sirope de Néctar & Frutas", "ESCARCHADO", 1600.0, "Reducción de frutos rojos"));

                // Toppings Frutales Naturales
                toppingRepo.save(new Topping("Trocitos de Mango Biche Fresco", "TOPPING", 2000.0, "Mango verde en cubos crujientes con limón"));
                toppingRepo.save(new Topping("Trocitos de Fresa Madura Cosechada", "TOPPING", 2200.0, "Fresas frescas en cubos seleccionadas"));
                toppingRepo.save(new Topping("Perlas Explosivas de Fresa Real (Popping Boba)", "TOPPING", 2500.0, "Esferificaciones con néctar de fresa"));
                toppingRepo.save(new Topping("Perlas Explosivas de Maracuyá", "TOPPING", 2500.0, "Boba con jugo de maracuyá cítrico"));
                toppingRepo.save(new Topping("Semillas de Chía & Menta Macerada", "TOPPING", 1800.0, "Infusión aromática de menta silvestre"));
                toppingRepo.save(new Topping("Gomitas Frutales Cítricas", "TOPPING", 2000.0, "Gomitas de jugo natural"));

                log.info("-> Toppings y escarchados naturales creados.");
            }

            // 5. Granizados (Catálogo 100% Fruta Natural)
            if (granizadoRepo.count() == 0) {
                granizadoRepo.save(new Granizado(
                        "Mango Biche Artesanal con Limón y Sal",
                        "Puro mango verde seleccionado en textura frappé glacial, limón mandarino recién exprimido y escarchado de sal marina con tajín suave.",
                        "tropical", "SIN_ALCOHOL", "0.0% Fruta Pura", "Sin Licor", 13000.0,
                        Map.of("12oz", 13000.0, "16oz", 16500.0, "24oz", 22000.0),
                        "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=700&q=80",
                        "🥭 FAVORITO DE COSECHA",
                        List.of("#FFB703", "#FB8500"),
                        List.of("Mango biche verde", "Limón mandarino", "Sal marina", "Tajín suave"),
                        true
                ));

                granizadoRepo.save(new Granizado(
                        "Maracuyá Silvestre Cítrico Dorado",
                        "Pulpa pura de maracuyá de campo con semillas crujientes aromáticas, néctar cítrico y escarcha subcero de hielo ultra fino.",
                        "tropical", "SIN_ALCOHOL", "0.0% Fruta Pura", "Sin Licor", 13500.0,
                        Map.of("12oz", 13500.0, "16oz", 17000.0, "24oz", 23000.0),
                        "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=700&q=80",
                        "☀️ 100% NATURAL",
                        List.of("#FF7A00", "#FFB703"),
                        List.of("Maracuyá pulpa pura", "Zumo de naranja valencia", "Hielo frappé cristal"),
                        true
                ));

                granizadoRepo.save(new Granizado(
                        "Fresa Campesina & Menta Glacial",
                        "Fresas rojas maduras cosechadas en su punto de dulzor óptimo, trituradas a -4°C con hojas de menta fresca de huerta.",
                        "berries", "SIN_ALCOHOL", "0.0% Fruta Pura", "Sin Licor", 13500.0,
                        Map.of("12oz", 13500.0, "16oz", 17000.0, "24oz", 23000.0),
                        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80",
                        "🍓 DULZURA NATURAL",
                        List.of("#FF1E56", "#E60049"),
                        List.of("Fresas rojas campesinas", "Menta silvestre", "Néctar frutal"),
                        true
                ));

                granizadoRepo.save(new Granizado(
                        "Lulo Valluno Refrescante con Hierbabuena",
                        "El ícono del trópico: auténtico lulo fresco macerado en frío extremo con hierbabuena fresca y toque ácido inolvidable.",
                        "citrus", "SIN_ALCOHOL", "0.0% Fruta Pura", "Sin Licor", 14000.0,
                        Map.of("12oz", 14000.0, "16oz", 17500.0, "24oz", 23500.0),
                        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80",
                        "🌿 REFRESCANCIA TOTAL",
                        List.of("#10B981", "#34D399"),
                        List.of("Lulo fresco seleccionado", "Hierbabuena fresca", "Limón persa"),
                        true
                ));

                granizadoRepo.save(new Granizado(
                        "Frutos Rojos Andinos (Fresa, Mora & Arándano)",
                        "Poderosa mezcla antioxidante de mora silvestre de montaña, fresa y arándanos enteros batidos en nieve frappé suave.",
                        "berries", "SIN_ALCOHOL", "0.0% Fruta Pura", "Sin Licor", 14000.0,
                        Map.of("12oz", 14000.0, "16oz", 17500.0, "24oz", 23500.0),
                        "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=700&q=80",
                        "🫐 SUPER ANTIOXIDANTE",
                        List.of("#8A1C58", "#FF1E56"),
                        List.of("Mora silvestre", "Fresas andinas", "Arándanos azules"),
                        false
                ));

                granizadoRepo.save(new Granizado(
                        "Limonada de Coco Caribeño & Lima",
                        "Cremosa pulpa de coco natural macerada en frío con zumo fresco de lima verde y textura frappé aterciopelada.",
                        "citrus", "SIN_ALCOHOL", "0.0% Fruta Pura", "Sin Licor", 14500.0,
                        Map.of("12oz", 14500.0, "16oz", 18500.0, "24oz", 24500.0),
                        "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=700&q=80",
                        "🥥 CREMOSO & CÍTRICO",
                        List.of("#E0EAFC", "#34D399"),
                        List.of("Pulpa de coco natural", "Lima fresca exprimida", "Hielo cristalino"),
                        false
                ));

                granizadoRepo.save(new Granizado(
                        "Piña Golden Dulce con Maracuyá",
                        "Piña miel madura de cosecha tropical combinada con el toque cítrico de la fruta de la pasión en nieve frappé.",
                        "tropical", "SIN_ALCOHOL", "0.0% Fruta Pura", "Sin Licor", 13500.0,
                        Map.of("12oz", 13500.0, "16oz", 17000.0, "24oz", 23000.0),
                        "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=700&q=80",
                        "🍍 TROPICAL FRESH",
                        List.of("#FFB703", "#FF7A00"),
                        List.of("Piña golden miel", "Maracuyá fresco", "Hielo frappé"),
                        false
                ));

                log.info("-> Catálogo 100% frutal sembrado exitosamente.");
            }

            // 6. Banners
            if (bannerRepo.count() == 0) {
                bannerRepo.save(new Banner(
                        "¡100% FRUTA NATURAL DIRECTO A TU PUERTA!",
                        "Granizados artesanales frappé elaborados únicamente con pulpa pura de frutas seleccionadas. Llegan congelados a -4°C.",
                        "🍃 COSECHA FRESCA & PURA",
                        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1400&q=85",
                        "Pedir Ahora",
                        "#menu",
                        1,
                        true
                ));
                bannerRepo.save(new Banner(
                        "PERSONALIZA TU VASO FRUTAL",
                        "Elige tu fruta favorita, añade trocitos de fruta picada, escarchado de sal marina o perlas boba explosivas.",
                        "🥭 EXPERIENCIA TROPICAL",
                        "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1400&q=85",
                        "Explorar Sabores",
                        "#menu",
                        2,
                        true
                ));
                log.info("-> Banners creados exitosamente.");
            }

            // 7. Pedidos de Demostración para Dashboard y Finanzas
            if (pedidoRepo.count() == 0) {
                Pedido p1 = new Pedido();
                p1.setCodigoPedido("GRZ-10482");
                p1.setClienteNombre("Camila Restrepo");
                p1.setClienteTelefono("3158901234");
                p1.setClienteDireccion("Calle 72 #45-18");
                p1.setBarrio("El Prado");
                p1.setMetodoPago("NEQUI");
                p1.setEstado("PENDIENTE_VALIDACION");
                p1.setItems(List.of(
                        new ItemPedido("1", "Mango Biche Fresco con Sal Marina", "16oz", 16500.0, 2, "Escarchado Chamoy & Tajín", List.of("Trozos de Mango Verde"), 1500.0, "Sin tanto picante"),
                        new ItemPedido("2", "Maracuyá Tropical Intenso", "12oz", 13000.0, 1, "Sal Marina", List.of(), 0.0, "Bien helado")
                ));
                p1.setSubtotal(47500.0);
                p1.setCostoEnvio(5000.0);
                p1.setTotal(52500.0);
                pedidoRepo.save(p1);

                Pedido p2 = new Pedido();
                p2.setCodigoPedido("GRZ-10483");
                p2.setClienteNombre("Carlos Mendoza");
                p2.setClienteTelefono("3004567890");
                p2.setClienteDireccion("Cra. 51B #82-120");
                p2.setBarrio("Altos de Riomar");
                p2.setMetodoPago("EFECTIVO");
                p2.setEstado("EN_PREPARACION");
                p2.setItems(List.of(
                        new ItemPedido("3", "Fresa Campesina & Menta Glacial", "24oz", 23000.0, 1, "Borde Sirope Néctar", List.of("Fresas Picadas"), 1500.0, "Por favor pitillo extra")
                ));
                p2.setSubtotal(24500.0);
                p2.setCostoEnvio(5000.0);
                p2.setTotal(29500.0);
                pedidoRepo.save(p2);

                Pedido p3 = new Pedido();
                p3.setCodigoPedido("GRZ-10475");
                p3.setClienteNombre("Valentina Gómez");
                p3.setClienteTelefono("3187654321");
                p3.setClienteDireccion("Cra. 44 #55-30");
                p3.setBarrio("Boston");
                p3.setMetodoPago("BANCOLOMBIA");
                p3.setEstado("ENTREGADO");
                p3.setItems(List.of(
                        new ItemPedido("4", "Lulo Valluno Refrescante con Hierbabuena", "16oz", 17500.0, 2, "Sal Marina", List.of(), 0.0, "")
                ));
                p3.setSubtotal(35000.0);
                p3.setCostoEnvio(5000.0);
                p3.setTotal(40000.0);
                pedidoRepo.save(p3);

                log.info("-> Pedidos de demostración para Dashboard creados exitosamente.");
            }

            log.info("--- DATOS FROST GLACIAL INICIALIZADOS CORRECTAMENTE ---");
        };
    }
}
