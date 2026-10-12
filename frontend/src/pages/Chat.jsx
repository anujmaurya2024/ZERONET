import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import { useSocket } from '../context/SocketContext';
import { usePeer } from '../context/PeerContext';

export default function Chat() {
  const { peerId } = useParams();
  const navigate = useNavigate();
  const { onlineDevices } = useSocket();
  const { peers } = usePeer();

  const device = onlineDevices.find((d) => d.deviceId === peerId);
  const peer = peerId ? peers[peerId] : null;
  const peerName = peer?.name || device?.deviceName || 'Nearby User';

  return (
    <div className="h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0b141a]">
      <ChatWindow
        peerId={peerId}
        peerName={peerName}
        onBack={() => navigate('/')}
      />
    </div>
  );
}
