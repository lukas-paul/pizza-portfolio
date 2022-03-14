DROP TABLE IF EXISTS reviews;


CREATE TABLE reviews(
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    review VARCHAR NOT NULL,
    selected VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO reviews (username, review, selected) VALUES (
    'Bob',
    'Best pizza in town!',
    'false'
);