import React, { useMemo, useState } from "react";
import { useCombobox } from "downshift";
import { useModuleContext } from "./ModuleContext";

import type { ModuleCondensed } from "./types";

type AddModuleProps = {
  year: number;
  semester: number;
};

export const AddModule = ({ year, semester }: AddModuleProps): JSX.Element => {
  const { moduleInfo, addModule } = useModuleContext();

  const filteredModules = useMemo(() => {
    return moduleInfo.filter((module) => module.semesters.includes(semester));
  }, [moduleInfo, semester]);

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
  // TODO: currently capping at the first 100 modules to avoid performance issues when rendering.
  const [filteredItems, setFilteredItems] = useState(() => items.slice(0, 100));

  const {
    isOpen,
    highlightedIndex,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
    setInputValue,
    openMenu,
    selectItem,
  } = useCombobox({
    items: filteredItems,
    itemToString: (item) => (item ? moduleInfoToString(item) : ""),
    onInputValueChange: ({ inputValue }) => {
      if (inputValue) {
        setFilteredItems(
          items
            .filter((item) =>
              moduleInfoToString(item)
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            )
            .slice(0, 100)
        );
      } else {
        setFilteredItems(items.slice(0, 100));
      }
    },
    onSelectedItemChange: ({ selectedItem }) => {
      // Trigger callback to add module on selection, and reset the combobox.
      if (selectedItem) {
        onItemSelected(selectedItem);
        setInputValue("");
        // TODO: better way to reset currently selected item?
        (selectItem as unknown as (item: null) => void)(null);
      }
    },
  });

  return (
    <div>
      <label {...getLabelProps()}>Add module:</label>
      <div {...getComboboxProps()}>
        <input
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
          {...getToggleButtonProps()}
          aria-label="Toggle menu"
        >
          &#8595;
        </button>
      </div>
      <ul {...getMenuProps()}>
        {isOpen &&
          (filteredItems.length ? (
            filteredItems.map((item, index) => (
              <li
                style={
                  highlightedIndex === index
                    ? { backgroundColor: "#bde4ff" }
                    : {}
                }
                key={`${item.moduleCode}`}
                {...getItemProps({ item, index })}
              >
                {moduleInfoToString(item)}
              </li>
            ))
          ) : (
            <li>No modules found</li>
          ))}
      </ul>
    </div>
  );
};
