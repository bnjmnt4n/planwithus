import { useState } from "react";
import { useCombobox } from "downshift";
import {
  IconButton,
  Input,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

type ComboboxProps<T> = {
  items: T[];
  label: string;
  placeholder: string;
  emptyText: string;
  itemKey: (item: T, index: number) => string;
  itemToString: (item: T) => string;
  onItemSelected: (module: T) => void;
};

const useComboboxStyles = makeStyles(() => ({
  menu: {
    overflow: "auto",
    maxHeight: "300px",
  },
}));

const NUM_ITEMS_SHOWN = 50;

export const Combobox: <T>(props: ComboboxProps<T>) => JSX.Element = ({
  items,
  label,
  placeholder,
  emptyText,
  itemKey,
  itemToString,
  onItemSelected,
}) => {
  const classes = useComboboxStyles();
  // TODO: currently capping at the first 50 items to avoid performance issues when rendering.
  const [filteredItems, setFilteredItems] = useState(() =>
    items.slice(0, NUM_ITEMS_SHOWN)
  );

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
    // Highlight first item by default.
    defaultHighlightedIndex: 0,
    itemToString: (item) => (item ? itemToString(item) : ""),
    onInputValueChange: ({ inputValue }) => {
      if (inputValue) {
        setFilteredItems(
          items
            .filter((item) =>
              itemToString(item)
                .toLowerCase()
                .startsWith(inputValue.toLowerCase())
            )
            .slice(0, NUM_ITEMS_SHOWN)
        );
      } else {
        setFilteredItems(items.slice(0, NUM_ITEMS_SHOWN));
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
      <FormLabel {...getLabelProps()}>{label}</FormLabel>
      <div {...getComboboxProps()} style={{ display: "flex" }}>
        <Input
          placeholder={placeholder}
          {...getInputProps({
            refKey: "inputRef",
            // Open the combobox dropdown on focus.
            onFocus: () => {
              if (!isOpen) {
                openMenu();
              }
            },
          })}
          style={{
            flexGrow: 1,
          }}
        />
        <IconButton color="secondary" {...getToggleButtonProps()}>
          <ExpandMoreIcon />
        </IconButton>
      </div>
      <List {...getMenuProps()} className={classes.menu}>
        {isOpen &&
          (filteredItems.length ? (
            filteredItems.map((item, index) => {
              return (
                <ListItem
                  key={itemKey(item, index)}
                  className={
                    index === highlightedIndex ? "bg-blue-200" : undefined
                  }
                  {...getItemProps({
                    item,
                    index,
                  })}
                >
                  <ListItemText primary={itemToString(item)} />
                </ListItem>
              );
            })
          ) : (
            <ListItem>
              <ListItemText>{emptyText}</ListItemText>
            </ListItem>
          ))}
      </List>
    </div>
  );
};
