import { makeStyles } from "@material-ui/core";
import { green } from "@material-ui/core/colors";

export const useItemStyles = makeStyles((theme) => ({
  idle: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0`,
  },
  highlighted: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0`,
    backgroundColor: green[200],
  },
  dragging: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0}`,
  },
}));
