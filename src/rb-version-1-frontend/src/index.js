import './wp/publicPath';
import React from 'react';
import { CookiesProvider } from 'react-cookie';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './css/style.css';
import Main from './Main';
import './scss/style.scss';

// Prefer ringbuilder-root when embedded in theme (avoids replacing theme's #root); fallback to root for standalone
const mountEl = document.getElementById('ringbuilder-root') || document.getElementById('root');
if (mountEl) {
    ReactDOM.render(
        <React.StrictMode>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <CookiesProvider>
                    <Main />
                </CookiesProvider>
            </BrowserRouter>
        </React.StrictMode>,
        mountEl,
    );
} else {
    console.error('Ring Builder: mount element #ringbuilder-root or #root not found.');
}
