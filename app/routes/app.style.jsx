import {
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  Button,
  Checkbox,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const DEFAULT_ELEMENTS = [
  { key: "image", label: "Product Image", visible: true },
  { key: "title", label: "Title", visible: true },
  { key: "controls", label: "Audio Controls", visible: true },
  { key: "waveform", label: "Waveform", visible: true },
  { key: "close", label: "Close Button", visible: true },
];

export default function PlayerStyleSettingsPage() {
  const [elements, setElements] = useState(DEFAULT_ELEMENTS);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(elements);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setElements(reordered);
  };

  const handleToggle = (index) => (checked) => {
    setElements((prev) =>
      prev.map((el, i) =>
        i === index ? { ...el, visible: checked } : el
      )
    );
  };

  const handleSubmit = () => {
    // TODO: Save order and visibility to backend
    alert(
      "Order: " +
        elements
          .filter((el) => el.visible)
          .map((el) => el.key)
          .join(", ")
    );
  };

  return (
    <Page>
      <TitleBar title="Audio Player Drag & Drop Designer" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd">
                Drag to reorder, toggle to show/hide elements
              </Text>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="player-elements">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        background: "#f6f6f7",
                        borderRadius: 8,
                        padding: 16,
                        minHeight: 200,
                      }}
                    >
                      {elements.map((el, idx) => (
                        <Draggable
                          key={el.key}
                          draggableId={el.key}
                          index={idx}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: snapshot.isDragging
                                  ? "#e0e0e0"
                                  : "#fff",
                                border: "1px solid #dfe3e8",
                                borderRadius: 6,
                                padding: "12px 16px",
                                marginBottom: 12,
                                ...provided.draggableProps.style,
                              }}
                            >
                              <span style={{ fontWeight: 500 }}>
                                {el.label}
                              </span>
                              <Checkbox
                                label="Show"
                                checked={el.visible}
                                onChange={handleToggle(idx)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <Button primary onClick={handleSubmit}>
                Save Layout
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
