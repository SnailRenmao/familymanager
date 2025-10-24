import { create } from 'zustand';
import { db } from '../db/database';

// 这就像Vue的defineStore，但写法更简洁
export const useAppStore = create((set, get) => ({
  // ========== 状态（类似Vue的state） ==========
  currentHouse: null,
  currentFloor: null,
  floors: [],
  rooms: [],
  furniture: [],
  items: [],
  selectedRoom: null,
  selectedFurniture: null,
  currentView: 'rooms', // rooms, furniture, items
  isLoading: false,

  // ========== 方法（类似Vue的actions） ==========
  
  // 初始化：加载房屋数据
  initialize: async () => {
    set({ isLoading: true });
    try {
      const houses = await db.houses.toArray();
      if (houses.length > 0) {
        get().setCurrentHouse(houses[0]);
      }
    } catch (error) {
      console.error('初始化失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 设置当前房屋
  setCurrentHouse: async (house) => {
    set({ currentHouse: house });
    // 加载楼层
    const floors = await db.floors.where('houseId').equals(house.id).toArray();
    set({ floors });
    if (floors.length > 0) {
      get().setCurrentFloor(floors[0]);
    }
  },

  // 设置当前楼层
  setCurrentFloor: async (floor) => {
    set({ currentFloor: floor, isLoading: true });
    // 加载该楼层的所有房间
    const rooms = await db.rooms.where('floorId').equals(floor.id).toArray();
    set({ rooms, isLoading: false });
  },

  // 设置当前视图
  setCurrentView: (view) => {
    set({ currentView: view });
  },

  // 选中家具
  selectFurniture: (furniture) => {
    set({ selectedFurniture: furniture });
    if (furniture) {
      get().loadItemsByFurniture(furniture.id);
    }
  },

  // 加载房间内的家具
  loadFurnitureByRoom: async (roomId) => {
    set({ isLoading: true });
    const furniture = await db.furniture.where('roomId').equals(roomId).toArray();
    set({ furniture, isLoading: false });
  },

  // 加载家具内的物品
  loadItemsByFurniture: async (furnitureId) => {
    set({ isLoading: true });
    const items = await db.items.where('furnitureId').equals(furnitureId).toArray();
    set({ items, isLoading: false });
  },

  // 添加家具
  addFurniture: async (furnitureData) => {
    const { selectedRoom } = get();
    const furnitureId = await db.furniture.add({
      roomId: selectedRoom.id,
      ...furnitureData
    });
    
    // 重新加载家具列表
    await get().loadFurnitureByRoom(selectedRoom.id);
    return furnitureId;
  },

  // 更新家具
  updateFurniture: async (furnitureId, updates) => {
    await db.furniture.update(furnitureId, updates);
    const { selectedRoom } = get();
    await get().loadFurnitureByRoom(selectedRoom.id);
  },

  // 删除家具
  deleteFurniture: async (furnitureId) => {
    // 先删除关联的物品
    await db.items.where('furnitureId').equals(furnitureId).delete();
    // 删除家具
    await db.furniture.delete(furnitureId);
    const { selectedRoom } = get();
    await get().loadFurnitureByRoom(selectedRoom.id);
    set({ selectedFurniture: null, items: [] });
  },

  // 添加物品
  addItem: async (itemData) => {
    const { selectedFurniture } = get();
    const itemId = await db.items.add({
      furnitureId: selectedFurniture.id,
      addedAt: new Date(),
      ...itemData
    });
    
    // 重新加载物品列表
    await get().loadItemsByFurniture(selectedFurniture.id);
    return itemId;
  },

  // 更新物品
  updateItem: async (itemId, updates) => {
    await db.items.update(itemId, updates);
    const { selectedFurniture } = get();
    await get().loadItemsByFurniture(selectedFurniture.id);
  },

  // 删除物品
  deleteItem: async (itemId) => {
    await db.items.delete(itemId);
    const { selectedFurniture } = get();
    await get().loadItemsByFurniture(selectedFurniture.id);
  },

  // 添加楼层
  addFloor: async (name) => {
    const { currentHouse } = get();
    const newFloorLevel = get().floors.length + 1;
    
    const floorId = await db.floors.add({
      houseId: currentHouse.id,
      level: newFloorLevel,
      name: name || `${newFloorLevel}楼`
    });
    
    // 重新加载楼层列表
    const floors = await db.floors.where('houseId').equals(currentHouse.id).toArray();
    set({ floors });
    
    return floorId;
  },

  // 添加房间
  addRoom: async (roomData) => {
    const { currentFloor } = get();
    const roomId = await db.rooms.add({
      floorId: currentFloor.id,
      ...roomData
    });
    
    // 重新加载房间列表
    const rooms = await db.rooms.where('floorId').equals(currentFloor.id).toArray();
    set({ rooms });
    
    return roomId;
  },

  // 更新房间
  updateRoom: async (roomId, updates) => {
    await db.rooms.update(roomId, updates);
    const rooms = await db.rooms.where('floorId').equals(get().currentFloor.id).toArray();
    set({ rooms });
  },

  // 删除房间
  deleteRoom: async (roomId) => {
    await db.rooms.delete(roomId);
    const rooms = await db.rooms.where('floorId').equals(get().currentFloor.id).toArray();
    set({ rooms, selectedRoom: null });
  },

  // 选中房间
  selectRoom: (room) => {
    set({ selectedRoom: room });
  }
}));