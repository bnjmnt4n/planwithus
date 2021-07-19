import React, { createContext, useCallback, useContext, useMemo } from "react";

import {
  addModule as addModuleUtil,
  removeModule as removeModuleUtil,
} from "./utils/modules";

import type { Module, ModuleCondensed, ModuleList } from "./types";

type ModuleContextValue = {
  modules: Module[];
  allModulesInformation: ModuleCondensed[];
  addModule: (module: Module, addBeforeIndex: number) => void;
  removeModule: (toRemoveIndex: number) => void;
  getModule: (index: number) => Module;
};

const ModuleContext = createContext<ModuleContextValue>(
  {} as ModuleContextValue
);

type ModuleContextProviderProps = {
  children: React.ReactNode;
  value: {
    modules: Module[];
    checkedResults: Module[];
    selectedModules: ModuleList;
    setSelectedModules: (value: React.SetStateAction<ModuleList>) => void;
    allModulesInformation: ModuleContextValue["allModulesInformation"];
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
  const { modules, checkedResults, setSelectedModules, allModulesInformation } =
    value;

  const addModule = useCallback(
    (module: Module, addBeforeIndex: number) => {
      setSelectedModules((modules) =>
        addModuleUtil(modules, module, addBeforeIndex)
      );
    },
    [setSelectedModules]
  );

  const removeModule = useCallback(
    (toRemoveIndex: number) => {
      setSelectedModules((modules) => removeModuleUtil(modules, toRemoveIndex));
    },
    [setSelectedModules]
  );

  const getModule = useCallback(
    (index: number) => {
      const module = checkedResults.find(
        (result) => result.code === modules[index].code
      );

      if (!module) {
        return modules[index];
      }
      return {
        ...module,
        uniqueId: modules[index].uniqueId,
      };
    },
    [checkedResults, modules]
  );

  const moduleData = useMemo(
    () => ({
      modules,
      allModulesInformation,
      addModule,
      removeModule,
      getModule,
    }),
    [modules, allModulesInformation, addModule, removeModule, getModule]
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
