-- Ludo Royale Web Database Schema
-- For use with MySQL/MariaDB

CREATE DATABASE IF NOT EXISTS ludo_royale;
USE ludo_royale;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT 'default.png',
    balance DECIMAL(10, 2) DEFAULT 0.00,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game Rooms Table
CREATE TABLE IF NOT EXISTS game_rooms (
    id VARCHAR(50) PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE,
    mode ENUM('computer', '2player', '4player', 'private') NOT NULL,
    entry_fee DECIMAL(10, 2) DEFAULT 0.00,
    prize_pool DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('waiting', 'playing', 'finished') DEFAULT 'waiting',
    winner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- Game Players Table
CREATE TABLE IF NOT EXISTS game_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50),
    user_id INT,
    color ENUM('red', 'green', 'yellow', 'blue'),
    is_ready BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (room_id) REFERENCES game_rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('deposit', 'withdrawal', 'entry_fee', 'win_prize') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
