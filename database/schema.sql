-- 淮安大富翁游戏数据库结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS huaian_monopoly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE huaian_monopoly;

-- 玩家表
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    avatar VARCHAR(255),
    total_games INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_money_earned BIGINT DEFAULT 0,
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_online BOOLEAN DEFAULT FALSE,
    INDEX idx_name (name),
    INDEX idx_email (email),
    INDEX idx_level (level)
);

-- 房间表
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    host_id VARCHAR(36) NOT NULL,
    max_players INT DEFAULT 6,
    current_players INT DEFAULT 0,
    status ENUM('waiting', 'playing', 'ended') DEFAULT 'waiting',
    password VARCHAR(255),
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (host_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_host (host_id),
    INDEX idx_created (created_at)
);

-- 游戏表
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    status ENUM('waiting', 'playing', 'ended') DEFAULT 'waiting',
    current_player_index INT DEFAULT 0,
    turn_number INT DEFAULT 1,
    game_state JSON,
    winner_id VARCHAR(36),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    duration_seconds INT DEFAULT 0,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES players(id) ON DELETE SET NULL,
    INDEX idx_room (room_id),
    INDEX idx_status (status),
    INDEX idx_winner (winner_id)
);

-- 游戏玩家表
CREATE TABLE IF NOT EXISTS game_players (
    id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    player_id VARCHAR(36) NOT NULL,
    player_order INT NOT NULL,
    starting_money INT DEFAULT 15000,
    current_money INT DEFAULT 15000,
    position INT DEFAULT 0,
    is_in_jail BOOLEAN DEFAULT FALSE,
    jail_turns INT DEFAULT 0,
    properties_owned JSON,
    color VARCHAR(7),
    avatar VARCHAR(255),
    is_bankrupt BOOLEAN DEFAULT FALSE,
    bankrupt_at TIMESTAMP NULL,
    final_rank INT,
    total_properties_bought INT DEFAULT 0,
    total_rent_collected INT DEFAULT 0,
    total_rent_paid INT DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_game_player (game_id, player_id),
    INDEX idx_game (game_id),
    INDEX idx_player (player_id),
    INDEX idx_position (position)
);

-- 属性表
CREATE TABLE IF NOT EXISTS properties (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position INT NOT NULL UNIQUE,
    price INT NOT NULL,
    rent INT NOT NULL,
    property_group VARCHAR(20) NOT NULL,
    description TEXT,
    culture_info TEXT,
    financial_tip TEXT,
    house_price INT DEFAULT 0,
    hotel_price INT DEFAULT 0,
    mortgage_value INT DEFAULT 0,
    INDEX idx_position (position),
    INDEX idx_group (property_group),
    INDEX idx_price (price)
);

-- 游戏属性状态表
CREATE TABLE IF NOT EXISTS game_properties (
    id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    property_id VARCHAR(36) NOT NULL,
    owner_id VARCHAR(36),
    houses INT DEFAULT 0,
    hotels INT DEFAULT 0,
    is_mortgaged BOOLEAN DEFAULT FALSE,
    mortgaged_at TIMESTAMP NULL,
    purchase_price INT,
    purchased_at TIMESTAMP NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES players(id) ON DELETE SET NULL,
    UNIQUE KEY unique_game_property (game_id, property_id),
    INDEX idx_game (game_id),
    INDEX idx_property (property_id),
    INDEX idx_owner (owner_id)
);

-- 卡片表
CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('chance', 'community') NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    action VARCHAR(50) NOT NULL,
    action_params JSON,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_type (type),
    INDEX idx_active (is_active)
);

-- 游戏事件表
CREATE TABLE IF NOT EXISTS game_events (
    id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    player_id VARCHAR(36),
    event_type VARCHAR(50) NOT NULL,
    event_data JSON,
    turn_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_game (game_id),
    INDEX idx_player (player_id),
    INDEX idx_type (event_type),
    INDEX idx_turn (turn_number),
    INDEX idx_created (created_at)
);

-- 交易表
CREATE TABLE IF NOT EXISTS trades (
    id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    from_player_id VARCHAR(36) NOT NULL,
    to_player_id VARCHAR(36) NOT NULL,
    from_money INT DEFAULT 0,
    to_money INT DEFAULT 0,
    from_properties JSON,
    to_properties JSON,
    status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (from_player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (to_player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_game (game_id),
    INDEX idx_from_player (from_player_id),
    INDEX idx_to_player (to_player_id),
    INDEX idx_status (status)
);

-- 聊天记录表
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    player_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('chat', 'system', 'trade', 'game') DEFAULT 'chat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_room (room_id),
    INDEX idx_player (player_id),
    INDEX idx_type (message_type),
    INDEX idx_created (created_at)
);

-- 成就表
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255),
    condition_type VARCHAR(50) NOT NULL,
    condition_value INT NOT NULL,
    points INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_type (condition_type),
    INDEX idx_active (is_active)
);

-- 玩家成就表
CREATE TABLE IF NOT EXISTS player_achievements (
    id VARCHAR(36) PRIMARY KEY,
    player_id VARCHAR(36) NOT NULL,
    achievement_id VARCHAR(36) NOT NULL,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    game_id VARCHAR(36),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL,
    UNIQUE KEY unique_player_achievement (player_id, achievement_id),
    INDEX idx_player (player_id),
    INDEX idx_achievement (achievement_id)
);

-- 游戏统计表
CREATE TABLE IF NOT EXISTS game_statistics (
    id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    total_turns INT DEFAULT 0,
    total_transactions INT DEFAULT 0,
    total_money_circulated BIGINT DEFAULT 0,
    most_expensive_property VARCHAR(36),
    highest_rent_collected INT DEFAULT 0,
    longest_jail_stay INT DEFAULT 0,
    most_properties_owned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_game (game_id)
);

-- 插入淮安特色地产数据
INSERT INTO properties (id, name, position, price, rent, property_group, description, culture_info, financial_tip, house_price, hotel_price, mortgage_value) VALUES
('prop_0', '起点', 0, 0, 0, 'special', '每次经过或停留获得2000元', '淮安市政府广场，城市的政治中心', '', 0, 0, 0),
('prop_1', '淮安府署', 1, 600, 20, 'brown', '明清时期淮安府衙门所在地', '淮安历史文化的重要象征，见证了淮安作为漕运总督府的辉煌', '历史文化地产具有独特的保值增值特性', 500, 2000, 300),
('prop_2', '机会', 2, 0, 0, 'chance', '抽取机会卡片', '', '', 0, 0, 0),
('prop_3', '河下古镇', 3, 600, 40, 'brown', '千年古镇，文化底蕴深厚', '淮安历史文化名镇，古代漕运重镇', '旅游业投资具有长期稳定回报的特点', 500, 2000, 300),
('prop_4', '所得税', 4, 0, 0, 'tax', '缴纳所得税200元', '', '', 0, 0, 0),
('prop_5', '淮安东站', 5, 2000, 250, 'railroad', '高铁枢纽站', '连接南北的重要交通枢纽', '交通基础设施是经济发展的重要支撑', 0, 0, 1000),
('prop_6', '清晏园', 6, 1000, 60, 'lightblue', '淮安最著名的古典园林', '江南园林艺术的代表作品', '文化旅游地产投资要注重品牌价值', 500, 2000, 500),
('prop_7', '公共服务', 7, 0, 0, 'community', '抽取公共服务卡片', '', '', 0, 0, 0),
('prop_8', '淮安万达广场', 8, 1000, 60, 'lightblue', '现代化商业中心', '淮安重要的商业综合体', '商业地产投资需要考虑人流量和消费能力', 500, 2000, 500),
('prop_9', '里运河', 9, 1200, 80, 'lightblue', '京杭大运河淮安段', '世界文化遗产，千年水运文化', '文化旅游资源具有独特的投资价值', 500, 2000, 600),
('prop_10', '监狱', 10, 0, 0, 'jail', '临时拘留所', '', '', 0, 0, 0);

-- 插入卡片数据
INSERT INTO cards (id, type, title, description, action, action_params) VALUES
('card_chance_1', 'chance', '政府扶持', '获得政府创业扶持资金', 'add_money', '{"amount": 1500}'),
('card_chance_2', 'chance', '市场机遇', '抓住市场机遇，投资收益翻倍', 'double_rent', '{}'),
('card_chance_3', 'chance', '前往起点', '回到起点，领取2000元', 'move_to_position', '{"position": 0}'),
('card_chance_4', 'chance', '交通罚款', '违章停车被罚款', 'lose_money', '{"amount": 500}'),
('card_chance_5', 'chance', '投资失败', '投资项目失败，损失资金', 'lose_money', '{"amount": 1000}'),
('card_community_1', 'community', '慈善捐款', '参与慈善活动，获得社会声誉', 'add_money', '{"amount": 800}'),
('card_community_2', 'community', '纳税优惠', '享受税收优惠政策', 'tax_relief', '{}'),
('card_community_3', 'community', '社区建设', '参与社区建设，每位玩家给你50元', 'collect_from_all', '{"amount": 50}'),
('card_community_4', 'community', '医疗费用', '生病住院，支付医疗费用', 'lose_money', '{"amount": 800}'),
('card_community_5', 'community', '教育投资', '教育投资获得回报', 'add_money', '{"amount": 1200}');

-- 插入成就数据
INSERT INTO achievements (id, name, description, icon, condition_type, condition_value, points) VALUES
('ach_1', '初来乍到', '完成第一场游戏', '🎮', 'games_played', 1, 10),
('ach_2', '地产大亨', '在一局游戏中拥有10个以上地产', '🏢', 'properties_owned', 10, 50),
('ach_3', '淮安通', '购买所有淮安特色地产', '🏛️', 'huaian_properties', 100, 100),
('ach_4', '百万富翁', '在一局游戏中资产超过100万', '💰', 'money_earned', 1000000, 75),
('ach_5', '连胜王者', '连续赢得5场游戏', '👑', 'consecutive_wins', 5, 200);