import { Draggable } from "react-beautiful-dnd";
import { IconButton, Paper } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { useItemStyles } from "./listStyles";
import { useModuleContext } from "./ModuleContext";

import type { Module } from "./types";
import { getModuleId, printMissingPrerequisites } from "./utils";

type ItemProps = {
  item: Module;
  index: number;
  onRemove: () => void;
};

const Item = ({ item, index, onRemove }: ItemProps): JSX.Element => {
  const classes = useItemStyles();
  const { modules, moduleInfo } = useModuleContext();

  const itemInfo = moduleInfo.find((module) => module.moduleCode === item.code);
  const module = modules.find((module) => module.code === item.code);

  const missingPrerequisites = module?.missingPrerequisites;

  return (
    <Draggable draggableId={getModuleId(item)} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={snapshot.isDragging ? classes.dragging : classes.idle}
          elevation={snapshot.isDragging ? 10 : 1}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            {item.code}
            {itemInfo && ` ${itemInfo.title}`}
            <IconButton aria-label="delete" onClick={onRemove}>
              <DeleteIcon />
            </IconButton>
          </div>
          {missingPrerequisites && (
            <p>
              Missing prerequisites:
              <br />
              {printMissingPrerequisites(missingPrerequisites)}
            </p>
          )}
        </Paper>
      )}
    </Draggable>
  );
};

export default Item;
