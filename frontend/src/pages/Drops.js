import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Drops() {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/drops').then(r => setDrops(r.data.drops || [])).catch(() => {});
  }, []);

  return (
    <div>
      {drops.length === 0 ? (
        <p>No active drops.</p>
      ) : (
        <ul>
          {drops.map(d => (
            <li key={d.id} style={{ marginBottom: 10 }}>
              <strong>{d.title}</strong>
              <div style={{ fontSize: 13 }}>{d.description}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
