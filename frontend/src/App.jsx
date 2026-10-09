import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ConnectionModal from './components/ConnectionModal';
import Lobby from './pages/Lobby';
import Chat from './pages/Chat';

function App() {
  return (
    <div className="min-h-screen min-h-[100dvh] max-w-full overflow-x-hidden">
      <Navbar />
      <ConnectionModal />
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/chat/:peerId" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
