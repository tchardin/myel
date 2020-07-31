import * as React from 'react';
import {Suspense, lazy} from 'react';
import {Routes, Route} from 'react-router-dom';
import Banner from './components/Banner';

const Auth = lazy(() => import('./pages/Auth'));
const Deals = lazy(() => import('./pages/Deals'));

const App = () => {
  return (
    <>
      <Banner />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Deals />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
