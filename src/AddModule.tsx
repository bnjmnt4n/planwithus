import { useModuleContext } from "./ModuleContext";
import { Combobox } from "./Combobox";

import type { ModuleCondensed } from "./types";

type AddModuleProps = {
  year: number;
  semester: number;
  moduleIndices: number[][][];
};

export const AddModule = ({
  year,
  semester,
  moduleIndices,
}: AddModuleProps): JSX.Element => {
  const { allModulesInformation, addModule } = useModuleContext();

  return (
    <div>
      <Combobox
        items={allModulesInformation}
        label="Add modules:"
        placeholder="Module"
        emptyText="No modules found"
        itemKey={(item, index) => `${item.moduleCode}-${index}`}
        itemToString={moduleInfoToString}
        onItemSelected={(module) =>
          addModule(
            {
              year,
              semester,
              code: module.moduleCode,
              uniqueId: 0,
            },
            getNextIndex(moduleIndices, year, semester)
          )
        }
      />
    </div>
  );
};

const moduleInfoToString = ({ title, moduleCode }: ModuleCondensed): string => {
  return `${moduleCode} ${title}`;
};

const getNextIndex = (
  moduleIndices: number[][][],
  year: number,
  semester: number
): number => {
  let moduleCount = 0;
  let index = 0;
  moduleIndices.forEach((yearArray, yearIndex) => {
    yearArray.forEach((semesterArray, semesterIndex) => {
      semesterArray.forEach((_module) => {
        moduleCount++;
      });

      if (year === yearIndex && semester === semesterIndex) {
        index = moduleCount;
      }
    });
  });

  return index;
};
