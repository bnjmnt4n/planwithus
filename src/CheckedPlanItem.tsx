import { useState } from "react";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import RemoveIcon from "@material-ui/icons/Remove";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { green, red } from "@material-ui/core/colors";
import { useModuleContext } from "./ModuleContext";
import { displayYaml } from "./utils/yaml";

import type { CheckedPlanResult } from "./utils/plan";
import { Button, Paper, Tooltip } from "@material-ui/core";

export const CheckedPlanItem = ({
  checkedPlanResult: module,
  ...props
}: {
  checkedPlanResult: CheckedPlanResult;
} & React.HTMLProps<HTMLDivElement>): JSX.Element => {
  const { setHighlightedBlock } = useModuleContext();

  // Hide match blocks and satisfy blocks which are satisfied.
  // They are hidden here so they are still allowed to recurse in the results checks.
  const visibleChildren = module.children.filter((result) => {
    return (
      result.type !== "match" &&
      !(result.type === "satisfy" && result.satisfied)
    );
  });

  const hasChildren = !!visibleChildren.length;
  const [isChildrenShown, setIsChildrenShown] = useState(false);

  const hasYaml = !!module.block;
  const blockYaml = module.block ? displayYaml(module.block) : null;
  const [isYamlShown, setIsYamlShown] = useState(false);

  const showAssignedModules = module.type !== "satisfy";
  const matchRef = /\/([^/]+)$/.exec(module.ref ?? "") ?? [];
  const shortRef = matchRef.length > 0 ? matchRef[1] : null;

  return (
    <Paper variant="outlined" square>
      <div
        style={{
          display: "flex",
          padding: "10px 0",
        }}
        onMouseOver={(e) => {
          e.stopPropagation();
          setHighlightedBlock(module.ref);
        }}
        {...props}
      >
        <div>
          {hasChildren ? (
            <Tooltip
              placement="bottom-start"
              title={isChildrenShown ? `Hide sub-blocks` : `View sub-blocks`}
            >
              <button
                onClick={() =>
                  setIsChildrenShown((isChildrenShown) => !isChildrenShown)
                }
              >
                {isChildrenShown ? (
                  <KeyboardArrowDownIcon fontSize="small" />
                ) : (
                  <KeyboardArrowRightIcon fontSize="small" />
                )}
              </button>
            </Tooltip>
          ) : (
            <RemoveIcon fontSize="small" />
          )}
        </div>
        <div style={{ paddingRight: "8px" }}>
          <Tooltip
            placement="bottom-start"
            title={`Block "${module.name || shortRef}" was ${
              module.satisfied ? "" : " not "
            }satisfied.`}
          >
            {module.satisfied ? (
              <CheckIcon fontSize="small" style={{ color: green[500] }} />
            ) : (
              <CloseIcon fontSize="small" style={{ color: red[500] }} />
            )}
          </Tooltip>
        </div>
        <div style={{ overflow: "hidden", flex: "1 1 0" }}>
          <div>
            <h2 style={{ fontWeight: "bold", fontSize: "1.03em" }}>
              {module.name
                ? shortRef
                  ? `${module.name} (${shortRef})`
                  : module.name
                : module.ref}
            </h2>

            <p>
              {showAssignedModules && (
                <>
                  <Tooltip
                    placement="bottom-start"
                    title={`Modules are assigned to a block when the block is able to match all of its requirements.`}
                  >
                    <strong>Assigned modules: </strong>
                  </Tooltip>
                  {module.assigned}
                  <br />
                </>
              )}
              {!!module.possibleAssignments.length && (
                <>
                  <Tooltip
                    placement="bottom-start"
                    title={`Possible matches are modules which could be assigned to a block but are not due to failure of the block to match.\n

                    The following modules were possible matches: ${module.possibleAssignments
                      .map(([moduleCode]) => moduleCode)
                      .join(", ")}`}
                  >
                    <strong>Possible matches: </strong>
                  </Tooltip>
                  {module.possibleAssignments.length}{" "}
                  <span style={{ fontSize: "90%" }}>
                    (
                    {module.possibleAssignments.reduce(
                      (sum, [, moduleCredits]) => sum + moduleCredits,
                      0
                    )}{" "}
                    MCs)
                  </span>
                  <br />
                </>
              )}
              {module.message && (
                <>
                  <strong>Message: </strong>
                  {module.message}
                  <br />
                </>
              )}
            </p>
            {hasYaml && (
              <Tooltip
                placement="bottom-start"
                title={`Block schemas state the requirements for matching blocks`}
              >
                <Button
                  onClick={() => setIsYamlShown((isYamlShown) => !isYamlShown)}
                >
                  <strong>
                    {isYamlShown ? "Hide schema" : "Display schema"}
                  </strong>
                </Button>
              </Tooltip>
            )}
            {isYamlShown && <pre style={{ overflow: "auto" }}>{blockYaml}</pre>}
          </div>

          {isChildrenShown && (
            <div style={{ width: "100%" }}>
              {visibleChildren.map((module) => (
                <CheckedPlanItem key={module.ref} checkedPlanResult={module} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Paper>
  );
};
