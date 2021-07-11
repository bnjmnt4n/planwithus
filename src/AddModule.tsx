import { useMemo, useState } from "react";
import { useCombobox } from "downshift";
import { useModuleContext } from "./ModuleContext";

import {
  IconButton,
  Input,
  FormLabel,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
    <div className="w-full">
      <FormLabel {...getLabelProps()}>Add modules:</FormLabel>
      <div {...getComboboxProps()}>
        <Input
          placeholder="Module"
          {...getInputProps({
            refKey: "inputRef",
            // Open the combobox dropdown on focus.
            onFocus: () => {
              if (!isOpen) {
                openMenu();
              }
            },
          })}
        />
        <IconButton color="secondary" {...getToggleButtonProps()}>
          <ExpandMoreIcon />
        </IconButton>
      </div>
      <List {...getMenuProps()}>
        {isOpen &&
          (filteredItems.length ? (
            filteredItems.map((item, index) => {
              return (
                <ListItem
                  key={`${item.moduleCode}=${index}`}
                  className={
                    index === highlightedIndex ? "bg-blue-200" : undefined
                  }
                  {...getItemProps({
                    item,
                    index,
                  })}
                >
                  <ListItemText primary={moduleInfoToString(item)} />
                </ListItem>
              );
            })
          ) : (
            <ListItem>
              <ListItemText>No modules found</ListItemText>
            </ListItem>
          ))}
      </List>
    </div>
  );
};
