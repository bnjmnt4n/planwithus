import { Draggable } from "react-beautiful-dnd";
import { Divider, IconButton, Paper } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

import { useItemStyles } from "./listStyles";
import { useModuleContext } from "./ModuleContext";
import { getModuleId } from "./utils/modules";
import { printMissingPrerequisites } from "./utils/prerequisites";
import { getBreadCrumbTrailFromAnyDirectory } from "./utils/plan";

type ItemProps = {
  index: number;
  displayWarnings: boolean;
  onRemove: () => void;
};

export const Item = ({
  index,
  displayWarnings,
  onRemove,
}: ItemProps): JSX.Element => {
  const classes = useItemStyles();
  const { getModule, highlightedBlock, allModulesInformation } =
    useModuleContext();

  const module = getModule(index);
  const itemInfo = allModulesInformation.find(
    (moduleInformation) => moduleInformation.moduleCode === module?.code
  );

  const missingPrerequisites = module?.missingPrerequisites;
  const individualModuleInfo = module?.moduleInfo;
  const duplicate = module?.duplicate;
  const assignedBlock = module?.assignedBlock ?? "";
  const possibleAssignedBlocks = module?.possibleAssignedBlocks ?? [];

  const hasWarnings =
    !individualModuleInfo || missingPrerequisites || duplicate;
  const isAssigned = !(
    assignedBlock === "" && possibleAssignedBlocks.length === 0
  );

  const isSomeModuleHighlighted = !!highlightedBlock;
  const isCurrentModuleHighlighted =
    isSomeModuleHighlighted &&
    [assignedBlock, ...possibleAssignedBlocks].some((block) =>
      block.startsWith(highlightedBlock)
    );

  return (
    <Draggable draggableId={getModuleId(module)} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={[
            classes.common,
            isSomeModuleHighlighted && !isCurrentModuleHighlighted
              ? classes.blank
              : hasWarnings
              ? classes.warning
              : isAssigned
              ? classes.assigned
              : classes.blank,
          ].join(" ")}
          elevation={snapshot.isDragging ? 10 : 1}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <b>
              {module.code}
              {itemInfo && ` ${itemInfo.title}`}
            </b>
            <IconButton
              aria-label="delete"
              onClick={onRemove}
              style={{ fontSize: "1.3rem" }}
            >
              <DeleteIcon />
            </IconButton>
          </div>
          <>
            {assignedBlock && (
              <p>
                Assigned to block:{" "}
                {getBreadCrumbTrailFromAnyDirectory(assignedBlock).join(" > ")}
              </p>
            )}
            {!!possibleAssignedBlocks.length && (
              <p>
                Possible matches:{" "}
                {possibleAssignedBlocks
                  .map((blockRef) =>
                    getBreadCrumbTrailFromAnyDirectory(blockRef).join(" > ")
                  )
                  .join(", ")}
              </p>
            )}
          </>
          {displayWarnings && hasWarnings && (
            <>
              <Divider style={{ margin: "8px 0" }} />
              {!individualModuleInfo ? (
                <p>Loading module information...</p>
              ) : (
                <ol style={{ padding: "0 16px", listStyle: "decimal" }}>
                  {duplicate && (
                    <li>
                      <p>Duplicate module</p>
                    </li>
                  )}
                  {missingPrerequisites && (
                    <li>
                      <p>
                        Missing prerequisites:
                        <br />
                        {printMissingPrerequisites(missingPrerequisites)}
                      </p>
                    </li>
                  )}
                </ol>
              )}
            </>
          )}
        </Paper>
      )}
    </Draggable>
  );
};
