import React, { useState } from 'react';
import axios from 'axios';

export default function Admin() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [result, setResult] = useState(null);

  async function createDrop() {
    try {
      const res = await axios.post('http://localhost:4000/admin/drops?admin=true', { title, description: desc });
      setResult({ ok: true, data: res.data });
    } catch (err) {
      setResult({ ok: false, error: err.response?.data || err.message });
    }
  }

  return (
    <div className="controls">
      <input className="input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input className="input" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
      <div className="row">
        <button className="btn" onClick={createDrop}>Create</button>
        <button className="btn secondary" onClick={() => { setTitle(''); setDesc(''); setResult(null); }}>Clear</button>
      </div>
      <div style={{ marginTop: 8 }} className="result">
        <pre>{result ? JSON.stringify(result, null, 2) : 'No result yet'}</pre>
      </div>
    </div>
  );
}
