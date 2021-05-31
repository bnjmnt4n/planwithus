import { DraggableLocation } from "react-beautiful-dnd";
import type { Module } from "./types";

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

/**
 * Removes a module from a list of modules.
 */
export const removeModule = (modules: Module[], toRemove: Module): Module[] => {
  return modules.filter(
    (module) =>
      !(
        module.code === toRemove.code &&
        module.semester === toRemove.semester &&
        module.year === toRemove.year
      )
  );
};

type IntermediateReorderModules = {
  activeSemester: Module[];
  otherSemesters: Module[];
};

/**
 * Reorders the position of a specific module in a given year/semester pair.
 */
export const reorder = (
  modules: Module[],
  semesterId: string,
  startIndex: number,
  endIndex: number
): Module[] => {
  const intermediate: IntermediateReorderModules = {
    activeSemester: [],
    otherSemesters: [],
  };
  const { activeSemester, otherSemesters } = modules.reduce((acc, module) => {
    if (`${module.year}-${module.semester}` === semesterId) {
      acc.activeSemester.push(module);
    } else {
      acc.otherSemesters.push(module);
    }

    return acc;
  }, intermediate);

  const [removed] = activeSemester.splice(startIndex, 1);
  activeSemester.splice(endIndex, 0, removed);

  return activeSemester.concat(otherSemesters);
};

type IntermediateMoveModules = {
  source: Module[];
  destination: Module[];
  others: Module[];
};

/**
 * Moves a module from a given year/semester pair to another.
 */
export const move = (
  modules: Module[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
): Module[] => {
  const intermediate: IntermediateMoveModules = {
    source: [],
    destination: [],
    others: [],
  };
  const { source, destination, others } = modules.reduce((acc, module) => {
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

  const [removed] = source.splice(droppableSource.index, 1);
  // TODO: typescript is preventing the use of ! here
  const match = /^(\d+)-(\d+)$/.exec(droppableDestination.droppableId);
  if (!match) {
    throw new Error(`Invalid ID: ${droppableDestination.droppableId}`);
  }
  const [, newYear, newSemester] = match;
  const newModule = {
    ...removed,
    year: Number(newYear),
    semester: Number(newSemester),
  };
  destination.splice(droppableDestination.index, 0, newModule);

  return source.concat(destination).concat(others);
};

/**
 * Get an ID for a module suitable for use as a React key.
 */
export const getModuleId = ({ code, semester, year }: Module): string => {
  return `${year}-${semester}-${code}`;
};
