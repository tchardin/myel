import * as React from 'react';
import {Suspense, lazy} from 'react';
import {Routes, Route} from 'react-router-dom';
import Banner from './components/Banner';

const Auth = lazy(() => import('./Auth'));
const Home = lazy(() => import('./Home'));

const App = () => {
  return (
    <>
      <Banner />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
