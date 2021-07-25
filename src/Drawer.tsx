import { useState } from "react";
import { CheckedPlanItem } from "./CheckedPlanItem";
import { Combobox } from "./Combobox";
import {
  Button,
  Drawer as MaterialUiDrawer,
  makeStyles,
  Typography,
} from "@material-ui/core";

import { CheckedPlanResult } from "./utils/plan";
import { getTopLevelBlockAY, getTopLevelBlockName } from "./utils/plan";

export const DRAWER_WIDTH = 500;
const useStyles = makeStyles(() => ({
  drawer: {
    width: DRAWER_WIDTH,
  },
  drawerPaper: {
    width: DRAWER_WIDTH,
    padding: 20,
  },
}));

type DrawerProps = {
  info: string[];
  checkedPlanResult: CheckedPlanResult;
  topLevelBlocks: (readonly [string, string])[];
  block: readonly [string, string];
  setBlock: React.Dispatch<React.SetStateAction<readonly [string, string]>>;
  setHighlightedBlock: React.Dispatch<React.SetStateAction<string>>;
};

export const Drawer = ({
  info,
  checkedPlanResult,
  topLevelBlocks,
  block,
  setBlock,
  setHighlightedBlock,
}: DrawerProps): JSX.Element => {
  const classes = useStyles();
  const [shouldShowInfo, setShouldShowInfo] = useState(true);

  return (
    <MaterialUiDrawer
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper,
      }}
      variant="permanent"
      anchor="left"
    >
      <Combobox
        items={topLevelBlocks}
        label="Select a block"
        placeholder="Block"
        emptyText="No such block"
        itemKey={(block, index) => `${block[0]}-${block[1]}-${index}`}
        itemToString={blockToString}
        onItemSelected={(block) => setBlock(block)}
      />

      <Typography>
        <strong>Selected block: </strong> {blockToString(block)}
      </Typography>
      {shouldShowInfo && (
        <>
          <Typography variant="body2" component="p">
            <b>Info:</b>
          </Typography>
          <ol style={{ padding: "0 16px", listStyle: "decimal" }}>
            {info.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ol>
        </>
      )}

      <Button
        size="small"
        onClick={() => setShouldShowInfo((shouldShowInfo) => !shouldShowInfo)}
      >
        Show {shouldShowInfo ? "less" : "more"}
      </Button>
      <CheckedPlanItem
        key={checkedPlanResult.ref}
        checkedPlanResult={checkedPlanResult}
        onMouseOut={() => setHighlightedBlock("")}
      />
    </MaterialUiDrawer>
  );
};

const blockToString = (block: readonly [string, string]) => {
  const name = getTopLevelBlockName(block);
  const ay = getTopLevelBlockAY(block);
  return ay === null ? name : `${name} (AY${ay % 100}/${(ay % 100) + 1})`;
};
