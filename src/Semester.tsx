import { Droppable } from "react-beautiful-dnd";
import Item from "./Item";
import { useModuleContext } from "./ModuleContext";
import { useListStyles } from "./listStyles";
import { getModuleId } from "./utils";

import type { Module } from "./types";
import { AddModule } from "./AddModule";
import { Grid, Typography } from "@material-ui/core";

type SemesterProps = {
  year: number;
  semester: number;
  data: Module[];
};

const Semester = ({ year, semester, data }: SemesterProps): JSX.Element => {
  const { removeModule } = useModuleContext();
  const classes = useListStyles();

  return (
    <Grid item>
      <Typography variant="h6">Semester {semester}</Typography>
      <Droppable droppableId={`${year}-${semester}`}>
        {(provided, snapshot) => (
          <Grid
            container
            spacing={2}
            ref={provided.innerRef}
            className={
              snapshot.isDraggingOver ? classes.isDraggingOver : classes.idle
            }
            {...provided.droppableProps}
          >
            {data.map((item, index) => (
              <Item
                item={item}
                index={index}
                key={getModuleId(item)}
                onRemove={() => removeModule(item)}
              />
            ))}
            {provided.placeholder}
          </Grid>
        )}
      </Droppable>
      <AddModule year={year} semester={semester} selectedModules={data} />
    </Grid>
  );
};

export default Semester;
