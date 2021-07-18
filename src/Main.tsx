import { useEffect, useMemo, useState } from "react";
import { useQueries, useQuery } from "react-query";
import { DragDropContext } from "react-beautiful-dnd";
import { Grid, makeStyles } from "@material-ui/core";

import { checks, move, reorder } from "./utils";
import { ModuleContextProvider } from "./ModuleContext";
import Year from "./Year";

import type { Module, ModuleCondensed } from "./types";
import type { DropResult } from "react-beautiful-dnd";

const YEARS = [1, 2, 3, 4];

const getInitialModules = (): Module[] => {
  let modules: Module[];
  try {
    modules = JSON.parse(localStorage.getItem("modules") ?? "[]");
    // eslint-disable-next-line no-empty
  } catch (e) {
    modules = [
      { year: 1, semester: 1, code: "GER1000", index: 0, moduleInfo: null },
      { year: 1, semester: 1, code: "CS1101S", index: 0, moduleInfo: null },
    ];
  }
  if (!modules.length) {
    modules = [];
  }

  return modules;
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export const Main = (): JSX.Element => {
  const classes = useStyles();

  const { data: moduleInfo, status } = useQuery<ModuleCondensed[]>(
    ["modules"],
    async () => {
      const request = await fetch(
        "https://api.nusmods.com/v2/2021-2022/moduleList.json"
      );
      return request.json();
    }
  );

  const [selectedModules, setSelectedModules] =
    useState<Module[]>(getInitialModules);

  // Fetch detailed information about each individual module, including prerequisite tree.
  const individualModuleInformation = useQueries(
    selectedModules.map((module) => ({
      queryKey: ["module", module.code],
      queryFn: async () => {
        const request = await fetch(
          `https://api.nusmods.com/v2/2021-2022/modules/${module.code}.json`
        );
        return request.json();
      },
    }))
  );

  // Persist modules to `localStorage`.
  useEffect(() => {
    localStorage.setItem("modules", JSON.stringify(selectedModules));
  }, [selectedModules]);

  const { hasAllData, transformedData, modules } = useMemo(
    () => checks(selectedModules, individualModuleInformation),
    [selectedModules, individualModuleInformation]
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

  if (status === "loading") {
    return <div className="text-center">Loading module information...</div>;
  }

  if (status === "error") {
    return (
      <div className="text-center">
        Error loading module information. Please refresh to try again.
      </div>
    );
  }

  if (!moduleInfo) {
    throw new Error("No module information found");
  }

  return (
    <ModuleContextProvider value={{ modules, moduleInfo, setSelectedModules }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="h-screen flex flex-col">
          <header className="w-full p-4 text-2xl text-center font-bold">
            <h1>plaNwithUS</h1>
          </header>
          <Grid
            container
            direction="row"
            wrap="nowrap"
            className={classes.root}
            spacing={3}
          >
            {YEARS.map((year, index) => (
              <Year key={year} year={year} data={transformedData[index]} />
            ))}
          </Grid>
          <div>
            {!hasAllData &&
              "Failed to load module information for all selected modules"}
          </div>
        </div>
      </DragDropContext>
    </ModuleContextProvider>
  );
};
