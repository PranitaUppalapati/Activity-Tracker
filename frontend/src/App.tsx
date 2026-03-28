import React, { useState, useEffect, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

interface Activity {
  [hour: string]: string;
}

interface DayData {
  [date: string]: Activity;
}

const INITIAL_COLORS = [
  "#FFDAC1", // Pastel Peach
  "#BDE4F4", // Pastel Sky Blue
  "#D4F1C5", // Pastel Green
  "#FDE2E4", // Pastel Pink
  "#FEF3C7", // Pastel Yellow
  "#A0E7E5", // Pastel Turquoise
  "#FFE5B4", // Pastel Orange
  "#F8D4E8", // Pastel Rose
  "#C2E0F9", // Light Pastel Blue
  "#D7F9DC", // Mint Green
  "#F9F7D9", // Pale Yellow
  "#E3D5F4", // Lavender
  "#FFDEE7", // Soft Pink
  "#FFE6CC", // Pastel Cream
  "#CCF0E1", // Soft Aqua
  "#FFE8E8", // Pale Blush
  "#E0CFFF", // Lavender Mist
  "#FFD9CE", // Peach Blush
  "#FDFD96", // Lemon Yellow
  "#D7BDE2", // Orchid Purple
  "#FFCCF9", // Baby Pink
  "#D8F3DC", // Light Mint
  "#FADADD", // Blush Pink
  "#FCECC9", // Light Cream
  "#BFD6D9", // Cloudy Blue
  '#A8A8A8', '#C2B9A9', '#B5A191', '#D2C6B2', '#B2BEB5', '#829AA8', '#6A9A8B', '#A3B8A2', '#7A8288', '#B8D0C4', '#C9A9A6', '#C27A6C', '#D8B4A3', '#A67E8A', '#B58B97', '#8C8A79', '#5F6D58', '#A68064', '#BC8A6F', '#C2A572', '#D9D9D9', '#E2DED0', '#C4C4C4', '#B3ADA0', '#AAA69D', '#91A8C0', '#708D8C', '#7E9E9E', '#98AFC7', '#B0C4C4', '#D4A59A', '#E3BDB6', '#CDAF9B', '#BFA094', '#E0C1A1', '#8A8571', '#918F7E', '#B39D89', '#A49F8C', '#CAB5A7', '#6C757D', '#B0AFAF', '#AEB4B0', '#8F9A9B', '#9A8F8F', '#B4A19B', '#D9C9C2', '#A8B2A0', '#92988E', '#7D8185'];

const ACTIVITY_COLORS: { [activity: string]: string } = {};

// Generate a random pastel color when INITIAL_COLORS are exhausted
const generateRandomPastelColor = () => {
  const pastelColors = [
    "#FFDAC1", "#BDE4F4", "#D4F1C5", "#FDE2E4", "#FEF3C7",
    "#A0E7E5", "#FFE5B4", "#F8D4E8", "#C2E0F9", "#D7F9DC",
    "#F9F7D9", "#E3D5F4", "#FFDEE7", "#FFE6CC", "#CCF0E1",
    "#FFE8E8", "#E0CFFF", "#FFD9CE", "#FDFD96", "#D7BDE2",
    "#FFCCF9", "#D8F3DC", "#FADADD", "#FCECC9", "#BFD6D9",
  ];

  return pastelColors[Math.floor(Math.random() * pastelColors.length)];
};


function App() {
  const [data, setData] = useState<DayData>({});
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [productiveViewTab, setProductiveViewTab] = useState<"day" | "week" | "month">("day");
  const [activityBreakdownTab, setActivityBreakdownTab] = useState<"day" | "week" | "month">(
    "day"
  );
  const [customProductiveActivities, setCustomProductiveActivities] = useState<string[]>([
    "Work",
    "Study",
    "Exercise",
    "Reading",
    "Planning",
  ]);

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
  const productiveInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("activityData");
    const savedActivities = localStorage.getItem("productiveActivities");
    if (savedData) setData(JSON.parse(savedData));
    if (savedActivities) setCustomProductiveActivities(JSON.parse(savedActivities));
  }, []);

  useEffect(() => {
    localStorage.setItem("activityData", JSON.stringify(data));
    localStorage.setItem("productiveActivities", JSON.stringify(customProductiveActivities));
  }, [data, customProductiveActivities]);

  const handleInputChange = (hour: string, activity: string) => {
    setData((prev) => {
      const updatedDayData = { ...(prev[selectedDate] || {}) };
      if (activity.trim() === "") delete updatedDayData[hour];
      else {
        if (!ACTIVITY_COLORS[activity]) {
          ACTIVITY_COLORS[activity] =
            INITIAL_COLORS.length > Object.keys(ACTIVITY_COLORS).length
              ? INITIAL_COLORS[Object.keys(ACTIVITY_COLORS).length]
              : generateRandomPastelColor();
        }
        updatedDayData[hour] = activity;
      }
      if (Object.keys(updatedDayData).length === 0) {
        const updatedData = { ...prev };
        delete updatedData[selectedDate];
        return updatedData;
      }
      return { ...prev, [selectedDate]: updatedDayData };
    });
  };

  const addProductiveActivity = (activity: string) => {
    if (!activity.trim()) return;

    const normalizedActivity = activity.trim().toLowerCase();
    if (customProductiveActivities.some((a) => a.toLowerCase() === normalizedActivity)) return;

    setCustomProductiveActivities([...customProductiveActivities, activity.trim()]);

    if (productiveInputRef.current) {
      productiveInputRef.current.value = "";
    }
  };

  const removeProductiveActivity = (activity: string) => {
    const normalizedActivity = activity.toLowerCase();
    setCustomProductiveActivities(
      customProductiveActivities.filter((a) => a.toLowerCase() !== normalizedActivity)
    );
  };

  const calculateSummary = (view: "day" | "week" | "month") => {
    const summary = { productiveHours: 0, nonProductiveHours: 0, totalHours: 0 };
    const date = new Date(selectedDate);
    const daysToInclude = view === "day" ? 1 : view === "week" ? 7 : 30;

    for (let i = 0; i < daysToInclude; i++) {
      const dayKey = date.toISOString().split("T")[0];
      const dayActivities = data[dayKey] || {};
      const totalDayHours = Object.keys(dayActivities).length;

      const productiveDayHours = Object.values(dayActivities).filter((activity) =>
        customProductiveActivities.some(
          (productive) => productive.toLowerCase() === activity.toLowerCase()
        )
      ).length;

      summary.productiveHours += productiveDayHours;
      summary.nonProductiveHours += totalDayHours - productiveDayHours;
      summary.totalHours += totalDayHours;
      date.setDate(date.getDate() - 1);
    }
    return summary;
  };

  const calculateChartData = (view: "day" | "week" | "month") => {
    const activityCounts: { [activity: string]: number } = {};
    const date = new Date(selectedDate);
    const daysToInclude = view === "day" ? 1 : view === "week" ? 7 : 30;

    for (let i = 0; i < daysToInclude; i++) {
      const dayKey = date.toISOString().split("T")[0];
      const dayActivities = data[dayKey] || {};
      Object.values(dayActivities).forEach((activity) => {
        if (!activityCounts[activity]) activityCounts[activity] = 0;
        activityCounts[activity]++;
      });
      date.setDate(date.getDate() - 1);
    }

    return Object.entries(activityCounts).map(([activity, count]) => ({
      name: activity,
      hours: count,
    }));
  };

  const getProductivityTrends = () => {
    const trends = [];
    const date = new Date(selectedDate);

    for (let i = 0; i < 7; i++) {
      const dayKey = date.toISOString().split("T")[0];
      const dayActivities = data[dayKey] || {};
      const totalDayHours = Object.keys(dayActivities).length;

      const productiveDayHours = Object.values(dayActivities).filter((activity) =>
        customProductiveActivities.some(
          (productive) => productive.toLowerCase() === activity.toLowerCase()
        )
      ).length;

      trends.push({
        date: dayKey,
        productivity: totalDayHours > 0 ? (productiveDayHours / totalDayHours) * 100 : 0,
      });

      date.setDate(date.getDate() - 1);
    }

    return trends.reverse();
  };

  return (
    <div className="app-container">
      <h1 className="title">Activity Tracker</h1>

      {/* Daily Input Grid */}
      <div className="date-selector">
        <label htmlFor="date">Select Date:</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      <div className="calendar-grid">
        {hours.map((hour) => (
          <div
            key={hour}
            className={`hour-cell ${data[selectedDate]?.[hour] ? "filled" : ""}`}
            style={{
              backgroundColor: data[selectedDate]?.[hour]
                ? ACTIVITY_COLORS[data[selectedDate][hour]]
                : undefined,
            }}
          >
            <label>{hour}</label>
            <input
              type="text"
              placeholder="Activity"
              value={data[selectedDate]?.[hour] || ""}
              onChange={(e) => handleInputChange(hour, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Custom Productivity List */}
      <div className="productive-activities">
        <h4>Customize Productive Activities</h4>
        <ul>
          {customProductiveActivities.map((activity) => (
            <li key={activity}>
              {activity}{" "}
              <button onClick={() => removeProductiveActivity(activity)}>Remove</button>
            </li>
          ))}
        </ul>
        <input
          ref={productiveInputRef}
          type="text"
          placeholder="Add productive activity"
          onKeyDown={(e) => {
            if (e.key === "Enter") addProductiveActivity(e.currentTarget.value);
          }}
        />
      </div>

      {/* Productivity Overview */}
      <div className="tabs">
        <button
          className={productiveViewTab === "day" ? "active" : ""}
          onClick={() => setProductiveViewTab("day")}
        >
          Daily
        </button>
        <button
          className={productiveViewTab === "week" ? "active" : ""}
          onClick={() => setProductiveViewTab("week")}
        >
          Weekly
        </button>
        <button
          className={productiveViewTab === "month" ? "active" : ""}
          onClick={() => setProductiveViewTab("month")}
        >
          Monthly
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={[
              { name: "Productive", hours: calculateSummary(productiveViewTab).productiveHours },
              {
                name: "Non-Productive",
                hours: calculateSummary(productiveViewTab).nonProductiveHours,
              },
            ]}
            dataKey="hours"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            <Cell fill="#4CAF50" />
            <Cell fill="#F44336" />
          </Pie>
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="top" align="center" />
        </PieChart>
      </ResponsiveContainer>

      {/* Activity Breakdown */}
      <div className="tabs">
        <button
          className={activityBreakdownTab === "day" ? "active" : ""}
          onClick={() => setActivityBreakdownTab("day")}
        >
          Daily
        </button>
        <button
          className={activityBreakdownTab === "week" ? "active" : ""}
          onClick={() => setActivityBreakdownTab("week")}
        >
          Weekly
        </button>
        <button
          className={activityBreakdownTab === "month" ? "active" : ""}
          onClick={() => setActivityBreakdownTab("month")}
        >
          Monthly
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={calculateChartData(activityBreakdownTab)}
            dataKey="hours"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {calculateChartData(activityBreakdownTab).map((entry) => (
              <Cell key={entry.name} fill={ACTIVITY_COLORS[entry.name] || generateRandomPastelColor()} />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="top" align="center" />
        </PieChart>
      </ResponsiveContainer>

      {/* Weekly Productivity Trends */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={getProductivityTrends()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="productivity" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;

