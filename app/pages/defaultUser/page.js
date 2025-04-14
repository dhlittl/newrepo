// Default User Dashboard

"use client";
import  React , { useState, useEffect } from 'react';

// importing from dnd-kit for widget implementation and styling
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

const initialWidgets = [
    { id: "apply", name: "Application", visible: true},
    { id: "sponsorInfo", name: "Sponsor Information", visible: true},
    { id: "help", name: "Help", visible: true},
  ];

export default function DefaultUserDashboard() {
    const [widgets, setWidgets] = useState (initialWidgets);
    const [userId, setUserId] = useState("1"); // update to be dynamic later
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      console.log("Using User_ID:", userId); 
      // fetch initial widget order
      async function fetchWidgetOrder() {
        try {
          if (typeof window !== 'undefined') {
            const User_ID = userId;
  
            const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/defaultUser/Dashboard/Preferences?User_ID=${User_ID}`);
            const data = await response.json();

            console.log("API Response", data)
  
            if (response.ok && Array.isArray(data.widget_order)) {
              const orderedWidgets = initialWidgets.map((widget) => ({
                  ...widget,
                  visible: data.widget_order.includes(widget.id)
              }));
              setWidgets(orderedWidgets);
            } else {
              console.error("Error fetching widget order:", data);
            }
          }
        } catch (error) {
          console.error("Failed to fetch widget order:", error);
        }
      }
  
      fetchWidgetOrder();
    }, [userId]);

    useEffect(() => {
      console.log("Widgets Updated:", widgets.map((w) => w.id));
    }, [widgets]);

    // sensors for dragging widgets
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor)
    );

    // function to handle drag and drop
    const handleDrag = (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
    
      console.log('Before Drag:', widgets);

      // get current order
      const updatedWidgets = [...widgets];

      const oldIndex = updatedWidgets.findIndex((w) => w.id === active.id);
      const newIndex = updatedWidgets.findIndex((w) => w.id === over.id);
    
      // checking if valid indices were found
      if (oldIndex === -1 || newIndex === -1) return;
    
      // update widget list
      const [movedWidget] = updatedWidgets.splice(oldIndex, 1);
      updatedWidgets.splice(newIndex, 0, movedWidget);
    
      console.log('Widgets Updated:', updatedWidgets);

      // update state
      setWidgets(updatedWidgets);

      updateWidgetOrder(updatedWidgets.filter((w) => w.visible));
    };

    // function to update the widget order in the database
    async function updateWidgetOrder(newVisibleWidgets) {
      try {
        const requestBody = {
          User_ID: userId,
          Widget_Order: newVisibleWidgets.map((widget) => widget.id),
        };
        console.log("Request Body:", requestBody);
        
        const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/defaultUser/Dashboard/Preferences`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
    
        const data = await response.json();
        
        console.log("API Response:", data);
    
        if (data.message === "Widget Order Updated or Created") { 
          console.log("Widget order updated successfully");
        } else {
          console.error("Error updating widget order:", data); 
        }
      } catch (error) {
        console.error("Failed to update widget order:", error);
      }
    };
    
    // function to toggle widget visibility
    const toggleWidget = (id) => {
      setWidgets((prev) =>
        prev.map((w) => (w.id === id ? {...w, visible: !w.visible} : w))
      );
    };

  // page
  return (
      <div className="w-full mx-auto p-4 flex">
        {/* Side Panel */}
        <div className="w-1/6 bg-gray-200 p-4 rounded-md shadow-md mr-4">
          <h2 className="text-lg font-semibold mb-4">Select Widgets</h2>
          {widgets.map((widget) => (
            <div key={widget.id} className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={widget.visible}
                onChange={() => toggleWidget(widget.id)}
              />
              <label>{widget.name}</label>
            </div>
          ))}
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">Default User Dashboard</h1>
    
        {/* Draggable Widgets */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDrag}>
          <SortableContext items={widgets.filter((w) => w.visible).map((w) => w.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-wrap gap-4 justify-start">
              {widgets.filter((w) => w.visible).map((widget) => (
                <SortableWidget key={widget.id} widget={widget} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
    );
}

// making widgets sortable
function SortableWidget({widget}) {
const { attributes, listeners, setNodeRef, transform, transition} = useSortable({ id: widget.id });

const style = {
    transform: CSS.Transform.toString(transform),
    transition,
};

return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="bg-gray-200 p-4 rounded-md shadow-md cursor-grab">
    {getWidgetContent(widget.id)}
    </div>
);
}


  // widget components
  // some hardcoded bc not connected to db yet
  function getWidgetContent(id) {
    switch (id) {
      case "apply":
        return <LinkWidget title="Application" content="Click here to apply to a sponsor!" link="/pages/defaultUser/applyForm" />;
      case "sponsorInfo":
        return <LinkWidget title="Sponsor Information" content="Click here to view information about available sponsors!" link="/pages/defaultUser/sponsorsPage"/>;
      case "help":
        return <LinkWidget title="Help" link="/pages/defaultUser/help" />;
      default:
        return null;
    }
  }


// generic widget
function Widget({ title, content }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p>{content}</p>
    </div>
  );
}


function LinkWidget ({ title, content, link }) {
  return (
    <div className="p-4 border rounded shadow-lg bg-gray-100">
      <h3 className="font-semibold">{title}</h3>
      {content && <p className="mb-3">{content}</p>}
      <Link href={link} className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Go to {title}
      </Link>
    </div>
  );
}