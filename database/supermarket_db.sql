-- ============================================================
-- Supermarket Ordering System (Fresh_Mart)
-- Database: supermarket_db
--
-- Run this whole script in MySQL Workbench.
-- It is safe to run more than once.
-- Tables are added to this script as each feature is developed.
-- ============================================================

CREATE DATABASE IF NOT EXISTS supermarket_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE supermarket_db;

-- ------------------------------------------------------------
-- Table: admin
-- Stores administrator accounts. Passwords are BCrypt hashes.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_admin PRIMARY KEY (id),
    CONSTRAINT uk_admin_email UNIQUE (email)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Table: category
-- One category can contain many items.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS category (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    name         VARCHAR(100) NOT NULL,
    description  VARCHAR(255),
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_category PRIMARY KEY (id),
    CONSTRAINT uk_category_name UNIQUE (name)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Table: item
-- Each item belongs to one category (foreign key category_id).
-- image_name is only the file name; the image file itself is kept
-- in the "item-images" folder of the project, not in MySQL.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS item (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)  NOT NULL,
    description     VARCHAR(500),
    price           DECIMAL(10,2) NOT NULL,
    stock_quantity  INT           NOT NULL DEFAULT 0,
    image_name      VARCHAR(255),
    category_id     BIGINT        NOT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_item PRIMARY KEY (id),
    CONSTRAINT uk_item_name UNIQUE (name),
    CONSTRAINT fk_item_category FOREIGN KEY (category_id) REFERENCES category (id),
    CONSTRAINT chk_item_price CHECK (price > 0),
    CONSTRAINT chk_item_stock CHECK (stock_quantity >= 0)
) ENGINE = InnoDB;

-- ============================================================
-- Sample data
-- INSERT IGNORE skips a row if a category or item with the same
-- name already exists, so running the script again adds no duplicates.
-- ============================================================

INSERT IGNORE INTO category (name, description) VALUES
('Rice & Grains',          'Everyday rice and grain products for household use.'),
('Beverages',              'Refreshing drinks and beverage products for everyday use.'),
('Snacks & Confectionery', 'Snacks and sweet treats for everyday enjoyment.');

-- Look up the id of each sample category
SET @rice_id     = (SELECT id FROM category WHERE name = 'Rice & Grains');
SET @beverage_id = (SELECT id FROM category WHERE name = 'Beverages');
SET @snack_id    = (SELECT id FROM category WHERE name = 'Snacks & Confectionery');

INSERT IGNORE INTO item (name, description, price, stock_quantity, image_name, category_id) VALUES
-- Rice & Grains
('Samba Rice',   'Premium Sri Lankan samba rice with small, tasty grains. 1 kg pack.',           280.00, 120, 'samba-rice.svg',   @rice_id),
('Nadu Rice',    'Locally grown nadu rice, ideal for everyday rice and curry. 1 kg pack.',       230.00, 150, 'nadu-rice.svg',    @rice_id),
('Red Rice',     'Nutritious unpolished red rice, rich in fibre. 1 kg pack.',                    250.00,  90, 'red-rice.svg',     @rice_id),
('Basmati Rice', 'Long-grain aromatic basmati rice, perfect for biryani and fried rice. 1 kg pack.', 950.00, 60, 'basmati-rice.svg', @rice_id),
('White Rice',   'Clean white raw rice for daily household cooking. 1 kg pack.',                 220.00, 140, 'white-rice.svg',   @rice_id),
-- Beverages
('Ceylon Tea',     'Pure Ceylon black tea from Sri Lankan hill country estates. 200 g pack.',    650.00,  75, 'ceylon-tea.svg',     @beverage_id),
('Instant Coffee', 'Rich and smooth instant coffee granules. 100 g jar.',                       1450.00,  40, 'instant-coffee.svg', @beverage_id),
('Orange Juice',   'Refreshing orange juice with no added preservatives. 1 L carton.',           850.00,  50, 'orange-juice.svg',   @beverage_id),
('Drinking Water', 'Purified bottled drinking water. 1.5 L bottle.',                             130.00, 200, 'drinking-water.svg', @beverage_id),
('Milk Powder',    'Full cream milk powder, rich in calcium. 400 g pack.',                      1100.00,  65, 'milk-powder.svg',    @beverage_id),
-- Snacks & Confectionery
('Chocolate Biscuits', 'Crunchy biscuits with a rich chocolate flavour. 200 g pack.',            350.00, 100, 'chocolate-biscuits.svg', @snack_id),
('Cream Crackers',     'Light and crispy cream crackers, great with tea. 500 g pack.',           520.00,  85, 'cream-crackers.svg',     @snack_id),
('Potato Chips',       'Thin and crispy salted potato chips. 100 g pack.',                       450.00,  70, 'potato-chips.svg',       @snack_id),
('Chocolate Bar',      'Smooth milk chocolate bar. 100 g.',                                      650.00,  90, 'chocolate-bar.svg',      @snack_id),
('Butter Cookies',     'Golden butter cookies baked to perfection. 300 g tin.',                  980.00,  45, 'butter-cookies.svg',     @snack_id);
