import { useMemo, useState } from "react";
import { useQueries, useQuery, UseQueryResult } from "react-query";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Grid, makeStyles, Typography } from "@material-ui/core";

import { ModuleContextProvider } from "./ModuleContext";
import { Year } from "./Year";
import { ModuleList } from "./ModuleList";
import { AddModule } from "./AddModule";
import { useUserSelectedModules } from "./hooks/useUserSelectedModules";
import { move, removeModule, swapPosition } from "./utils/modules";
import { checks } from "./utils/checks";
import { getTopLevelBlocks } from "./utils/plan";
import { Drawer, DRAWER_WIDTH } from "./Drawer";

import type { DropResult } from "react-beautiful-dnd";
import type { ModuleCondensed, ModuleInformation } from "./types";

export const YEARS = [1, 2, 3, 4, 5];

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: DRAWER_WIDTH,
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export const Main = (): JSX.Element => {
  const classes = useStyles();

  // User-customizable data.
  const { selectedModules, setSelectedModules } = useUserSelectedModules();
  const topLevelBlocks = getTopLevelBlocks();
  const [block, setBlock] = useState(topLevelBlocks[0]);
  const [highlightedBlock, setHighlightedBlock] = useState("");

  // Fetch list of all modules.
  const { data: allModulesInformation, status } = useQuery<ModuleCondensed[]>(
    ["modules"],
    async () => {
      const request = await fetch(
        "https://api.nusmods.com/v2/2020-2021/moduleList.json"
      );
      return request.json();
    }
  );

  // Fetch detailed information about each individual module, including prerequisite tree.
  const individualModuleInformation = useQueries(
    selectedModules.modules.map((module) => ({
      queryKey: ["module", module.code],
      queryFn: async () => {
        const request = await fetch(
          `https://api.nusmods.com/v2/2020-2021/modules/${module.code}.json`
        );
        return request.json();
      },
    }))
  ) as UseQueryResult<ModuleInformation>[];

  const { moduleIndices, modules, checkedResults, info, checkedPlanResult } =
    useMemo(
      () => checks(selectedModules.modules, individualModuleInformation, block),
      [selectedModules, individualModuleInformation, block]
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
      setSelectedModules(removeModule(selectedModules, source.index));
    }
    // Reorder module within the same semester grouping.
    else if (sourceId === destinationId) {
      setSelectedModules(
        swapPosition(selectedModules, source.index, destination.index)
      );
    }
    // Move module from one grouping to another.
    else {
      setSelectedModules(move(selectedModules, source.index, destination));
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

  if (!allModulesInformation) {
    throw new Error("No module information found");
  }

  return (
    <ModuleContextProvider
      value={{
        modules,
        checkedResults,
        allModulesInformation,
        selectedModules,
        setSelectedModules,
        highlightedBlock,
        setHighlightedBlock,
      }}
    >
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex flex-col">
          <Droppable droppableId="remove">
            {/* TODO: highlighting when dragging over */}
            {(provided, _snapshot) => (
              <header
                ref={provided.innerRef}
                className="w-full p-4 text-2xl text-center font-bold"
                {...provided.droppableProps}
              >
                {isDragging ? (
                  <Typography color="secondary" variant="h4">
                    Drop to remove
                  </Typography>
                ) : (
                  <Typography style={{ whiteSpace: "nowrap" }} variant="h4">
                    pla<span style={{ color: "#ef7c00" }}>N</span>with
                    <span style={{ color: "#ef7c00" }}>US</span>
                  </Typography>
                )}
              </header>
            )}
          </Droppable>
          <Drawer
            info={info}
            checkedPlanResult={checkedPlanResult}
            topLevelBlocks={topLevelBlocks}
            block={block}
            setBlock={setBlock}
            setHighlightedBlock={setHighlightedBlock}
            moduleIndices={moduleIndices}
          />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            className={classes.root}
            spacing={3}
          >
            <Grid item>
              <Typography variant="h6">Exempted Modules</Typography>
              <ModuleList droppableId="0-0" modules={moduleIndices[0][0]} />
              <AddModule year={0} semester={0} moduleIndices={moduleIndices} />
            </Grid>

            {YEARS.map((year) => (
              <Year key={year} year={year} moduleIndices={moduleIndices} />
            ))}
          </Grid>
        </div>
      </DragDropContext>
    </ModuleContextProvider>
  );
};
