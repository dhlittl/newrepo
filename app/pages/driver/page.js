// Driver Dashboard

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
import { UserIcon } from '@heroicons/react/20/solid';
import Link from "next/link";

// setting up initial widgets that the driver user has access to
const initialWidgets = [
  { id: "points", name: "Current Points", visible: true},
  { id: "conversion", name: "Point-to-Dollar Conversion", visible: true},
  { id: "progress", name: "Progress to Point Goal", visible: true},
  { id: "catalog", name: "Catalog", visible: true},
  { id: "friends", name: "Friends", visible: true},
  { id: "trend", name: "Point Trend Graph", visible: true},
  { id: "notifications", name: "Notifications", visible: true},
  { id: "help", name: "Help", visible: true},
];

export default function DriverDashboard() {
    const [widgets, setWidgets] = useState (initialWidgets);
    const [userId, setUserId] = useState("1"); // update to be dynamic later
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Fetch initial widget order from the API when the component mounts
      async function fetchWidgetOrder() {
        try {
          const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Preferences?User_ID=${user_id}`);
          const data = await response.json();
      
          if (response.ok && data.widget_order) {
              // Update widgets based on the fetched widget order
              const orderedWidgets = initialWidgets.map((widget) => {
              return {
                ...widget,
                visible: data.widget_order.includes(widget.id)
              };
            });
            setWidgets(orderedWidgets);
          } else {
            console.error("Error fetching widget order:", data); // log the entire data to debug
          }
        } catch (error) {
          console.error("Failed to fetch widget order:", error); // more detailed error logging
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
      const visibleWidgets = widgets.filter((w) => w.visible);
      const oldIndex = visibleWidgets.findIndex((w) => w.id === active.id);
      const newIndex = visibleWidgets.findIndex((w) => w.id === over.id);
    
      // checking if valid indices were found
      if (oldIndex === -1 || newIndex === -1) return;
    
      // reorder visible widgets
      const newVisibleWidgets = arrayMove(visibleWidgets, oldIndex, newIndex);

      console.log('New visible widgets:', newVisibleWidgets);
    
      // update widget list
      const newWidgets = widgets.map((widget) =>
        newVisibleWidgets.find((newW) => newW.id === widget.id) || widget
      );
    
      console.log('Widgets Updated:', newWidgets);

      // update state
      setWidgets(newVisibleWidgets);

      updateWidgetOrder(newVisibleWidgets.map((widget) => widget.id));
    };

    // function to update the widget order in the database
    async function updateWidgetOrder() {
      try {
        const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Preferences?User_ID=${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: "1", 
            widget_order: widgets.map((w) => w.id),
          }),
        });
    
        const data = await response.json();
        
        console.log("API Response:", data);
    
        if (response.ok && data.success) { 
          console.log("Widget order updated successfully");
        } else {
          console.error("Error updating widget order:", data); 
        }
      } catch (error) {
        console.error("Failed to update widget order:", error);
      }
    }
    

    // function to toggle widget visibility
    const toggleWidget = (id) => {
      setWidgets((prev) =>
        prev.map((w) => (w.id === id ? {...w, visible: !w.visible} : w))
      );
    };

    // page
    return (
      <div className="max-w-2xl mx-auto p-4">
        
        <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
  
        {/* Widget Selection */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Select Widgets</h2>
          {widgets.map((widget) => (
            <div key={widget.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={widget.visible}
                onChange={() => toggleWidget(widget.id)}
              />
              <label>{widget.name}</label>
            </div>
          ))}
        </div>
  
        {/* Draggable Widgets */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDrag}>
        <SortableContext items={widgets.filter((w) => w.visible).map((w) => w.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {widgets.filter((w) => w.visible).map((widget) => (
                <SortableWidget key={widget.id} widget={widget} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  }

  // making widgets sortable
  function SortableWidget({widget}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: widget.id,
    });

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

  function PointsWidget() {
    const [points, setPoints] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      async function fetchPoints() {
        try {
          const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points");
          const data = await response.json();
          if (response.ok) {
            setPoints(data.points);
          } else {
            console.error("Error fetching points:", data.message);
          }
        } catch (error) {
          console.error("Failed to fetch points:", error);
        } finally {
          setLoading(false);
        }
      }
  
      fetchPoints();
    }, []);
  
    return (
      <div>
        <h3 className="font-semibold">Current Points</h3>
        {loading ? <p>Loading...</p> : <p>{points !== null ? `${points} pts` : "No points available"}</p>}
      </div>
    );
  }


  // widget components
  // some hardcoded bc not connected to db yet
  function getWidgetContent(id) {
    switch (id) {
      case "points":
        return <PointsWidget />;
      case "conversion":
        return <Widget title="Point-to-Dollar" content="1,500 pts = $1500" />;
      case "progress":
        return <ProgressWidget />;
      case "catalog":
        return <LinkWidget title="Rewards Catalog" link="/catalog" />;
      case "friends":
        return <Widget title="Friends" content="You have 5 friends" />;
      case "trend":
        return <TrendGraph />;
      case "notifications":
        return <Widget title="Notifications" content="You have 3 new alerts" />;
      case "help":
        return <LinkWidget title="Help" link="/pages/driver/driverHelp" />;
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

// link widget for widgets that will lead to other pages in the future
function LinkWidget ({ title, link }) {
  return (
    <div className="p-4 border rounded shadow-lg bg-gray-100">
      <h3 className="font-semibold">{title}</h3>
      <Link href={link} className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Go to {title}
      </Link>
    </div>
  );
}

// progress bar widget functionality
function ProgressWidget() {
  // hardcoding in progress percentage for now 
  const progress = 60;

  return (
    <div>
      <h3 className="font-semibold">Progress to Goal</h3>
        <div className="bg-gray-300 h-4 rounded-md overflow-hidden">
          <div className="bg-blue-500 h-full" style={{ width: `${progress}%` }}></div>
        </div>
      <p>{progress}% Complete</p>
    </div>
  );
}

// point trend graph widget functionality 
// hard coding for example and bc not tied to db yet
function TrendGraph() {
  const data = [
    { name: "Jan", points: 200 },
    { name: "Feb", points: 350 },
  ];
  return (
    <div>
      <h3 className="font-semibold">Point Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="points" fill="#3182CE" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}