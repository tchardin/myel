import React from 'react';

import Text from './components/Text';
import Main from './components/Main';
import Scroll from './components/Scroll';
import Banner from './components/Banner';

function App() {
  return (
    <Scroll>
      <Banner />
      <Main>
        <Text is="title">Hello Hack FS</Text>
      </Main>
    </Scroll>
  );
}

export default App;
