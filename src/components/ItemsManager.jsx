import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Plus, Trash2, Edit2, Check, X, Package, Calendar, Camera } from 'lucide-react';

export default function ItemsManager() {
  const { 
    selectedFurniture, 
    items, 
    addItem, 
    updateItem, 
    deleteItem,
    setCurrentView,
    isLoading
  } = useAppStore();
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  // 表单状态
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemPhoto, setItemPhoto] = useState(null);
  
  // 开始添加新物品
  const handleAddItem = () => {
    setEditingItem(null);
    setItemName('');
    setItemQuantity(1);
    setItemPhoto(null);
    setIsEditing(true);
  };
  
  // 开始编辑物品
  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemQuantity(item.quantity);
    setItemPhoto(item.photo);
    setIsEditing(true);
  };
  
  // 保存物品
  const handleSaveItem = async () => {
    if (!itemName.trim() || itemQuantity < 1) return;
    
    const itemData = {
      name: itemName.trim(),
      quantity: parseInt(itemQuantity),
      photo: itemPhoto
    };
    
    if (editingItem) {
      await updateItem(editingItem.id, itemData);
    } else {
      await addItem(itemData);
    }
    
    setIsEditing(false);
  };
  
  // 删除物品
  const handleDeleteItem = async (itemId) => {
    if (window.confirm('确定要删除这个物品吗？')) {
      await deleteItem(itemId);
    }
  };
  
  // 处理图片上传（模拟）
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 在实际应用中，这里应该上传图片到服务器
      // 这里只是模拟，使用一个占位符URL
      setItemPhoto(`https://picsum.photos/seed/${Date.now()}/200/200`);
      setShowImageUpload(false);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };
  
  // 没有选中家具时显示提示
  if (!selectedFurniture) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">请先选择家具</h3>
          <p className="text-slate-500 mb-6">选择一个家具来管理其中的物品</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* 顶部操作栏 */}
      <div className="p-4 border-b border-slate-200 bg-white shadow-sm flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">
          {selectedFurniture.name} - 物品管理
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setCurrentView('furniture')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all flex items-center gap-1"
          >
            <X size={18} />
            <span>返回</span>
          </button>
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-1 shadow-button"
          >
            <Plus size={18} />
            <span>添加物品</span>
          </button>
        </div>
      </div>
      
      {/* 物品列表 */}
      <div className="flex-1 overflow-auto p-4 animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500">暂无物品，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-primary/50 hover:shadow-card transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {item.photo ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                        <img 
                          src={item.photo} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-all"
                      title="编辑"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{item.name}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">数量: {item.quantity}</span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar size={12} />
                    <span>{formatDate(item.addedAt)}</span>
                  </div>
                </div>
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
                {editingItem ? '编辑物品' : '添加物品'}
              </h3>
              
              <div className="space-y-4">
                {/* 物品图片 */}
                <div className="flex flex-col items-center mb-2">
                  <button 
                    onClick={() => setShowImageUpload(true)}
                    className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center mb-2 cursor-pointer hover:bg-slate-200 transition-all"
                  >
                    {itemPhoto ? (
                      <img 
                        src={itemPhoto} 
                        alt="物品图片" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                  <span className="text-sm text-slate-500">点击上传图片（可选）</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    物品名称
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="例如：书籍、餐具、衣服"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    数量
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex border-t border-slate-200 p-4 gap-3">
              <button
                onClick={handleSaveItem}
                disabled={!itemName.trim() || itemQuantity < 1}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1 font-medium"
              >
                <Check size={18} />
                保存
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowImageUpload(false);
                }}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 图片上传对话框 */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">上传物品图片</h3>
            <div className="text-center py-6">
              <Camera className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">支持 JPG、PNG 格式，最大 5MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label 
                htmlFor="imageUpload"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-all font-medium inline-flex items-center gap-2"
              >
                <Camera size={18} />
                选择图片
              </label>
            </div>
            <button
              onClick={() => setShowImageUpload(false)}
              className="w-full mt-4 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}