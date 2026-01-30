
import React from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen }) => {
  const menuItems = [
    { 
      id: ViewMode.CHAT, 
      label: 'Chat Assistant', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> 
    },
    { 
      id: ViewMode.IMAGE, 
      label: 'Image Studio', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> 
    },
    { 
      id: ViewMode.LIVE, 
      label: 'Live Voice', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> 
    },
  ];

  return (
    <aside className={`
      fixed md:static inset-y-0 left-0 z-40 w-64 glass transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      flex flex-col border-r border-white/5
    `}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black italic">N</div>
          <span className="text-xl font-bold tracking-widest text-indigo-100">NUSAAI</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeView === item.id 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-100'}
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5 space-y-4">
        <div className="bg-slate-800/40 p-3 rounded-lg text-xs text-slate-400 flex flex-col gap-1">
          <p>Powered by Gemini 2.5/3.0</p>
          <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-3/4"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
