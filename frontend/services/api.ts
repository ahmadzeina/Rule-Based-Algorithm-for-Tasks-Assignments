import axios from "axios";
import { createClient } from "@/lib/supabase/client";


const supabase = createClient();


// Types for assignment API
export interface AssignmentRequest {
  team: Array<{
    id: string;
    name?: string;
    skills: string[];
    capacity_sp: number;
    current_sp: number;
    experience: "Junior" | "Mid-level" | "Senior";
    efficiency: number;
  }>;
  tasks: Array<{
    id: string;
    priority: "High" | "Medium" | "Low";
    deadline: string;
    story_points: number;
    required_skills: string[];
    min_experience?: "Junior" | "Mid-level" | "Senior";
  }>;
}

export interface Assignment {
  task_id: string;
  assigned_to: string;
  match_score: number;
  skill_match: string;
  story_points: number;
}

export interface WorkloadSummary {
  member_id: string;
  name: string;
  current_sp: number;
  capacity_sp: number;
  efficiency: number;
  effective_capacity: number;
  workload_percentage: number;
  tasks_assigned: number;
  status: string;
}

export interface AssignmentResponse {
  assignments: Assignment[];
  workload_summary: WorkloadSummary[];
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Fixed endpoint from /assign_tasks to /data/assign
export const assignTasks = (data: AssignmentRequest): Promise<AssignmentResponse> =>
  api.post("/data/assign", data).then((res) => res.data);

// Maps any thrown error into a clear, honest message for the UI.
// - 401: explains the dev-token workflow (this app intentionally has no login screen).
// - Network error: names the two usual causes (backend down / app opened on a non-allowed origin).
// No status, score, or reasoning is ever invented here — only what the backend actually returned.
export function getApiErrorMessage(
  err: unknown,
  fallback = "Unknown error occurred"
): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data: unknown = err.response?.data;

    let detailMsg: string | undefined;
    if (data && typeof data === "object" && "detail" in data) {
      const d = (data as { detail: unknown }).detail;
      if (typeof d === "string") {
        detailMsg = d;
      } else if (Array.isArray(d)) {
        detailMsg = d
          .map((item) =>
            typeof item === "object" && item !== null && "msg" in item
              ? String((item as { msg: unknown }).msg)
              : String(item)
          )
          .join("; ");
      }
    }

    if (status === 401) {
      return `You are not signed in. Please log in and try again.`;
    }
    if (err.response) {
      return `Request failed with status ${status}${detailMsg ? `: ${detailMsg}` : ""}`;
    }
    if (err.request) {
      return "Network Error: could not reach the backend on http://127.0.0.1:8000. Make sure the backend is running, and open the app via http://localhost:3000 (or http://127.0.0.1:3000) — other origins are blocked by CORS.";
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}