import { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Search, Home, Layers, Table, Package, PackageCheck, ArrowRight, ChevronDown, Filter } from 'lucide-react';

export default function SearchPanel() {
  const { houses = [], floors = [], rooms = [], furniture = [], items = [] } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, house, floor, room, furniture, item
  const [showFilters, setShowFilters] = useState(false);
  
  // 搜索结果分类
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { houses: [], floors: [], rooms: [], furniture: [], items: [] };
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = {
      houses: searchType === 'all' || searchType === 'house'
        ? houses.filter(h => h.name.toLowerCase().includes(term))
        : [],
      floors: searchType === 'all' || searchType === 'floor'
        ? floors.filter(f => {
            const floorMatch = f.name.toLowerCase().includes(term);
            const houseName = houses.find(h => h.id === f.houseId)?.name || '';
            return floorMatch || houseName.toLowerCase().includes(term);
          })
        : [],
      rooms: searchType === 'all' || searchType === 'room'
        ? rooms.filter(r => {
            const roomMatch = r.name.toLowerCase().includes(term);
            const floor = floors.find(f => f.id === r.floorId);
            const house = floor ? houses.find(h => h.id === floor.houseId) : null;
            const floorName = floor?.name || '';
            const houseName = house?.name || '';
            return roomMatch || floorName.toLowerCase().includes(term) || houseName.toLowerCase().includes(term);
          })
        : [],
      furniture: searchType === 'all' || searchType === 'furniture'
        ? furniture.filter(f => {
            const furnitureMatch = f.name.toLowerCase().includes(term);
            const room = rooms.find(r => r.id === f.roomId);
            const floor = room ? floors.find(f => f.id === room.floorId) : null;
            const house = floor ? houses.find(h => h.id === floor.houseId) : null;
            const roomName = room?.name || '';
            const floorName = floor?.name || '';
            const houseName = house?.name || '';
            return furnitureMatch || roomName.toLowerCase().includes(term) || floorName.toLowerCase().includes(term) || houseName.toLowerCase().includes(term);
          })
        : [],
      items: searchType === 'all' || searchType === 'item'
        ? items.filter(i => {
            const itemMatch = i.name.toLowerCase().includes(term);
            const furn = furniture.find(f => f.id === i.furnitureId);
            const room = furn ? rooms.find(r => r.id === furn.roomId) : null;
            const floor = room ? floors.find(f => f.id === room.floorId) : null;
            const house = floor ? houses.find(h => h.id === floor.houseId) : null;
            const furnitureName = furn?.name || '';
            const roomName = room?.name || '';
            const floorName = floor?.name || '';
            const houseName = house?.name || '';
            return itemMatch || furnitureName.toLowerCase().includes(term) || roomName.toLowerCase().includes(term) || floorName.toLowerCase().includes(term) || houseName.toLowerCase().includes(term);
          })
        : []
    };
    
    return filtered;
  }, [searchTerm, searchType, houses, floors, rooms, furniture, items]);
  
  // 计算总结果数
  const totalResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);
  
  // 获取物品所在位置路径
  const getItemPath = (item) => {
    const furn = furniture.find(f => f.id === item.furnitureId);
    const room = furn ? rooms.find(r => r.id === furn.roomId) : null;
    const floor = room ? floors.find(f => f.id === room.floorId) : null;
    const house = floor ? houses.find(h => h.id === floor.houseId) : null;
    
    return [house, floor, room, furn]
      .filter(Boolean)
      .map((obj, idx, arr) => obj.name + (idx < arr.length - 1 ? ' > ' : ''))
      .join('');
  };
  
  // 获取家具所在位置路径
  const getFurniturePath = (furn) => {
    const room = rooms.find(r => r.id === furn.roomId);
    const floor = room ? floors.find(f => f.id === room.floorId) : null;
    const house = floor ? houses.find(h => h.id === floor.houseId) : null;
    
    return [house, floor, room]
      .filter(Boolean)
      .map((obj, idx, arr) => obj.name + (idx < arr.length - 1 ? ' > ' : ''))
      .join('');
  };
  
  // 获取房间所在位置路径
  const getRoomPath = (room) => {
    const floor = floors.find(f => f.id === room.floorId);
    const house = floor ? houses.find(h => h.id === floor.houseId) : null;
    
    return [house, floor]
      .filter(Boolean)
      .map((obj, idx, arr) => obj.name + (idx < arr.length - 1 ? ' > ' : ''))
      .join('');
  };
  
  // 获取楼层所在位置路径
  const getFloorPath = (floor) => {
    const house = houses.find(h => h.id === floor.houseId);
    return house ? house.name : '';
  };
  
  // 渲染搜索结果项
  const renderResultItem = (item, type) => {
    const getIcon = () => {
      switch (type) {
        case 'house': return <Home size={16} className="text-blue-500" />;
        case 'floor': return <Layers size={16} className="text-green-500" />;
        case 'room': return <Table size={16} className="text-yellow-500" />;
        case 'furniture': return <Package size={16} className="text-purple-500" />;
        case 'item': return <PackageCheck size={16} className="text-red-500" />;
        default: return null;
      }
    };
    
    const getPath = () => {
      switch (type) {
        case 'house': return '';
        case 'floor': return getFloorPath(item);
        case 'room': return getRoomPath(item);
        case 'furniture': return getFurniturePath(item);
        case 'item': return getItemPath(item);
        default: return '';
      }
    };
    
    return (
      <div 
        key={`${type}-${item.id}`}
        className="p-3 rounded-lg hover:bg-slate-50 border border-slate-100 flex flex-col gap-1 cursor-pointer group transition-all"
        // 点击事件可以根据类型跳转到对应视图
        onClick={() => handleResultClick(item, type)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-medium text-slate-800">{item.name}</span>
          </div>
          <ArrowRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {getPath() && (
          <div className="text-xs text-slate-500 ml-6 truncate">
            {getPath()}
          </div>
        )}
      </div>
    );
  };
  
  // 处理结果点击
  const handleResultClick = (item, type) => {
    const state = useAppStore.getState();
    const { setCurrentHouse, setCurrentFloor, selectRoom, setCurrentView, houses = [], floors = [], rooms = [], furniture = [] } = state;
    
    switch (type) {
      case 'house':
        setCurrentHouse(item);
        setCurrentView('floors');
        break;
      case 'floor':
        const house = houses.find(h => h && h.id === item.houseId);
        if (house) setCurrentHouse(house);
        setCurrentFloor(item);
        setCurrentView('rooms');
        break;
      case 'room':
        const floor = floors.find(f => f && f.id === item.floorId);
        const houseForRoom = floor ? houses.find(h => h && h.id === floor.houseId) : null;
        if (houseForRoom) setCurrentHouse(houseForRoom);
        if (floor) setCurrentFloor(floor);
        selectRoom(item);
        setCurrentView('rooms');
        break;
      case 'furniture':
        const roomForFurniture = rooms.find(r => r && r.id === item.roomId);
        const floorForFurniture = roomForFurniture ? floors.find(f => f && f.id === roomForFurniture.floorId) : null;
        const houseForFurniture = floorForFurniture ? houses.find(h => h && h.id === floorForFurniture.houseId) : null;
        if (houseForFurniture) setCurrentHouse(houseForFurniture);
        if (floorForFurniture) setCurrentFloor(floorForFurniture);
        if (roomForFurniture) selectRoom(roomForFurniture);
        setCurrentView('furniture');
        break;
      case 'item':
        const furnitureForItem = furniture.find(f => f && f.id === item.furnitureId);
        const roomForItem = furnitureForItem ? rooms.find(r => r && r.id === furnitureForItem.roomId) : null;
        const floorForItem = roomForItem ? floors.find(f => f && f.id === roomForItem.floorId) : null;
        const houseForItem = floorForItem ? houses.find(h => h && h.id === floorForItem.houseId) : null;
        if (houseForItem) setCurrentHouse(houseForItem);
        if (floorForItem) setCurrentFloor(floorForItem);
        if (roomForItem) selectRoom(roomForItem);
        setCurrentView('items');
        break;
    }
  };
  
  // 渲染结果分类
  const renderResultSection = (title, results, type) => {
    if (results.length === 0) return null;
    
    return (
      <div className="mb-6 last:mb-0">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-medium text-slate-700">{title} ({results.length})</h3>
        </div>
        <div className="flex flex-col gap-1">
          {results.map(item => renderResultItem(item, type))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200">
      {/* 顶部搜索栏 */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="搜索住房、楼层、房间、家具或物品..."
            className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* 搜索类型过滤器 */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-wrap gap-1">
            {[
              { value: 'all', label: '全部' },
              { value: 'house', label: '住房' },
              { value: 'floor', label: '楼层' },
              { value: 'room', label: '房间' },
              { value: 'furniture', label: '家具' },
              { value: 'item', label: '物品' }
            ].map(option => (
              <button
                key={option.value}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${searchType === option.value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                onClick={() => setSearchType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <button 
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-primary transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={14} />
            <span>筛选</span>
            {showFilters && <ChevronDown size={14} />}
          </button>
        </div>
        
        {/* 高级筛选（可扩展） */}
        {showFilters && (
          <div className="mt-2 p-2 border border-slate-100 rounded-lg bg-white">
            <p className="text-xs text-slate-500 mb-2">高级筛选功能开发中...</p>
          </div>
        )}
      </div>
      
      {/* 搜索结果区域 */}
      <div className="flex-1 overflow-auto p-4">
        {searchTerm ? (
          <>
            {totalResults > 0 ? (
              <>
                <div className="mb-4 text-sm text-slate-500">
                  找到 {totalResults} 条与 "{searchTerm}" 相关的结果
                </div>
                
                {renderResultSection('住房', searchResults.houses, 'house')}
                {renderResultSection('楼层', searchResults.floors, 'floor')}
                {renderResultSection('房间', searchResults.rooms, 'room')}
                {renderResultSection('家具', searchResults.furniture, 'furniture')}
                {renderResultSection('物品', searchResults.items, 'item')}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-500">没有找到与 "{searchTerm}" 相关的内容</p>
                <p className="text-xs text-slate-400 mt-1">尝试使用其他关键词或检查拼写</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-500">输入关键词开始搜索</p>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
              您可以搜索住房、楼层、房间、家具或物品的名称
            </p>
          </div>
        )}
      </div>
    </div>
  );
}