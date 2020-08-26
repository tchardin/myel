import React, { Suspense } from "react";

import Home from "./pages/Home";

function App() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}

export default App;
