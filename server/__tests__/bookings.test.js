const express = require('express');
const request = require('supertest');

describe('Bookings API routes', () => {
  let app;

  beforeEach(() => {
    // Re-require the router before each test so the in-memory bookings array is
    // reset to empty. We achieve this by clearing the module cache.
    jest.resetModules();
    const freshRouter = require('../routes/bookings');
    app = express();
    app.use(express.json());
    app.use('/bookings', freshRouter);
  });

  // ─── POST /bookings ────────────────────────────────────────────────────────
  describe('POST /bookings', () => {
    it('creates a new booking and returns 201 with booking data', async () => {
      const booking = {
        id: 'b1',
        tourId: 'tour-42',
        userId: 'user-1',
        date: '2025-06-01',
      };
      const res = await request(app).post('/bookings').send(booking);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Booking created');
      expect(res.body.booking).toMatchObject(booking);
    });

    it('stores the booking so it appears in GET', async () => {
      const booking = { id: 'b2', tourId: 'tour-99' };
      await request(app).post('/bookings').send(booking);
      const res = await request(app).get('/bookings');
      expect(res.body).toContainEqual(expect.objectContaining({ id: 'b2' }));
    });

    it('can create multiple bookings', async () => {
      await request(app).post('/bookings').send({ id: 'a1' });
      await request(app).post('/bookings').send({ id: 'a2' });
      const res = await request(app).get('/bookings');
      expect(res.body).toHaveLength(2);
    });
  });

  // ─── GET /bookings ─────────────────────────────────────────────────────────
  describe('GET /bookings', () => {
    it('returns 200 with an empty array when there are no bookings', async () => {
      const res = await request(app).get('/bookings');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns all stored bookings', async () => {
      const bookings = [
        { id: 'x1', tourId: 'tour-1' },
        { id: 'x2', tourId: 'tour-2' },
      ];
      for (const b of bookings) {
        await request(app).post('/bookings').send(b);
      }
      const res = await request(app).get('/bookings');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body).toContainEqual(expect.objectContaining({ id: 'x1' }));
      expect(res.body).toContainEqual(expect.objectContaining({ id: 'x2' }));
    });
  });

  // ─── DELETE /bookings/:id ──────────────────────────────────────────────────
  describe('DELETE /bookings/:id', () => {
    it('returns 204 when deleting a booking', async () => {
      await request(app).post('/bookings').send({ id: 'del-1' });
      const res = await request(app).delete('/bookings/del-1');
      expect(res.status).toBe(204);
    });

    it('removes the specified booking from the list', async () => {
      await request(app).post('/bookings').send({ id: 'keep-1' });
      await request(app).post('/bookings').send({ id: 'remove-1' });
      await request(app).delete('/bookings/remove-1');
      const res = await request(app).get('/bookings');
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({ id: 'keep-1' });
    });

    it('returns 204 even if the booking ID does not exist', async () => {
      const res = await request(app).delete('/bookings/nonexistent-id');
      expect(res.status).toBe(204);
    });

    it('leaves other bookings untouched when one is deleted', async () => {
      const ids = ['c1', 'c2', 'c3'];
      for (const id of ids) {
        await request(app).post('/bookings').send({ id });
      }
      await request(app).delete('/bookings/c2');
      const res = await request(app).get('/bookings');
      expect(res.body).toHaveLength(2);
      expect(res.body.map((b) => b.id)).not.toContain('c2');
      expect(res.body.map((b) => b.id)).toContain('c1');
      expect(res.body.map((b) => b.id)).toContain('c3');
    });
  });
});
