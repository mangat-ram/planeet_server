import request from 'supertest';
import express from 'express';
import router from './index';

const app = express();
app.use(express.json());
app.use('/user', router);

describe('User API', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/user')
      .send({ name: 'John Doe', email: 'john@example.com' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('John Doe');
    expect(response.body.email).toBe('john@example.com');
  });

  // Add more tests as needed
});