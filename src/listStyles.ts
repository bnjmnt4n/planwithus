import { makeStyles } from "@material-ui/core";

export const useListStyles = makeStyles(() => ({
  idle: {
    border: "2px solid transparent",
    width: 250,
  },
  isDraggingOver: {
    border: "2px solid lightgrey",
    width: 250,
  },
}));

export const useItemStyles = makeStyles((theme) => ({
  idle: {
    userSelect: "none",
    padding: theme.spacing(2),
  },
  dragging: {
    userSelect: "none",
    padding: theme.spacing(2),
  },
}));
