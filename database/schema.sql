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

-- 清空并重新插入完整的淮安特色地产数据（40个地块）
DELETE FROM properties;

-- 插入完整的40个地块数据
INSERT INTO properties (id, name, position, price, rent, property_group, description, culture_info, financial_tip, house_price, hotel_price, mortgage_value) VALUES
-- 起点
('prop_0', '起点', 0, 0, 0, 'special', '每次经过获得200元', '淮安市政府广场，城市的政治中心', '', 0, 0, 0),

-- 棕色组
('prop_1', '淮安府署', 1, 600, 20, 'brown', '明清时期淮安府衙门所在地', '淮安历史文化的重要象征，见证了淮安作为漕运总督府的辉煌', '历史文化地产具有独特的保值增值特性', 500, 2000, 300),
('prop_2', '机会', 2, 0, 0, 'chance', '抽取机会卡片', '', '', 0, 0, 0),
('prop_3', '河下古镇', 3, 600, 40, 'brown', '千年古镇，文化底蕴深厚', '淮安历史文化名镇，古代漕运重镇', '旅游业投资具有长期稳定回报的特点', 500, 2000, 300),
('prop_4', '所得税', 4, 0, 0, 'tax', '缴纳所得税200元', '', '', 0, 0, 0),
('prop_5', '淮安东站', 5, 2000, 250, 'railroad', '高铁枢纽站', '连接南北的重要交通枢纽', '交通基础设施是经济发展的重要支撑', 0, 0, 1000),

-- 浅蓝组
('prop_6', '清晏园', 6, 1000, 60, 'lightblue', '淮安最著名的古典园林', '江南园林艺术的代表作品', '文化旅游地产投资要注重品牌价值', 500, 2000, 500),
('prop_7', '公共服务', 7, 0, 0, 'community', '抽取公共服务卡片', '', '', 0, 0, 0),
('prop_8', '淮安万达广场', 8, 1000, 60, 'lightblue', '现代化商业中心', '淮安重要的商业综合体', '商业地产投资需要考虑人流量和消费能力', 500, 2000, 500),
('prop_9', '里运河', 9, 1200, 80, 'lightblue', '京杭大运河淮安段', '世界文化遗产，千年水运文化', '文化旅游资源具有独特的投资价值', 500, 2000, 600),

-- 监狱
('prop_10', '监狱', 10, 0, 0, 'jail', '临时拘留所', '', '', 0, 0, 0),

-- 粉红组
('prop_11', '淮安府署', 11, 140, 10, 'pink', '古代官衙，淮安行政中心遗迹', '明清时期淮安府衙门所在地，见证淮安作为漕运总督府的辉煌', '府衙遗址具有文化价值投资潜力', 100, 500, 70),
('prop_12', '淮阴电力', 12, 150, 0, 'utility', '电力供应公司', '城市基础设施服务', '公用事业投资稳定但收益有限', 0, 0, 75),
('prop_13', '镇淮楼', 13, 140, 10, 'pink', '古城标志性楼阁，俯瞰运河', '淮安古城的标志性建筑', '历史建筑具有独特的文化价值', 100, 500, 70),
('prop_14', '中国漕运博物馆', 14, 160, 12, 'pink', '展示大运河漕运历史', '全国唯一以漕运为主题的博物馆', '文化博物馆投资注重教育价值', 100, 500, 80),
('prop_15', '汽车站', 15, 200, 25, 'railroad', '长途客运枢纽', '连接周边城市的交通枢纽', '客运站投资关注人流密度', 0, 0, 100),

-- 橙色组
('prop_16', '中国淮扬菜博物馆', 16, 180, 14, 'orange', '淮扬菜文化展示厅，美食圣地', '中国四大菜系之一淮扬菜的文化殿堂', '美食文化产业具有强大的市场潜力', 100, 500, 90),
('prop_17', '公共服务', 17, 0, 0, 'community', '抽取公共服务卡片', '', '', 0, 0, 0),
('prop_18', '楚秀园', 18, 180, 14, 'orange', '古典园林，园林与淮扬园林代表', '淮安最著名的古典园林，江南园林艺术的代表', '园林文化地产具有观赏价值', 100, 500, 90),
('prop_19', '淮安里运河文化长廊', 19, 200, 16, 'orange', '运河畔文化走廊，现代休闲带', '展现运河文化的现代景观带', '文化长廊投资融合传统与现代', 100, 500, 100),

-- 运河码头
('prop_20', '运河码头', 20, 0, 0, 'parking', '抽取运河宝藏卡，获得现金或道具', '古代漕运的重要码头', '', 0, 0, 0),

-- 红色组
('prop_21', '周恩来纪念馆', 21, 220, 18, 'red', '纪念伟人的专题馆，景区核心', '为纪念周恩来总理而建的专题纪念馆', '伟人纪念馆具有深厚的教育意义', 150, 750, 110),
('prop_22', '机会', 22, 0, 0, 'chance', '抽取机会卡片', '', '', 0, 0, 0),
('prop_23', '淮安大剧院', 23, 220, 18, 'red', '现代文化艺术中心，演出地标', '淮安市标志性文化建筑', '文化艺术中心投资关注演出市场', 150, 750, 110),
('prop_24', '淮安市体育中心', 24, 240, 20, 'red', '体育赛事举办地，城市活力象征', '淮安市重要的体育文化设施', '体育设施投资带动周边发展', 150, 750, 120),
('prop_25', '新长铁路', 25, 200, 25, 'railroad', '重要铁路干线', '连接苏北地区的重要铁路', '铁路投资促进区域经济发展', 0, 0, 100),

-- 黄色组
('prop_26', '白马湖旅游景区', 26, 260, 22, 'yellow', '湖泊生态区，休闲度假胜地', '白马湖生态旅游区，天然氧吧', '生态旅游投资关注环保价值', 150, 750, 130),
('prop_27', '淮安西游乐园', 27, 260, 22, 'yellow', '以《西游记》主题的乐园', '以吴承恩《西游记》为主题的大型主题乐园', '主题乐园投资需要文化创意支撑', 150, 750, 130),
('prop_28', '自来水公司', 28, 150, 0, 'utility', '城市供水服务', '城市基础设施供水系统', '供水设施投资稳定但监管严格', 0, 0, 75),
('prop_29', '古淮河文化生态景区', 29, 280, 24, 'yellow', '淮河古文化与生态融合', '古淮河文化和现代生态理念的完美结合', '文化生态投资注重可持续发展', 150, 750, 140),

-- 去监狱
('prop_30', '去监狱', 30, 0, 0, 'gotojail', '直接前往监狱', '', '', 0, 0, 0),

-- 绿色组
('prop_31', '淮安国际食品博览中心', 31, 300, 26, 'green', '食品产业博览会场馆，体现淮安经济', '淮安食品产业发展的展示窗口', '食品产业投资前景广阔', 200, 1000, 150),
('prop_32', '江苏食品药品职业技术学院', 32, 300, 26, 'green', '淮安本地高校，培养食品相关人才', '专业的食品药品类高等职业院校', '教育投资培养专业人才', 200, 1000, 150),
('prop_33', '公共服务', 33, 0, 0, 'community', '抽取公共服务卡片', '', '', 0, 0, 0),
('prop_34', '淮阴博物馆', 34, 320, 28, 'green', '地方历史博物馆，收藏淮安文物', '展示淮安地区历史文化的重要场所', '博物馆投资保护历史文化', 200, 1000, 160),
('prop_35', '宁淮高速', 35, 200, 25, 'railroad', '连接南京的高速公路', '淮安通往南京的重要交通干线', '高速公路投资促进区域一体化', 0, 0, 100),

-- 深蓝组
('prop_36', '机会', 36, 0, 0, 'chance', '抽取机会卡片', '', '', 0, 0, 0),
('prop_37', '淮安国际商城步行街', 37, 350, 35, 'darkblue', '商业繁华区，购物天堂', '淮安最繁华的商业中心', '商业步行街投资关注消费升级', 200, 1000, 175),
('prop_38', '奢侈税', 38, 0, 0, 'tax', '缴纳奢侈税750元', '', '', 0, 0, 0),
('prop_39', '江苏银行淮安分行', 39, 350, 35, 'darkblue', '金融服务机构，代表现代经济支柱', '金融服务业发展的重要节点', '金融机构投资需要专业资质', 200, 1000, 175);

-- 清空并重新插入完整的卡片数据
DELETE FROM cards;

-- 插入机会卡片数据
INSERT INTO cards (id, type, title, description, action, action_params) VALUES
('card_chance_1', 'chance', '参观周恩来故居', '获得300元灵感奖金', 'add_money', '{"amount": 300}'),
('card_chance_2', 'chance', '吴承恩故居西游灵感爆发', '一轮租金翻倍', 'double_rent', '{}'),
('card_chance_3', 'chance', '前往起点', '回到起点，领取200元', 'move_to_position', '{"position": 0}'),
('card_chance_4', 'chance', '交通罚款', '违章停车被罚款200元', 'lose_money', '{"amount": 200}'),
('card_chance_5', 'chance', '投资运河航运', '获得运河船只，航运模式解锁', 'get_ship', '{}'),
('card_chance_6', 'chance', '房产升值', '所有房产价值上涨10%', 'property_appreciation', '{}'),
('card_chance_7', 'chance', '漕运博物馆文化节', '如果拥有博物馆类地产，额外获得500元', 'culture_bonus', '{"amount": 500}'),
('card_chance_8', 'chance', '大运河申遗成功', '运河相关地产租金提升20%', 'canal_bonus', '{}'),
('card_chance_9', 'chance', '政府基建投资', '获得政府扶持资金800元', 'add_money', '{"amount": 800}'),
('card_chance_10', 'chance', '前往监狱', '直接前往监狱，不经过起点', 'go_to_jail', '{}'),

-- 插入公共服务卡片数据
('card_community_1', 'community', '参加河下古镇庙会', '所有玩家支付你50元庆贺费', 'collect_from_all', '{"amount": 50}'),
('card_community_2', 'community', '运河涨水', '洪泽湖区地产支付200元防洪费', 'flood_tax', '{"amount": 200}'),
('card_community_3', 'community', '淮扬菜美食节', '获得淮扬名菜buff，下次罚款免疫', 'get_food_buff', '{}'),
('card_community_4', 'community', '医疗费用', '生病住院，支付医疗费用300元', 'lose_money', '{"amount": 300}'),
('card_community_5', 'community', '教育投资奖励', '支持本地教育，获得回报600元', 'add_money', '{"amount": 600}'),
('card_community_6', 'community', '环保奖励', '参与运河环保，获得政府奖励400元', 'add_money', '{"amount": 400}'),
('card_community_7', 'community', '慈善捐款', '参与慈善活动，获得社会声誉和300元奖励', 'add_money', '{"amount": 300}'),
('card_community_8', 'community', '文化遗产保护', '参与文化遗产保护，每位玩家给你30元', 'collect_from_all', '{"amount": 30}'),
('card_community_9', 'community', '税收优惠', '享受税收优惠政策，下次税费减半', 'tax_relief', '{}'),
('card_community_10', 'community', '前往起点', '社区建设有功，前往起点领奖', 'move_to_position', '{"position": 0}');

-- 插入成就数据前清空表，防止主键冲突
DELETE FROM achievements;
-- 插入成就数据
INSERT INTO achievements (id, name, description, icon, condition_type, condition_value, points) VALUES
('ach_1', '初来乍到', '完成第一场游戏', '🎮', 'games_played', 1, 10),
('ach_2', '地产大亨', '在一局游戏中拥有10个以上地产', '🏢', 'properties_owned', 10, 50),
('ach_3', '淮安通', '购买所有淮安特色地产', '🏛️', 'huaian_properties', 100, 100),
('ach_4', '百万富翁', '在一局游戏中资产超过100万', '💰', 'money_earned', 1000000, 75),
('ach_5', '连胜王者', '连续赢得5场游戏', '👑', 'consecutive_wins', 5, 200);