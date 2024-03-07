import React from "react";
import { Table } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const DragDropOrders = ({ data, columns, handleDragEnd }) => {
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="table">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <Table
              dataSource={data}
              columns={columns}
              pagination={false}
              rowKey="id"
              components={{
                body: {
                  row: (props) => {
                    return <DraggableRow {...props} />;
                  },
                },
              }}
            />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const DraggableRow = ({ children, ...props }) => {
  let index = children?.[0]?.props?.index;
  return (
    <Draggable draggableId={props?.["data-row-key"]?.toString()} index={index}>
      {(provided) => (
        <tr
          {...props}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {children}
        </tr>
      )}
    </Draggable>
  );
};

export default DragDropOrders;
