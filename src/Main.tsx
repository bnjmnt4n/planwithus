import { useMemo, useState } from "react";
import { useQueries, useQuery, UseQueryResult } from "react-query";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Grid, makeStyles, Typography } from "@material-ui/core";

import { ModuleContextProvider } from "./ModuleContext";
import { Combobox } from "./Combobox";
import Year from "./Year";
import { ModuleList } from "./ModuleList";
import { AddModule } from "./AddModule";
import { useUserSelectedModules } from "./hooks/useUserSelectedModules";
import { move, remove, reorder } from "./utils/modules";
import { checks } from "./utils/checks";
import { getTopLevelBlockName, getTopLevelBlocks } from "./utils/plan";

import type { DropResult } from "react-beautiful-dnd";
import type { ModuleCondensed, ModuleInformation } from "./types";

const YEARS = [1, 2, 3, 4];

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export const Main = (): JSX.Element => {
  const classes = useStyles();

  // User-customizable data.
  const {
    selectedModules,
    exemptedModules,
    setSelectedModules,
    setExemptedModules,
  } = useUserSelectedModules();
  const topLevelBlocks = getTopLevelBlocks();
  const [block, setBlock] = useState(topLevelBlocks[0]);

  // Fetch list of all modules.
  const { data: moduleInfo, status } = useQuery<ModuleCondensed[]>(
    ["modules"],
    async () => {
      const request = await fetch(
        "https://api.nusmods.com/v2/2021-2022/moduleList.json"
      );
      return request.json();
    }
  );

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
  ) as UseQueryResult<ModuleInformation>[];

  const { hasAllData, transformedData, modules, results, info } = useMemo(
    () =>
      checks(
        selectedModules,
        exemptedModules,
        individualModuleInformation,
        block
      ),
    [selectedModules, exemptedModules, individualModuleInformation, block]
  );

  // Used to display drop to remove indicator.
  const [isDragging, setIsDragging] = useState(false);
  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = ({ source, destination }: DropResult): void => {
    setIsDragging(false);

    // Don't allow drops outside the list.
    if (!destination) {
      return;
    }

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;

    // Remove module from selection.
    if (destinationId === "remove") {
      const {
        selectedModules: newSelectedModules,
        exemptedModules: newExemptedModules,
      } = remove(selectedModules, exemptedModules, sourceId, source.index);

      setSelectedModules(newSelectedModules);
      setExemptedModules(newExemptedModules);
    }
    // Reorder module within the same semester grouping.
    else if (sourceId === destinationId) {
      const {
        selectedModules: newSelectedModules,
        exemptedModules: newExemptedModules,
      } = reorder(
        selectedModules,
        exemptedModules,
        sourceId,
        source.index,
        destination.index
      );

      setSelectedModules(newSelectedModules);
      setExemptedModules(newExemptedModules);
    }
    // Move module from one grouping to another.
    else {
      const {
        selectedModules: newSelectedModules,
        exemptedModules: newExemptedModules,
      } = move(selectedModules, exemptedModules, source, destination);

      setSelectedModules(newSelectedModules);
      setExemptedModules(newExemptedModules);
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
    <ModuleContextProvider
      value={{
        modules,
        moduleInfo,
        selectedModules,
        exemptedModules,
        setSelectedModules,
        setExemptedModules,
      }}
    >
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="h-screen flex flex-col">
          <Droppable droppableId="remove">
            {/* TODO: highlighting when dragging over */}
            {(provided, _snapshot) => (
              <header
                ref={provided.innerRef}
                className="w-full p-4 text-2xl text-center font-bold"
                {...provided.droppableProps}
              >
                <h1>{isDragging ? "Drop to remove" : "plaNwithUS"}</h1>
              </header>
            )}
          </Droppable>
          <Grid
            container
            direction="row"
            wrap="nowrap"
            className={classes.root}
            spacing={3}
          >
            <div style={{ flex: "1 0 20%", padding: 20 }}>
              <p>Selected block: {getTopLevelBlockName(block)}</p>
              <Combobox
                items={topLevelBlocks}
                label="Select a block"
                placeholder="Block"
                emptyText="No such block"
                itemKey={(block, index) => `${block[0]}-${block[1]}-${index}`}
                itemToString={(block) => getTopLevelBlockName(block)}
                onItemSelected={(block) => setBlock(block)}
              />
              <p>{results.isSatisfied ? "satisfied" : results.message}</p>
              <p>{info.join("\n")}</p>
            </div>

            <Grid item>
              <Typography variant="h6">Exempted Modules</Typography>
              <ModuleList droppableId="exemptions" modules={exemptedModules} />
              <AddModule year={0} semester={0} isExemption />
            </Grid>

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
