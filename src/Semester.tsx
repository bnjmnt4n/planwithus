import type { Module } from "./types";
import { AddModule } from "./AddModule";
import { Grid, Typography } from "@material-ui/core";
import { ModuleList } from "./ModuleList";

type SemesterProps = {
  year: number;
  semester: number;
  modules: Module[];
};

const Semester = ({ year, semester, modules }: SemesterProps): JSX.Element => {
  return (
    <Grid item>
      <Typography variant="h6">Semester {semester}</Typography>
      <ModuleList droppableId={`${year}-${semester}`} modules={modules} />
      <AddModule year={year} semester={semester} />
    </Grid>
  );
};

export default Semester;
