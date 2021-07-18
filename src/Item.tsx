import { Draggable } from "react-beautiful-dnd";
import { IconButton, Paper } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

import { useItemStyles } from "./listStyles";
import { useModuleContext } from "./ModuleContext";
import { getModuleId } from "./utils/modules";
import { printMissingPrerequisites } from "./utils/prerequisites";

import type { Module } from "./types";

type ItemProps = {
  item: Module;
  index: number;
  displayWarnings: boolean;
  onRemove: () => void;
};

const Item = ({
  item,
  index,
  displayWarnings,
  onRemove,
}: ItemProps): JSX.Element => {
  const classes = useItemStyles();
  const { modules, moduleInfo } = useModuleContext();

  const itemInfo = moduleInfo.find((module) => module.moduleCode === item.code);
  const module = modules.find(
    (module) => module.code === item.code && module.index === item.index
  );

  const missingPrerequisites = module?.missingPrerequisites;
  const individualModuleInfo = module?.moduleInfo;
  const duplicate = module?.duplicate;
  const assignedBlock = module?.assignedBlock;

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
          {displayWarnings && (
            <>
              {!individualModuleInfo && <p>Loading module information...</p>}
              {duplicate && <p>Duplicate module</p>}
              {assignedBlock && <p>Assigned to block: {assignedBlock}</p>}
              {missingPrerequisites && (
                <p>
                  Missing prerequisites:
                  <br />
                  {printMissingPrerequisites(missingPrerequisites)}
                </p>
              )}
            </>
          )}
        </Paper>
      )}
    </Draggable>
  );
};

export default Item;
