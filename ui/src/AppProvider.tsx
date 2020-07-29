import * as React from 'react';
import {ThemeProvider} from './theme';
import {BrowserRouter} from 'react-router-dom';
import {RecoilRoot} from 'recoil';
import {initializeState} from './client';

const AppProvider: React.FC = ({children}) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default AppProvider;
