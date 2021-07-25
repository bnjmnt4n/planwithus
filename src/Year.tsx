import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import { Semester } from "./Semester";

type YearProps = {
  year: number;
  moduleIndices: number[][][];
};

const SEMESTERS = [1, 2];

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
}));

export const Year = ({ year, moduleIndices }: YearProps): JSX.Element => {
  const styles = useStyles();
  return (
    <Grid item>
      <Paper variant="outlined" className={styles.root}>
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
      </Paper>
    </Grid>
  );
};
