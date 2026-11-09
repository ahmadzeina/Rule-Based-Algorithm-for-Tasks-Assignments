import { create } from "zustand";

export interface TeamMember {
  id: string;
  name?: string;
  skills: string[];
  capacity_sp: number;
  current_sp: number;
  experience: "Junior" | "Mid-level" | "Senior";
  efficiency: number;
}

interface TeamStore {
  team: TeamMember[];
  setTeam: (team: TeamMember[]) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  team: [
    {
      id: "TM1",
      name: "Team Member 1",
      skills: ["Python", "Django"],
      capacity_sp: 10,
      current_sp: 3,
      experience: "Senior",
      efficiency: 1.2,
    },
    {
      id: "TM2",
      name: "Team Member 2",
      skills: ["React", "JavaScript"],
      capacity_sp: 8,
      current_sp: 2,
      experience: "Mid-level",
      efficiency: 1.0,
    },
  ],
  setTeam: (team: TeamMember[]) => set({ team }),
}));