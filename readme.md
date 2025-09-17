# Dota2 Player Guessing Game

## 简介
一个网页游戏，玩家通过输入 Dota2 选手 ID 来猜测目标选手。游戏会根据玩家的猜测给出详细提示，包括战队、国籍、年龄、TI 次数和位置的正确性或接近程度，并显示箭头提示数字偏高或偏低。

特点：
- 支持输入联想提示（ID 自动补全）
- 年龄和 TI 次数总显示⬆️/⬇️箭头，接近目标时标黄色
- 已猜测列表显示每次猜测的详细信息
- 猜对或机会用完后显示重新开始按钮

---

## 环境要求
- Python 3.10+
- Flask 2.x
- PyMySQL
- MySQL 5.7+ 或 MariaDB

---

## 数据库配置

1. 创建数据库和表：

```sql
CREATE DATABASE IF NOT EXISTS dota_guess CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE dota_guess;

CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    team VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    ti_count INT NOT NULL,
    position VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

