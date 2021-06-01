import React, { useMemo } from "react";
import { Item } from "@react-stately/collections";
import { ComboBox } from "./ComboBox";
import { useModuleContext } from "./ModuleContext";

import type { Module } from "./types";

type AddModuleProps = {
  year: number;
  semester: number;
};

export const AddModule = ({ year, semester }: AddModuleProps) => {
  const { moduleInfo, addModule } = useModuleContext();

  const filteredModules = useMemo(() => {
    return moduleInfo.filter((module) => module.semesters.includes(semester));
  }, [moduleInfo, semester]);

  return (
    <div>
      <h4>Add Module</h4>
      <ComboBox label="Select a module">
        {moduleInfo.map((module) => (
          <Item
            key={module.moduleCode}
          >{`${module.moduleCode} ${module.title}`}</Item>
        ))}
      </ComboBox>
    </div>
  );
};
