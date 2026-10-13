import request from 'supertest';
import app from '../app';

describe('App & Health Endpoint Tests', () => {
  it('GET /health returns status 200 with healthy state', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('environment');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/v1 returns welcome message and version', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Gym & Fitness Management System API');
    expect(res.body.version).toBe('1.0.0');
  });
});
