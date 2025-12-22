import React, { useState } from 'react';
import { useStore } from '../../state/store';
import { t } from '../../utils/i18n';

const WinnersPanel: React.FC = () => {
    const winners = useStore((state) => state.winners);
    const remainingNames = useStore((state) => state.remainingNames);
    const language = useStore((state) => state.language);

    // TBD: Collapsible?
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div style={{
            position: 'absolute',
            top: 70,
            right: 20,
            width: isOpen ? 300 : 'auto',
            maxHeight: '80vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: 12,
            padding: 20,
            color: 'white',
            zIndex: 100,
            transition: 'width 0.3s',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{t(language, 'winners')} ({winners.length})</h3>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ padding: '0.2em 0.5em', background: 'transparent', border: 'none', color: 'white' }}
                >
                    {isOpen ? t(language, 'close') : t(language, 'show')}
                </button>
            </div>

            {isOpen && (
                <>
                    <div style={{ marginBottom: 10, fontSize: '0.9em', color: '#aaa' }}>
                        {t(language, 'remaining')}: {remainingNames.length}
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {[...winners].reverse().map((w) => (
                            <div key={w.timestamp} style={{
                                padding: '8px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span style={{ fontWeight: 'bold' }}>{w.name}</span>
                                <span style={{ fontSize: '0.8em', color: '#888' }}>{t(language, 'round', { round: w.round })}</span>
                            </div>
                        ))}
                        {winners.length === 0 && <div style={{ color: '#666', fontStyle: 'italic' }}>{t(language, 'noWinners')}</div>}
                    </div>
                </>
            )}
        </div>
    );
};

export default WinnersPanel;
