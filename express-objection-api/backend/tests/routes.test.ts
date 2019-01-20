import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:3000',
});

describe('login', () => {
  it('produces success with correct credentials', async () => {
    const resp = await api.post('/api/login', {
      email: 'test@test.com',
      password: 'test',
    });
    expect(resp.status).toBe(200);
  });

  it('fails with incorrect credentials', () => {});

  it('validates presence of email and password', () => {});
  it('checks for user existence', () => {});
});
