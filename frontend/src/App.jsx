import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ConnectionModal from './components/ConnectionModal';
import LanguageSettingsModal from './components/LanguageSettingsModal';
import TechnicalExplanationModal from './components/TechnicalExplanationModal';
import Lobby from './pages/Lobby';
import Chat from './pages/Chat';
import { useTranslation } from './context/TranslationContext';

function App() {
  const { isSettingsOpen, setIsSettingsOpen } = useTranslation();

  return (
    <div className="min-h-screen min-h-[100dvh] max-w-full overflow-x-hidden">
      <Navbar />
      <ConnectionModal />
      <LanguageSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TechnicalExplanationModal />
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/chat/:peerId" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;

