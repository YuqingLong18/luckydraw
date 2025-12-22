import React, { useState } from 'react';
import { useStore } from '../../state/store';
import { t } from '../../utils/i18n';

interface ImportModalProps {
    onClose: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose }) => {
    const importNames = useStore((state) => state.importNames);
    const language = useStore((state) => state.language);
    const [text, setText] = useState('');

    const handleImport = () => {
        const names = text.split('\n');
        importNames(names);
        onClose();
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300
        }}>
            <div style={{
                backgroundColor: '#222',
                padding: 30,
                borderRadius: 12,
                width: 500,
                maxWidth: '90%'
            }}>
                <h2 style={{ marginTop: 0 }}>{t(language, 'importTitle')}</h2>
                <p style={{ color: '#aaa' }}>{t(language, 'importHint')}</p>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={10}
                    style={{
                        width: '100%',
                        backgroundColor: '#111',
                        border: '1px solid #333',
                        color: 'white',
                        padding: 10,
                        borderRadius: 4,
                        marginBottom: 20
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ background: 'transparent' }}>{t(language, 'cancel')}</button>
                    <button onClick={handleImport} style={{ backgroundColor: '#E63946', color: 'white' }}>{t(language, 'import')}</button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
