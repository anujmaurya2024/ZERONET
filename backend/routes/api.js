import express from 'express';

export default function createApiRouter(deviceId, deviceName) {
  const router = express.Router();

  // GET /api/info - returns device info for discovery
  router.get('/info', (req, res) => {
    res.json({
      deviceId,
      deviceName,
    });
  });

  // GET /api/discover - used for IP scanning fallback (returns same info)
  router.get('/discover', (req, res) => {
    res.json({
      deviceId,
      deviceName,
    });
  });

  return router;
}
