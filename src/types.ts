import type { PrerequisiteTree } from "./utils/prerequisites";

export type Module = {
  year: number;
  semester: number;
  code: string;
  /** Unique identifier to allow duplicate modules to be selected. */
  index: number;
  missingPrerequisites?: PrerequisiteTree[] | null;
  duplicate?: boolean;
  assignedBlock?: string;
  moduleInfo?: ModuleInformation | null;
};

// Copied from https://github.com/nusmodifications/nusmods/blob/0d8b187f2711c9af4d98c4a2b44ce3b1847ac1d1/scrapers/nus-v2/src/types/modules.ts
export type ModuleCode = string; // E.g. "CS3216"
export type ModuleTitle = string;

// This format is returned from the module list endpoint.
export type ModuleCondensed = Readonly<{
  moduleCode: ModuleCode;
  title: ModuleTitle;
  semesters: number[];
}>;

export type ModuleInformation = Readonly<{
  moduleCode: ModuleCode;
  title: ModuleTitle;
  description?: string;
  moduleCredit: string;
  prereqTree?: PrerequisiteTree;
}>;
