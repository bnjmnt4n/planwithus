import { Draggable } from "react-beautiful-dnd";
import { Divider, IconButton, makeStyles, Paper } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

import { useModuleContext } from "./ModuleContext";
import { getModuleId } from "./utils/modules";
import { printMissingPrerequisites } from "./utils/prerequisites";
import { getBreadCrumbTrailFromAnyDirectory } from "./utils/plan";

const useStyles = makeStyles((theme) => ({
  common: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0`,
    fontSize: "0.9rem",
    width: "100%",
  },
  blank: {
    backgroundColor: theme.palette.action.disabled,
  },
  warning: {
    backgroundColor: theme.palette.warning.light,
  },
  assigned: {
    backgroundColor: theme.palette.success.light,
  },
  highlighted: {
    backgroundColor: "#4dabf5",
  },
}));

type ModuleItemProps = {
  index: number;
  displayWarnings: boolean;
  onRemove: () => void;
};

export const ModuleItem = ({
  index,
  displayWarnings,
  onRemove,
}: ModuleItemProps): JSX.Element => {
  const classes = useStyles();
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

  const moduleCreditStr = individualModuleInfo?.moduleCredit;
  const moduleCredit = moduleCreditStr ? parseInt(moduleCreditStr) : null;

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
            isSomeModuleHighlighted
              ? isCurrentModuleHighlighted
                ? classes.highlighted
                : classes.blank
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
            {moduleCredit && <p>{moduleCredit} MCs</p>}
            {assignedBlock && (
              <p style={{ fontSize: "90%" }}>
                {getBreadCrumbTrailFromAnyDirectory(assignedBlock).join(" > ")}
              </p>
            )}
            {!!possibleAssignedBlocks.length && (
              <>
                <p style={{ fontSize: "90%" }}>Possible matches:</p>
                <ul
                  style={{
                    fontSize: "90%",
                    listStyle: "decimal",
                    padding: "0 16px",
                  }}
                >
                  {possibleAssignedBlocks.map((blockRef) => (
                    <li key={blockRef}>
                      {getBreadCrumbTrailFromAnyDirectory(blockRef).join(" > ")}
                    </li>
                  ))}
                </ul>
              </>
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
