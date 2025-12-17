import React from 'react';
import { useStore } from '../../state/store';
import { CONSTANTS } from '../../utils/constants';

const Controls: React.FC = () => {
    const phase = useStore((state) => state.phase);
    const startDraw = useStore((state) => state.startDraw);
    const completeDraw = useStore((state) => state.completeDraw);
    const dismissWinner = useStore((state) => state.dismissWinner);
    const reset = useStore((state) => state.reset);
    const remainingNames = useStore((state) => state.remainingNames);
    const completeTimeoutRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        return () => {
            if (completeTimeoutRef.current !== null) {
                window.clearTimeout(completeTimeoutRef.current);
                completeTimeoutRef.current = null;
            }
        };
    }, []);

    const handleRun = () => {
        if (phase === 'WINNER_VIEW') {
            dismissWinner();
            return;
        }

        if (phase === 'IDLE' && remainingNames.length > 0) {
            startDraw();

            if (completeTimeoutRef.current !== null) {
                window.clearTimeout(completeTimeoutRef.current);
                completeTimeoutRef.current = null;
            }

            const completeAtMs = Math.max(0, Math.round(CONSTANTS.DRAW.COMPLETE_AT_S * 1000));
            completeTimeoutRef.current = window.setTimeout(() => {
                completeDraw();
                completeTimeoutRef.current = null;
            }, completeAtMs);
        }
    };

    const getButtonText = () => {
        if (phase === 'RUNNING') return 'Drawing...';
        if (phase === 'WINNER_VIEW') return 'RUN DRAW'; // Acts as "Resume"
        if (remainingNames.length === 0) return 'Empty';
        return 'RUN DRAW';
    };

    return (
        <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 10, zIndex: 100 }}>
            <button
                onClick={handleRun}
                disabled={phase === 'RUNNING' || (phase === 'IDLE' && remainingNames.length === 0)}
                style={{
                    backgroundColor: phase === 'RUNNING' ? '#555' : '#E63946',
                    fontSize: '1.2em',
                    padding: '0.8em 1.5em',
                    color: 'white',
                    cursor: phase === 'RUNNING' ? 'default' : 'pointer'
                }}
            >
                {getButtonText()}
            </button>
            <button onClick={reset} disabled={phase === 'RUNNING'}>Reset</button>
        </div>
    );
};

export default Controls;
