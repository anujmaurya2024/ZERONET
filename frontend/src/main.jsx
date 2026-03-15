import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SocketProvider } from './context/SocketContext';
import { DiscoveryProvider } from './context/DiscoveryContext';
import { PeerProvider } from './context/PeerContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DiscoveryProvider>
        <SocketProvider>
          <PeerProvider>
            <App />
          </PeerProvider>
        </SocketProvider>
      </DiscoveryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
