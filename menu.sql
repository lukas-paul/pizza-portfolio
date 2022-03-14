DROP TABLE IF EXISTS menu;

 CREATE TABLE menu(
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     ingredients VARCHAR(255) NOT NULL,
     price VARCHAR(255) NOT NULL,
     selected VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

 INSERT INTO menu (name, ingredients, price, selected) VALUES (
    'Margherita',
    'Marzano tomatoes, mozzarella cheese, fresh basil, salt, and extra-virgin olive oil.',
    '11',
    'true'
);