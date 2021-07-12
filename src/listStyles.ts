import { makeStyles } from "@material-ui/core";

export const useListStyles = makeStyles(() => ({
  idle: {
    border: "2px solid transparent",
    width: 300,
  },
  isDraggingOver: {
    border: "2px solid lightgrey",
    width: 300,
  },
}));

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
