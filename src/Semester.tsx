import { AddModule } from "./AddModule";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { ModuleList } from "./ModuleList";
import { useModuleContext } from "./ModuleContext";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      marginBottom: theme.spacing(1),
    },
  },
}));

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
  const styles = useStyles();
  const { getModule } = useModuleContext();

  const moduleCredits = moduleIndices[year][semester].reduce(
    (sum, moduleIndex) => {
      const module = getModule(moduleIndex);
      const moduleCredit =
        parseInt(module?.moduleInfo?.moduleCredit ?? "0") || 0;

      return sum + moduleCredit;
    },
    0
  );

  return (
    <Grid item className={styles.root}>
      <div>
        <Typography variant="h6">Semester {semester}</Typography>
        <Typography variant="body1">
          <strong>{moduleCredits} MCs</strong>
        </Typography>
      </div>
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
