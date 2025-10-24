import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Plus, Trash2, Edit2, Palette, X, Check, Move, Info, Package } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

export default function RoomEditor() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { rooms, selectedRoom, addRoom, deleteRoom, selectRoom, setCurrentView } = useAppStore();
  
  // 绘制状态
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);
  
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // 响应式画布大小
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 });
  
  // 触摸设备检测
  const [isMobile, setIsMobile] = useState(false);

  // 预设颜色（12种常用家居配色）
  const PRESET_COLORS = [
    { name: '天空蓝', value: '#93c5fd', dark: '#3b82f6' },
    { name: '薄荷绿', value: '#86efac', dark: '#22c55e' },
    { name: '蜜桃橙', value: '#fdba74', dark: '#f97316' },
    { name: '薰衣草', value: '#c4b5fd', dark: '#8b5cf6' },
    { name: '珊瑚粉', value: '#fda4af', dark: '#f43f5e' },
    { name: '柠檬黄', value: '#fde047', dark: '#eab308' },
    { name: '青瓷绿', value: '#6ee7b7', dark: '#10b981' },
    { name: '樱花粉', value: '#f9a8d4', dark: '#ec4899' },
    { name: '琥珀黄', value: '#fbbf24', dark: '#f59e0b' },
    { name: '海洋蓝', value: '#60a5fa', dark: '#3b82f6' },
    { name: '紫罗兰', value: '#a78bfa', dark: '#7c3aed' },
    { name: '草莓红', value: '#fb7185', dark: '#e11d48' },
  ];

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 响应式调整画布大小
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const padding = isMobile ? 16 : 32;
        const maxWidth = isMobile ? window.innerWidth - padding * 2 : 1400;
        const maxHeight = isMobile ? window.innerHeight * 0.6 : 800;
        const width = Math.min(container.clientWidth - padding * 2, maxWidth);
        const height = Math.min(container.clientHeight - padding * 2, maxHeight);
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isMobile]);

  // 🎨 绘制画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // 绘制网格背景
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvasSize.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasSize.height);
      ctx.stroke();
    }
    for (let i = 0; i <= canvasSize.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasSize.width, i);
      ctx.stroke();
    }

    // 绘制所有房间
    rooms.forEach(room => {
      const isSelected = selectedRoom?.id === room.id;
      
      // 房间矩形填充
      ctx.fillStyle = room.color || '#93c5fd';
      ctx.fillRect(room.x, room.y, room.width, room.height);
      
      // 选中高亮效果
      if (isSelected) {
        ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
        ctx.fillRect(room.x, room.y, room.width, room.height);
      }
      
      // 房间边框
      ctx.strokeStyle = isSelected ? '#0ea5e9' : '#64748b';
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeRect(room.x, room.y, room.width, room.height);
      
      // 房间名称
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        room.name,
        room.x + room.width / 2,
        room.y + room.height / 2
      );
    });

    // 绘制正在创建的房间
    if (isDrawing && currentRect) {
      ctx.fillStyle = 'rgba(147, 197, 253, 0.3)';
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
      ctx.setLineDash([]);
      
      // 显示尺寸提示
      ctx.fillStyle = '#0ea5e9';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${Math.round(currentRect.width)} × ${Math.round(currentRect.height)}`,
        currentRect.x + currentRect.width / 2,
        currentRect.y - 10
      );
    }
  }, [rooms, selectedRoom, isDrawing, currentRect, canvasSize]);

  // 🖱️ 鼠标事件处理
  const handleMouseDown = (e) => {
    if (isEditing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击了已有房间
    const clickedRoom = rooms.find(room =>
      x >= room.x && x <= room.x + room.width &&
      y >= room.y && y <= room.y + room.height
    );

    if (clickedRoom) {
      selectRoom(clickedRoom);
    } else {
      // 开始绘制新房间
      setIsDrawing(true);
      setDrawStart({ x, y });
      selectRoom(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - drawStart.x;
    const height = y - drawStart.y;

    setCurrentRect({
      x: width > 0 ? drawStart.x : x,
      y: height > 0 ? drawStart.y : y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;

    // 只保存足够大的房间（避免误触）
    if (currentRect.width > 50 && currentRect.height > 50) {
      setEditingRoom({
        ...currentRect,
        name: '',
        color: '#93c5fd'
      });
      setIsEditing(true);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentRect(null);
  };

  // 💾 保存房间
  const handleSaveRoom = async () => {
    if (editingRoom.name.trim()) {
      await addRoom(editingRoom);
      setIsEditing(false);
      setEditingRoom(null);
      setShowColorPicker(false);
    }
  };

  // 🗑️ 删除房间
  const handleDeleteRoom = async () => {
    if (selectedRoom && confirm(`确定要删除 "${selectedRoom.name}" 吗？`)) {
      await deleteRoom(selectedRoom.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 工具栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Plus size={18} className="text-primary" />
              <span className="text-sm text-gray-700">
                <span className="font-semibold text-primary">拖拽创建</span> 新房间
              </span>
            </div>
            
            {selectedRoom && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <Edit2 size={16} className="text-green-600" />
                <span className="text-sm">
                  <span className="text-gray-600">已选择:</span>
                  <span className="font-semibold text-dark ml-1">{selectedRoom.name}</span>
                </span>
              </div>
            )}
          </div>
          
          {selectedRoom && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('furniture')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md"
              >
                <Package size={16} />
                家具管理
              </button>
              <button
                onClick={handleDeleteRoom}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md"
              >
                <Trash2 size={16} />
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 画布区域 */}
      <div 
        ref={containerRef} 
        className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-0"
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="border-4 border-slate-300 rounded-2xl shadow-2xl cursor-crosshair bg-white"
        />
      </div>

      {/* 编辑房间对话框 */}
      {isEditing && editingRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* 对话框头部 */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Plus size={24} />
                创建新房间
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingRoom(null);
                  setShowColorPicker(false);
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* 对话框内容 */}
            <div className="p-6 space-y-6">
              {/* 房间名称 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  房间名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  placeholder="例如：主卧、客厅、厨房、书房"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all text-lg"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveRoom()}
                />
              </div>

              {/* 房间颜色 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  房间颜色
                </label>
                
                {/* 预设颜色网格 */}
                <div className="grid grid-cols-6 gap-3 mb-4">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => {
                        setEditingRoom({ ...editingRoom, color: color.value });
                        setShowColorPicker(false);
                      }}
                      className="relative aspect-square rounded-xl transition-all hover:scale-110 group"
                      title={color.name}
                      style={{ 
                        background: `linear-gradient(135deg, ${color.value} 0%, ${color.dark} 100%)`,
                        border: editingRoom.color === color.value ? '3px solid #0ea5e9' : '2px solid #e5e7eb',
                        boxShadow: editingRoom.color === color.value ? '0 4px 12px rgba(14, 165, 233, 0.4)' : 'none'
                      }}
                    >
                      {editingRoom.color === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={24} className="text-white drop-shadow-lg" strokeWidth={3} />
                        </div>
                      )}
                      {/* 悬停提示 */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {color.name}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 自定义颜色按钮 */}
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-gray-50 transition-all"
                >
                  <Palette size={20} className="text-gray-600" />
                  <span className="text-gray-700 font-medium">自定义颜色</span>
                  <span className="ml-auto text-gray-400">{showColorPicker ? '▲' : '▼'}</span>
                </button>

                {/* react-colorful 颜色选择器 */}
                {showColorPicker && (
                  <div className="mt-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                    <HexColorPicker 
                      color={editingRoom.color} 
                      onChange={(color) => setEditingRoom({ ...editingRoom, color })}
                      style={{ width: '100%', height: '220px' }}
                    />
                    <div className="mt-4 flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-md flex-shrink-0"
                        style={{ backgroundColor: editingRoom.color }}
                      />
                      <input
                        type="text"
                        value={editingRoom.color.toUpperCase()}
                        onChange={(e) => setEditingRoom({ ...editingRoom, color: e.target.value })}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-center font-mono font-bold text-lg uppercase focus:outline-none focus:border-primary"
                        maxLength={7}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 对话框底部按钮 */}
            <div className="sticky bottom-0 flex gap-3 px-6 pb-6 bg-white">
              <button
                onClick={handleSaveRoom}
                disabled={!editingRoom.name.trim()}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-bold text-lg flex items-center justify-center gap-2"
              >
                <Check size={20} />
                保存房间
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingRoom(null);
                  setShowColorPicker(false);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
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