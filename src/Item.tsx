import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { getItemStyle } from "./listStyles";
import { useModuleContext } from "./ModuleContext";

import type { Module } from "./types";
import { getModuleId } from "./utils";

type ItemProps = {
  item: Module;
  index: number;
  onRemove: () => void;
};

const Item = ({ item, index, onRemove }: ItemProps): JSX.Element => {
  const { moduleInfo } = useModuleContext();

  const itemInfo = moduleInfo.find((module) => module.moduleCode === item.code);

  return (
    <Draggable draggableId={getModuleId(item)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            {item.code}
            {itemInfo && ` ${itemInfo.title}`}
            <button type="button" onClick={onRemove}>
              Delete
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Item;
