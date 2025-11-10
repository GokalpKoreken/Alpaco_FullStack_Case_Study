import React from 'react';
import Drops from './pages/Drops';
import Claim from './pages/Claim';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <h1>DropSpot (demo)</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h2>Drops</h2>
          <Drops />
        </div>
        <div style={{ width: 320 }}>
          <h2>Claim</h2>
          <Claim />
          <h2>Admin</h2>
          <Admin />
        </div>
      </div>
    </div>
  );
}
