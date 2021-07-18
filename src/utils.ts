import { DraggableLocation } from "react-beautiful-dnd";
import type { Module } from "./types";
import { verifyPlan, initDirectories, SatisfierResult } from "planwithus-lib";

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
 * Adds a module to a list of modules.
 */
export const addModule = (modules: Module[], toAdd: Module): Module[] => {
  const { code } = toAdd;
  const index =
    modules.reduce((index, module) => {
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
export const getModuleId = ({
  code,
  semester,
  year,
  index,
}: Module): string => {
  return `${code}-${year}-${semester}-${index}`;
};

export const cleanQueries = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queries: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { hasAllData: boolean; data: any[] } => {
  const data = [];
  let hasAllData = true;

  for (const query of queries) {
    if (query.status !== "success") {
      hasAllData = false;
      continue;
    }
    data.push(query.data);
  }

  return { data, hasAllData };
};

export const checks = (
  modules: Module[],
  queries: unknown[],
  blockId: string
): {
  hasAllData: boolean;
  modules: Module[];
  transformedData: Module[][][];
  results: SatisfierResult;
  // TODO: better typings
  checkedResults: ReturnType<typeof checkPlan>;
} => {
  const { hasAllData, data } = cleanQueries(queries);

  const checkedDupModules = checkDuplicates(modules);
  const transformedModules = transform(checkedDupModules);
  const checkedPrereqModules = checkPrerequisites(transformedModules, data);

  const results = verifyPlan(
    checkedPrereqModules
      .filter((module) => !module.duplicate)
      .map((module) => [
        module.code,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Number((module.moduleInfo as any)?.moduleCredit) ?? 4,
      ]),
    initDirectories().primary,
    blockId
  );

  const checkedResults = checkPlan(checkedPrereqModules, results);

  return {
    hasAllData,
    modules: checkedPrereqModules,
    transformedData: transformedModules,
    results,
    checkedResults,
  };
};

const checkPlan = (modules: Module[], results: SatisfierResult): Module[] => {
  return modules;
};

const checkDuplicates = (modules: Module[]): Module[] => {
  const seenModulesSet = new Set<string>();
  return modules.map((module) => {
    if (seenModulesSet.has(module.code)) {
      return {
        ...module,
        duplicate: true,
      };
    }

    seenModulesSet.add(module.code);
    return {
      ...module,
      duplicate: false,
    };
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkPrerequisites = (modules: Module[][][], data: any[]) => {
  const semesters = modules.flatMap((year) => year);

  const checkedSemesters = semesters.map((currSemesterModules, index) => {
    const prevSemesterModules =
      index === 0
        ? []
        : semesters
            .slice(0, index)
            .flatMap((module) => module)
            .filter((module) => !module.duplicate)
            .map((module) => module.code);

    if (!currSemesterModules.length) {
      return currSemesterModules;
    }

    return currSemesterModules.map((module) => {
      const moduleInfo = data.find(
        (moduleInfo) => moduleInfo.moduleCode === module.code
      );
      const prerequisiteTree = moduleInfo?.prereqTree;
      const duplicate = moduleInfo?.duplicate;

      if (!duplicate && prerequisiteTree) {
        const missingPrerequisites = checkPrerequisiteTree(
          prevSemesterModules,
          prerequisiteTree
        );

        if (missingPrerequisites) {
          return {
            ...module,
            moduleInfo,
            missingPrerequisites,
          };
        }
      }

      return { ...module, moduleInfo: moduleInfo ?? null };
    });
  });

  return checkedSemesters.flatMap((module) => module);
};

export type PrerequisiteTree =
  | string
  | { and: PrerequisiteTree[] }
  | { or: PrerequisiteTree[] };

// Returns `null` if all pre=requisites are met.
const checkPrerequisiteTree = (
  completedModules: string[],
  tree: PrerequisiteTree
) => {
  function walkPrerequisiteTree(
    tree: PrerequisiteTree
  ): PrerequisiteTree[] | null {
    if (typeof tree === "string") {
      return completedModules.includes(tree) ? null : [tree];
    }

    // If none of the values in the `or` tree are `null`, all of them are unfulfilled.
    if ("or" in tree && Array.isArray(tree.or)) {
      return tree.or.every((child) => !!walkPrerequisiteTree(child))
        ? [tree]
        : null;
    }

    if ("and" in tree && Array.isArray(tree.and)) {
      const notFulfilled = tree.and
        .map(walkPrerequisiteTree)
        .filter((element): element is PrerequisiteTree[] => element !== null);
      return notFulfilled.length === 0 ? null : notFulfilled.flat();
    }

    throw new Error(`Invalid prerequisite tree: ${tree}`);
  }

  return walkPrerequisiteTree(tree);
};

export const printMissingPrerequisites = (
  prerequisiteTree: PrerequisiteTree[]
): string => {
  return prerequisiteTree
    .map((tree) => {
      const string = printMissingPrerequisite(tree);
      if (string.includes(" ")) {
        return `(${string})`;
      }
      return string;
    })
    .join(" and ");
};

const printMissingPrerequisite = (
  prerequisiteTree: PrerequisiteTree
): string => {
  if (typeof prerequisiteTree === "string") {
    return prerequisiteTree;
  } else if ("or" in prerequisiteTree && Array.isArray(prerequisiteTree.or)) {
    return prerequisiteTree.or
      .map((tree) => {
        const string = printMissingPrerequisite(tree);
        if (string.includes(" ")) {
          return `(${string})`;
        }
        return string;
      })
      .join(" or ");
  } else if ("and" in prerequisiteTree && Array.isArray(prerequisiteTree.and)) {
    return prerequisiteTree.and
      .map((tree) => {
        const string = printMissingPrerequisite(tree);
        if (string.includes(" ")) {
          return `(${string})`;
        }
        return string;
      })
      .join(" and ");
  }

  throw new Error(`Unexpected tree: ${prerequisiteTree}`);
};
