import { Grid, makeStyles } from "@material-ui/core";
import { Droppable } from "react-beautiful-dnd";

import { Item } from "./Item";
import { useModuleContext } from "./ModuleContext";
import { getModuleId } from "./utils/modules";

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
  modules: number[];
};

export const ModuleList = ({
  droppableId,
  modules,
}: ModuleListProps): JSX.Element => {
  const { getModule, removeModule } = useModuleContext();
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
          {modules.map((moduleIndex) => (
            <Item
              key={getModuleId(getModule(moduleIndex))}
              index={moduleIndex}
              displayWarnings={droppableId !== "0-0"}
              onRemove={() => removeModule(moduleIndex)}
            />
          ))}
          {provided.placeholder}
        </Grid>
      )}
    </Droppable>
  );
};
