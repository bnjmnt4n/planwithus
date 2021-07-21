import { useMemo, useState } from "react";
import { useQueries, useQuery, UseQueryResult } from "react-query";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Drawer, Grid, makeStyles, Typography } from "@material-ui/core";

import { ModuleContextProvider } from "./ModuleContext";
import { Combobox } from "./Combobox";
import { Year } from "./Year";
import { ModuleList } from "./ModuleList";
import { AddModule } from "./AddModule";
import { CheckedPlanItem } from "./CheckedPlanItem";
import { useUserSelectedModules } from "./hooks/useUserSelectedModules";
import { move, removeModule, swapPosition } from "./utils/modules";
import { checks } from "./utils/checks";
import {
  getTopLevelBlockAY,
  getTopLevelBlockName,
  getTopLevelBlocks,
} from "./utils/plan";

import type { DropResult } from "react-beautiful-dnd";
import type { ModuleCondensed, ModuleInformation } from "./types";

export const YEARS = [1, 2, 3, 4, 5];

const drawerWidth = 500;
const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: drawerWidth,
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  drawer: {
    width: drawerWidth,
  },
  drawerPaper: {
    width: drawerWidth,
    padding: 20,
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
        "https://api.nusmods.com/v2/2021-2022/moduleList.json"
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
          `https://api.nusmods.com/v2/2021-2022/modules/${module.code}.json`
        );
        return request.json();
      },
    }))
  ) as UseQueryResult<ModuleInformation>[];

  const {
    hasAllData,
    moduleIndices,
    modules,
    checkedResults,
    // results,
    info,
    checkedPlanResult,
  } = useMemo(
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
          <Drawer
            className={classes.drawer}
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            anchor="left"
          >
            <p>Selected block: {getTopLevelBlockName(block)}</p>
            <Combobox
              items={topLevelBlocks}
              label="Select a block"
              placeholder="Block"
              emptyText="No such block"
              itemKey={(block, index) => `${block[0]}-${block[1]}-${index}`}
              itemToString={(block) => {
                const name = getTopLevelBlockName(block);
                const ay = getTopLevelBlockAY(block);
                return ay === null
                  ? name
                  : `${name} (AY${ay % 100}/${(ay % 100) + 1})`;
              }}
              onItemSelected={(block) => setBlock(block)}
            />
            <p>
              <b>Info:</b>
              <ol style={{ padding: "0 16px", listStyle: "decimal" }}>
                {info.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ol>
            </p>
            <CheckedPlanItem
              key={checkedPlanResult.ref}
              checkedPlanResult={checkedPlanResult}
              onMouseOut={() => setHighlightedBlock("")}
            />
          </Drawer>
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
          <div>
            {!hasAllData &&
              "Failed to load module information for all selected modules"}
          </div>
        </div>
      </DragDropContext>
    </ModuleContextProvider>
  );
};
