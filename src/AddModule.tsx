import { useModuleContext } from "./ModuleContext";
import { Combobox } from "./Combobox";

import type { ModuleCondensed } from "./types";

type AddModuleProps = {
  year: number;
  semester: number;
  isExemption?: boolean;
};

export const AddModule = ({
  year,
  semester,
  isExemption,
}: AddModuleProps): JSX.Element => {
  const { moduleInfo, addModule, addExemptedModule } = useModuleContext();

  return (
    <div>
      <Combobox
        items={moduleInfo}
        label="Add modules:"
        placeholder="Module"
        emptyText="No modules found"
        itemKey={(item, index) => `${item.moduleCode}-${index}`}
        itemToString={moduleInfoToString}
        onItemSelected={(module) =>
          (isExemption ? addExemptedModule : addModule)({
            year,
            semester,
            code: module.moduleCode,
            index: 0,
            moduleInfo: null,
          })
        }
      />
    </div>
  );
};

const moduleInfoToString = ({ title, moduleCode }: ModuleCondensed): string => {
  return `${moduleCode} ${title}`;
};
