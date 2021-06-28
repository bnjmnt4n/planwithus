import React, { createContext, useCallback, useContext, useMemo } from "react";
import { removeModule as removeModuleUtil } from "./utils";

import type { Module, ModuleCondensed } from "./types";

type ModuleContextValue = {
  modules: Module[];
  moduleInfo: ModuleCondensed[];
  addModule: (module: Module) => void;
  removeModule: (module: Module) => void;
};

const ModuleContext = createContext<ModuleContextValue>(
  {} as ModuleContextValue
);

type ModuleContextProviderProps = {
  children: React.ReactNode;
  value: {
    modules: Module[];
    setSelectedModules: (value: React.SetStateAction<Module[]>) => void;
    moduleInfo: ModuleContextValue["moduleInfo"];
  };
};

/**
 * A context provider which allows elements deep in the component tree to have access to
 * the `addModule` and `removeModule` methods and the `moduleInfo` from the NUSMods API.
 */
export const ModuleContextProvider = ({
  value,
  children,
}: ModuleContextProviderProps): JSX.Element => {
  const { modules, moduleInfo, setSelectedModules } = value;

  const addModule = useCallback(
    (module: Module) => {
      setSelectedModules((modules) => modules.concat(module));
    },
    [setSelectedModules]
  );

  const removeModule = useCallback(
    (toRemove: Module) => {
      setSelectedModules((modules) => removeModuleUtil(modules, toRemove));
    },
    [setSelectedModules]
  );

  const moduleData = useMemo(
    () => ({
      modules,
      moduleInfo,
      addModule,
      removeModule,
    }),
    [modules, moduleInfo, addModule, removeModule]
  );

  return (
    <ModuleContext.Provider value={moduleData}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModuleContext = (): ModuleContextValue => {
  return useContext(ModuleContext);
};
