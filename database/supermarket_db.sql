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
