# 开发规范和规则

- 修复了玩家掷骰子后不触发购买地块事件的关键问题：1.修复了handlePlayerLanding函数的无限递归错误；2.统一了服务器端和客户端的地块数据；3.调整了经济参数(起始资金15000元，经过起点奖励2000元)以适应新的地块价格；4.添加了详细的调试日志来追踪事件触发
