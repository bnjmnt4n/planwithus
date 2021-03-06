import { Grid, makeStyles } from "@material-ui/core";
import { Droppable } from "react-beautiful-dnd";

import { ModuleItem } from "./ModuleItem";
import { useModuleContext } from "./ModuleContext";
import { getModuleId } from "./utils/modules";

const useListStyles = makeStyles(() => ({
  idle: {
    border: "2px solid transparent",
    borderRadius: 5,
    width: 310,
    padding: 5,
  },
  isDraggingOver: {
    border: "2px solid lightgrey",
    borderRadius: 5,
    width: 310,
    padding: 5,
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
          spacing={1}
          ref={provided.innerRef}
          className={
            snapshot.isDraggingOver ? classes.isDraggingOver : classes.idle
          }
          {...provided.droppableProps}
        >
          {modules.map((moduleIndex) => (
            <ModuleItem
              key={getModuleId(getModule(moduleIndex))}
              index={moduleIndex}
              displayWarnings={true}
              onRemove={() => removeModule(moduleIndex)}
            />
          ))}
          {provided.placeholder}
        </Grid>
      )}
    </Droppable>
  );
};
