import { makeStyles } from "@material-ui/core";

export const useItemStyles = makeStyles((theme) => ({
  idle: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0`,
    backgroundColor: theme.palette.primary.light,
  },
  highlighted: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0`,
    backgroundColor: theme.palette.info.light,
  },
  warning: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0`,
    backgroundColor: theme.palette.warning.light,
  },
  assigned: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0`,
    backgroundColor: theme.palette.success.light,
  },
  dragging: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0}`,
    backgroundColor: theme.palette.primary.light,
  },
}));
