import { CheckedPlanItem } from "./CheckedPlanItem";
import { Combobox } from "./Combobox";
import { Drawer as MaterialUiDrawer, makeStyles } from "@material-ui/core";

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

  return (
    <MaterialUiDrawer
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper,
      }}
      variant="permanent"
      anchor="left"
    >
      <p>
        <strong>Selected block: </strong> {blockToString(block)}
      </p>
      <Combobox
        items={topLevelBlocks}
        label="Select a block"
        placeholder="Block"
        emptyText="No such block"
        itemKey={(block, index) => `${block[0]}-${block[1]}-${index}`}
        itemToString={blockToString}
        onItemSelected={(block) => setBlock(block)}
      />
      <p>
        <b>Info:</b>
      </p>
      <ol style={{ padding: "0 16px", listStyle: "decimal" }}>
        {info.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ol>
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
