import React, { useCallback, useMemo, useRef, useState } from "react";
import { useCombobox } from "downshift";
import { useVirtual } from "react-virtual";
import { useModuleContext } from "./ModuleContext";

import type { Module, ModuleCondensed } from "./types";

type AddModuleProps = {
  year: number;
  semester: number;
  selectedModules: Module[];
};

export const AddModule = ({
  year,
  semester,
  selectedModules,
}: AddModuleProps): JSX.Element => {
  const { moduleInfo, addModule } = useModuleContext();

  const filteredModules = useMemo(() => {
    return (
      moduleInfo
        .filter((module) => module.semesters.includes(semester))
        // Prevent duplicate selection.
        .filter((module) =>
          selectedModules.every(
            (selectedModule) => module.moduleCode !== selectedModule.code
          )
        )
    );
  }, [moduleInfo, semester, selectedModules]);

  return (
    <div>
      <Combobox
        items={filteredModules}
        onItemSelected={(module) =>
          addModule({ year, semester, code: module.moduleCode })
        }
      />
    </div>
  );
};

const moduleInfoToString = ({ title, moduleCode }: ModuleCondensed): string => {
  return `${moduleCode} ${title}`;
};

type ComboboxProps = {
  items: ModuleCondensed[];
  onItemSelected: (module: ModuleCondensed) => void;
};

const Combobox = ({ items, onItemSelected }: ComboboxProps): JSX.Element => {
  const [inputValue, setInputValue] = useState<string | undefined>("");
  // TODO: currently capping at the first 100 modules to avoid performance issues when rendering.
  const filteredItems = useMemo(() => {
    if (inputValue) {
      return items.filter((item) =>
        moduleInfoToString(item)
          .toLowerCase()
          .includes(inputValue.toLowerCase())
      );
    } else {
      return items;
    }
  }, [items, inputValue]);

  const listRef = useRef(null);
  const rowVirtualizer = useVirtual({
    size: filteredItems.length,
    parentRef: listRef,
    estimateSize: useCallback(() => 50, []),
    overscan: 3,
  });

  const {
    isOpen,
    highlightedIndex,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
    openMenu,
    selectItem,
  } = useCombobox({
    items: filteredItems,
    inputValue,
    itemToString: (item) => (item ? moduleInfoToString(item) : ""),
    onInputValueChange: ({ inputValue: newValue }) => {
      setInputValue(newValue);
    },
    onSelectedItemChange: ({ selectedItem }) => {
      // Trigger callback to add module on selection, and reset the combobox.
      if (selectedItem) {
        onItemSelected(selectedItem);
        // TODO: better way to reset currently selected item?
        (selectItem as unknown as (item: null) => void)(null);
        Promise.resolve(undefined).then(() => setInputValue(""));
      }
    },
    onHighlightedIndexChange: ({ highlightedIndex }) => {
      if (highlightedIndex) {
        rowVirtualizer.scrollToIndex(highlightedIndex);
      }
    },
  });

  return (
    <div className="w-full">
      <label {...getLabelProps()}>Add module:</label>
      <div {...getComboboxProps()}>
        <input
          className="p-1 border-2 border-gray-400 rounded"
          {...getInputProps({
            // Open the combobox dropdown on focus.
            onFocus: () => {
              if (!isOpen) {
                openMenu();
              }
            },
          })}
        />
        <button
          type="button"
          className="px-2 py-1 border-2 border-gray-400 rounded"
          {...getToggleButtonProps()}
          aria-label="Toggle menu"
        >
          &#8595;
        </button>
      </div>
      <ul
        {...getMenuProps({ ref: listRef })}
        className="max-h-80 overflow-auto relative"
      >
        {isOpen &&
          (filteredItems.length ? (
            <>
              <li
                key="total-size"
                className="relative w-full"
                style={{ height: rowVirtualizer.totalSize }}
              />
              {rowVirtualizer.virtualItems.map((virtualRow) => (
                <li
                  key={filteredItems[virtualRow.index].moduleCode}
                  className={`px-2 py-3 w-full absolute block ${
                    highlightedIndex === virtualRow.index ? "bg-blue-200" : ""
                  }`}
                  style={{
                    top: 0,
                    left: 0,
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  {...getItemProps({
                    item: filteredItems[virtualRow.index],
                    index: virtualRow.index,
                    ref: (element) => {
                      console.log(element);
                      console.log(element?.getBoundingClientRect());
                      return virtualRow.measureRef(element);
                    },
                  })}
                >
                  <div className="h-full">
                    {moduleInfoToString(filteredItems[virtualRow.index])}
                  </div>
                </li>
              ))}
            </>
          ) : (
            <li>No modules found</li>
          ))}
      </ul>
    </div>
  );
};
