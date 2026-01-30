
import React, { useState, useCallback } from 'react';
import { ViewMode } from './types';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';
import LiveView from './components/LiveView';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.CHAT);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case ViewMode.CHAT:
        return <ChatView />;
      case ViewMode.IMAGE:
        return <ImageView />;
      case ViewMode.LIVE:
        return <LiveView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans text-slate-100">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass rounded-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <Sidebar 
        activeView={currentView} 
        onViewChange={(view) => {
          setCurrentView(view);
          setSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300">
        <header className="h-16 flex items-center px-6 border-b border-white/5 glass shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              NusaAI {currentView === ViewMode.CHAT ? 'Chat' : currentView === ViewMode.IMAGE ? 'Vision' : 'Live'}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
