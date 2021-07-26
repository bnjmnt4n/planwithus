import { initDirectories, verifyPlan } from "planwithus-lib";
import { Module } from "../types";

import type { Block, SatisfierResult } from "planwithus-lib";

const DIRECTORIES = initDirectories();

export const getTopLevelBlocks = (): (readonly [string, string])[] => {
  return Object.entries(DIRECTORIES).flatMap(([name, blocks]) => {
    return blocks
      .retrieveSelectable()
      .map((blockId) => [name, blockId] as const);
  });
};

export const getTopLevelBlockName = ([directory, blockId]: readonly [
  string,
  string
]): string => {
  const [, block] = DIRECTORIES[directory as keyof typeof DIRECTORIES].find(
    "",
    blockId
  );

  return block.name ?? "";
};

export const getTopLevelBlockAY = ([directory, blockId]: readonly [
  string,
  string
]): number | null => {
  const [, block] = DIRECTORIES[directory as keyof typeof DIRECTORIES].find(
    "",
    blockId
  );

  return block.ay ?? null;
};

const cleanBlock = (
  block: Block | null
): Pick<Block, "assign" | "match" | "satisfy"> | null => {
  if (!block) {
    return null;
  }
  const { assign, match, satisfy } = block;
  return { assign, match, satisfy };
};

const directoryBlockMap: Map<string, Map<string, Block | null>> = new Map();
export const getBlock = (directory: string, blockRef: string): Block | null => {
  let blockMap: Map<string, Block | null> | undefined =
    directoryBlockMap.get(directory);
  if (!blockMap) {
    blockMap = new Map();
    directoryBlockMap.set(directory, blockMap);
  }

  let block = blockMap.get(blockRef);
  if (!block) {
    // Remove all and/or/mc block refs since they won't have a name.
    if (/\/\d+(\/or|\/mc|\/and)?$/.test(blockRef)) {
      block = null;
      blockMap.set(blockRef, block);
      return block;
    }

    let blockSegments = blockRef.split(/\/(?:assign|match|satisfy)\//g);
    blockSegments = blockSegments.flatMap((segment) => {
      // Remove all `/0/and/0` at the front, so we can get the blocks.
      const segments = segment.split("/");
      for (let i = 0; i < segments.length; i++) {
        if (!/^(\d+|or|and)$/.test(segments[i])) {
          return segments.slice(i);
        }
      }
      return [];
    });

    let prefix = "";
    block = null;
    for (const subString of blockSegments) {
      try {
        [prefix, block] = DIRECTORIES[
          directory as keyof typeof DIRECTORIES
        ].find(prefix, subString);

        if (block) {
          continue;
        }
      } catch (e) {
        break;
      }
    }

    block || (block = null);
    blockMap.set(blockRef, block);
  }

  return block;
};

export const getBlockName = (
  directory: string,
  blockRef: string
): string | null => {
  const block = getBlock(directory, blockRef);

  if (!block) {
    let match;
    let partialBlockRef = blockRef;
    // Name refs after their specific type.
    while ((match = /\/(\d+)(\/or|\/mc|\/and)?$/.exec(partialBlockRef))) {
      partialBlockRef = partialBlockRef.slice(0, -match[0].length);
    }

    if ((match = /\/(match|satisfy)$/.exec(partialBlockRef))) {
      const ruleType = match[1];
      return `${ruleType.charAt(0).toUpperCase()}${ruleType.slice(1)} rule`;
    }

    return null;
  }

  return block.name ?? null;
};

// Hack to get a block from any directory since modules don't know which
// directory they are in.
export const getBlockNameFromAnyDirectory = (
  blockRef: string
): string | null => {
  for (const directory of Object.keys(DIRECTORIES)) {
    try {
      return getBlockName(directory, blockRef);
    } catch (e) {
      continue;
    }
  }

  throw new Error(`Unable to get block name for block ref ${blockRef}`);
};

export const getBreadCrumbTrailFromAnyDirectory = (
  blockRef: string
): string[] => {
  // Assignments must always end with matches.
  // TODO: more robust
  blockRef = blockRef.replace(/\/match(\/\d+(\/or|\/and)?)?$/g, "");
  // They can only contain assigns.
  let blockSegments = blockRef.split(/\/assign\//g);
  blockSegments = blockSegments.flatMap((segment) => segment.split("/"));

  const breadCrumbs = [];
  let { length } = blockSegments;
  while (length--) {
    breadCrumbs.unshift(
      getBlockNameFromAnyDirectory(
        blockSegments
          .slice(0, length + 1)
          .filter((crumb) => crumb !== null)
          .join("/")
      )
    );
  }

  return breadCrumbs.filter((crumb) => crumb != null) as string[];
};

export type CheckedPlanResult = {
  ref: string;
  block: Block | null;
  type: "assign" | "match" | "satisfy";
  name: string | null;
  assigned: number;
  possibleAssignments: [string, number][];
  showSatisfiedWarnings: boolean;
  satisfied: boolean;
  message?: string;
  info?: string;
  children: CheckedPlanResult[];
};

export const checkPlan = (
  modules: Module[],
  [directory, blockId]: readonly [string, string]
): {
  results: Module[];
  info: string[];
  checkedPlan: SatisfierResult;
  checkedPlanResult: CheckedPlanResult;
} => {
  const seenModulesSet = new Set<string>();
  modules = modules
    .filter((module) => {
      const seen = seenModulesSet.has(module.code);
      seenModulesSet.add(module.code);
      return !seen;
    })
    .map((module) => ({ ...module }));

  const checkedPlan = verifyPlan(
    modules.map((module) => [
      module.code,
      Number(module.moduleInfo?.moduleCredit ?? "4") ?? 4,
    ]),
    DIRECTORIES[directory],
    blockId
  );

  const getModule = (moduleCode: string) => {
    const module = modules.find((module) => module.code === moduleCode);
    if (!module) {
      throw new Error(`Expected to find module: ${moduleCode}`);
    }
    return module;
  };

  const addPossibleAssignedBlockToModule = (
    moduleCode: string,
    blockRef: string
  ) => {
    const module = getModule(moduleCode);
    const possibleAssignedBlocks =
      module.possibleAssignedBlocks || (module.possibleAssignedBlocks = []);
    // Only add a block ref if it isn't an ancestor of one of the possible
    // assigned blocks.
    if (
      possibleAssignedBlocks.every(
        (innerBlockRef) => !innerBlockRef.startsWith(blockRef)
      )
    ) {
      possibleAssignedBlocks.push(blockRef);
    }
  };

  const isModuleInList = (list: [string, number][], moduleCode: string) => {
    return list.some(([innerModuleCode]) => innerModuleCode === moduleCode);
  };

  const recurse = (
    result: SatisfierResult,
    checkedPlanResultList: CheckedPlanResult[],
    blockType: "assign" | "match" | "satisfy",
    isTopLevel = false
  ) => {
    const currentRef = result.ref;
    const mainResult = result;
    const checkedPlanResult: CheckedPlanResult = {
      ref: currentRef,
      block: cleanBlock(getBlock(directory, currentRef)),
      type: blockType,
      name: getBlockName(directory, currentRef),
      assigned: result.added.length,
      possibleAssignments: [],
      showSatisfiedWarnings: true,
      satisfied: result.isSatisfied,
      message: result.message,
      info: result.info,
      children: [],
    };
    checkedPlanResultList.push(checkedPlanResult);

    let isAllAssignmentSatisfied = true;

    result.results.forEach((result) => {
      // ASSIGN BLOCKS
      // -------------
      if (isAssignBlock(result)) {
        result.results.forEach((result) => {
          // Do not show satisfy warnings if any block does not have modules assigned.
          // We make this assumption to reduce the number of warnings displayed.
          if (!result.added.length) {
            checkedPlanResult.showSatisfiedWarnings = false;
          }

          if (!result.context) {
            return;
          }

          const block = result.context as SatisfierResult;
          if (!block.isSatisfied) {
            isAllAssignmentSatisfied = false;
          }

          recurse(block, checkedPlanResult.children, "assign");
          block.added.forEach(([moduleCode, moduleCredits]) => {
            // TODO: don't allow satisfy blocks to assign.
            if (/\/satisfy(\/|$)/.test(currentRef)) {
              return;
            }
            addPossibleAssignedBlockToModule(moduleCode, block.ref);
            if (!isModuleInList(mainResult.added, moduleCode)) {
              checkedPlanResult.possibleAssignments.push([
                moduleCode,
                moduleCredits,
              ]);
            }
          });
        });
      }
      // MATCH BLOCKS
      // ------------
      else if (isMatchBlock(result)) {
        // TODO: single match result? is this accurate?
        if (!result.results.length) {
          // Do not show satisfy warnings if any block does not have modules assigned.
          // We make this assumption to reduce the number of warnings displayed.
          if (!result.added.length) {
            checkedPlanResult.showSatisfiedWarnings = false;
          }

          result.added.forEach(([moduleCode, moduleCredits]) => {
            // TODO: don't allow satisfy blocks to assign.
            if (/\/satisfy(\/|$)/.test(currentRef)) {
              return;
            }
            addPossibleAssignedBlockToModule(moduleCode, result.ref);
            if (!isModuleInList(mainResult.added, moduleCode)) {
              checkedPlanResult.possibleAssignments.push([
                moduleCode,
                moduleCredits,
              ]);
            }
          });
        }

        result.results.forEach((block) => {
          // Do not show satisfy warnings if any block does not have modules assigned.
          // We make this assumption to reduce the number of warnings displayed.
          if (!block.added.length) {
            checkedPlanResult.showSatisfiedWarnings = false;
          }

          recurse(block, checkedPlanResult.children, "match");
          block.added.forEach(([moduleCode, moduleCredits]) => {
            // TODO: don't allow satisfy blocks to assign.
            if (/\/satisfy(\/|$)/.test(currentRef)) {
              return;
            }
            addPossibleAssignedBlockToModule(moduleCode, block.ref);
            if (!isModuleInList(mainResult.added, moduleCode)) {
              checkedPlanResult.possibleAssignments.push([
                moduleCode,
                moduleCredits,
              ]);
            }
          });
        });
      }
      // SATISFY BLOCKS
      // --------------
      else if (isSatisfyBlock(result) || blockType === "satisfy") {
        if (!result.results.length) {
          const block = (result.context as SatisfierResult) || result;
          // Only show satisfy warnings for blocks with assigned modules to avoid showing too many warnings.
          if (
            checkedPlanResult.showSatisfiedWarnings ||
            isSatisfyMcBlock(block) ||
            isAllAssignmentSatisfied
          ) {
            recurse(block, checkedPlanResult.children, "satisfy");
          }
        }

        result.results.forEach((result) => {
          const block = (result.context as SatisfierResult) || result;
          // Only show satisfy warnings for blocks with assigned modules to avoid showing too many warnings.
          if (
            checkedPlanResult.showSatisfiedWarnings ||
            isSatisfyMcBlock(block) ||
            isAllAssignmentSatisfied
          ) {
            recurse(block, checkedPlanResult.children, "satisfy");
          }
        });
      }
    });

    // Add possible assignments from child results as well.
    checkedPlanResult.possibleAssignments =
      checkedPlanResult.possibleAssignments.concat(
        checkedPlanResult.children.reduce(
          (sum, { possibleAssignments }: CheckedPlanResult) =>
            sum.concat(possibleAssignments),
          [] as [string, number][]
        )
      );

    // If this is the top level block, we can finalize the list of assigned
    // modules.
    if (isTopLevel) {
      result.assigned.forEach(([moduleCode]) => {
        const module = getModule(moduleCode);
        // TODO: revisit this code.
        // // Assigned modules should have only 1 potential assignment.
        // if (module.possibleAssignedBlocks?.length !== 1) {
        //   throw new Error(
        //     `Expected module ${moduleCode} to have been assigned to ${currentRef}`
        //   );
        // }
        module.possibleAssignedBlocks = module.possibleAssignedBlocks?.filter(
          (blockRef) => blockRef !== currentRef
        );
        module.assignedBlock = currentRef;
      });
    }
  };

  const checkedPlanResultList: CheckedPlanResult[] = [];
  recurse(checkedPlan, checkedPlanResultList, "assign", true);

  return {
    results: modules,
    info: getInfo(checkedPlan),
    checkedPlan,
    checkedPlanResult: checkedPlanResultList[0],
  };
};

export const getInfo = (result: SatisfierResult, info?: string[]): string[] => {
  info || (info = []);
  if (result.info && !info.includes(result.info)) {
    info.push(result.info);
  }

  result.results.forEach((result) => getInfo(result, info));

  if (result.context) {
    getInfo(result.context as SatisfierResult, info);
  }

  return info;
};

const isAssignBlock = (result: SatisfierResult) =>
  result.ref.endsWith("/assign");
const isMatchBlock = (result: SatisfierResult) => result.ref.endsWith("/match");
const isSatisfyBlock = (result: SatisfierResult) =>
  result.ref.endsWith("/satisfy");
const isSatisfyMcBlock = (result: SatisfierResult) =>
  result.ref.endsWith("/mc");
