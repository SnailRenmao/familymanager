import Dexie from 'dexie';

// 创建数据库实例（类似Vue里定义data）
export const db = new Dexie('HomeStorageDB');

// 定义数据表结构
db.version(1).stores({
  houses: '++id, name, createdAt',           // 房屋
  floors: '++id, houseId, level, name',      // 楼层
  rooms: '++id, floorId, name, x, y, width, height, color',  // 房间
  furniture: '++id, roomId, name, x, y, width, height, color', // 家具
  items: '++id, furnitureId, name, quantity, photo, addedAt'   // 物品
});

// 初始化示例数据
export async function initDatabase() {
  const houseCount = await db.houses.count();
  
  if (houseCount === 0) {
    // 创建默认房屋
    const houseId = await db.houses.add({
      name: '我的家',
      createdAt: new Date()
    });
    
    // 创建一楼
    const floorId = await db.floors.add({
      houseId: houseId,
      level: 1,
      name: '一楼'
    });

    // 创建默认房间
    const room1Id = await db.rooms.add({
      floorId: floorId,
      name: '客厅',
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      color: '#3b82f6'
    });

    const room2Id = await db.rooms.add({
      floorId: floorId,
      name: '厨房',
      x: 280,
      y: 50,
      width: 150,
      height: 120,
      color: '#10b981'
    });

    const room3Id = await db.rooms.add({
      floorId: floorId,
      name: '主卧',
      x: 50,
      y: 230,
      width: 180,
      height: 120,
      color: '#8b5cf6'
    });

    const room4Id = await db.rooms.add({
      floorId: floorId,
      name: '次卧',
      x: 260,
      y: 230,
      width: 150,
      height: 100,
      color: '#ec4899'
    });

    const room5Id = await db.rooms.add({
      floorId: floorId,
      name: '书房',
      x: 440,
      y: 50,
      width: 120,
      height: 120,
      color: '#14b8a6'
    });

    const room6Id = await db.rooms.add({
      floorId: floorId,
      name: '厕所',
      x: 440,
      y: 230,
      width: 80,
      height: 100,
      color: '#06b6d4'
    });

    // 为每个房间添加示例家具
    // 客厅家具
    const furniture1Id = await db.furniture.add({
      roomId: room1Id,
      name: '书架',
      x: 100,
      y: 70,
      width: 80,
      height: 40,
      color: '#d97706'
    });

    const furniture2Id = await db.furniture.add({
      roomId: room1Id,
      name: '沙发',
      x: 150,
      y: 120,
      width: 100,
      height: 60,
      color: '#94a3b8'
    });

    // 厨房家具
    const furniture3Id = await db.furniture.add({
      roomId: room2Id,
      name: '橱柜',
      x: 300,
      y: 70,
      width: 100,
      height: 30,
      color: '#f59e0b'
    });

    // 卧室家具
    await db.furniture.add({
      roomId: room3Id,
      name: '床',
      x: 80,
      y: 90,
      width: 120,
      height: 80,
      color: '#f472b6'
    });

    await db.furniture.add({
      roomId: room4Id,
      name: '单人床',
      x: 90,
      y: 70,
      width: 80,
      height: 60,
      color: '#fb923c'
    });

    // 书房家具
    await db.furniture.add({
      roomId: room5Id,
      name: '书桌',
      x: 10,
      y: 30,
      width: 90,
      height: 60,
      color: '#a16207'
    });

    // 厕所家具 - 添加缺失的厕所家具
    await db.furniture.add({
      roomId: room6Id,
      name: '马桶',
      x: 20,
      y: 30,
      width: 40,
      height: 40,
      color: '#64748b'
    });

    // 创建示例物品
    // 书架上的物品
    await db.items.add({
      furnitureId: furniture1Id,
      name: '《JavaScript权威指南》',
      quantity: 1,
      photo: null,
      addedAt: new Date()
    });

    await db.items.add({
      furnitureId: furniture1Id,
      name: '笔记本',
      quantity: 5,
      photo: null,
      addedAt: new Date()
    });

    // 沙发上的物品
    await db.items.add({
      furnitureId: furniture2Id,
      name: '靠枕',
      quantity: 3,
      photo: null,
      addedAt: new Date()
    });

    // 橱柜里的物品
    await db.items.add({
      furnitureId: furniture3Id,
      name: '锅具套装',
      quantity: 1,
      photo: null,
      addedAt: new Date()
    });

    await db.items.add({
      furnitureId: furniture3Id,
      name: '碗碟套装',
      quantity: 1,
      photo: null,
      addedAt: new Date()
    });
    
    console.log('✅ 数据库初始化完成');
  }
}