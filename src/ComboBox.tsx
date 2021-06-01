import React, { useRef } from "react";

import { Item } from "@react-stately/collections";
import { mergeProps } from "@react-aria/utils";
import { useButton } from "@react-aria/button";
import { useComboBox } from "@react-aria/combobox";
import {
  ComboBoxState,
  ComboBoxStateProps,
  useComboBoxState,
} from "@react-stately/combobox";
import { useFilter } from "@react-aria/i18n";
import { AriaListBoxOptions, useListBox, useOption } from "@react-aria/listbox";
import { useOverlay, DismissButton } from "@react-aria/overlays";
import { ModuleCondensed } from "./types";

type ComboBoxProps = ComboBoxStateProps<ModuleCondensed> & {
  label: string;
};

export const ComboBox = (props: ComboBoxProps): JSX.Element => {
  const { contains } = useFilter({ sensitivity: "base" });

  // Create state based on the incoming props and the filter function
  const state = useComboBoxState({ ...props, defaultFilter: contains });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listBoxRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Get props for child elements from useComboBox
  const {
    buttonProps: triggerProps,
    inputProps,
    listBoxProps,
    labelProps,
  } = useComboBox(
    {
      ...props,
      inputRef,
      buttonRef: triggerRef,
      listBoxRef,
      popoverRef,
      menuTrigger: "input",
    },
    state
  );

  // Get props for the trigger button based on the
  // button props from useComboBox
  const { buttonProps } = useButton(triggerProps, triggerRef);

  return (
    <div style={{ display: "inline-flex", flexDirection: "column" }}>
      <label {...labelProps}>{props.label}</label>
      <div style={{ position: "relative", display: "inline-block" }}>
        <input
          {...inputProps}
          ref={inputRef}
          style={{
            height: 22,
            boxSizing: "border-box",
            marginRight: 0,
          }}
        />
        <button
          {...buttonProps}
          ref={triggerRef}
          style={{
            height: 22,
            marginLeft: 0,
          }}
        >
          <span aria-hidden="true" style={{ padding: "0 2px" }}>
            ▼
          </span>
        </button>
        {state.isOpen && (
          <ListBoxPopup
            {...listBoxProps}
            // Use virtual focus to get aria-activedescendant tracking and
            // ensure focus doesn't leave the input field
            shouldUseVirtualFocus
            listBoxRef={listBoxRef}
            popoverRef={popoverRef}
            state={state as any}
          />
        )}
      </div>
    </div>
  );
};

type ListBoxPopupProps = AriaListBoxOptions<ModuleCondensed> & {
  shouldUseVirtualFocus: boolean;
  listBoxRef: React.RefObject<HTMLElement>;
  popoverRef: React.RefObject<HTMLDivElement>;
  state: ComboBoxStateProps<ModuleCondensed>;
};

const ListBoxPopup = (props: ListBoxPopupProps): JSX.Element => {
  const {
    popoverRef,
    listBoxRef,
    state,
    // shouldUseVirtualFocus,
    ...otherProps
  } = props;

  // Get props for the list box.
  // Prevent focus moving to list box via shouldUseVirtualFocus
  const { listBoxProps } = useListBox(
    {
      autoFocus: (state as any).focusStrategy,
      disallowEmptySelection: true,
      // shouldUseVirtualFocus,
      ...otherProps,
    },
    state as any,
    listBoxRef
  );

  // Handle events that should cause the popup to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  const { overlayProps } = useOverlay(
    {
      onClose: () => (state as any).close(),
      shouldCloseOnBlur: true,
      isOpen: state.isOpen,
      isDismissable: true,
    },
    popoverRef
  );

  // Add a hidden <DismissButton> component at the end of the list
  // to allow screen reader users to dismiss the popup easily.
  return (
    <div {...overlayProps} ref={popoverRef}>
      <ul
        {...mergeProps(listBoxProps, otherProps)}
        ref={listBoxRef as any}
        style={{
          position: "absolute",
          width: "100%",
          margin: "4px 0 0 0",
          padding: 0,
          listStyle: "none",
          border: "1px solid gray",
          background: "lightgray",
          maxHeight: "200px",
          overflow: "scroll",
        }}
      >
        {[...(state as any).collection].map((item) => (
          <Option
            shouldUseVirtualFocus
            key={item.key}
            item={item}
            state={state as any}
          />
        ))}
      </ul>
      <DismissButton onDismiss={() => (state as any).close()} />
    </div>
  );
};

type OptionProps = {
  item: any;
  state: ComboBoxState<ModuleCondensed>;
  shouldUseVirtualFocus: boolean;
};

const Option = ({ item, state, shouldUseVirtualFocus }: OptionProps) => {
  const ref = useRef<HTMLElement>(null);
  const isDisabled = state.disabledKeys.has(item.key);
  const isSelected = state.selectionManager.isSelected(item.key);
  // Track focus via focusedKey state instead of with focus event listeners
  // since focus never leaves the text input in a ComboBox
  const isFocused = state.selectionManager.focusedKey === item.key;

  // Get props for the option element.
  // Prevent options from receiving browser focus via shouldUseVirtualFocus.
  const { optionProps } = useOption(
    {
      key: item.key,
      isDisabled,
      isSelected,
      shouldSelectOnPressUp: true,
      shouldFocusOnHover: true,
      shouldUseVirtualFocus,
    },
    state,
    ref
  );

  let backgroundColor;
  let color = "black";

  if (isSelected) {
    backgroundColor = "blueviolet";
    color = "white";
  } else if (isFocused) {
    backgroundColor = "gray";
  } else if (isDisabled) {
    backgroundColor = "transparent";
    color = "gray";
  }

  return (
    <li
      {...optionProps}
      ref={ref as any}
      style={{
        background: backgroundColor,
        color: color,
        padding: "2px 5px",
        outline: "none",
        cursor: "pointer",
      }}
    >
      {item.rendered}
    </li>
  );
};
