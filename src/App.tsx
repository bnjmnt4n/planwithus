import React, { useEffect, useState } from "react";
import Main from "./Main";

const App = (): JSX.Element => {
  const [modules, setModules] = useState(undefined);

  useEffect(() => {
    let cancelled = false;

    // TODO:
    fetch("https://api.nusmods.com/v2/2020-2021/moduleList.json")
      .then((request) => request.json())
      .then((modules) => {
        if (!cancelled) {
          setModules(modules);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>plaNwithUS</h1>
      </header>
      {modules ? <Main /> : <p>Loading modules</p>}
    </div>
  );
};

export default App;
