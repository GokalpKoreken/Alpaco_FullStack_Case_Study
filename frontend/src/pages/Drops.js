import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Drops() {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/drops').then(r => setDrops(r.data.drops || [])).catch(() => {});
  }, []);

  if (!drops || drops.length === 0) {
    return <div className="muted">No active drops.</div>;
  }

  return (
    <div className="drops-list">
      {drops.map(d => (
        <div className="drop-card" key={d.id}>
          <div className="drop-title">{d.title}</div>
          <div className="drop-desc">{d.description || 'No description'}</div>
        </div>
      ))}
    </div>
  );
}
