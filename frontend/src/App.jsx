import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Lobby from './pages/Lobby';
import Chat from './pages/Chat';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/chat/:peerId" element={<Chat />} />
      </Routes>
    </>
  );
}

export default App;
