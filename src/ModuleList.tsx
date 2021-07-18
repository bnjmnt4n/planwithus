import { Grid, makeStyles } from "@material-ui/core";
import { Droppable } from "react-beautiful-dnd";

import Item from "./Item";
import { useModuleContext } from "./ModuleContext";
import { getModuleId } from "./utils/modules";

import type { Module } from "./types";

const useListStyles = makeStyles(() => ({
  idle: {
    border: "2px solid transparent",
    width: 300,
  },
  isDraggingOver: {
    border: "2px solid lightgrey",
    width: 300,
  },
}));

type ModuleListProps = {
  droppableId: string;
  modules: Module[];
};

export const ModuleList = ({
  droppableId,
  modules,
}: ModuleListProps): JSX.Element => {
  const { removeModule, removeExemptedModule } = useModuleContext();
  const classes = useListStyles();

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <Grid
          container
          spacing={2}
          ref={provided.innerRef}
          className={
            snapshot.isDraggingOver ? classes.isDraggingOver : classes.idle
          }
          {...provided.droppableProps}
        >
          {modules.map((item, index) => (
            <Item
              item={item}
              index={index}
              key={getModuleId(item)}
              displayWarnings={droppableId !== "exemptions"}
              onRemove={() =>
                droppableId === "exemptions"
                  ? removeExemptedModule(item)
                  : removeModule(item)
              }
            />
          ))}
          {provided.placeholder}
        </Grid>
      )}
    </Droppable>
  );
};
