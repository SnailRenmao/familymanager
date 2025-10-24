import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Home, Building, Layers, Table, ChevronDown, ChevronRight, Plus, Edit2 } from 'lucide-react';

export default function TreeView() {
  const { 
    houses = [], 
    floors = [], 
    rooms = [], 
    furniture = [],
    currentHouse, 
    currentFloor, 
    selectedRoom,
    setCurrentHouse, 
    setCurrentFloor, 
    selectRoom,
    loadFurnitureByRoom,
    currentView,
    setCurrentView
  } = useAppStore();
  
  // 展开/折叠状态管理
  const [expandedHouses, setExpandedHouses] = useState(new Set());
  const [expandedFloors, setExpandedFloors] = useState(new Set());
  
  // 当选择房间时，自动展开对应的楼层和房屋
  useEffect(() => {
    if (selectedRoom) {
      const floor = floors.find(f => f.id === selectedRoom.floorId);
      const house = houses.find(h => h.id === floor?.houseId);
      
      if (house) {
        setExpandedHouses(prev => new Set(prev).add(house.id));
      }
      if (floor) {
        setExpandedFloors(prev => new Set(prev).add(floor.id));
      }
    }
  }, [selectedRoom, floors, houses]);
  
  // 切换房屋展开/折叠状态
  const toggleHouse = (houseId) => {
    setExpandedHouses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(houseId)) {
        newSet.delete(houseId);
      } else {
        newSet.add(houseId);
        // 选中该房屋
        const house = houses.find(h => h.id === houseId);
        if (house) {
          setCurrentHouse(house);
        }
      }
      return newSet;
    });
  };
  
  // 切换楼层展开/折叠状态
  const toggleFloor = (floorId, houseId) => {
    setExpandedFloors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(floorId)) {
        newSet.delete(floorId);
      } else {
        newSet.add(floorId);
        // 选中该房屋和楼层
        if (!currentHouse || currentHouse.id !== houseId) {
          const house = houses.find(h => h.id === houseId);
          if (house) {
            setCurrentHouse(house);
          }
        }
        const floor = floors.find(f => f.id === floorId);
        if (floor) {
          setCurrentFloor(floor);
        }
      }
      return newSet;
    });
  };
  
  // 选择房间
  const handleSelectRoom = (room) => {
    selectRoom(room);
    loadFurnitureByRoom(room.id);
    setCurrentView('rooms');
  };
  
  // 获取指定房屋的所有楼层
  const getFloorsByHouse = (houseId) => {
    return floors.filter(floor => floor.houseId === houseId);
  };
  
  // 获取指定楼层的所有房间
  const getRoomsByFloor = (floorId) => {
    return rooms.filter(room => room.floorId === floorId);
  };
  
  // 计算房间内家具数量
  const getFurnitureCount = (roomId) => {
    return furniture && Array.isArray(furniture) 
      ? furniture.filter(item => item && item.roomId === roomId).length 
      : 0;
  };
  
  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* 顶部标题 */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Building size={18} />
          <span>我的住房</span>
          <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">
            {houses.length}
          </span>
        </h2>
      </div>
      
      {/* 树形结构内容 */}
      <div className="flex-1 overflow-auto p-2">
        {houses.map((house) => {
          const houseFloors = getFloorsByHouse(house.id);
          const isHouseExpanded = expandedHouses.has(house.id);
          const isHouseSelected = currentHouse?.id === house.id;
          
          return (
            <div key={house.id} className="mb-1">
              {/* 房屋节点 */}
              <div 
                onClick={() => toggleHouse(house.id)}
                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all ${isHouseSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-100'}`}
              >
                {isHouseExpanded ? (
                  <ChevronDown size={16} className="flex-shrink-0 mr-2" />
                ) : (
                  <ChevronRight size={16} className="flex-shrink-0 mr-2" />
                )}
                <Home size={16} className="flex-shrink-0 mr-2" />
                <span className="flex-1 truncate">{house.name || '未命名房屋'}</span>
                <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                  {Array.isArray(houseFloors) ? houseFloors.length : 0}层
                </span>
              </div>
              
              {/* 楼层节点 */}
              {isHouseExpanded && houseFloors.map((floor) => {
                const floorRooms = getRoomsByFloor(floor.id);
                const isFloorExpanded = expandedFloors.has(floor.id);
                const isFloorSelected = currentFloor?.id === floor.id;
                
                return (
                  <div key={floor.id} className="ml-6 mb-1">
                    <div 
                      onClick={() => toggleFloor(floor.id, house.id)}
                      className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all ${isFloorSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-100'}`}
                    >
                      {isFloorExpanded ? (
                        <ChevronDown size={16} className="flex-shrink-0 mr-2" />
                      ) : (
                        <ChevronRight size={16} className="flex-shrink-0 mr-2" />
                      )}
                      <Layers size={16} className="flex-shrink-0 mr-2" />
                      <span className="flex-1 truncate">{floor.name || '未命名楼层'}</span>
                      <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                        {Array.isArray(floorRooms) ? floorRooms.length : 0}间
                      </span>
                    </div>
                    
                    {/* 房间节点 */}
                    {isFloorExpanded && floorRooms.map((room) => {
                      const isRoomSelected = selectedRoom?.id === room.id;
                      const furnitureCount = getFurnitureCount(room.id);
                      
                      return (
                        <div 
                          key={room.id}
                          onClick={() => handleSelectRoom(room)}
                          className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all ml-6 mb-0.5 ${isRoomSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-100'}`}
                        >
                          <Table size={16} className="flex-shrink-0 mr-2" />
                          <span className="flex-1 truncate">{room.name || '未命名房间'}</span>
                          {furnitureCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                              {furnitureCount}件
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
        
        {/* 无数据状态 */}
        {houses.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Home size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">暂无住房数据</p>
          </div>
        )}
      </div>
      
      {/* 底部操作栏 */}
      <div className="px-4 py-3 border-t border-slate-200 flex justify-between">
        <button className="text-sm flex items-center gap-1 text-slate-600 hover:text-primary transition-colors">
          <Plus size={14} />
          <span>添加住房</span>
        </button>
        <button className="text-sm flex items-center gap-1 text-slate-600 hover:text-primary transition-colors">
          <Edit2 size={14} />
          <span>管理</span>
        </button>
      </div>
    </div>
  );
}