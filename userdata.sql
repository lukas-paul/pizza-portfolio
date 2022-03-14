DROP TABLE IF EXISTS userdata;

 CREATE TABLE userdata(
     id SERIAL PRIMARY KEY,
     username VARCHAR(255) NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

 INSERT INTO userdata (username, password) VALUES (
    'admin',
    'password123'
);