import { initDirectories } from "planwithus-lib";
import { Module } from "../types";

import type { SatisfierResult } from "planwithus-lib";

const DIRECTORIES = initDirectories();

export const getTopLevelBlocks = (): (readonly [string, string])[] => {
  return Object.entries(DIRECTORIES).flatMap(([name, blocks]) => {
    return blocks.retrieveTopLevel().map((blockId) => [name, blockId] as const);
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

export const checkPlan = (
  modules: Module[],
  result: SatisfierResult
): { results: Module[]; info: string[] } => {
  modules = modules.map((module) => ({ ...module }));

  const recurse = (result: SatisfierResult) => {
    result.results.forEach((result) => {
      if (isAssignBlock(result)) {
        result.results.forEach((result) => {
          if (!result.context) {
            return;
          }

          const block = result.context as SatisfierResult;
          block.added.forEach(([moduleCode]) => {
            const module = modules.find((module) => module.code === moduleCode);
            if (!module) throw new Error("Missing module");
            module.assignedBlock = block.ref;
          });
          recurse(block);
        });
      } else if (isMatchBlock(result)) {
        result.results.forEach((block) => {
          block.added.forEach(([moduleCode]) => {
            const module = modules.find((module) => module.code === moduleCode);
            if (!module) throw new Error("Missing module");
            module.assignedBlock = block.ref;
          });
        });
      } else if (isSatisfyBlock(result)) {
        if (result.isSatisfied) {
          // No-op
        } else {
          result.results.forEach(() => {
            // TODO
          });
        }
      }
    });
  };
  recurse(result);

  return { results: modules, info: Array.from(getInfo(result)) };
};

export const getInfo = (
  result: SatisfierResult,
  info?: Set<string>
): Set<string> => {
  info || (info = new Set());
  if (result.info) {
    info.add(result.info);
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
