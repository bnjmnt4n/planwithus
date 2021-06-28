import { useEffect, useMemo, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { move, reorder, transform } from "./utils";
import { ModuleContextProvider } from "./ModuleContext";
import Year from "./Year";

import type { Module, ModuleCondensed } from "./types";
import type { DropResult } from "react-beautiful-dnd";

const YEARS = [1, 2, 3, 4];

type MainProps = {
  moduleInfo: ModuleCondensed[];
};

const getInitialModules = (): Module[] => {
  let modules;
  try {
    modules = JSON.parse(localStorage.getItem("modules") ?? "[]");
    // eslint-disable-next-line no-empty
  } catch (e) {}

  if (!modules || !modules.length) {
    modules = [
      { year: 1, semester: 1, code: "GER1000" },
      { year: 1, semester: 1, code: "CS1101S" },
    ];
  }
  return modules;
};

const Main = ({ moduleInfo }: MainProps): JSX.Element => {
  const [selectedModules, setSelectedModules] =
    useState<Module[]>(getInitialModules);

  // Persist modules to `localStorage`.
  useEffect(() => {
    localStorage.setItem("modules", JSON.stringify(selectedModules));
  }, [selectedModules]);

  const transformedData = useMemo(
    () => transform(selectedModules),
    [selectedModules]
  );

  const onDragEnd = ({ source, destination }: DropResult): void => {
    // Don't allow drops outside the list.
    if (!destination) {
      return;
    }

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;

    if (sourceId === destinationId) {
      const newState = reorder(
        selectedModules,
        sourceId,
        source.index,
        destination.index
      );

      setSelectedModules(newState);
    } else {
      const newState = move(selectedModules, source, destination);

      setSelectedModules(newState);
    }
  };

  return (
    <ModuleContextProvider value={{ moduleInfo, setSelectedModules }}>
      <div className="flex flex-row">
        <DragDropContext onDragEnd={onDragEnd}>
          {YEARS.map((year, index) => (
            <Year key={year} year={year} data={transformedData[index]} />
          ))}
        </DragDropContext>
      </div>
    </ModuleContextProvider>
  );
};

export default Main;
