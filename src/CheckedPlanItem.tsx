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
            <Tooltip
              placement="bottom-start"
              title="Hover over blocks in the sidebar to highlight matching modules"
            >
              <h2 style={{ fontWeight: "bold", fontSize: "1.03em" }}>
                {module.name
                  ? shortRef
                    ? `${module.name} (${shortRef})`
                    : module.name
                  : module.ref}
              </h2>
            </Tooltip>

            <p>
              {showAssignedModules && (
                <>
                  <strong>Assigned modules: </strong>
                  {module.assigned}
                  <br />
                </>
              )}
              {!!module.possibleAssignments && (
                <>
                  <strong>Possible matches: </strong>
                  {module.possibleAssignments}
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
