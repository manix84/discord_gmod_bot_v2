const app = require('../app');
const request = require('supertest');

describe('Test basic endpoints', () => {
  // GET / -> 200 (HELLO WORLD)
  test('GET /', async () => {
    await request(app).get('/')
      .expect(200);
  });
  // GET /invite -> 200
  test('GET /invite', async () => {
    await request(app).get('/invite')
      .expect(200);
  });

  // GET /servers/<UID> -> 200 | 404 | 5XX
  test('GET /servers/<UID>', async () => {
    await request(app).get('/servers/<UID>')
      .expect(200);
  });

  // GET /servers/<UID>/users 200 | 403 | 404
  test('GET /servers/<UID>/users', async () => {
    await request(app).get('/servers/<UID>/users')
      .expect(200);
  });

  // GET /servers/<UID>/users/<UID> 200 | 403 | 404
  test('GET /servers/<UID>/users/<UID>', async () => {
    await request(app).get('/servers/<UID>/users/<UID>')
      .expect(200);
  });

  // POST /servers/<UID>/users/<UID>/mute 200 | 403 | 404
  test('POST /servers/<UID>/users/<UID>/<COMMANDS>', async () => {
    await request(app).post('/servers/<UID>/users/<UID>/<COMMAND>')
      .expect(200);

    await request(app).post('/servers/<UID>/users/<UID>/mute')
      .expect(200)
      .then(response =>
        response.body.command === 'mute'
      );

    await request(app).post('/servers/<UID>/users/<UID>/unmute')
      .expect(200)
      .then(response =>
        response.body.command === 'unmute'
      );

    await request(app).post('/servers/<UID>/users/<UID>/deafen')
      .expect(200)
      .then(response =>
        response.body.command === 'deafen'
      );

    await request(app).post('/servers/<UID>/users/<UID>/undeafen')
      .expect(200)
      .then(response =>
        response.body.command === 'undeafen'
      );

    await request(app).post('/servers/<UID>/users/<UID>/invalid')
      .expect(200)
      .then(response =>
        response.body.command === false
      );
  });
});
