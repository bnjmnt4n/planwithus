import React from "react";
import Semester from "./Semester";

import type { Module } from "./types";

type YearProps = {
  year: number;
  data: Module[][];
};

const SEMESTERS = [1, 2];

const Year = ({ year, data }: YearProps): JSX.Element => {
  return (
    <div>
      <h2>Year {year}</h2>
      <div>
        {SEMESTERS.map((semester, index) => (
          <Semester
            key={semester}
            year={year}
            semester={semester}
            data={data[index]}
          />
        ))}
      </div>
    </div>
  );
};

export default Year;
