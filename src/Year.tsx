import React from "react";
import Semester from "./Semester";

import type { Module } from "./types";

type YearProps = {
  year: number;
  data: Module[][];
  removeModule: (toRemove: Module) => void;
};

const SEMESTERS = [1, 2];

const Year = ({ year, data, removeModule }: YearProps): JSX.Element => {
  return (
    <div>
      <h2>Year {year}</h2>
      {SEMESTERS.map((semester, index) => (
        <Semester
          key={semester}
          year={year}
          semester={semester}
          data={data[index]}
          removeModule={removeModule}
        />
      ))}
    </div>
  );
};

export default Year;
