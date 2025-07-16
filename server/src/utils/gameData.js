const HUAIAN_PROPERTIES = [
  // 起点
  { id: '0', name: '起点', position: 0, price: 0, rent: 0, group: 'special', houses: 0, hotels: 0, mortgaged: false, description: '每次经过获得200元', culture: '淮安市政府广场，城市的政治中心' },
  
  // 棕色组
  { id: '1', name: '河下古镇', position: 1, price: 60, rent: 2, group: 'brown', houses: 0, hotels: 0, mortgaged: false, description: '千年古镇，保留明清街巷，运河文化精华', culture: '淮安历史文化名镇，古代漕运重镇', housePrice: 50 },
  { id: '2', name: '机会', position: 2, price: 0, rent: 0, group: 'chance', houses: 0, hotels: 0, mortgaged: false, description: '抽取机会卡片' },
  { id: '3', name: '淮安驸马巷', position: 3, price: 60, rent: 4, group: 'brown', houses: 0, hotels: 0, mortgaged: false, description: '古巷道，连接历史与民俗', culture: '明清时期的古街巷，承载着深厚的历史文化', housePrice: 50 },
  { id: '4', name: '所得税', position: 4, price: 0, rent: 0, group: 'tax', houses: 0, hotels: 0, mortgaged: false, description: '缴纳所得税200元' },
  { id: '5', name: '淮安东站', position: 5, price: 200, rent: 25, group: 'railroad', houses: 0, hotels: 0, mortgaged: false, description: '高铁枢纽站', culture: '连接南北的重要交通枢纽' },
  
  // 浅蓝组
  { id: '6', name: '周恩来故居', position: 6, price: 100, rent: 6, group: 'lightblue', houses: 0, hotels: 0, mortgaged: false, description: '伟人童年居所，红色教育基地', culture: '中华人民共和国第一任总理周恩来的童年居所', housePrice: 50 },
  { id: '7', name: '公共服务', position: 7, price: 0, rent: 0, group: 'community', houses: 0, hotels: 0, mortgaged: false, description: '抽取公共服务卡片' },
  { id: '8', name: '吴承恩故居', position: 8, price: 120, rent: 8, group: 'lightblue', houses: 0, hotels: 0, mortgaged: false, description: '《西游记》作者故居，文学地标', culture: '明代小说家吴承恩的故居，《西游记》诞生地', housePrice: 50 },
  { id: '9', name: '里运河', position: 9, price: 120, rent: 8, group: 'lightblue', houses: 0, hotels: 0, mortgaged: false, description: '京杭大运河淮安段', culture: '世界文化遗产，千年水运文化', housePrice: 50 },
  
  // 监狱
  { id: '10', name: '淮安府衙审判', position: 10, price: 0, rent: 0, group: 'jail', houses: 0, hotels: 0, mortgaged: false, description: '临时拘留，支付罚金或关押' },
  
  // 粉红组
  { id: '11', name: '淮安府署', position: 11, price: 140, rent: 10, group: 'pink', houses: 0, hotels: 0, mortgaged: false, description: '古代官衙，淮安行政中心遗迹', culture: '明清时期淮安府衙门所在地，见证淮安作为漕运总督府的辉煌', housePrice: 100 },
  { id: '12', name: '淮阴电力', position: 12, price: 150, rent: 0, group: 'utility', houses: 0, hotels: 0, mortgaged: false, description: '电力供应公司' },
  { id: '13', name: '镇淮楼', position: 13, price: 140, rent: 10, group: 'pink', houses: 0, hotels: 0, mortgaged: false, description: '古城标志性楼阁，俯瞰运河', culture: '淮安古城的标志性建筑', housePrice: 100 },
  { id: '14', name: '中国漕运博物馆', position: 14, price: 160, rent: 12, group: 'pink', houses: 0, hotels: 0, mortgaged: false, description: '展示大运河漕运历史', culture: '全国唯一以漕运为主题的博物馆', housePrice: 100 },
  { id: '15', name: '汽车站', position: 15, price: 200, rent: 25, group: 'railroad', houses: 0, hotels: 0, mortgaged: false, description: '长途客运枢纽' },
  
  // 橙色组
  { id: '16', name: '中国淮扬菜博物馆', position: 16, price: 180, rent: 14, group: 'orange', houses: 0, hotels: 0, mortgaged: false, description: '淮扬菜文化展示厅，美食圣地', culture: '中国四大菜系之一淮扬菜的文化殿堂', buff: 'food', housePrice: 100 },
  { id: '17', name: '公共服务', position: 17, price: 0, rent: 0, group: 'community', houses: 0, hotels: 0, mortgaged: false, description: '抽取公共服务卡片' },
  { id: '18', name: '楚秀园', position: 18, price: 180, rent: 14, group: 'orange', houses: 0, hotels: 0, mortgaged: false, description: '古典园林，园林与淮扬园林代表', culture: '淮安最著名的古典园林，江南园林艺术的代表', housePrice: 100 },
  { id: '19', name: '淮安里运河文化长廊', position: 19, price: 200, rent: 16, group: 'orange', houses: 0, hotels: 0, mortgaged: false, description: '运河畔文化走廊，现代休闲带', culture: '展现运河文化的现代景观带', housePrice: 100 },
  
  // 运河码头（替换免费停车）
  { id: '20', name: '运河码头', position: 20, price: 0, rent: 0, group: 'parking', houses: 0, hotels: 0, mortgaged: false, description: '抽取运河宝藏卡，获得现金或道具' },
  
  // 红色组
  { id: '21', name: '周恩来纪念馆', position: 21, price: 220, rent: 18, group: 'red', houses: 0, hotels: 0, mortgaged: false, description: '纪念伟人的专题馆，景区核心', culture: '为纪念周恩来总理而建的专题纪念馆', housePrice: 150 },
  { id: '22', name: '机会', position: 22, price: 0, rent: 0, group: 'chance', houses: 0, hotels: 0, mortgaged: false, description: '抽取机会卡片' },
  { id: '23', name: '淮安大剧院', position: 23, price: 220, rent: 18, group: 'red', houses: 0, hotels: 0, mortgaged: false, description: '现代文化艺术中心，演出地标', culture: '淮安市标志性文化建筑', housePrice: 150 },
  { id: '24', name: '淮安市体育中心', position: 24, price: 240, rent: 20, group: 'red', houses: 0, hotels: 0, mortgaged: false, description: '体育赛事举办地，城市活力象征', culture: '淮安市重要的体育文化设施', housePrice: 150 },
  { id: '25', name: '新长铁路', position: 25, price: 200, rent: 25, group: 'railroad', houses: 0, hotels: 0, mortgaged: false, description: '重要铁路干线' },
  
  // 黄色组
  { id: '26', name: '白马湖旅游景区', position: 26, price: 260, rent: 22, group: 'yellow', houses: 0, hotels: 0, mortgaged: false, description: '湖泊生态区，休闲度假胜地', culture: '白马湖生态旅游区，天然氧吧', housePrice: 150 },
  { id: '27', name: '淮安西游乐园', position: 27, price: 260, rent: 22, group: 'yellow', houses: 0, hotels: 0, mortgaged: false, description: '以《西游记》主题的乐园', culture: '以吴承恩《西游记》为主题的大型主题乐园', housePrice: 150 },
  { id: '28', name: '自来水公司', position: 28, price: 150, rent: 0, group: 'utility', houses: 0, hotels: 0, mortgaged: false, description: '城市供水服务' },
  { id: '29', name: '古淮河文化生态景区', position: 29, price: 280, rent: 24, group: 'yellow', houses: 0, hotels: 0, mortgaged: false, description: '淮河古文化与生态融合', culture: '古淮河文化和现代生态理念的完美结合', housePrice: 150 },
  
  // 去监狱
  { id: '30', name: '去监狱', position: 30, price: 0, rent: 0, group: 'gotojail', houses: 0, hotels: 0, mortgaged: false, description: '直接前往监狱' },
  
  // 绿色组
  { id: '31', name: '淮安国际食品博览中心', position: 31, price: 300, rent: 26, group: 'green', houses: 0, hotels: 0, mortgaged: false, description: '食品产业博览会场馆，体现淮安经济', culture: '淮安食品产业发展的展示窗口', housePrice: 200 },
  { id: '32', name: '江苏食品药品职业技术学院', position: 32, price: 300, rent: 26, group: 'green', houses: 0, hotels: 0, mortgaged: false, description: '淮安本地高校，培养食品相关人才', culture: '专业的食品药品类高等职业院校', special: 'lab', housePrice: 200 },
  { id: '33', name: '公共服务', position: 33, price: 0, rent: 0, group: 'community', houses: 0, hotels: 0, mortgaged: false, description: '抽取公共服务卡片' },
  { id: '34', name: '淮阴博物馆', position: 34, price: 320, rent: 28, group: 'green', houses: 0, hotels: 0, mortgaged: false, description: '地方历史博物馆，收藏淮安文物', culture: '展示淮安地区历史文化的重要场所', housePrice: 200 },
  { id: '35', name: '宁淮高速', position: 35, price: 200, rent: 25, group: 'railroad', houses: 0, hotels: 0, mortgaged: false, description: '连接南京的高速公路' },
  
  // 深蓝组
  { id: '36', name: '机会', position: 36, price: 0, rent: 0, group: 'chance', houses: 0, hotels: 0, mortgaged: false, description: '抽取机会卡片' },
  { id: '37', name: '淮安国际商城步行街', position: 37, price: 350, rent: 35, group: 'darkblue', houses: 0, hotels: 0, mortgaged: false, description: '商业繁华区，购物天堂', culture: '淮安最繁华的商业中心', housePrice: 200 },
  { id: '38', name: '奢侈税', position: 38, price: 0, rent: 0, group: 'tax', houses: 0, hotels: 0, mortgaged: false, description: '缴纳奢侈税750元' },
  { id: '39', name: '江苏银行淮安分行', position: 39, price: 350, rent: 35, group: 'darkblue', houses: 0, hotels: 0, mortgaged: false, description: '金融服务机构，代表现代经济支柱', special: 'bank', housePrice: 200 }
]

const CHANCE_CARDS = [
  { id: 'chance1', type: 'chance', title: '参观周恩来故居', description: '获得300元灵感奖金', action: 'addMoney', amount: 300 },
  { id: 'chance2', type: 'chance', title: '吴承恩故居西游灵感爆发', description: '一轮租金翻倍', action: 'doubleRent', amount: 0 },
  { id: 'chance3', type: 'chance', title: '前往起点', description: '回到起点，领取200元', action: 'moveToPosition', position: 0 },
  { id: 'chance4', type: 'chance', title: '交通罚款', description: '违章停车被罚款200元', action: 'loseMoney', amount: 200 },
  { id: 'chance5', type: 'chance', title: '投资运河航运', description: '获得运河船只，航运模式解锁', action: 'getShip', amount: 0 },
  { id: 'chance6', type: 'chance', title: '房产升值', description: '所有房产价值上涨10%', action: 'propertyAppreciation', amount: 0 },
  { id: 'chance7', type: 'chance', title: '漕运博物馆文化节', description: '如果拥有博物馆类地产，额外获得500元', action: 'cultureBonus', amount: 500 },
  { id: 'chance8', type: 'chance', title: '大运河申遗成功', description: '运河相关地产租金提升20%', action: 'canalBonus', amount: 0 },
  { id: 'chance9', type: 'chance', title: '政府基建投资', description: '获得政府扶持资金800元', action: 'addMoney', amount: 800 },
  { id: 'chance10', type: 'chance', title: '前往监狱', description: '直接前往监狱，不经过起点', action: 'goToJail', amount: 0 }
]

const COMMUNITY_CARDS = [
  { id: 'community1', type: 'community', title: '参加河下古镇庙会', description: '所有玩家支付你50元庆贺费', action: 'collectFromAll', amount: 50 },
  { id: 'community2', type: 'community', title: '运河涨水', description: '洪泽湖区地产支付200元防洪费', action: 'floodTax', amount: 200 },
  { id: 'community3', type: 'community', title: '淮扬菜美食节', description: '获得淮扬名菜buff，下次罚款免疫', action: 'getFoodBuff', amount: 0 },
  { id: 'community4', type: 'community', title: '医疗费用', description: '生病住院，支付医疗费用300元', action: 'loseMoney', amount: 300 },
  { id: 'community5', type: 'community', title: '教育投资奖励', description: '支持本地教育，获得回报600元', action: 'addMoney', amount: 600 },
  { id: 'community6', type: 'community', title: '环保奖励', description: '参与运河环保，获得政府奖励400元', action: 'addMoney', amount: 400 },
  { id: 'community7', type: 'community', title: '慈善捐款', description: '参与慈善活动，获得社会声誉和300元奖励', action: 'addMoney', amount: 300 },
  { id: 'community8', type: 'community', title: '文化遗产保护', description: '参与文化遗产保护，每位玩家给你30元', action: 'collectFromAll', amount: 30 },
  { id: 'community9', type: 'community', title: '税收优惠', description: '享受税收优惠政策，下次税费减半', action: 'taxRelief', amount: 0 },
  { id: 'community10', type: 'community', title: '前往起点', description: '社区建设有功，前往起点领奖', action: 'moveToPosition', position: 0 }
]

const CANAL_TREASURE_CARDS = [
  { id: 'treasure1', type: 'treasure', title: '运河宝藏', description: '发现古代商人遗留的宝藏', action: 'addMoney', amount: 2000 },
  { id: 'treasure2', type: 'treasure', title: '航运特权', description: '获得运河船只，解锁航运模式', action: 'getShip', amount: 0 },
  { id: 'treasure3', type: 'treasure', title: '运河加持', description: '运河相关地产租金提升20%', action: 'canalBonus', amount: 20, duration: 5 },
  { id: 'treasure4', type: 'treasure', title: '漕运督察', description: '所有玩家向你缴纳100元通行费', action: 'collectFromAll', amount: 100 },
  { id: 'treasure5', type: 'treasure', title: '商贸兴盛', description: '下次收取租金时翻倍', action: 'doubleRent', amount: 0 },
  { id: 'treasure6', type: 'treasure', title: '水利工程', description: '建造房屋成本减半（一次）', action: 'buildDiscount', amount: 50 },
  { id: 'treasure7', type: 'treasure', title: '运河预言', description: '预知下次骰子结果', action: 'foresight', amount: 0 },
  { id: 'treasure8', type: 'treasure', title: '免疫符', description: '免疫下次监狱或罚款', action: 'immunity', amount: 0 },
  { id: 'treasure9', type: 'treasure', title: '强制交易令', description: '与任意玩家强制交易一次', action: 'forceTrade', amount: 0 },
  { id: 'treasure10', type: 'treasure', title: '股市内幕', description: '获得股票内幕消息，股票投资收益翻倍（3回合）', action: 'stockBonus', amount: 100, duration: 3 }
]

// 颜色组垄断效果
const GROUP_MONOPOLY_EFFECTS = {
  brown: { name: '古镇风韵', effect: '租金基础加成10%', bonus: 0.1 },
  lightblue: { name: '伟人故里', effect: '每回合额外获得20元文化津贴', bonus: 20 },
  pink: { name: '府衙威严', effect: '免疫税收类罚款', bonus: 'tax_immunity' },
  orange: { name: '淮扬美食', effect: '每回合随机获得50-200元美食收入', bonus: 'food_income' },
  red: { name: '文化圣地', effect: '租金收入增加20%', bonus: 0.2 },
  yellow: { name: '生态旅游', effect: '每3回合获得300元生态奖励', bonus: 'eco_bonus' },
  green: { name: '教育科研', effect: '建造房屋成本减少25%', bonus: 'build_discount' },
  darkblue: { name: '经济中心', effect: '租金翻倍，但建造成本增加50%', bonus: 'economic_center' }
}

module.exports = {
  HUAIAN_PROPERTIES,
  CHANCE_CARDS,
  COMMUNITY_CARDS,
  CANAL_TREASURE_CARDS,
  GROUP_MONOPOLY_EFFECTS
}