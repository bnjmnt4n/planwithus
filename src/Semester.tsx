import { AddModule } from "./AddModule";
import { Grid, Typography } from "@material-ui/core";
import { ModuleList } from "./ModuleList";
import { useModuleContext } from "./ModuleContext";

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
    <Grid item>
      <Typography variant="h6">Semester {semester}</Typography>
      <p style={{ fontWeight: "bold" }}>{moduleCredits} MCs</p>
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
