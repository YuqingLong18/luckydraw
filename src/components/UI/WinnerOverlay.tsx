import React from 'react';
import { useStore } from '../../state/store';
import { CONSTANTS } from '../../utils/constants';

const WinnerOverlay: React.FC = () => {
    const phase = useStore((state) => state.phase);
    const currentWinner = useStore((state) => state.currentWinner);

    if (phase !== 'WINNER_VIEW' || !currentWinner) return null;

    // Use currentWinner directly, not from historical list (though it should match)
    const winnerName = currentWinner;
    // We can also find the round number if needed, but "Round X" might be tricky if store.round is already incremented?
    // Store.round increments in `dismissWinner` or `runDraw`?
    // My new `dismissWinner` increments round.
    // So current `store.round` is correct for the *current* draw.

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
            <div style={{ fontSize: '2rem', color: '#ccc', marginBottom: '1rem' }}>Winner</div>
            <div style={{
                fontSize: '5rem',
                fontWeight: 'bold',
                color: CONSTANTS.COLORS.GOLD,
                fontFamily: '"Cinzel", serif',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                {winnerName}
            </div>
            {/* Round display might need store.round */}
            {/* <div style={{ fontSize: '1.5rem', color: '#aaa', marginTop: '1rem' }}>Round {useStore.getState().round}</div> */}
            {/* Easier to omit round or fetch it properly if critical. The screenshot shows "Round 3". */}
            {/* I'll add it back. */}
            <RoundDisplay />
        </div>
    );
};

const RoundDisplay = () => {
    const round = useStore(s => s.round);
    return <div style={{ fontSize: '1.5rem', color: '#aaa', marginTop: '1rem' }}>Round {round}</div>;
}

export default WinnerOverlay;
