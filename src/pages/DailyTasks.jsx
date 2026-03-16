import { useState } from "react";
import TaskList from "../components/daily-tasks/TaskList";
import MedicationTracker from "../components/daily-tasks/MedicationTracker";
import RoutinePlanner from "../components/daily-tasks/RoutinePlanner";
import "./dailytasks.css"; 

const DailyTasks = () => {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <div className="daily-tasks-page">
      <center>
        <h1>Daily Tasks Support</h1>
      </center>
      <br></br>

      <div className="tabs">
        <button
          className={activeTab === "tasks" ? "active" : ""}
          onClick={() => setActiveTab("tasks")}
        >
          Task List
        </button>
        <button
          className={activeTab === "medication" ? "active" : ""}
          onClick={() => setActiveTab("medication")}
        >
          Medication
        </button>
        <button
          className={activeTab === "routine" ? "active" : ""}
          onClick={() => setActiveTab("routine")}
        >
          Routine
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "tasks" && <TaskList />}
        {activeTab === "medication" && <MedicationTracker />}
        {activeTab === "routine" && <RoutinePlanner />}
      </div>
    </div>
  );
};

export default DailyTasks;
