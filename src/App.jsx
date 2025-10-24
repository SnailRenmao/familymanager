import { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { initDatabase } from './db/database';
import FloorSelector from './components/FloorSelector';
import RoomEditor from './components/RoomEditor';
import FurnitureManager from './components/FurnitureManager';
import ItemsManager from './components/ItemsManager';
import TreeView from './components/TreeView';
import SearchPanel from './components/SearchPanel';
import { Home, Package, Box, Plus, ArrowLeft } from 'lucide-react';

function App() {
  const { initialize, isLoading, currentFloor, currentView, setCurrentView, currentHouse } = useAppStore();

  // 组件挂载时初始化
  useEffect(() => {
    const init = async () => {
      await initDatabase();
      await initialize();
    };
    init();
  }, []);

  // 加载状态
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">正在初始化系统</h2>
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 min-w-0">
      {/* 顶部标题栏 */}
      <header className="bg-gradient-to-r from-dark to-slate-800 text-white shadow-xl flex-shrink-0 transition-all duration-300 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-all shadow-lg">
              {currentView === 'rooms' && <Package size={32} className="text-white" />}
              {currentView === 'furniture' && <Box size={32} className="text-white" />}
              {currentView === 'items' && <Home size={32} className="text-white" />}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">家庭收纳管家</h1>
              <p className="text-xs md:text-sm text-slate-300">智能物品管理系统</p>
            </div>
          </div>
          
          {/* 当前位置信息显示 */}
          {currentHouse && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{currentHouse.name}</span>
              {currentFloor && (
                <span className="text-slate-300">· {currentFloor.name}</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 主内容区域 - 三栏布局 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 左侧树形结构 */}
        <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-white overflow-hidden">
          <TreeView />
        </div>
        
        {/* 中间主内容区 */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="h-full mx-auto">
            {currentView === 'rooms' && currentFloor ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 h-full transition-all">
                <RoomEditor />
              </div>
            ) : currentView === 'rooms' && !currentFloor ? (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 h-full flex items-center justify-center p-8 transition-all">
                <div className="text-center">
                  <div className="w-24 h-24 mb-6 mx-auto p-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Home size={40} className="text-slate-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">选择楼层</h2>
                  <p className="text-slate-500">请在上方选择或添加一个楼层开始</p>
                </div>
              </div>
            ) : currentView === 'furniture' ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 h-full transition-all">
                <FurnitureManager />
              </div>
            ) : currentView === 'items' ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 h-full transition-all">
                <ItemsManager />
              </div>
            ) : null}
          </div>
        </div>
        
        {/* 右侧搜索面板 */}
        <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white overflow-hidden">
          <SearchPanel />
        </div>
      </main>
    </div>
  );
}

export default App;