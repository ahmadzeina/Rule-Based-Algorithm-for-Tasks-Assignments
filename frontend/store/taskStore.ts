import { create } from "zustand";
import { assignTasks, AssignmentResponse, AssignmentRequest, getApiErrorMessage } from "@/services/api";
import { TeamMember } from "./teamStore";

export interface Task {
  id: string;
  priority: "High" | "Medium" | "Low";
  deadline: string; // YYYY-MM-DD format
  story_points: number;
  required_skills: string[];
  min_experience?: "Junior" | "Mid-level" | "Senior";
}

interface AssignmentState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  removeTask: (id: string) => void;
  clearTasks: () => void;

  // Assignment execution
  isLoading: boolean;
  error: string | null;
  lastAssignmentResult: AssignmentResponse | null;
  executeAssignment: (team: TeamMember[], tasks: Task[]) => Promise<void>;
  clearAssignmentResult: () => void;
}

export const useTaskStore = create<AssignmentState>((set) => ({
  tasks: [],
  setTasks: (tasks: Task[]) => set({ tasks }),
  addTask: (task: Task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  updateTask: (id: string, updates: Partial<Task>) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id: string) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
  clearTasks: () => set({ tasks: [] }),

  isLoading: false,
  error: null,
  lastAssignmentResult: null,

  executeAssignment: async (team: TeamMember[], tasks: Task[]) => {
    set({ isLoading: true, error: null });

    try {
      if (team.length === 0) {
        throw new Error("No team members available");
      }
      if (tasks.length === 0) {
        throw new Error("No tasks to assign");
      }

      const request: AssignmentRequest = {
        team: team.map((m) => ({
          id: m.id,
          name: m.name,
          skills: m.skills,
          capacity_sp: m.capacity_sp,
          current_sp: m.current_sp,
          experience: m.experience,
          efficiency: m.efficiency,
        })),
        tasks: tasks.map((t) => ({
          id: t.id,
          priority: t.priority,
          deadline: t.deadline,
          story_points: t.story_points,
          required_skills: t.required_skills,
          min_experience: t.min_experience,
        })),
      };

      const response = await assignTasks(request);
      set({ lastAssignmentResult: response, isLoading: false });
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Assignment failed");
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  clearAssignmentResult: () =>
    set({ lastAssignmentResult: null, error: null, isLoading: false }),
}));
