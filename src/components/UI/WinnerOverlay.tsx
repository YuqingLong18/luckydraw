import React from 'react';
import { useStore } from '../../state/store';
import { t } from '../../utils/i18n';

const WinnerOverlay: React.FC = () => {
    const phase = useStore((state) => state.phase);
    const currentWinner = useStore((state) => state.currentWinner);
    const language = useStore((state) => state.language);

    if (phase !== 'WINNER_VIEW' || !currentWinner) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 200,
            pointerEvents: 'none',
            textShadow: '0 0 20px rgba(0,0,0,0.8)',
        }}>
            <div style={{ fontSize: '2rem', color: '#ccc', marginBottom: '1rem' }}>{t(language, 'winner')}</div>
            <RoundDisplay />
        </div>
    );
};

const RoundDisplay = () => {
    const round = useStore(s => s.round);
    const language = useStore(s => s.language);
    return <div style={{ fontSize: '1.5rem', color: '#aaa', marginTop: '1rem' }}>{t(language, 'round', { round })}</div>;
}

export default WinnerOverlay;
