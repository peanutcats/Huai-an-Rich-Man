import type { Property } from '@/types'

export const HUAIAN_PROPERTIES: Property[] = [
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

export const CHANCE_CARDS = [
  { id: 'chance1', type: 'chance', title: '政府扶持', description: '获得政府创业扶持资金', action: 'addMoney', amount: 1500 },
  { id: 'chance2', type: 'chance', title: '市场机遇', description: '抓住市场机遇，投资收益翻倍', action: 'doubleRent', amount: 0 },
  { id: 'chance3', type: 'chance', title: '前往起点', description: '回到起点，领取2000元', action: 'moveToPosition', position: 0 },
  { id: 'chance4', type: 'chance', title: '交通罚款', description: '违章停车被罚款', action: 'loseMoney', amount: 500 },
  { id: 'chance5', type: 'chance', title: '投资失败', description: '投资项目失败，损失资金', action: 'loseMoney', amount: 1000 },
  { id: 'chance6', type: 'chance', title: '房产升值', description: '所有房产价值上涨10%', action: 'propertyAppreciation', amount: 0 },
]

export const COMMUNITY_CARDS = [
  { id: 'community1', type: 'community', title: '慈善捐款', description: '参与慈善活动，获得社会声誉', action: 'addMoney', amount: 800 },
  { id: 'community2', type: 'community', title: '纳税优惠', description: '享受税收优惠政策', action: 'taxRelief', amount: 0 },
  { id: 'community3', type: 'community', title: '社区建设', description: '参与社区建设，每位玩家给你50元', action: 'collectFromAll', amount: 50 },
  { id: 'community4', type: 'community', title: '医疗费用', description: '生病住院，支付医疗费用', action: 'loseMoney', amount: 800 },
  { id: 'community5', type: 'community', title: '教育投资', description: '教育投资获得回报', action: 'addMoney', amount: 1200 },
  { id: 'community6', type: 'community', title: '环保奖励', description: '环保项目获得政府奖励', action: 'addMoney', amount: 1000 },
]

export function getPropertyByPosition(position: number): Property | undefined {
  return HUAIAN_PROPERTIES.find(p => p.position === position)
}

export function getPropertyById(id: string): Property | undefined {
  return HUAIAN_PROPERTIES.find(p => p.id === id)
}

export function getPropertiesByGroup(group: string): Property[] {
  return HUAIAN_PROPERTIES.filter(p => p.group === group)
}

export function calculateRent(property: Property): number {
  let rent = property.rent
  
  // 房屋加成 - 每个房屋增加100%的租金
  if (property.houses > 0) {
    rent *= (1 + property.houses * 1.0)
  }
  
  // 酒店加成 - 更大的收益
  if (property.hotels > 0) {
    rent *= (1 + property.hotels * 3)
  }
  
  return Math.floor(rent)
}

export const CANAL_TREASURE_CARDS = [
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

export const GROUP_MONOPOLY_EFFECTS = {
  brown: { name: '古镇文化区', effect: '租金+15%', bonus: 0.15 },
  lightblue: { name: '伟人故里', effect: '每回合+20元文化津贴', bonus: 20 },
  pink: { name: '古建遗址区', effect: '租金+25%', bonus: 0.25 },
  orange: { name: '淮扬美食区', effect: '每回合随机获得50-200元美食收入', bonus: 'food_income' },
  red: { name: '现代文化区', effect: '租金+30%', bonus: 0.30 },
  yellow: { name: '生态旅游区', effect: '每3回合+300元生态奖励', bonus: 'eco_bonus' },
  green: { name: '教育科研区', effect: '建造成本-25%，租金+35%', bonus: 0.35 },
  darkblue: { name: '商业金融区', effect: '租金+50%，可进行高级金融操作', bonus: 0.50 },
  railroad: { name: '交通枢纽', effect: '根据拥有数量倍增租金', bonus: 'railroad_multiplier' },
  utility: { name: '公用事业', effect: '租金=骰子点数×倍数', bonus: 'utility_multiplier' }
}

export function getPropertyColor(group: string): string {
  const colors: Record<string, string> = {
    brown: 'linear-gradient(145deg, #8B4513 0%, #A0522D 100%)',
    lightblue: 'linear-gradient(145deg, #87CEEB 0%, #B0E0E6 100%)',
    pink: 'linear-gradient(145deg, #FF69B4 0%, #FFB6C1 100%)',
    orange: 'linear-gradient(145deg, #FF8C00 0%, #FFA500 100%)',
    red: 'linear-gradient(145deg, #DC143C 0%, #FF6347 100%)',
    yellow: 'linear-gradient(145deg, #FFD700 0%, #FFFF99 100%)',
    green: 'linear-gradient(145deg, #228B22 0%, #32CD32 100%)',
    darkblue: 'linear-gradient(145deg, #000080 0%, #191970 100%)',
    railroad: 'linear-gradient(145deg, #2C3E50 0%, #34495E 100%)',
    utility: 'linear-gradient(145deg, #7F8C8D 0%, #95A5A6 100%)',
    special: 'linear-gradient(145deg, #F39C12 0%, #F1C40F 100%)',
    chance: 'linear-gradient(145deg, #E74C3C 0%, #FF6B6B 100%)',
    community: 'linear-gradient(145deg, #3498DB 0%, #74B9FF 100%)',
    tax: 'linear-gradient(145deg, #8E44AD 0%, #9B59B6 100%)',
    jail: 'linear-gradient(145deg, #95A5A6 0%, #BDC3C7 100%)',
    gotojail: 'linear-gradient(145deg, #E74C3C 0%, #C0392B 100%)',
    parking: 'linear-gradient(145deg, #1ABC9C 0%, #16A085 100%)'
  }
  return colors[group] || 'linear-gradient(145deg, #CCCCCC 0%, #DDDDDD 100%)'
}