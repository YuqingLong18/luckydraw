import React from 'react';

// PRD said "Vanilla CSS for maximum flexibility". I'll stick to that or standard CSS. A simple CSS file for Layout is fine.
// But I haven't created Layout.css. I can use utility classes or inline styles for simplicity given "minimalist UI".
// Actually, I can use a simple module or just styled-components if I install it?
// Let's stick to simple CSS in `index.css` or component-specific CSS.
// I'll use standard CSS classes.

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="layout-container" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {children}
        </div>
    );
};

export default Layout;
