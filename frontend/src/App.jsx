import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ConnectionModal from './components/ConnectionModal';
import LanguageSettingsModal from './components/LanguageSettingsModal';
import TechnicalExplanationModal from './components/TechnicalExplanationModal';
import PhoneVerificationModal from './components/PhoneVerificationModal';
import NewChatModal from './components/NewChatModal';
import PrivacySettingsModal from './components/PrivacySettingsModal';
import Lobby from './pages/Lobby';
import Chat from './pages/Chat';
import { useTranslation } from './context/TranslationContext';
import { usePhoneAuth } from './context/PhoneAuthContext';

function App() {
  const { isSettingsOpen, setIsSettingsOpen } = useTranslation();
  const {
    isPhoneModalOpen,
    setIsPhoneModalOpen,
    isNewChatModalOpen,
    setIsNewChatModalOpen,
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
  } = usePhoneAuth();

  return (
    <div className="min-h-screen min-h-[100dvh] max-w-full overflow-x-hidden">
      <Navbar />
      <ConnectionModal />
      <LanguageSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TechnicalExplanationModal />
      <PhoneVerificationModal isOpen={isPhoneModalOpen} onClose={() => setIsPhoneModalOpen(false)} />
      <NewChatModal isOpen={isNewChatModalOpen} onClose={() => setIsNewChatModalOpen(false)} />
      <PrivacySettingsModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/chat/:peerId" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;

