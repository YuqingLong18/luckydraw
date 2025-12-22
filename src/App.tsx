import { useState, useEffect } from 'react';
import Scene from './components/Scene/Scene';
import Layout from './components/UI/Layout';
import Controls from './components/UI/Controls';
import WinnersPanel from './components/UI/WinnersPanel';
import WinnerOverlay from './components/UI/WinnerOverlay';
import ImportModal from './components/UI/ImportModal';
import { useStore } from './state/store';
import { t } from './utils/i18n';

function App() {
  const [showImport, setShowImport] = useState(false);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  // Auto-open import if empty?
  useEffect(() => {
    // Maybe logic later
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  return (
    <Layout>
      <Scene />

      <Controls onImport={() => setShowImport(true)} />

      <WinnersPanel />
      <WinnerOverlay />

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', zIndex: 10 }}>
        <h1 className="title-text" style={{ margin: 0, fontSize: '1.5rem' }}>
          {t(language, 'title')}
        </h1>
      </div>

      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 120 }}>
        <button
          onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          style={{
            padding: '0.5em 0.9em',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          中文/English
        </button>
      </div>
    </Layout>
  );
}

export default App;
