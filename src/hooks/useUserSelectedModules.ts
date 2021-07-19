import { useEffect, useState } from "react";
import { getSelectedModules, persistModules } from "../utils/modules";

import type { ModuleList } from "../types";

export function useUserSelectedModules(): {
  selectedModules: ModuleList;
  setSelectedModules: (modules: React.SetStateAction<ModuleList>) => void;
} {
  const [selectedModules, setSelectedModules] =
    useState<ModuleList>(getSelectedModules);

  // Persist modules to `localStorage`.
  useEffect(() => {
    persistModules(selectedModules);
  }, [selectedModules]);

  return {
    selectedModules,
    setSelectedModules,
  };
}
