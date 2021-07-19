import { AddModule } from "./AddModule";
import { Grid, Typography } from "@material-ui/core";
import { ModuleList } from "./ModuleList";

type SemesterProps = {
  year: number;
  semester: number;
  moduleIndices: number[][][];
};

export const Semester = ({
  year,
  semester,
  moduleIndices,
}: SemesterProps): JSX.Element => {
  return (
    <Grid item>
      <Typography variant="h6">Semester {semester}</Typography>
      <ModuleList
        droppableId={`${year}-${semester}`}
        modules={moduleIndices[year][semester]}
      />
      <AddModule
        year={year}
        semester={semester}
        moduleIndices={moduleIndices}
      />
    </Grid>
  );
};
