import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Plus, Trash2, Edit2, Check, X, Palette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

export default function FurnitureManager() {
  const { 
    selectedRoom, 
    furniture, 
    selectedFurniture, 
    selectFurniture,
    loadFurnitureByRoom, 
    addFurniture, 
    updateFurniture, 
    deleteFurniture,
    setCurrentView,
    isLoading
  } = useAppStore();
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editingFurniture, setEditingFurniture] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // 表单状态
  const [furnitureName, setFurnitureName] = useState('');
  const [furnitureColor, setFurnitureColor] = useState('#f59e0b');
  
  // 预设颜色（10种常用家具配色）
  const PRESET_COLORS = [
    { name: '橡木色', value: '#d97706' },
    { name: '胡桃木', value: '#92400e' },
    { name: '白色', value: '#f3f4f6' },
    { name: '灰色', value: '#9ca3af' },
    { name: '蓝色', value: '#3b82f6' },
    { name: '绿色', value: '#10b981' },
    { name: '紫色', value: '#8b5cf6' },
    { name: '红色', value: '#ef4444' },
    { name: '黄色', value: '#f59e0b' },
    { name: '粉色', value: '#ec4899' },
  ];
  
  // 当选中房间改变时，加载家具
  useEffect(() => {
    if (selectedRoom) {
      loadFurnitureByRoom(selectedRoom.id);
    }
  }, [selectedRoom]);
  
  // 开始添加新家具
  const handleAddFurniture = () => {
    setEditingFurniture(null);
    setFurnitureName('');
    setFurnitureColor('#f59e0b');
    setIsEditing(true);
  };
  
  // 开始编辑家具
  const handleEditFurniture = (furniture) => {
    setEditingFurniture(furniture);
    setFurnitureName(furniture.name);
    setFurnitureColor(furniture.color);
    setIsEditing(true);
  };
  
  // 保存家具
  const handleSaveFurniture = async () => {
    if (!furnitureName.trim()) return;
    
    const furnitureData = {
      name: furnitureName.trim(),
      color: furnitureColor,
      x: 100,
      y: 100,
      width: 80,
      height: 40
    };
    
    if (editingFurniture) {
      await updateFurniture(editingFurniture.id, furnitureData);
    } else {
      await addFurniture(furnitureData);
    }
    
    setIsEditing(false);
  };
  
  // 删除家具
  const handleDeleteFurniture = async (furnitureId) => {
    if (window.confirm('确定要删除这个家具吗？这会同时删除里面的所有物品。')) {
      await deleteFurniture(furnitureId);
    }
  };
  
  // 查看物品
  const handleViewItems = (furniture) => {
    selectFurniture(furniture);
    setCurrentView('items');
  };
  
  // 没有选中房间时显示提示
  if (!selectedRoom) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Palette className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">请先选择房间</h3>
          <p className="text-slate-500 mb-6">在平面图上点击一个房间，然后开始管理家具</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* 顶部操作栏 */}
      <div className="p-4 border-b border-slate-200 bg-white shadow-sm flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">
          {selectedRoom.name} - 家具管理
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setCurrentView('rooms')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all flex items-center gap-1"
          >
            <X size={18} />
            <span>返回</span>
          </button>
          <button
            onClick={handleAddFurniture}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-1 shadow-button"
          >
            <Plus size={18} />
            <span>添加家具</span>
          </button>
        </div>
      </div>
      
      {/* 家具列表 */}
      <div className="flex-1 overflow-auto p-4 animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : furniture.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500">暂无家具，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {furniture.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-xl p-4 border transition-all duration-300 hover:shadow-card ${selectedFurniture?.id === item.id ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'border-slate-200 hover:border-primary/50'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditFurniture(item)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-all"
                      title="编辑"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteFurniture(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 mb-3">{item.name}</h3>
                <button
                  onClick={() => handleViewItems(item)}
                  className="w-full py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all font-medium"
                >
                  管理物品
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 编辑对话框 */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                {editingFurniture ? '编辑家具' : '添加家具'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    家具名称
                  </label>
                  <input
                    type="text"
                    value={furnitureName}
                    onChange={(e) => setFurnitureName(e.target.value)}
                    placeholder="例如：书架、衣柜、橱柜"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    颜色
                  </label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg cursor-pointer" 
                      style={{ backgroundColor: furnitureColor }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    ></div>
                    <input
                      type="text"
                      value={furnitureColor}
                      onChange={(e) => setFurnitureColor(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                  </div>
                  
                  {/* 颜色选择器 */}
                  {showColorPicker && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 shadow-lg">
                      <div className="grid grid-cols-5 gap-2 mb-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color.value}
                            className={`w-8 h-8 rounded-md transition-all ${furnitureColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => setFurnitureColor(color.value)}
                            title={color.name}
                          ></button>
                        ))}
                      </div>
                      <HexColorPicker color={furnitureColor} onChange={setFurnitureColor} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex border-t border-slate-200 p-4 gap-3">
              <button
                onClick={handleSaveFurniture}
                disabled={!furnitureName.trim()}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1 font-medium"
              >
                <Check size={18} />
                保存
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowColorPicker(false);
                }}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}