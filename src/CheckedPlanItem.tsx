import { useState } from "react";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import { green, red } from "@material-ui/core/colors";
import { useModuleContext } from "./ModuleContext";

import type { CheckedPlanResult } from "./utils/plan";

export const CheckedPlanItem = ({
  checkedPlanResult: module,
  ...props
}: {
  checkedPlanResult: CheckedPlanResult;
} & React.HTMLProps<HTMLDivElement>): JSX.Element => {
  const { setHighlightedBlock } = useModuleContext();

  const hasChildren = !!module.children.length;
  const [isChildrenShown, setIsChildrenShown] = useState(false);

  return (
    <div
      style={{
        margin: "10px 0",
      }}
      {...props}
    >
      <div onMouseOver={() => setHighlightedBlock(module.ref)}>
        <h2 style={{ fontWeight: "bold" }}>
          {module.satisfied ? (
            <CheckIcon style={{ color: green[500] }} />
          ) : (
            <CloseIcon style={{ color: red[500] }} />
          )}{" "}
          {module.name || module.ref}
        </h2>
        {hasChildren && (
          <button
            onClick={() =>
              setIsChildrenShown((isChildrenShown) => !isChildrenShown)
            }
          >
            {isChildrenShown ? "Close" : "Expand"}
          </button>
        )}
        <p style={{ fontFamily: "Iosevka, monospace" }}>
          <strong>Assigned modules: </strong>
          {module.assigned}
          <br />
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
      </div>

      {isChildrenShown && (
        <div style={{ marginLeft: 20 }}>
          {module.children.map((module) => (
            <CheckedPlanItem key={module.ref} checkedPlanResult={module} />
          ))}
        </div>
      )}
    </div>
  );
};
