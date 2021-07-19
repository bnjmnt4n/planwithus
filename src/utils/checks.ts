import { EXEMPTION_SEMESTER, EXEMPTION_YEAR, transform } from "./modules";
import { checkPrerequisites } from "./prerequisites";
import { checkPlan } from "./plan";

import type { UseQueryResult } from "react-query";
import type { SatisfierResult } from "planwithus-lib";
import type { Module, ModuleInformation } from "../types";

export const checks = (
  modules: Module[],
  queries: UseQueryResult<ModuleInformation>[],
  block: readonly [string, string]
): {
  hasAllData: boolean;
  modules: Module[];
  checkedResults: Module[];
  moduleIndices: number[][][];
  results: SatisfierResult;
  info: string[];
} => {
  const { hasAllData, data } = cleanQueries(queries);

  const exemptedModules = modules.filter(
    (module) =>
      module.year === EXEMPTION_YEAR && module.semester === EXEMPTION_SEMESTER
  );
  const selectedModules = modules.filter(
    (module) =>
      !(
        module.year === EXEMPTION_YEAR && module.semester === EXEMPTION_SEMESTER
      )
  );

  const checkedDupModules = checkDuplicates(selectedModules);
  const checkedPrereqModules = checkPrerequisites(
    checkedDupModules,
    exemptedModules,
    data
  );
  const { results, info, checkedPlan } = checkPlan(checkedPrereqModules, block);

  const moduleIndices = transform(modules, (_module, index) => index);

  return {
    hasAllData,
    modules,
    checkedResults: results,
    moduleIndices,
    results: checkedPlan,
    info,
  };
};

/**
 * Adds the `duplicate` property to modules which have a duplicate in the given list.
 */
const checkDuplicates = (modules: Module[]): Module[] => {
  modules = modules.map((module) => ({ ...module }));

  const seenModulesMap: Record<string, Module[]> = {};

  modules.forEach((module) => {
    const moduleCode = module.code;
    const modules =
      seenModulesMap[moduleCode] || (seenModulesMap[moduleCode] = []);
    modules.push(module);
  });

  return Object.values(seenModulesMap).reduce((acc, modules) => {
    if (modules.length > 1) {
      modules.forEach((module) => {
        module.duplicate = true;
      });
    }

    return acc.concat(modules);
  }, []);
};

/**
 * Extracts `data` from `react-query` query objects, and returns an object with a
 * `hasAllData` boolean to indicate if all queries were successfully fetched.
 */
const cleanQueries = (
  queries: UseQueryResult<ModuleInformation>[]
): { hasAllData: boolean; data: ModuleInformation[] } => {
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
