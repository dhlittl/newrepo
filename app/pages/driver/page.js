// Driver Dashboard

// IMPORTS
'use client';
import  React , { useState, useEffect } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation'
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';

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
// setting up initial widgets that the driver user has access to
const initialWidgets = [
  { id: "points", name: "Current Points", visible: true},
  { id: "conversion", name: "Point-to-Dollar Conversion", visible: true},
  { id: "catalog", name: "Catalog", visible: true},
  { id: "help", name: "Help", visible: true},
  { id: "sponsors", name: "Sponsors", visible: true},
  { id: "apply", name: "Applications", visible: true},
  { id: "sponsorInfo", name: "Sponsor Information", visible: true},
];

// OVERALL DRIVER DASHBOARD AND FUNCTIONS
export default function DriverDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const { userId, isAssumed } = useEffectiveDriverId();
  const [widgets, setWidgets] = useState(initialWidgets);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkGroup() {
      try {
        const session = await fetchAuthSession();
        console.log("Full Auth Session:", session);
        const groups = session.tokens?.idToken?.payload["cognito:groups"] || [];
        console.log("User groups:", groups);
        if (groups.includes("driver") || groups.includes("sponsor") || groups.includes("admin")) {
          setAuthorized(true);
        } else {
          console.warn("Not in driver group");
          router.replace("/unauthorized");
        }
      } catch (err) {
        console.error("Auth error:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    checkGroup();
  }, [router]);

  useEffect(() => {
    if (!userId) {
      console.warn('Invalid User_ID');
      return;
    }
  
    console.log('Using User_ID:', userId);
  
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
      {loading ? (
        <div className="text-center p-4 text-lg font-medium">Checking access...</div>
      ) : (
        <>
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

            {isAssumed && (
              <button
                className="mb-4 text-sm text-gray-700 underline"
                onClick={() => {
                  sessionStorage.removeItem("assumedDriverId");
                  sessionStorage.removeItem("assumedDriverName");
                  router.push("/pages/sponsor/drivers");
                }}
              >
                ← Return to Sponsor View
              </button>
            )}
            {/* Draggable Widgets */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDrag}>
              <SortableContext
                items={widgets.filter((w) => w.visible).map((w) => w.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-wrap gap-4 justify-start">
                  {widgets
                    .filter((w) => w.visible)
                    .map((widget) => (
                      <SortableWidget key={widget.id} widget={widget} userId={userId} />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </>
      )}
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
      return <PointsWidget userId={userId} />;
    case "conversion":
      return <ConversionWidget title="Point-to-Dollar" />;
    case "catalog":
      return <LinkWidget title="Rewards Catalog" link="/pages/driver/sponsors" />;
    case "help":
      return <LinkWidget title="Help" link="/pages/driver/driverHelp" />;
    case "sponsors":
      return <SponsorsWidget />;
    case "apply":
      return <LinkWidget title="Applications" content="Want to apply to more sponsors?" link="/pages/driver/applyForm" />;
    case "sponsorInfo":
      return <LinkWidget title="Sponsor Information" content="Click here to view information about available sponsors!" link="/pages/driver/sponsorInfo"/>;
    default:
      return null;
  }
}

function PointsWidget({ userId }) {
  const [pointsData, setPointsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (!userId) {
      console.debug("No userId available yet in PointsWidget, waiting...");
      return;
    }

    async function fetchPoints() {
      try {
        const response = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points?userId=${userId}`
        );
        const data = await response.json();

        console.log("Points response:", data);

        if (response.ok && Array.isArray(data)) {
          setPointsData(data);
          
          // Calculate total points across all sponsors
          const total = data.reduce((sum, sponsorPoints) => {
            return sum + (sponsorPoints.Point_Balance || 0);
          }, 0);
          
          setTotalPoints(total);
        } else {
          console.error("Error fetching points:", data?.message || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to fetch points:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPoints();
  }, [userId]);

  return (
    <div className="p-4 rounded-xl shadow-md bg-white">
      <h3 className="font-semibold text-lg mb-2">Sponsor Points</h3>
      
      {/* Total Points Summary */}
      <div className="bg-blue-100 p-3 rounded-lg mb-4">
        <span className="font-semibold">Total Points: </span>
        <span className="text-lg font-bold text-blue-700">{totalPoints.toLocaleString()} points</span>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : pointsData.length > 0 ? (
        <div className="mt-3">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Points by Sponsor:</h4>
          <ul className="space-y-2">
            {pointsData.map((entry) => (
              <li 
                key={entry.Sponsor_Org_ID}
                className="p-2 bg-gray-50 rounded flex justify-between items-center"
              >
                <span className="font-medium">{entry.Sponsor_Org_Name}</span>
                <span className="text-blue-600 font-bold">{entry.Point_Balance.toLocaleString()} pts</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No points available</p>
      )}
      
      <Link href={"/pages/driver/pointInfo"} className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        See Point Details
      </Link>
    </div>
  );
}

function ConversionWidget({ title }) {
  const { userId } = useEffectiveDriverId();
  const [pointsData, setPointsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.debug("No userId available yet in ConversionWidget, waiting...");
      return;
    }

    async function fetchPoints() {
      try {
        const response = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points?userId=${userId}`
        );
        const data = await response.json();

        console.log("Conversion rates response:", data);

        if (response.ok && Array.isArray(data)) {
          setPointsData(data);
        } else {
          throw new Error(data?.message || "Unknown error");
        }
      } catch (error) {
        console.error("Failed to fetch conversion rates:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPoints();
  }, [userId]);

  return (
    <div className="p-4 rounded-xl shadow-md bg-white">
      <h3 className="font-semibold text-lg mb-2">Conversion Rates:</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load data: {error}</p>
      ) : pointsData.length > 0 ? (
        <div className="mt-3">
          <ul className="space-y-2">
            {pointsData.map((entry) => (
              <li 
                key={entry.Sponsor_Org_ID}
                className="p-2 bg-gray-50 rounded flex justify-between items-center"
              >
                <span className="font-medium">{entry.Sponsor_Org_Name}</span>
                <span className="text-blue-600 font-bold">{entry.ConversionRate_DtoP} points per $</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No Conversion Rates available</p>
      )}
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