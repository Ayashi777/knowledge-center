import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './src/app/App';
import { I18nProvider } from './src/app/providers/i18n/i18n';
import { AuthProvider } from './src/app/providers/AuthProvider';
import { ModalProvider } from './src/app/providers/ModalProvider/ModalProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <I18nProvider>
          <ModalProvider>
              <App />
          </ModalProvider>
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
