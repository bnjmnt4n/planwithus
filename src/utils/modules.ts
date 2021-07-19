import type { DraggableLocation } from "react-beautiful-dnd";
import type { Module, ModuleList } from "../types";

export const EXEMPTION_YEAR = 0;
export const EXEMPTION_SEMESTER = 0;

/**
 * Get a unique, stable identifier for the module.
 */
export const getModuleId = (module: Module): string => {
  return `${module.uniqueId}`;
};

/**
 * Get the user's selected modules from `localStorage`.
 */
export const getSelectedModules = (): ModuleList => {
  let selectedModules: ModuleList | undefined = undefined;
  try {
    selectedModules = JSON.parse(localStorage.getItem("modules") ?? "");
  } catch (e) {
    // TODO
  }
  if (!selectedModules) {
    selectedModules = {
      uniqueId: 0,
      modules: [],
    };
  }

  return selectedModules;
};

/**
 * Persists modules to `localStorage`.
 */
export const persistModules = (selectedModules: ModuleList): void => {
  localStorage.setItem("modules", JSON.stringify(selectedModules));
};

/**
 * Adds a module to a list of modules.
 */
export const addModule = (
  { modules, uniqueId }: ModuleList,
  toAdd: Module,
  addBeforeIndex: number
): ModuleList => {
  uniqueId++;
  const newModule: Module = {
    ...toAdd,
    uniqueId,
  };

  return {
    uniqueId,
    modules: [
      ...modules.slice(0, addBeforeIndex),
      newModule,
      ...modules.slice(addBeforeIndex),
    ],
  };
};

/**
 * Removes a module from a list of modules.
 */
export const removeModule = (
  { modules, uniqueId }: ModuleList,
  toRemoveIndex: number
): ModuleList => {
  return {
    uniqueId,
    modules: [
      ...modules.slice(0, toRemoveIndex),
      ...modules.slice(toRemoveIndex + 1),
    ],
  };
};

/**
 * Swaps the position of two modules with the same semester.
 */
export const swapPosition = (
  { modules, uniqueId }: ModuleList,
  startIndex: number,
  endIndex: number
): ModuleList => {
  modules = [...modules];

  const [removed] = modules.splice(startIndex, 1);
  modules.splice(endIndex, 0, removed);

  return {
    uniqueId,
    modules,
  };
};

/**
 * Moves a module from a given semester to another.
 */
export const move = (
  { modules, uniqueId }: ModuleList,
  startIndex: number,
  droppableDestination: DraggableLocation
): ModuleList => {
  modules = [...modules];

  const [removed] = modules.splice(startIndex, 1);
  let newModule = removed;
  const match = /^(\d+)-(\d+)$/.exec(droppableDestination.droppableId);
  if (!match) {
    throw new Error(`Invalid ID: ${droppableDestination.droppableId}`);
  }
  const [, newYear, newSemester] = match;
  newModule = {
    ...removed,
    year: Number(newYear),
    semester: Number(newSemester),
  };
  modules.splice(droppableDestination.index, 0, newModule);

  return {
    uniqueId,
    modules,
  };
};

/**
 * Transforms a flat array of modules into a 3-dimensional array of modules.
 * `result[year][semester]` will contain a list of modules chosen for that year and semester.
 */
export const transform = <T>(
  modules: Module[],
  callback: (module: Module, index: number) => T
): T[][][] => {
  const years: T[][][] = Array.from({ length: 5 }, () => [[], [], []]);
  modules.forEach((module, index) => {
    years[module.year][module.semester].push(callback(module, index));
  });
  return years;
};
