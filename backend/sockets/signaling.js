export function setupSignaling(io) {
  const connectedDevices = new Map(); // socketId -> { deviceId, deviceName }

  io.on('connection', (socket) => {
    let currentDeviceId = null;
    let currentDeviceName = null;

    socket.on('register', ({ deviceId, deviceName }) => {
      currentDeviceId = deviceId;
      currentDeviceName = deviceName || 'Unknown Device';
      connectedDevices.set(socket.id, { deviceId, deviceName: currentDeviceName });
      socket.broadcast.emit('device-online', { deviceId, deviceName: currentDeviceName, socketId: socket.id });
    });

    socket.on('request-connection', ({ fromDeviceId, fromDeviceName, toDeviceId }) => {
      const target = [...connectedDevices.entries()].find(([, data]) => data.deviceId === toDeviceId);
      if (target) {
        io.to(target[0]).emit('connection-request', {
          fromDeviceId,
          fromDeviceName,
          fromSocketId: socket.id,
        });
      } else {
        socket.emit('connection-error', { message: 'Device not found' });
      }
    });

    socket.on('connection-accepted', ({ fromSocketId, toDeviceId }) => {
      io.to(fromSocketId).emit('connection-accepted', {
        toSocketId: socket.id,
        toDeviceId,
        toDeviceName: currentDeviceName,
      });
    });

    socket.on('connection-rejected', ({ fromSocketId }) => {
      io.to(fromSocketId).emit('connection-rejected');
    });

    // WebRTC signaling: forward offer, answer, ice-candidate
    socket.on('webrtc-offer', ({ toSocketId, offer }) => {
      io.to(toSocketId).emit('webrtc-offer', { fromSocketId: socket.id, offer });
    });

    socket.on('webrtc-answer', ({ toSocketId, answer }) => {
      io.to(toSocketId).emit('webrtc-answer', { fromSocketId: socket.id, answer });
    });

    socket.on('webrtc-ice-candidate', ({ toSocketId, candidate }) => {
      io.to(toSocketId).emit('webrtc-ice-candidate', { fromSocketId: socket.id, candidate });
    });

    socket.on('get-online-devices', () => {
      const devices = [...connectedDevices.entries()]
        .filter(([id]) => id !== socket.id)
        .map(([id, data]) => ({ socketId: id, ...data }));
      socket.emit('online-devices', devices);
    });

    socket.on('disconnect', () => {
      if (currentDeviceId) {
        socket.broadcast.emit('device-offline', { deviceId: currentDeviceId, socketId: socket.id });
        connectedDevices.delete(socket.id);
      }
    });
  });
}
