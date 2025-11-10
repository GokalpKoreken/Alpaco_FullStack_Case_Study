import React, { useState } from 'react';
import axios from 'axios';

export default function Claim() {
  const [userId, setUserId] = useState('');
  const [dropId, setDropId] = useState('');
  const [result, setResult] = useState(null);

  async function doClaim() {
    try {
      const res = await axios.post(`http://localhost:4000/drops/${dropId}/claim`, { user_id: Number(userId) });
      setResult({ ok: true, data: res.data });
    } catch (err) {
      setResult({ ok: false, error: err.response?.data || err.message });
    }
  }

  return (
    <div>
      <div>
        <input placeholder="user_id" value={userId} onChange={e => setUserId(e.target.value)} />
        <input placeholder="drop_id" value={dropId} onChange={e => setDropId(e.target.value)} />
        <button onClick={doClaim}>Claim</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <pre>{result ? JSON.stringify(result, null, 2) : 'No result yet'}</pre>
      </div>
    </div>
  );
}
