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
    <div>
      <div>
        <input placeholder="title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="description" value={desc} onChange={e => setDesc(e.target.value)} />
        <button onClick={createDrop}>Create</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <pre>{result ? JSON.stringify(result, null, 2) : 'No result yet'}</pre>
      </div>
    </div>
  );
}
