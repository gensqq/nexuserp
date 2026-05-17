"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Timer,
  FolderKanban,
  Trash2,
  Download,
} from "lucide-react";
import { projectsAPI } from "@/utils/api";
import { useToast } from "@/components/ui/toast";
import { exportToCSV } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  LOW: "secondary",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "destructive",
};

const statusColors: Record<string, string> = {
  PLANNING: "secondary",
  ACTIVE: "info",
  ON_HOLD: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
  TODO: "secondary",
  IN_PROGRESS: "info",
  IN_REVIEW: "warning",
  DONE: "success",
};

export default function ProjectsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"board" | "list" | "time">("board");
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddTime, setShowAddTime] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [newTask, setNewTask] = useState({ title: "", projectId: "", priority: "MEDIUM", dueDate: "" });
  const [newTimeEntry, setNewTimeEntry] = useState({ taskId: "", hours: "", description: "", date: new Date().toISOString().split("T")[0] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsData, tasksData, timeData] = await Promise.all([
        projectsAPI.getProjects(),
        projectsAPI.getTasks(),
        projectsAPI.getTimeEntries(),
      ]);
      setProjects(projectsData.projects || []);
      setTasks(tasksData.tasks || []);
      setTimeEntries(timeData.timeEntries || []);
      setTotalHours(timeData.totalHours || 0);
    } catch (error) {
      console.error("Projects fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.name) {
      addToast({ title: "Validation Error", message: "Project name is required", type: "warning" });
      return;
    }
    try {
      await projectsAPI.createProject(newProject);
      addToast({ title: "Project Created", message: newProject.name, type: "success" });
      setNewProject({ name: "", description: "" });
      setShowAddProject(false);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.projectId) {
      addToast({ title: "Validation Error", message: "Title and project are required", type: "warning" });
      return;
    }
    try {
      await projectsAPI.createTask(newTask);
      addToast({ title: "Task Created", message: newTask.title, type: "success" });
      setNewTask({ title: "", projectId: "", priority: "MEDIUM", dueDate: "" });
      setShowAddTask(false);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await projectsAPI.updateTask({ id: taskId, status: newStatus });
      addToast({ title: "Task Updated", message: `Status changed to ${newStatus}`, type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleAddTimeEntry = async () => {
    if (!newTimeEntry.taskId || !newTimeEntry.hours) {
      addToast({ title: "Validation Error", message: "Task and hours are required", type: "warning" });
      return;
    }
    try {
      await projectsAPI.createTimeEntry({
        taskId: newTimeEntry.taskId,
        hours: parseFloat(newTimeEntry.hours),
        description: newTimeEntry.description || undefined,
        date: newTimeEntry.date,
      });
      addToast({ title: "Time Logged", message: `${newTimeEntry.hours}h recorded`, type: "success" });
      setNewTimeEntry({ taskId: "", hours: "", description: "", date: new Date().toISOString().split("T")[0] });
      setShowAddTime(false);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleDeleteTimeEntry = async (id: string) => {
    try {
      await projectsAPI.deleteTimeEntry(id);
      addToast({ title: "Deleted", message: "Time entry removed", type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleExportTime = () => {
    exportToCSV(
      ["Date", "Task", "Project", "Hours", "Description"],
      timeEntries.map((e) => [new Date(e.date).toLocaleDateString(), e.task?.title || "", e.task?.project?.name || "", e.hours, e.description || ""]),
      "time-entries"
    );
    addToast({ title: "Exported", message: "Time entries exported as CSV", type: "success" });
  };

  // Group time entries by task for summary
  const hoursByProject = timeEntries.reduce((acc: Record<string, number>, e: any) => {
    const name = e.task?.project?.name || "Unknown";
    acc[name] = (acc[name] || 0) + e.hours;
    return acc;
  }, {});

  const kanbanColumns = [
    { id: "TODO", title: "To Do", tasks: tasks.filter((t) => t.status === "TODO") },
    { id: "IN_PROGRESS", title: "In Progress", tasks: tasks.filter((t) => t.status === "IN_PROGRESS") },
    { id: "IN_REVIEW", title: "In Review", tasks: tasks.filter((t) => t.status === "IN_REVIEW") },
    { id: "DONE", title: "Done", tasks: tasks.filter((t) => t.status === "DONE") },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage projects, tasks, and team collaboration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={activeTab === "board" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("board")}>Board</Button>
          <Button variant={activeTab === "list" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("list")}>List</Button>
          <Button variant={activeTab === "time" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("time")}>
            <Timer className="w-4 h-4 mr-1" /> Time
          </Button>
          <Button size="sm" onClick={() => setShowAddTask(true)}><Plus className="w-4 h-4 mr-1" /> New Task</Button>
          <Button size="sm" variant="outline" onClick={() => setShowAddProject(true)}><Plus className="w-4 h-4 mr-1" /> New Project</Button>
        </div>
      </div>

      {/* Add Project Form */}
      {showAddProject && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add New Project</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name *</label>
                <Input placeholder="Project name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Project description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddProject}>Create Project</Button>
              <Button variant="outline" onClick={() => setShowAddProject(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Task Form */}
      {showAddTask && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add New Task</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title *</label>
                <Input placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project *</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={newTask.projectId} onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}>
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddTask}>Create Task</Button>
              <Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Time Entry Form */}
      {showAddTime && (
        <Card>
          <CardHeader><CardTitle className="text-base">Log Time</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task *</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={newTimeEntry.taskId} onChange={(e) => setNewTimeEntry({ ...newTimeEntry, taskId: e.target.value })}>
                  <option value="">Select task</option>
                  {tasks.map((t) => <option key={t.id} value={t.id}>{t.title} ({t.project?.name || "No project"})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hours *</label>
                <Input type="number" placeholder="2.5" min="0.5" step="0.5" value={newTimeEntry.hours} onChange={(e) => setNewTimeEntry({ ...newTimeEntry, hours: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={newTimeEntry.date} onChange={(e) => setNewTimeEntry({ ...newTimeEntry, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="What did you work on?" value={newTimeEntry.description} onChange={(e) => setNewTimeEntry({ ...newTimeEntry, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddTimeEntry}>Log Time</Button>
              <Button variant="outline" onClick={() => setShowAddTime(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent></Card>
          ))
        ) : projects.length === 0 ? (
          <Card className="col-span-4"><CardContent className="p-8 text-center">
            <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No projects yet. Create your first project!</p>
          </CardContent></Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{project.name}</h3>
                  <Badge variant={statusColors[project.status] as any}>{project.status}</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{project.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${project.progress || 0}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project.taskCount || 0} tasks</span>
                    <span>{project.completedTasks || 0} done</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Kanban Board */}
      {activeTab === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((column) => (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">{column.tasks.length}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                {column.tasks.map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium">{task.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={priorityColors[task.priority] as any} className="text-xs">{task.priority}</Badge>
                        {task.estimatedHours && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Timer className="w-3 h-3" /> {task.estimatedHours}h
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        {task.assignee && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5"><AvatarFallback className="bg-primary/10 text-primary text-[10px]">{task.assignee.name?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback></Avatar>
                            <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                          </div>
                        )}
                        {task.dueDate && <span className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                      <div className="flex gap-1 pt-1">
                        {["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map((s) => (
                          <button
                            key={s}
                            className={`flex-1 text-[10px] py-1 rounded ${task.status === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"}`}
                            onClick={() => handleUpdateTaskStatus(task.id, s)}
                          >
                            {s === "TODO" ? "To Do" : s === "IN_PROGRESS" ? "Progress" : s === "IN_REVIEW" ? "Review" : "Done"}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "list" && (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Task</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Project</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Assignee</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : tasks.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No tasks found</td></tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                      <td className="p-4 text-sm font-medium">{task.title}</td>
                      <td className="p-4 text-sm">{task.project?.name || "-"}</td>
                      <td className="p-4"><Badge variant={statusColors[task.status] as any}>{task.status}</Badge></td>
                      <td className="p-4"><Badge variant={priorityColors[task.priority] as any}>{task.priority}</Badge></td>
                      <td className="p-4 text-sm">{task.assignee?.name || "-"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {activeTab === "time" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-bold text-foreground">{totalHours.toFixed(1)}h</span>
              </div>
              {Object.entries(hoursByProject).length > 0 && (
                <div className="flex gap-2">
                  {Object.entries(hoursByProject).map(([name, hours]) => (
                    <Badge key={name} variant="secondary" className="text-xs">{name}: {(hours as number).toFixed(1)}h</Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportTime}>
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
              <Button size="sm" onClick={() => setShowAddTime(true)}><Plus className="w-4 h-4 mr-1" /> Log Time</Button>
            </div>
          </div>

          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Task</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Project</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Hours</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : timeEntries.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No time entries yet. Start logging your work!</td></tr>
                  ) : (
                    timeEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                        <td className="p-4 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="p-4 text-sm font-medium">{entry.task?.title || "-"}</td>
                        <td className="p-4 text-sm text-muted-foreground">{entry.task?.project?.name || "-"}</td>
                        <td className="p-4 text-sm font-medium text-right">{entry.hours}h</td>
                        <td className="p-4 text-sm text-muted-foreground">{entry.description || "-"}</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteTimeEntry(entry.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </div>
      )}
    </div>
  );
}
