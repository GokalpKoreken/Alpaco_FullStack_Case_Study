const request = require('supertest');

// Mock ../db with a lightweight in-memory implementation so tests don't need native sqlite
jest.mock('../db', () => {
  const store = { users: [], drops: [], waitlist: [], claims: [] };
  let ids = { users: 0, drops: 0, waitlist: 0, claims: 0 };

  function findUserByEmail(email) {
    return store.users.find(u => u.email === email.toLowerCase());
  }

  function prepare(sql) {
    const s = sql.toLowerCase();
    return {
      run: (...params) => {
        if (s.startsWith('insert or ignore into users')) {
          const [email, created_at] = params;
          const existing = findUserByEmail(email);
          if (existing) return { changes: 0, lastInsertRowid: existing.id };
          const id = ++ids.users;
          const user = { id, email: email.toLowerCase(), created_at };
          store.users.push(user);
          return { changes: 1, lastInsertRowid: id };
        }

        if (s.startsWith('insert into drops')) {
          const [title, description, is_active, claim_open, created_at] = params;
          const id = ++ids.drops;
          const d = { id, title, description, is_active, claim_open, created_at };
          store.drops.push(d);
          return { changes: 1, lastInsertRowid: id };
        }

        if (s.startsWith('insert or ignore into waitlist')) {
          const [drop_id, user_id, joined_at, priority_score] = params;
          const exists = store.waitlist.find(w => w.drop_id === drop_id && w.user_id === user_id);
          if (exists) return { changes: 0 };
          const id = ++ids.waitlist;
          store.waitlist.push({ id, drop_id, user_id, joined_at, priority_score });
          return { changes: 1, lastInsertRowid: id };
        }

        if (s.startsWith('insert into claims')) {
          const [drop_id, user_id, claim_code, claimed_at] = params;
          const id = ++ids.claims;
          store.claims.push({ id, drop_id, user_id, claim_code, claimed_at });
          return { changes: 1, lastInsertRowid: id };
        }

        if (s.startsWith('delete from waitlist')) {
          const [drop_id, user_id] = params;
          const before = store.waitlist.length;
          for (let i = store.waitlist.length - 1; i >= 0; i--) {
            const w = store.waitlist[i];
            if (w.drop_id === drop_id && w.user_id === user_id) store.waitlist.splice(i, 1);
          }
          const after = store.waitlist.length;
          return { changes: before - after };
        }

        if (s.startsWith('update drops set')) {
          const [title, description, is_active, claim_open, id] = params;
          const d = store.drops.find(x => x.id === id);
          if (!d) return { changes: 0 };
          if (title !== undefined && title !== null) d.title = title;
          if (description !== undefined && description !== null) d.description = description;
          if (is_active !== undefined && is_active !== null) d.is_active = is_active;
          if (claim_open !== undefined && claim_open !== null) d.claim_open = claim_open;
          return { changes: 1 };
        }

        return { changes: 0 };
      },
      get: (...params) => {
        if (s.startsWith('select id, email, created_at from users where email')) {
          const [email] = params;
          return findUserByEmail(email) || null;
        }

          if (s.startsWith('select id, created_at from users where id')) {
            const [id] = params;
            return store.users.find(u => u.id === id) || null;
          }

        if (s.startsWith('select id, title, description, is_active, claim_open, created_at from drops')) {
          return store.drops.filter(d => d.is_active === 1)[0] || null;
        }

        if (s.startsWith('select id, title, description, is_active, claim_open, created_at from drops where is_active')) {
          // handled by all()
          return null;
        }

        if (s.startsWith('select * from drops where id')) {
          const [id] = params;
          return store.drops.find(d => d.id === id) || null;
        }

        if (s.startsWith('select id, claim_open from drops where id')) {
          const [id] = params;
          const d = store.drops.find(x => x.id === id);
          return d ? { id: d.id, claim_open: d.claim_open } : null;
        }

        if (s.startsWith('select claim_code, claimed_at from claims where drop_id')) {
          const [drop_id, user_id] = params;
          const c = store.claims.find(x => x.drop_id === drop_id && x.user_id === user_id);
          return c ? { claim_code: c.claim_code, claimed_at: c.claimed_at } : null;
        }

        if (s.startsWith('select user_id from waitlist where drop_id')) {
          const [drop_id] = params;
          const list = store.waitlist.filter(w => w.drop_id === drop_id).sort((a,b) => {
            if (a.priority_score !== b.priority_score) return a.priority_score - b.priority_score;
            return a.joined_at - b.joined_at;
          });
          return list[0] || null;
        }

        return null;
      },
      all: (...params) => {
        if (s.includes('from drops where is_active = 1')) {
          return store.drops.filter(d => d.is_active === 1);
        }

        if (s.startsWith('select * from drops order by created_at desc')) {
          return store.drops.slice().sort((a,b) => b.created_at - a.created_at);
        }

        return [];
      }
    };
  }

  return { db: { prepare, exec: () => {} }, init: () => {} };
});

const app = require('../index');

describe('integration: auth -> join -> claim flow (idempotency)', () => {
  test('signup, create drop, join twice, open claim, claim idempotent', async () => {
    // signup two users
    const u1 = await request(app).post('/auth/signup').send({ email: 'u1@example.test' });
    expect(u1.status).toBe(201);
    const user1 = u1.body.user;

    const u2 = await request(app).post('/auth/signup').send({ email: 'u2@example.test' });
    expect(u2.status).toBe(201);
    const user2 = u2.body.user;

    // create drop as admin
    const dres = await request(app).post('/admin/drops?admin=true').send({ title: 'Test Drop' });
    expect(dres.status).toBe(201);
    const drop = dres.body.drop;

    // user1 joins
    const j1 = await request(app).post(`/drops/${drop.id}/join`).send({ user_id: user1.id });
    expect([200,201]).toContain(j1.status);

    // user1 joins again (idempotent)
    const j1b = await request(app).post(`/drops/${drop.id}/join`).send({ user_id: user1.id });
    expect(j1b.status).toBe(200);
    expect(j1b.body.message).toBe('already_joined');

    // user2 joins
    const j2 = await request(app).post(`/drops/${drop.id}/join`).send({ user_id: user2.id });
    expect([200,201]).toContain(j2.status);

    // open claim window
    const openRes = await request(app).put(`/admin/drops/${drop.id}?admin=true`).send({ claim_open: true });
    expect(openRes.status).toBe(200);

    // user1 claims (should be first)
    const c1 = await request(app).post(`/drops/${drop.id}/claim`).send({ user_id: user1.id });
    expect(c1.status).toBe(200);
    expect(c1.body).toHaveProperty('claim_code');
    const code = c1.body.claim_code;

    // user1 claims again -> idempotent, returns same code
    const c1b = await request(app).post(`/drops/${drop.id}/claim`).send({ user_id: user1.id });
    expect(c1b.status).toBe(200);
    expect(c1b.body.claim_code).toBe(code);
  }, 20000);
});
