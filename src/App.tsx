import React, { useState, useEffect } from 'react';
import Scene from './components/Scene/Scene';
import Layout from './components/UI/Layout';
import Controls from './components/UI/Controls';
import WinnersPanel from './components/UI/WinnersPanel';
import WinnerOverlay from './components/UI/WinnerOverlay';
import ImportModal from './components/UI/ImportModal';
import { useStore } from './state/store';

function App() {
  const [showImport, setShowImport] = useState(false);
  const remainingNames = useStore(state => state.remainingNames);

  // Auto-open import if empty?
  useEffect(() => {
    // Maybe logic later
  }, []);

  return (
    <Layout>
      <Scene />

      <Controls />
      <button
        onClick={() => setShowImport(true)}
        style={{ position: 'absolute', bottom: 20, left: 240, zIndex: 100 }}
      >
        Import Names
      </button>

      <WinnersPanel />
      <WinnerOverlay />

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: '"Mountains of Christmas", serif' }}>Lucky Draw</h1>
      </div>
    </Layout>
  );
}

export default App;
