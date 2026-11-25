import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LangProvider } from './i18n.jsx';
import Site from './site/Site.jsx';
import './site/site.css';

const Admin = lazy(() => import('./admin/Admin.jsx'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={null}><Admin /></Suspense>} />
        <Route path="*" element={<LangProvider><Site /></LangProvider>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
