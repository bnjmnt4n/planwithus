import { useEffect, useState } from "react";
import Main from "./Main";

import type { ModuleCondensed } from "./types";

const App = (): JSX.Element => {
  const [moduleInfo, setModuleInfo] = useState<ModuleCondensed[] | undefined>(
    undefined
  );

  useEffect(() => {
    let cancelled = false;

    fetch("https://api.nusmods.com/v2/2021-2022/moduleList.json")
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
    <div className="h-screen flex flex-col">
      <header className="w-full p-4 text-2xl text-center font-bold">
        <h1>plaNwithUS</h1>
      </header>
      <div className="w-full p-4 flex-grow overflow-x-auto">
        {moduleInfo ? (
          <Main moduleInfo={moduleInfo} />
        ) : (
          <p className="text-center">Loading modules...</p>
        )}
      </div>
    </div>
  );
};

export default App;
