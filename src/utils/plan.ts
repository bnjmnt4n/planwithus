import { initDirectories, verifyPlan } from "planwithus-lib";
import { Module } from "../types";

import type { SatisfierResult } from "planwithus-lib";

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

const directoryBlockNameMap: Map<string, Map<string, string>> = new Map();
export const getBlockName = (
  directory: string,
  blockRef: string,
  // TODO: simplify using this?
  _parentBlockRef: string
): string => {
  let blockNameMap = directoryBlockNameMap.get(directory);
  if (!blockNameMap) {
    blockNameMap = new Map();
    directoryBlockNameMap.set(directory, blockNameMap);
  }

  let blockName = blockNameMap.get(blockRef);
  if (!blockName) {
    let blockSegments = blockRef.split(/\/(?:assign|match|satisfy)\//g);
    const lastSegment = blockSegments[blockSegments.length - 1];

    // Remove all and/or/mc block refs since they won't have a name.
    if (/^(\d+)(\/or|\/mc|\/and)?$/.test(lastSegment)) {
      const segments = blockRef.slice(0, -lastSegment.length - 1).split("/");
      const parentName = getBlockName(
        directory,
        segments.slice(0, -1).join("/"),
        ""
      );
      const ruleType = segments[segments.length - 1];
      blockName = `${parentName ? parentName + " " : ""}${ruleType} rule`;

      blockNameMap.set(blockRef, blockName);
      return blockName;
    }
    blockSegments = blockSegments.flatMap((segment) => segment.split("/"));

    const blockIdPossibilities = blockSegments.map((_, index) => {
      const slice = blockSegments.length - index - 1;
      return [blockSegments.slice(0, slice).join("/"), lastSegment];
    });

    for (const [prefix, blockId] of blockIdPossibilities) {
      try {
        const [, block] = DIRECTORIES[
          directory as keyof typeof DIRECTORIES
        ].find(prefix, blockId);

        blockName = block.name ?? "";
        if (blockName) {
          continue;
        }
      } catch (e) {
        continue;
      }
    }

    blockName || (blockName = "");
    blockNameMap.set(blockRef, blockName);
  }

  return blockName;
};

export type CheckedPlanResult = {
  ref: string;
  name?: string;
  assigned: number;
  possibleAssignments: number;
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

  const addAssignedBlockToModule = (moduleCode: string, blockRef: string) => {
    const module = getModule(moduleCode);
    (module.assignedBlock || (module.assignedBlock = [])).push(blockRef);
  };

  const isModuleInList = (list: [string, number][], moduleCode: string) => {
    return list.some(([innerModuleCode]) => innerModuleCode === moduleCode);
  };

  const recurse = (
    result: SatisfierResult,
    checkedPlanResultList: CheckedPlanResult[],
    // TODO: make use of this to get the block
    parentRef: string
  ) => {
    const currentRef = result.ref;
    const mainResult = result;
    const checkedPlanResult = {
      ref: currentRef,
      name: getBlockName(directory, currentRef, parentRef),
      assigned: result.added.length,
      possibleAssignments: 0,
      showSatisfiedWarnings: true,
      satisfied: result.isSatisfied,
      message: result.message,
      info: result.info,
      children: [],
    };
    checkedPlanResultList.push(checkedPlanResult);

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
          recurse(block, checkedPlanResult.children, currentRef);
          block.added.forEach(([moduleCode]) => {
            addAssignedBlockToModule(moduleCode, block.ref);
            if (!isModuleInList(mainResult.added, moduleCode)) {
              checkedPlanResult.possibleAssignments++;
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

          result.added.forEach(([moduleCode]) => {
            addAssignedBlockToModule(moduleCode, result.ref);
            if (!isModuleInList(mainResult.added, moduleCode)) {
              checkedPlanResult.possibleAssignments++;
            }
          });
        }

        result.results.forEach((block) => {
          // Do not show satisfy warnings if any block does not have modules assigned.
          // We make this assumption to reduce the number of warnings displayed.
          if (!block.added.length) {
            checkedPlanResult.showSatisfiedWarnings = false;
          }

          recurse(block, checkedPlanResult.children, currentRef);
          block.added.forEach(([moduleCode]) => {
            addAssignedBlockToModule(moduleCode, block.ref);
            if (!isModuleInList(mainResult.added, moduleCode)) {
              checkedPlanResult.possibleAssignments++;
            }
          });
        });
      }
      // SATISFY BLOCKS
      // --------------
      else if (isSatisfyBlock(result)) {
        if (!result.results.length) {
          // TODO: is this necessary?
        }

        result.results.forEach((result) => {
          const block = (result.context as SatisfierResult) || result;
          // Only show satisfy warnings for blocks with assigned modules to avoid showing too many warnings.
          if (
            !checkedPlanResult.showSatisfiedWarnings &&
            !isSatisfyMcBlock(block)
          ) {
            return;
          }

          recurse(block, checkedPlanResult.children, currentRef);
        });
      }
    });

    // Add possible assignments from child results as well.
    checkedPlanResult.possibleAssignments += checkedPlanResult.children.reduce(
      (sum, { possibleAssignments }: CheckedPlanResult) =>
        sum + possibleAssignments,
      0
    );
  };

  const checkedPlanResultList: CheckedPlanResult[] = [];
  recurse(checkedPlan, checkedPlanResultList, "");
  // console.log(checkedPlan);
  // console.log(moduleMapList[0]);

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
