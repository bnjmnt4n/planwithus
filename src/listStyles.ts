import { makeStyles } from "@material-ui/core";

export const useItemStyles = makeStyles((theme) => ({
  common: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `${theme.spacing(1)}px 0`,
    fontSize: "0.9rem",
  },
  blank: {
    backgroundColor: theme.palette.action.disabled,
  },
  idle: {
    backgroundColor: theme.palette.primary.light,
  },
  highlighted: {
    backgroundColor: theme.palette.secondary.light,
  },
  warning: {
    backgroundColor: theme.palette.warning.light,
  },
  assigned: {
    backgroundColor: theme.palette.success.light,
  },
}));
