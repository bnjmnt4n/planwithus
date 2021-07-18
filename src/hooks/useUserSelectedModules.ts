import { useEffect, useState } from "react";

import type { Module } from "../types";
import {
  getExemptedModules,
  getSelectedModules,
  persistModules,
} from "../utils/modules";

export function useUserSelectedModules(): {
  selectedModules: Module[];
  exemptedModules: Module[];
  setSelectedModules: (modules: React.SetStateAction<Module[]>) => void;
  setExemptedModules: (modules: React.SetStateAction<Module[]>) => void;
} {
  const [exemptedModules, setExemptedModules] =
    useState<Module[]>(getExemptedModules);
  const [selectedModules, setSelectedModules] =
    useState<Module[]>(getSelectedModules);

  // Persist modules to `localStorage`.
  useEffect(() => {
    persistModules(selectedModules, exemptedModules);
  }, [selectedModules, exemptedModules]);

  return {
    selectedModules,
    exemptedModules,
    setSelectedModules,
    setExemptedModules,
  };
}
