import { Grid, Typography } from "@material-ui/core";
import Semester from "./Semester";

import type { Module } from "./types";

type YearProps = {
  year: number;
  data: Module[][];
};

const SEMESTERS = [1, 2];

const Year = ({ year, data }: YearProps): JSX.Element => {
  return (
    <Grid item>
      <Typography variant="h5">Year {year}</Typography>
      <Grid container direction="row" wrap="nowrap" spacing={2}>
        {SEMESTERS.map((semester, index) => (
          <Semester
            key={semester}
            year={year}
            semester={semester}
            data={data[index]}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default Year;
