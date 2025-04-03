// Driver Dashboard

// IMPORTS
'use client';
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


// INITIALIZING
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
  { id: "sponsors", name: "Sponsors", visible: true},
  { id: "apply", name: "Applications", visible: true},
];

const checkUserSession = async () => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      
      if (idToken) {
        const groups = idToken.payload["cognito:groups"] || [];
      }

      if(!groups.include("Driver")) router.push("/pages/aboutpage");;
    } catch (error) {
      console.log("No active user session. User needs to sign in.");
    }
  };


// OVERALL DRIVER DASHBOARD AND FUNCTIONS
export default function DriverDashboard() {
  const [widgets, setWidgets] = useState (initialWidgets);
  //const [userId, setUserId] = useState(1); // update to be dynamic later
  const userId = 1;
  const [loading, setLoading] = useState(true);
  //const User_ID="1";

  useEffect(() => {
    console.log("Using User_ID:", userId); 
    // fetch initial widget order
    async function fetchWidgetOrder() {
      try {
        if (typeof window !== 'undefined') {
          const User_ID = userId;

          const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Preferences?User_ID=${User_ID}`);
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
      
      const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Preferences`, {
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
        <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
        
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


// SORTING FUNCTION
// making widgets sortable
function SortableWidget({widget, userId}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: widget.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="bg-gray-200 p-4 rounded-md shadow-md cursor-grab">
      {getWidgetContent(widget.id, userId)}
    </div>
  );
}

// WIDGET COMPONENTS
// some hardcoded bc not connected to db yet
function getWidgetContent(id, userId) {
  switch (id) {
    case "points":
      return <PointsWidget />;
    case "conversion":
      return <Widget title="Point-to-Dollar" content="1,500 pts = $1500" />;
    case "progress":
      return <ProgressWidget userId={userId}/>;
    case "catalog":
      return <LinkWidget title="Rewards Catalog" link="/itunes-test" />;
    case "friends":
      return <Widget title="Friends" content="You have 5 friends" />;
    case "trend":
      return <TrendGraph />;
    case "notifications":
      return <Widget title="Notifications" content="You have 3 new alerts" />;
    case "help":
      return <LinkWidget title="Help" link="/pages/driver/driverHelp" />;
    case "sponsors":
      return <SponsorsWidget />;
    case "apply":
      return <LinkWidget title="Applications" content="Want to apply to more sponsors?" link="/pages/driver/applyForm" />;
    default:
      return null;
  }
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

function SponsorsWidget() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors");

        if (!response.ok) {
          throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
        }

        const data = await response.json();

        const transformedData = data.map((sponsor) => ({
          id: sponsor.Sponsor_Org_ID,
          name: sponsor.Sponsor_Org_Name,
          description: sponsor.Sponsor_Description,
          email: sponsor.Email,
          phone: sponsor.Phone_Number,
        }));

        setSponsors(transformedData);
      } catch (err) {
        setError(err.message);
        setSponsors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  return (
    <div>
      <h3 className="font-semibold">Sponsors</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && sponsors.length === 0 && <p>No sponsors available.</p>}

      {!loading && !error && sponsors.length > 0 && (
        <ul className="list-disc pl-4">
          {sponsors.map((sponsor) => (
            <li key={sponsor.id}>
              <strong>{sponsor.name}</strong> - {sponsor.description} <br />
              <strong>Contact:</strong> {sponsor.email} | <strong>Phone:</strong> {sponsor.phone}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// INDIVIDUAL WIDGET FUNCTIONALITY
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

function ProgressWidget({ userId }) {
  const [points, setPoints] = useState(null);
  const [pointGoal, setPointGoal] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState('');


  useEffect(() => {
    // debug
    console.log('userId:', userId);
    if (userId == null|| userId === "undefined") {
      console.error("Invalid User_ID");
      setLoading(false); // stop loading if userId is invalid
      return;
    }
    console.log("Using User_ID:", userId); 

    async function fetchProgressData() {
      try {
        // fetch current points
        const pointsResponse = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points");
        const pointsData = await pointsResponse.json();
        
        if (pointsResponse.ok) {
          setPoints(pointsData.points);
        } else {
          console.error("Error fetching points:", pointsData.message);
        }

        // fetch point goal
        const goalResponse = await fetch(` https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/pointGoal?User_ID=${userId}`);
        const goalData = await goalResponse.json();
        
        if (goalResponse.ok) {
          console.log("Fetched Point Goal:", goalData.Point_Goal);
          setPointGoal(goalData.point_goal);
          setNewGoal(goalData.point_goal); 
        } else {
          console.error("Error fetching point goal:", goalData.message);
        }
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProgressData();
  }, [userId]);

  useEffect(() => {
    if (pointGoal !== null && points !== null) {
      setProgress((points / pointGoal) * 100);
    }
  }, [points, pointGoal]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewGoal(pointGoal); 
  };

  const handleSaveClick = async () => {
    console.log("Attempting to update point goal:", newGoal);

    if (!newGoal || isNaN(newGoal) || newGoal <= 0) {
      console.error("Invalid goal value:", newGoal);
      return;
    }
    try {
      const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/pointGoal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ User_ID: userId, Point_Goal: parseInt(newGoal, 10) }),
      });

      // debugging
      const result = await response.json().catch(() => null);

      console.log("Full Response:", response);
      console.log("Response Status:", response.status);
      console.log("Response Body:", result);

      if (response.ok) {
        console.log("Point goal updated successfully!");
        setPointGoal(parseInt(newGoal, 10)); 
        setIsEditing(false);
      } else {
        console.error("Error updating point goal");
      }
    } catch (error) {
      console.error("Failed to update point goal:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3 className="font-semibold">Progress to Goal</h3>
      <p>Goal: {pointGoal} points</p>

      <div className="bg-gray-300 h-4 rounded-md overflow-hidden mt-2">
        <div className="bg-blue-500 h-full" style={{ width: `${progress}%` }}></div>
      </div>
      <p>{`${progress.toFixed(1)}% Complete`}</p>

      {isEditing ? (
        <div>
          <input
            type="number"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            className="border p-1 rounded-md"
          />
          <button onClick={handleSaveClick} className="ml-2 bg-green-500 text-white px-2 py-1 rounded">Save</button>
          <button onClick={handleCancelClick} className="ml-2 bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
        </div>
      ) : (
        <button onClick={handleEditClick} className="mt-2 bg-blue-500 text-white px-2 py-1 rounded">Edit Goal</button>
      )}
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