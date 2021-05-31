import React, { useMemo, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { move, removeModule, reorder, transform } from "./utils";
import Year from "./Year";

import type { Module } from "./types";
import type { DropResult } from "react-beautiful-dnd";

const YEARS = [1, 2, 3, 4];

const Main = (): JSX.Element => {
  const [state, setState] = useState<Module[]>([
    { year: 1, semester: 1, code: "GER1000" },
  ]);

  const transformedData = useMemo(() => transform(state), [state]);

  const onDragEnd = ({ source, destination }: DropResult): void => {
    // Don't allow drops outside the list.
    if (!destination) {
      return;
    }

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;

    if (sourceId === destinationId) {
      const newState = reorder(
        state,
        sourceId,
        source.index,
        destination.index
      );

      setState(newState);
    } else {
      const newState = move(state, source, destination);

      setState(newState);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {YEARS.map((year, index) => (
          <Year
            key={year}
            year={year}
            data={transformedData[index]}
            removeModule={(toRemove: Module) =>
              setState((modules) => removeModule(modules, toRemove))
            }
          />
        ))}
      </DragDropContext>
    </div>
  );
};

export default Main;
