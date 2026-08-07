import React, { useMemo, useState } from "react";
import {
  ScanSearch,
  Copy,
  Check,
  CheckCheck,
  X,
  Type,
  Layout,
  Palette,
  Box,
} from "lucide-react";

import "./CSSInspector.css";

const CSSInspector = ({
  selectedElement,
  onPropertyChange,
}) => {
  const [editingProperty, setEditingProperty] =
    useState(null);

  const [editValue, setEditValue] =
    useState("");

  const [copiedItem, setCopiedItem] =
    useState(null);

  const formatProperty = (property) =>
    property
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase();

  const startEditing = (
    property,
    value
  ) => {
    setEditingProperty(property);
    setEditValue(value);
  };

  const saveProperty = (property) => {
    if (onPropertyChange) {
      onPropertyChange(
        property,
        editValue
      );
    }

    setEditingProperty(null);
    setEditValue("");
  };

  const cancelEditing = () => {
    setEditingProperty(null);
    setEditValue("");
  };

  const copyText = async (
    id,
    value
  ) => {
    await navigator.clipboard.writeText(
      value
    );

    setCopiedItem(id);

    setTimeout(() => {
      setCopiedItem(null);
    }, 1200);
  };

  const copyProperty = (
    property,
    value
  ) => {
    copyText(
      property,
      `${formatProperty(property)}: ${value};`
    );
  };

  const copySelector = () => {
    const selector =
      `${selectedElement.tag}` +
      `${selectedElement.id ? "#" + selectedElement.id : ""}` +
      `${
        selectedElement.classes
          ? "." +
            selectedElement.classes
              .split(" ")
              .join(".")
          : ""
      }`;

    copyText("selector", selector);
  };

  const copyCompleteCSS = () => {
    const css = Object.entries(
      selectedElement.styles || {}
    )
      .map(
        ([property, value]) =>
          `  ${formatProperty(property)}: ${value};`
      )
      .join("\n");

    const selector =
      `${selectedElement.tag}` +
      `${selectedElement.id ? "#" + selectedElement.id : ""}` +
      `${
        selectedElement.classes
          ? "." +
            selectedElement.classes
              .split(" ")
              .join(".")
          : ""
      }`;

    copyText(
      "css",
      `${selector} {\n${css}\n}`
    );
  };

  if (!selectedElement) {
    return (
      <div className="css-inspector">

        <div className="inspector-header">

          <div>

            <h2>
              CSS Inspector
            </h2>

            <p>
              Live element
              inspection
            </p>

          </div>

        </div>

        <div className="empty-inspector">

          <ScanSearch
            size={46}
          />

          <h3>
            Inspector Ready
          </h3>

          <p>
            Start Live Inspect,
            hover any element,
            then click to lock
            your selection.
          </p>

        </div>

      </div>
    );
  }

  const typography = [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "textAlign",
    "letterSpacing",
    "color",
  ];

  const layout = [
    "display",
    "position",
    "width",
    "height",
    "minWidth",
    "minHeight",
    "maxWidth",
    "maxHeight",
  ];

  const spacing = [
    "margin",
    "padding",
    "gap",
    "top",
    "left",
    "right",
    "bottom",
  ];

  const appearance = [
    "backgroundColor",
    "border",
    "borderRadius",
    "boxShadow",
    "opacity",
  ];

  const propertyGroups =
    useMemo(
      () => [
        {
          title:
            "Typography",
          icon: Type,
          properties:
            typography,
        },
        {
          title:
            "Layout",
          icon: Layout,
          properties:
            layout,
        },
        {
          title:
            "Spacing",
          icon: Box,
          properties:
            spacing,
        },
        {
          title:
            "Appearance",
          icon: Palette,
          properties:
            appearance,
        },
      ],
      []
    );

  return (
    <div className="css-inspector">

      <div className="inspector-header">

        <div>

          <h2>CSS Inspector</h2>

          <p>
            Live CSS properties for the selected element
          </p>

        </div>

        <button
          className="secondary-btn"
          onClick={copyCompleteCSS}
        >

          {copiedItem === "css" ? (
            <CheckCheck size={16} />
          ) : (
            <Copy size={16} />
          )}

          Copy CSS

        </button>

      </div>

      <div className="element-card">

        <div className="selector-pills">

          <span className="selector-pill tag">
            {selectedElement.tag}
          </span>

          {selectedElement.id && (
            <span className="selector-pill id">
              #{selectedElement.id}
            </span>
          )}

          {selectedElement.classes &&
            selectedElement.classes
              .split(" ")
              .filter(Boolean)
              .map((cls) => (
                <span
                  key={cls}
                  className="selector-pill class"
                >
                  .{cls}
                </span>
              ))}

        </div>

        {selectedElement.dimensions && (

          <div className="element-size mono">

            {selectedElement.dimensions.width}
            {" × "}
            {selectedElement.dimensions.height}px

          </div>

        )}

        {selectedElement.textContent && (

          <div className="element-text">

            {selectedElement.textContent}

          </div>

        )}

      </div>

      <div className="property-groups">

        {propertyGroups.map(
          ({
            title,
            icon: Icon,
            properties,
          }) => {

            const visible =
              properties.filter(
                (property) => {
                  const value =
                    selectedElement
                      ?.styles?.[
                      property
                    ];

                  return (
                    value &&
                    value !==
                      "none" &&
                    value !==
                      "auto"
                  );
                }
              );

            if (!visible.length)
              return null;

            return (

              <div
                key={title}
                className="property-group-card"
              >

                <div className="group-header">

                  <div className="group-title">

                    <Icon size={16} />

                    <span>
                      {title}
                    </span>

                  </div>

                  <span className="group-count">

                    {visible.length}

                  </span>

                </div>

                <div className="group-properties">

                  {visible.map(
                    (property) => {

                      const value =
                        selectedElement
                          .styles[
                          property
                        ];

                      return (

                        <div
                          key={
                            property
                          }
                          className="property-card"
                        >

                          <div className="property-name mono">

                            {formatProperty(
                              property
                            )}

                          </div>

                          {editingProperty ===
                          property ? (

                            <div className="property-editor">

                              <input
                                value={
                                  editValue
                                }
                                onChange={(
                                  e
                                ) =>
                                  setEditValue(
                                    e
                                      .target
                                      .value
                                  )
                                }
                                onKeyDown={(
                                  e
                                ) => {

                                  if (
                                    e.key ===
                                    "Enter"
                                  )
                                    saveProperty(
                                      property
                                    );

                                  if (
                                    e.key ===
                                    "Escape"
                                  )
                                    cancelEditing();

                                }}
                                autoFocus
                              />

                              <button
                                className="icon-button"
                                onClick={() =>
                                  saveProperty(
                                    property
                                  )
                                }
                              >

                                <Check
                                  size={
                                    15
                                  }
                                />

                              </button>

                              <button
                                className="icon-button"
                                onClick={
                                  cancelEditing
                                }
                              >

                                <X
                                  size={
                                    15
                                  }
                                />

                              </button>

                            </div>

                          ) : (

                            <div className="property-display">

                              <span
                                className="property-value mono"
                                onClick={() =>
                                  startEditing(
                                    property,
                                    value
                                  )
                                }
                              >

                                {value}

                              </span>

                              <button
                                className="icon-button"
                                onClick={() =>
                                  copyProperty(
                                    property,
                                    value
                                  )
                                }
                              >

                                {copiedItem ===
                                property ? (

                                  <CheckCheck
                                    size={
                                      15
                                    }
                                  />

                                ) : (

                                  <Copy
                                    size={
                                      15
                                    }
                                  />

                                )}

                              </button>

                            </div>

                          )}

                        </div>

                      );

                    }
                  )}

                </div>

              </div>

            );

          }
        )}

      </div>

      <div className="inspector-footer">

        <button
          className="secondary-btn"
          onClick={copySelector}
        >

          {copiedItem ===
          "selector" ? (
            <CheckCheck
              size={16}
            />
          ) : (
            <Copy
              size={16}
            />
          )}

          Copy Selector

        </button>

      </div>

    </div>
  );
};

export default CSSInspector;