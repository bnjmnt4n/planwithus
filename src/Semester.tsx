import React from "react";
import { Droppable } from "react-beautiful-dnd";
import Item from "./Item";
import { useModuleContext } from "./ModuleContext";
import { getListStyle } from "./listStyles";
import { getModuleId } from "./utils";

import type { Module } from "./types";

type SemesterProps = {
  year: number;
  semester: number;
  data: Module[];
};

const Semester = ({ year, semester, data }: SemesterProps): JSX.Element => {
  const { removeModule } = useModuleContext();

  return (
    <div>
      <h3>Semester {semester}</h3>
      <Droppable droppableId={`${year}-${semester}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
            {data.map((item, index) => (
              <Item
                item={item}
                index={index}
                key={getModuleId(item)}
                onRemove={() => removeModule(item)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Semester;
