import { Grid, Typography } from "@material-ui/core";
import { Semester } from "./Semester";

type YearProps = {
  year: number;
  moduleIndices: number[][][];
};

const SEMESTERS = [1, 2];

export const Year = ({ year, moduleIndices }: YearProps): JSX.Element => {
  return (
    <Grid item>
      <Typography variant="h5">Year {year}</Typography>
      <Grid container direction="row" wrap="nowrap" spacing={2}>
        {SEMESTERS.map((semester) => (
          <Semester
            key={semester}
            year={year}
            semester={semester}
            moduleIndices={moduleIndices}
          />
        ))}
      </Grid>
    </Grid>
  );
};
