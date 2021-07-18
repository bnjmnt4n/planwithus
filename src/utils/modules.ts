import type { DraggableLocation } from "react-beautiful-dnd";
import type { Module } from "../types";

/**
 * Get a unique ID for a module, suitable for use as a React key.
 */
export const getModuleId = ({
  code,
  semester,
  year,
  index,
}: Module): string => {
  return `${code}-${year}-${semester}-${index}`;
};

/**
 * Get the user's list of selected modules, either from `localStorage` or a default module list.
 */
export const getSelectedModules = (): Module[] => {
  let selectedModules: Module[];
  try {
    selectedModules = JSON.parse(localStorage.getItem("modules") ?? "[]");
  } catch (e) {
    selectedModules = [
      { year: 1, semester: 1, code: "GER1000", index: 0, moduleInfo: null },
      { year: 1, semester: 1, code: "CS1101S", index: 0, moduleInfo: null },
    ];
  }
  if (!selectedModules.length) {
    selectedModules = [];
  }

  return selectedModules;
};

/**
 * Get the user's list of exempted modules, either from `localStorage` or a default module list.
 */
export const getExemptedModules = (): Module[] => {
  let exemptedModules: Module[];
  try {
    exemptedModules = JSON.parse(
      localStorage.getItem("exemptedModules") ?? "[]"
    );
  } catch (e) {
    exemptedModules = [
      { year: 1, semester: 1, code: "CS1010", index: 0, moduleInfo: null },
    ];
  }
  if (!exemptedModules.length) {
    exemptedModules = [];
  }

  return exemptedModules;
};

/**
 * Persists modules to `localStorage`.
 */
export const persistModules = (
  selectedModules: Module[],
  exemptedModules: Module[]
): void => {
  localStorage.setItem("modules", JSON.stringify(selectedModules));
  localStorage.setItem("exemptedModules", JSON.stringify(exemptedModules));
};

/**
 * Adds a module to a list of modules.
 */
export const addModule = (
  modules: Module[],
  otherModules: Module[],
  toAdd: Module
): Module[] => {
  const { code } = toAdd;
  const index =
    modules.concat(otherModules).reduce((index, module) => {
      if (module.code === code) {
        return Math.max(module.index, index);
      }

      return index;
    }, 0) + 1;

  return modules.concat({ ...toAdd, index });
};

/**
 * Removes a module from a list of modules.
 */
export const removeModule = (modules: Module[], toRemove: Module): Module[] => {
  return modules.filter(
    (module) =>
      !(
        module.code === toRemove.code &&
        module.semester === toRemove.semester &&
        module.year === toRemove.year &&
        module.index === toRemove.index
      )
  );
};

type IntermediateReorderModules = {
  activeSemester: Module[];
  otherSemesters: Module[];
};

/**
 * Reorders the position of a specific module in a given semester.
 */
export const reorder = (
  selectedModules: Module[],
  exemptedModules: Module[],
  semesterId: string,
  startIndex: number,
  endIndex: number
): { selectedModules: Module[]; exemptedModules: Module[] } => {
  if (semesterId === "exemptions") {
    const newExemptedModules = [...exemptedModules];
    const [removed] = newExemptedModules.splice(startIndex, 1);
    newExemptedModules.splice(endIndex, 0, removed);

    return { selectedModules, exemptedModules: newExemptedModules };
  }

  const intermediate: IntermediateReorderModules = {
    activeSemester: [],
    otherSemesters: [],
  };
  const { activeSemester, otherSemesters } = selectedModules.reduce(
    (acc, module) => {
      if (`${module.year}-${module.semester}` === semesterId) {
        acc.activeSemester.push(module);
      } else {
        acc.otherSemesters.push(module);
      }

      return acc;
    },
    intermediate
  );

  const [removed] = activeSemester.splice(startIndex, 1);
  activeSemester.splice(endIndex, 0, removed);

  return {
    selectedModules: activeSemester.concat(otherSemesters),
    exemptedModules,
  };
};

type IntermediateMoveModules = {
  source: Module[];
  destination: Module[];
  others: Module[];
};

/**
 * Moves a module from a given semester to another.
 */
export const move = (
  selectedModules: Module[],
  exemptedModules: Module[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
): { selectedModules: Module[]; exemptedModules: Module[] } => {
  let intermediate: IntermediateMoveModules = {
    source: [],
    destination: [],
    others: [],
  };
  intermediate = selectedModules.reduce((acc, module) => {
    const semesterId = `${module.year}-${module.semester}`;
    if (semesterId === droppableSource.droppableId) {
      acc.source.push(module);
    } else if (semesterId === droppableDestination.droppableId) {
      acc.destination.push(module);
    } else {
      acc.others.push(module);
    }

    return acc;
  }, intermediate);
  let { source, destination } = intermediate;
  const { others } = intermediate;

  if (droppableSource.droppableId === "exemptions") {
    source = [...exemptedModules];
  }

  const [removed] = source.splice(droppableSource.index, 1);
  let newModule = removed;
  // If we're dropping on exemptions, we don't have to set a new semester.
  if (droppableDestination.droppableId === "exemptions") {
    destination = [...exemptedModules];
  } else {
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
  }
  destination.splice(droppableDestination.index, 0, newModule);

  let newSelectedModules, newExemptedModules;
  if (droppableSource.droppableId === "exemptions") {
    newSelectedModules = [...destination, ...others];
    newExemptedModules = source;
  } else if (droppableDestination.droppableId === "exemptions") {
    newSelectedModules = [...source, ...others];
    newExemptedModules = destination;
  } else {
    newSelectedModules = [...source, ...destination, ...others];
    newExemptedModules = exemptedModules;
  }

  return {
    selectedModules: newSelectedModules,
    exemptedModules: newExemptedModules,
  };
};

/**
 * Removes a module from the user's selection.
 */
export const remove = (
  selectedModules: Module[],
  exemptedModules: Module[],
  semesterId: string,
  index: number
): { selectedModules: Module[]; exemptedModules: Module[] } => {
  if (semesterId === "exemptions") {
    const newExemptedModules = [...exemptedModules];
    newExemptedModules.splice(index, 1);

    return { selectedModules, exemptedModules: newExemptedModules };
  }

  const [source, others] = selectedModules.reduce(
    ([source, others], module) => {
      const currModuleSemesterId = `${module.year}-${module.semester}`;
      if (currModuleSemesterId === semesterId) {
        source.push(module);
      } else {
        others.push(module);
      }

      return [source, others];
    },
    [[], []] as [Module[], Module[]]
  );

  source.splice(index, 1);

  return { selectedModules: [...source, ...others], exemptedModules };
};

/**
 * Transforms a flat array of modules into a 3-dimensional array of modules.
 * `result[year][semester]` will contain a list of modules chosen for that year and semester.
 */
export const transform = (modules: Module[]): Module[][][] => {
  const years: Module[][][] = Array.from({ length: 4 }, () => [[], []]);
  modules.forEach((module) => {
    years[module.year - 1][module.semester - 1].push(module);
  });
  return years;
};
