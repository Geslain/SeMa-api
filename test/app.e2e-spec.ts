import * as request from 'supertest';

describe('AppController (e2e)', () => {
  it('/ (GET)', async () => {
    const response = await request(global.app.getHttpServer()).get('/');

    expect(response.status).toBe(200);
  });
});
