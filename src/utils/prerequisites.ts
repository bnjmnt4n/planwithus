import type { Module } from "../types";

export const checkPrerequisites = (
  modules: Module[][][],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
): Module[] => {
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
