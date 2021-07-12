import { makeStyles } from "@material-ui/core";

export const getListStyle = (isDraggingOver: boolean): React.CSSProperties => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: 8,
  width: 250,
});

export const useItemStyles = makeStyles((theme) => ({
  idle: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `0 0 ${theme.spacing(2)}px 0`,
  },
  dragging: {
    userSelect: "none",
    padding: theme.spacing(2),
    margin: `0 0 ${theme.spacing(2)}px 0`,
  },
}));
