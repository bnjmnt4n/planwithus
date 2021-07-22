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

  return (
    <div
      style={{
        display: "flex",
        padding: "10px 0",
      }}
      {...props}
    >
      <div>
        {hasChildren ? (
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
        ) : (
          <RemoveIcon fontSize="small" />
        )}
      </div>
      <div style={{ paddingRight: "8px" }}>
        {module.satisfied ? (
          <CheckIcon fontSize="small" style={{ color: green[500] }} />
        ) : (
          <CloseIcon fontSize="small" style={{ color: red[500] }} />
        )}
      </div>
      <div style={{ overflow: "hidden" }}>
        <div onMouseOver={() => setHighlightedBlock(module.ref)}>
          <h2 style={{ fontWeight: "bold", fontSize: "1.03em" }}>
            {module.name ? `${module.name} (${module.ref})` : module.ref}
          </h2>

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
            {module.info && (
              <>
                <strong>Info: </strong>
                {module.info}
                <br />
              </>
            )}
          </p>
          {hasYaml && (
            <p>
              <button
                onClick={() => setIsYamlShown((isYamlShown) => !isYamlShown)}
              >
                <strong>
                  {isYamlShown ? "Hide schema" : "Display schema"}
                </strong>
              </button>
            </p>
          )}
          {isYamlShown && <pre style={{ overflow: "auto" }}>{blockYaml}</pre>}
        </div>

        {isChildrenShown && (
          <div>
            {visibleChildren.map((module) => (
              <CheckedPlanItem key={module.ref} checkedPlanResult={module} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
