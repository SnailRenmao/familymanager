import { useAppStore } from '../stores/useAppStore';
import { Plus, Home, X, Check } from 'lucide-react';
import { useState } from 'react';

export default function FloorSelector() {
  const { floors, currentFloor, setCurrentFloor, addFloor } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');

  // 添加新楼层
  const handleAddFloor = async () => {
    if (newFloorName.trim()) {
      await addFloor(newFloorName);
      setNewFloorName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0 transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3">
        <div className="flex flex-col gap-4">
          {/* 楼层标签和计数 - 移动端适配 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Home size={20} className="text-primary" />
              <span>楼层列表</span>
            </div>
            <span className="text-xs text-slate-500 px-2 py-1 bg-slate-100 rounded-full">
              共 {floors.length} 个楼层
            </span>
          </div>
          
          {/* 楼层按钮列表 - 响应式布局 */}
          <div className="flex gap-3 flex-wrap">
            {floors.map(floor => (
              <button
                key={floor.id}
                onClick={() => setCurrentFloor(floor)}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  currentFloor?.id === floor.id
                    ? 'bg-primary text-white shadow-button scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                }`}
              >
                {floor.name}
              </button>
            ))}
            
            {/* 添加楼层按钮 - 大气设计 */}
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-primary/20 text-primary hover:from-primary/20 hover:to-primary/30 hover:scale-105 flex items-center gap-2 transition-all duration-300 shadow-sm"
              >
                <Plus size={18} />
                <span className="font-medium">添加楼层</span>
              </button>
            )}
          </div>

          {/* 添加楼层输入框 - 动画效果增强 */}
          {isAdding && (
            <div className="mt-3 flex flex-col sm:flex-row gap-3 max-w-xl animate-slide-up bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
              <input
                type="text"
                value={newFloorName}
                onChange={(e) => setNewFloorName(e.target.value)}
                placeholder="输入楼层名称（如：二楼、地下室、阁楼）"
                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFloor()}
                autoFocus
              />
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleAddFloor}
                  disabled={!newFloorName.trim()}
                  className="px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-button flex items-center justify-center gap-2 min-w-20"
                >
                  <Check size={18} />
                  <span className="font-medium">确认</span>
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewFloorName('');
                  }}
                  className="px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all flex items-center justify-center min-w-16"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}