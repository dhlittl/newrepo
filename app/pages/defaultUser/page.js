// Default User Dashboard

// IMPORTS
"use client";
import  React , { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

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

// INITIALIZING
// setting up initial widgets that the defaultUser has access to
const initialWidgets = [
    { id: "apply", name: "Application", visible: true},
    { id: "sponsorInfo", name: "Sponsor Information", visible: true},
    { id: "help", name: "Help", visible: true},
  ];

// DEFAULT USER DASHBOARD AND FUNCTIONS
export default function DefaultUserDashboard() {
    const [cognitoSub, setCognitoSub] = useState(null);
    const [widgets, setWidgets] = useState (initialWidgets);
    const [userId, setUserId] = useState("1"); // update to be dynamic later
    const [loading, setLoading] = useState(true);

    // fetch current user (gets coginto_sub)
    useEffect(() => {
      async function fetchUser() {
        try {
          const user = await getCurrentUser();
          setCognitoSub(user.userId);
            
          console.log("Fetched Cognito user ID:", user.userId);
        } catch (error) {
          console.error("Error fetching current user:", error);
        }
      }
  
      fetchUser();
    }, []);

    // using cognito_sub to get user_id
    useEffect(() => {
      async function fetchDatabaseUserId() {
        try {
          const user = await getCurrentUser();
          const cognitoSub = user.userId;
          console.log("Cognito Sub:", cognitoSub);
              
          const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${cognitoSub}`);
          const data = await response.json();
              
          if (response.ok && data.userId) {
            setUserId(data.userId);
            console.log("Database User ID:", data.userId);
            //fetchWidgetOrder(data.userId);
          } else {
            console.error("Error fetching database user ID:", data.error || "Unknown error");
          }
        } catch (error) {
          console.error("Error in user ID mapping:", error);
        }
      }
  
      fetchDatabaseUserId();
    }, []);

    useEffect(() => {
      if (!userId) {
        console.warn('Invalid User_ID');
        return;
      }

      console.log("Using User_ID:", userId); 

      // fetch initial widget order
      const fetchWidgetOrder = async () => {
        try {
          const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Preferences?User_ID=${userId}`);
          const data = await response.json();
      
          console.log('Fetched widget order:', data);
      
          // check if data has a widget_order property that's an array
          if (data && data.widget_order && Array.isArray(data.widget_order)) {
            const widgetOrder = data.widget_order;
            console.log('Widget order array:', widgetOrder);
            
            // mark all widgets as not visible
            const updatedWidgets = initialWidgets.map(widget => ({
              ...widget,
              visible: false
            }));
            
            // make the widgets in the order visible and reorder them
            const reorderedWidgets = [];
            
            // add widgets that are in the order list
            widgetOrder.forEach(widgetId => {
              const widget = initialWidgets.find(w => w.id === widgetId);
              if (widget) {
                reorderedWidgets.push({
                  ...widget,
                  visible: true
                });
              }
            });
            
            // add remaining widgets (not visible)
            initialWidgets.forEach(widget => {
              if (!widgetOrder.includes(widget.id)) {
                reorderedWidgets.push({
                  ...widget,
                  visible: false
                });
              }
            });
            
            console.log('Reordered widgets:', reorderedWidgets);
            setWidgets(reorderedWidgets);
          }
        } catch (error) {
          console.error('Failed to fetch widget order:', error);
        }
      };
    
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
      setWidgets((prev) => {
        const updatedWidgets = prev.map((w) => (w.id === id ? {...w, visible: !w.visible} : w));
        
        // call updateWidgetOrder
        setTimeout(() => {
          updateWidgetOrder(updatedWidgets.filter((w) => w.visible));
        }, 0);
        
        return updatedWidgets;
      });
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
                 <SortableWidget key={widget.id} widget={widget} userId={userId} />
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