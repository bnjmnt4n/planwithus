import { makeStyles } from "@material-ui/core";

export const useItemStyles = makeStyles((theme) => ({
  common: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0`,
  },
  idle: {
    backgroundColor: theme.palette.primary.light,
  },
  highlighted: {
    backgroundColor: theme.palette.info.light,
  },
  warning: {
    backgroundColor: theme.palette.warning.light,
  },
  assigned: {
    backgroundColor: theme.palette.success.light,
  },
  dragging: {
    backgroundColor: theme.palette.primary.light,
  },
}));
