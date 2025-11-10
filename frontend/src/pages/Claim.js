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
    <div className="controls">
      <input className="input" placeholder="user id" value={userId} onChange={e => setUserId(e.target.value)} />
      <input className="input" placeholder="drop id" value={dropId} onChange={e => setDropId(e.target.value)} />
      <div className="row">
        <button className="btn" onClick={doClaim}>Claim</button>
        <button className="btn secondary" onClick={() => { setUserId(''); setDropId(''); setResult(null); }}>Reset</button>
      </div>
      <div className="result" style={{ marginTop: 8 }}>
        <pre>{result ? JSON.stringify(result, null, 2) : 'No result yet'}</pre>
      </div>
    </div>
  );
}
