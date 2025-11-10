import React from 'react';
import Drops from './pages/Drops';
import Claim from './pages/Claim';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div className="app">
      <div className="header">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1>DropSpot</h1>
            <div className="sub">Limited drops & fair waitlist</div>
          </div>
        </div>
        <div className="sub">Demo — local only</div>
      </div>

      <div className="layout">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Active Drops</h2>
          <Drops />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Claim</h3>
            <Claim />
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Admin</h3>
            <Admin />
          </div>
        </div>
      </div>
    </div>
  );
}
