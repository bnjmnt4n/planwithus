import { makeStyles } from "@material-ui/core";

export const useItemStyles = makeStyles((theme) => ({
  idle: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0`,
  },
  dragging: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0}`,
  },
}));
