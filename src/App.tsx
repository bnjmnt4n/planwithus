import React, { useEffect, useState } from "react";
import Main from "./Main";

import type { ModuleCondensed } from "./types";

const App = (): JSX.Element => {
  const [moduleInfo, setModuleInfo] =
    useState<ModuleCondensed[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    // TODO:
    fetch("https://api.nusmods.com/v2/2020-2021/moduleList.json")
      .then((request) => request.json())
      .then((moduleInfo) => {
        if (!cancelled) {
          setModuleInfo(moduleInfo);
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
      {moduleInfo ? <Main moduleInfo={moduleInfo} /> : <p>Loading modules</p>}
    </div>
  );
};

export default App;
