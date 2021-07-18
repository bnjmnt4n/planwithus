import React, { createContext, useCallback, useContext, useMemo } from "react";

import {
  addModule as addModuleUtil,
  removeModule as removeModuleUtil,
} from "./utils/modules";

import type { Module, ModuleCondensed } from "./types";

type ModuleContextValue = {
  modules: Module[];
  moduleInfo: ModuleCondensed[];
  addModule: (module: Module) => void;
  removeModule: (module: Module) => void;
  addExemptedModule: (module: Module) => void;
  removeExemptedModule: (module: Module) => void;
};

const ModuleContext = createContext<ModuleContextValue>(
  {} as ModuleContextValue
);

type ModuleContextProviderProps = {
  children: React.ReactNode;
  value: {
    modules: Module[];
    selectedModules: Module[];
    exemptedModules: Module[];
    setSelectedModules: (value: React.SetStateAction<Module[]>) => void;
    setExemptedModules: (value: React.SetStateAction<Module[]>) => void;
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
  const {
    modules,
    moduleInfo,
    selectedModules,
    exemptedModules,
    setSelectedModules,
    setExemptedModules,
  } = value;

  const addModule = useCallback(
    (module: Module) => {
      setSelectedModules((modules) =>
        addModuleUtil(modules, exemptedModules, module)
      );
    },
    [exemptedModules, setSelectedModules]
  );

  const removeModule = useCallback(
    (toRemove: Module) => {
      setSelectedModules((modules) => removeModuleUtil(modules, toRemove));
    },
    [setSelectedModules]
  );

  const addExemptedModule = useCallback(
    (module: Module) => {
      setExemptedModules((modules) =>
        addModuleUtil(modules, selectedModules, module)
      );
    },
    [selectedModules, setExemptedModules]
  );

  const removeExemptedModule = useCallback(
    (toRemove: Module) => {
      setExemptedModules((modules) =>
        modules.filter(
          (module) =>
            !(module.code === toRemove.code && module.index === toRemove.index)
        )
      );
    },
    [setExemptedModules]
  );

  const moduleData = useMemo(
    () => ({
      modules,
      moduleInfo,
      addModule,
      removeModule,
      addExemptedModule,
      removeExemptedModule,
    }),
    [
      modules,
      moduleInfo,
      addModule,
      removeModule,
      addExemptedModule,
      removeExemptedModule,
    ]
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
