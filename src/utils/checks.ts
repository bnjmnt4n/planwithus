import { verifyPlan, initDirectories } from "planwithus-lib";
import { transform } from "./modules";
import { checkPrerequisites } from "./prerequisites";

import type { SatisfierResult } from "planwithus-lib";
import type { Module } from "../types";

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

// TODO: perform checks!
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
