const request = require('supertest');

const API_URL = 'http://localhost:3000';

describe('API Tests', () => {
  jest.setTimeout(30000); // 30 segundos de timeout por prueba

  test('GET / - should return success message', async () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await request(API_URL).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Coneccion Exitosa a MySQL');
        return;
      } catch (error) {
        if (attempt === 5) throw new Error(`Failed after ${attempt} attempts: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Espera 5 segundos
      }
    }
  });

  test('POST /create - should create a user', async () => {
    const payload = { name: 'Test User', value: '123' };
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await request(API_URL).post('/create').send(payload);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('record created');
        expect(response.body.id).toBeDefined();
        return;
      } catch (error) {
        if (attempt === 5) throw new Error(`Failed after ${attempt} attempts: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  });

  test('GET /read - should return a list of users', async () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await request(API_URL).get('/read');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        return;
      } catch (error) {
        if (attempt === 5) throw new Error(`Failed after ${attempt} attempts: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  });

  test('PUT /update/:id - should update a user', async () => {
    // Crear un usuario primero
    const createResponse = await request(API_URL).post('/create').send({ name: 'Update Test', value: 'initial' });
    const userId = createResponse.body.id;

    const updatePayload = { name: 'Updated User', value: 'updated' };
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await request(API_URL).put(`/update/${userId}`).send(updatePayload);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('updated');
        return;
      } catch (error) {
        if (attempt === 5) throw new Error(`Failed after ${attempt} attempts: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  });

  test('DELETE /delete/:id - should delete a user', async () => {
    // Crear un usuario primero
    const createResponse = await request(API_URL).post('/create').send({ name: 'Delete Test', value: '123' });
    const userId = createResponse.body.id;

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await request(API_URL).delete(`/delete/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('deleted');
        return;
      } catch (error) {
        if (attempt === 5) throw new Error(`Failed after ${attempt} attempts: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  });

  test('GET /nonexistent - should return 404', async () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await request(API_URL).get('/nonexistent');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Ruta no encontrada');
        return;
      } catch (error) {
        if (attempt === 5) throw new Error(`Failed after ${attempt} attempts: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  });

  test('GET / - should handle multiple requests', async () => {
    for (let i = 0; i < 10; i++) {
      const response = await request(API_URL).get('/');
      expect(response.status).toBe(200);
    }
  });
});