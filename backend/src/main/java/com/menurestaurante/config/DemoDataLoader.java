package com.menurestaurante.config;

import com.menurestaurante.model.Allergen;
import com.menurestaurante.model.Category;
import com.menurestaurante.model.Dish;
import com.menurestaurante.model.RestaurantTable;
import com.menurestaurante.repository.CategoryRepository;
import com.menurestaurante.repository.DishRepository;
import com.menurestaurante.repository.RestaurantTableRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;

/**
 * Carta y mesas de ejemplo para enseñar la aplicación. Solo se ejecuta con {@code app.demo-data=true}
 * y si la base de datos no tiene categorías.
 */
@Component
@Order(1)
@ConditionalOnProperty(name = "app.demo-data", havingValue = "true")
public class DemoDataLoader implements ApplicationRunner {

    /** Token fijo de la mesa de demostración, para poder enlazarla desde el README: /mesa/demo */
    public static final String DEMO_TABLE_TOKEN = "demo";

    private static final Logger log = LoggerFactory.getLogger(DemoDataLoader.class);

    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final RestaurantTableRepository tableRepository;

    public DemoDataLoader(CategoryRepository categoryRepository, DishRepository dishRepository,
                          RestaurantTableRepository tableRepository) {
        this.categoryRepository = categoryRepository;
        this.dishRepository = dishRepository;
        this.tableRepository = tableRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() > 0) {
            return;
        }

        Category starters = category("Entrantes", 1);
        Category mains = category("Principales", 2);
        Category desserts = category("Postres", 3);
        Category drinks = category("Bebidas", 4);

        dish(starters, "Croquetas de jamón", "8 unidades, caseras", "9.50", Allergen.GLUTEN, Allergen.MILK, Allergen.EGGS);
        dish(starters, "Patatas bravas", "Con salsa brava y alioli", "6.00", Allergen.EGGS);
        dish(starters, "Ensalada de burrata", "Tomate, rúcula, pesto y piñones", "11.00", Allergen.MILK, Allergen.NUTS);
        dish(starters, "Gambas al ajillo", "En cazuela de barro", "12.50", Allergen.CRUSTACEANS);
        dish(mains, "Arroz negro", "Con sepia y alioli (mín. 2 personas, precio por persona)", "16.00",
                Allergen.MOLLUSCS, Allergen.EGGS, Allergen.FISH);
        dish(mains, "Solomillo de ternera", "Con patatas panaderas y pimientos", "22.00");
        dish(mains, "Lubina a la espalda", "Con verduras de temporada", "19.50", Allergen.FISH);
        dish(mains, "Hamburguesa de la casa", "Ternera, cheddar, cebolla caramelizada", "14.00",
                Allergen.GLUTEN, Allergen.MILK, Allergen.SESAME, Allergen.MUSTARD);
        dish(desserts, "Tarta de queso", "Horneada, con frutos rojos", "6.50", Allergen.MILK, Allergen.EGGS, Allergen.GLUTEN);
        dish(desserts, "Coulant de chocolate", "Con helado de vainilla", "7.00", Allergen.MILK, Allergen.EGGS, Allergen.GLUTEN);
        dish(desserts, "Fruta de temporada", null, "4.50");
        dish(drinks, "Agua mineral", "50 cl", "2.00");
        dish(drinks, "Refresco", "Cola, naranja o limón", "2.80");
        dish(drinks, "Caña de cerveza", null, "2.50", Allergen.GLUTEN);
        dish(drinks, "Copa de vino tinto", "Rioja crianza", "3.80", Allergen.SULPHITES);

        for (int i = 1; i <= 8; i++) {
            RestaurantTable table = new RestaurantTable();
            table.setName("Mesa " + i);
            if (i == 1) {
                table.setToken(DEMO_TABLE_TOKEN);
            }
            tableRepository.save(table);
        }
        log.info("Datos de demostración cargados. Mesa 1 disponible en /mesa/{}", DEMO_TABLE_TOKEN);
    }

    private Category category(String name, int position) {
        Category category = new Category();
        category.setName(name);
        category.setPosition(position);
        return categoryRepository.save(category);
    }

    private void dish(Category category, String name, String description, String price, Allergen... allergens) {
        Dish dish = new Dish();
        dish.setCategory(category);
        dish.setName(name);
        dish.setDescription(description);
        dish.setPrice(new BigDecimal(price));
        dish.setAllergens(Set.of(allergens));
        dishRepository.save(dish);
    }
}
