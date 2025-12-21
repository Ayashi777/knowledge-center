import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/app/App';
import { I18nProvider } from './src/app/providers/i18n/i18n';
import { AuthProvider } from './src/app/providers/AuthProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </AuthProvider>
  </React.StrictMode>
);
