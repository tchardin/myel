import * as React from 'react';
import {Suspense, lazy} from 'react';
import {Routes, Route} from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './utils/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';

const Auth = lazy(() => import('./pages/Auth'));
const Deals = lazy(() => import('./pages/Deals'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Peers = lazy(() => import('./pages/Peers'));

const App = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route
          path="/*"
          element={
            <AppLayout
              master={
                <ErrorBoundary fallback={<ErrorFallback />}>
                  <Suspense fallback={null}>
                    <Wallet />
                  </Suspense>
                </ErrorBoundary>
              }
              detail={
                <ErrorBoundary fallback={<ErrorFallback />}>
                  <Suspense fallback={null}>
                    <Routes>
                      <Route path="/">
                        <Deals />
                      </Route>
                      <Route path="peers">
                        <Peers />
                      </Route>
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              }
            />
          }
        />
        <Route path="auth">
          <Auth />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
