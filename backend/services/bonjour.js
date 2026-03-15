import { Bonjour } from 'bonjour-service';

let instance = null;

export function startBonjour(port) {
  try {
    instance = new Bonjour();
    instance.publish({
      name: 'Zeronet',
      type: 'zeronet',
      port,
      txt: {
        path: '/',
        protocol: 'http',
      },
    });
    console.log(`mDNS/Bonjour: Zeronet server advertised on port ${port}`);
  } catch (err) {
    console.warn('Bonjour failed to start:', err.message);
  }
}

export function stopBonjour() {
  if (instance) {
    try {
      instance.destroy();
    } catch (e) {
      // ignore
    }
    instance = null;
  }
}
