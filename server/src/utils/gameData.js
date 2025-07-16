const HUAIAN_PROPERTIES = [
  // 起点
  { id: '0', name: '起点', position: 0, price: 0, rent: 0, group: 'special', houses: 0, hotels: 0, mortgaged: false, description: '每次经过或停留获得2000元', culture: '淮安市政府广场，城市的政治中心' },
  
  // 第一组 - 淮安区
  { id: '1', name: '淮安府署', position: 1, price: 600, rent: 20, group: 'brown', houses: 0, hotels: 0, mortgaged: false, description: '明清时期淮安府衙门所在地', culture: '淮安历史文化的重要象征，见证了淮安作为漕运总督府的辉煌' },
  { id: '2', name: '机会', position: 2, price: 0, rent: 0, group: 'chance', houses: 0, hotels: 0, mortgaged: false, description: '抽取机会卡片' },
  { id: '3', name: '河下古镇', position: 3, price: 600, rent: 40, group: 'brown', houses: 0, hotels: 0, mortgaged: false, description: '千年古镇，文化底蕴深厚', culture: '淮安历史文化名镇，古代漕运重镇', financialTip: '旅游业投资具有长期稳定回报的特点' },
  { id: '4', name: '所得税', position: 4, price: 0, rent: 0, group: 'tax', houses: 0, hotels: 0, mortgaged: false, description: '缴纳所得税200元' },
  { id: '5', name: '淮安东站', position: 5, price: 2000, rent: 250, group: 'railroad', houses: 0, hotels: 0, mortgaged: false, description: '高铁枢纽站', culture: '连接南北的重要交通枢纽', financialTip: '交通基础设施是经济发展的重要支撑' },
  
  // 第二组 - 清江浦区
  { id: '6', name: '清晏园', position: 6, price: 1000, rent: 60, group: 'lightblue', houses: 0, hotels: 0, mortgaged: false, description: '淮安最著名的古典园林', culture: '江南园林艺术的代表作品' },
  { id: '7', name: '公共服务', position: 7, price: 0, rent: 0, group: 'community', houses: 0, hotels: 0, mortgaged: false, description: '抽取公共服务卡片' },
  { id: '8', name: '淮安万达广场', position: 8, price: 1000, rent: 60, group: 'lightblue', houses: 0, hotels: 0, mortgaged: false, description: '现代化商业中心', financialTip: '商业地产投资需要考虑人流量和消费能力' },
  { id: '9', name: '里运河', position: 9, price: 1200, rent: 80, group: 'lightblue', houses: 0, hotels: 0, mortgaged: false, description: '京杭大运河淮安段', culture: '世界文化遗产，千年水运文化', financialTip: '文化旅游资源具有独特的投资价值' },
  
  // 监狱
  { id: '10', name: '监狱', position: 10, price: 0, rent: 0, group: 'jail', houses: 0, hotels: 0, mortgaged: false, description: '临时拘留所' },
  
  // 剩余地产简化版本
  { id: '11', name: '韩信故里', position: 11, price: 1400, rent: 100, group: 'pink', houses: 0, hotels: 0, mortgaged: false, description: '兵仙韩信的故乡', culture: '韩信点兵、韩信练兵的历史文化景点' },
  { id: '12', name: '淮阴电力', position: 12, price: 1500, rent: 0, group: 'utility', houses: 0, hotels: 0, mortgaged: false, description: '电力供应公司', financialTip: '公用事业投资具有稳定的现金流' },
  { id: '13', name: '淮阴工业园', position: 13, price: 1400, rent: 100, group: 'pink', houses: 0, hotels: 0, mortgaged: false, description: '现代制造业基地' },
  { id: '14', name: '师范学院', position: 14, price: 1600, rent: 120, group: 'pink', houses: 0, hotels: 0, mortgaged: false, description: '知名师范院校' },
  { id: '15', name: '汽车站', position: 15, price: 2000, rent: 250, group: 'railroad', houses: 0, hotels: 0, mortgaged: false, description: '长途客运枢纽' },
  
  { id: '16', name: '富士康', position: 16, price: 1800, rent: 140, group: 'orange', houses: 0, hotels: 0, mortgaged: false, description: '高科技制造基地' },
  { id: '17', name: '公共服务', position: 17, price: 0, rent: 0, group: 'community', houses: 0, hotels: 0, mortgaged: false, description: '抽取公共服务卡片' },
  { id: '18', name: '软件园', position: 18, price: 1800, rent: 140, group: 'orange', houses: 0, hotels: 0, mortgaged: false, description: '软件产业聚集区' },
  { id: '19', name: '保税区', position: 19, price: 2000, rent: 160, group: 'orange', houses: 0, hotels: 0, mortgaged: false, description: '对外贸易特殊监管区' },
  
  // 免费停车
  { id: '20', name: '免费停车', position: 20, price: 0, rent: 0, group: 'parking', houses: 0, hotels: 0, mortgaged: false, description: '免费停车场' },
  
  { id: '21', name: '涟水公园', position: 21, price: 2200, rent: 180, group: 'red', houses: 0, hotels: 0, mortgaged: false, description: '涟水县城市公园' },
  { id: '22', name: '机会', position: 22, price: 0, rent: 0, group: 'chance', houses: 0, hotels: 0, mortgaged: false, description: '抽取机会卡片' },
  { id: '23', name: '涟水机场', position: 23, price: 2200, rent: 180, group: 'red', houses: 0, hotels: 0, mortgaged: false, description: '支线机场' },
  { id: '24', name: '涟水工业园', position: 24, price: 2400, rent: 200, group: 'red', houses: 0, hotels: 0, mortgaged: false, description: '县域工业发展基地' },
  { id: '25', name: '新长铁路', position: 25, price: 2000, rent: 250, group: 'railroad', houses: 0, hotels: 0, mortgaged: false, description: '重要铁路干线' },
  
  { id: '26', name: '洪泽湖', position: 26, price: 2600, rent: 220, group: 'yellow', houses: 0, hotels: 0, mortgaged: false, description: '中国第四大淡水湖' },
  { id: '27', name: '洪泽湖大堤', position: 27, price: 2600, rent: 220, group: 'yellow', houses: 0, hotels: 0, mortgaged: false, description: '古代水利工程' },
  { id: '28', name: '自来水公司', position: 28, price: 1500, rent: 0, group: 'utility', houses: 0, hotels: 0, mortgaged: false, description: '城市供水服务' },
  { id: '29', name: '洪泽渔港', position: 29, price: 2800, rent: 240, group: 'yellow', houses: 0, hotels: 0, mortgaged: false, description: '淡水渔业基地' },
  
  // 去监狱
  { id: '30', name: '去监狱', position: 30, price: 0, rent: 0, group: 'gotojail', houses: 0, hotels: 0, mortgaged: false, description: '直接前往监狱' },
  
  { id: '31', name: '龙虾城', position: 31, price: 3000, rent: 260, group: 'green', houses: 0, hotels: 0, mortgaged: false, description: '中国龙虾之都' },
  { id: '32', name: '第一山', position: 32, price: 3000, rent: 260, group: 'green', houses: 0, hotels: 0, mortgaged: false, description: '国家级森林公园' },
  { id: '33', name: '公共服务', position: 33, price: 0, rent: 0, group: 'community', houses: 0, hotels: 0, mortgaged: false, description: '抽取公共服务卡片' },
  { id: '34', name: '盱眙古城', position: 34, price: 3200, rent: 280, group: 'green', houses: 0, hotels: 0, mortgaged: false, description: '千年古县' },
  { id: '35', name: '宁淮高速', position: 35, price: 2000, rent: 250, group: 'railroad', houses: 0, hotels: 0, mortgaged: false, description: '连接南京的高速公路' },
  
  { id: '36', name: '机会', position: 36, price: 0, rent: 0, group: 'chance', houses: 0, hotels: 0, mortgaged: false, description: '抽取机会卡片' },
  { id: '37', name: '荷花荡', position: 37, price: 3500, rent: 350, group: 'darkblue', houses: 0, hotels: 0, mortgaged: false, description: '万亩荷花观赏地' },
  { id: '38', name: '奢侈税', position: 38, price: 0, rent: 0, group: 'tax', houses: 0, hotels: 0, mortgaged: false, description: '缴纳奢侈税750元' },
  { id: '39', name: '水上森林', position: 39, price: 4000, rent: 500, group: 'darkblue', houses: 0, hotels: 0, mortgaged: false, description: '独特的水上森林景观' }
]

const CHANCE_CARDS = [
  { id: 'chance1', type: 'chance', title: '政府扶持', description: '获得政府创业扶持资金1500元', action: 'addMoney', amount: 1500 },
  { id: 'chance2', type: 'chance', title: '市场机遇', description: '抓住市场机遇，下次收取租金翻倍', action: 'doubleRent', amount: 0 },
  { id: 'chance3', type: 'chance', title: '前往起点', description: '回到起点，领取2000元', action: 'moveToPosition', position: 0 },
  { id: 'chance4', type: 'chance', title: '交通罚款', description: '违章停车被罚款500元', action: 'loseMoney', amount: 500 },
  { id: 'chance5', type: 'chance', title: '投资失败', description: '投资项目失败，损失1000元', action: 'loseMoney', amount: 1000 },
]

const COMMUNITY_CARDS = [
  { id: 'community1', type: 'community', title: '慈善捐款', description: '参与慈善活动，获得社会声誉，奖励800元', action: 'addMoney', amount: 800 },
  { id: 'community2', type: 'community', title: '纳税优惠', description: '享受税收优惠政策', action: 'taxRelief', amount: 0 },
  { id: 'community3', type: 'community', title: '社区建设', description: '参与社区建设，每位玩家给你50元', action: 'collectFromAll', amount: 50 },
  { id: 'community4', type: 'community', title: '医疗费用', description: '生病住院，支付医疗费用800元', action: 'loseMoney', amount: 800 },
  { id: 'community5', type: 'community', title: '教育投资', description: '教育投资获得回报1200元', action: 'addMoney', amount: 1200 },
]

module.exports = {
  HUAIAN_PROPERTIES,
  CHANCE_CARDS,
  COMMUNITY_CARDS
}