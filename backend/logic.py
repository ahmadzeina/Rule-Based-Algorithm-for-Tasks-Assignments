from typing import List, Dict, Any
from difflib import SequenceMatcher


# ----------------------------
# Core TaskAssigner Class
# ----------------------------
class TaskAssigner:
    def __init__(self, team_members: List[Dict[str, Any]]):
        self.team = {m['id']: m for m in team_members}
        self.experience_levels = {'Junior': 1, 'Mid-level': 2, 'Senior': 3}
        # Track assignments per member for fairness
        self.task_count = {m['id']: 0 for m in team_members}
    
    def _skill_similarity(self, required_skills, member_skills):
        total_score = 0
        for req in required_skills:
            best_match_score = max(
                (SequenceMatcher(None, req.lower(), ms.lower()).ratio() for ms in member_skills),
                default=0
            )
            total_score += best_match_score
        return total_score / len(required_skills) if required_skills else 0
    
    def _get_threshold(self, priority):
        """Dynamic threshold depending on task priority."""
        if priority == "High":
            return 0.3
        elif priority == "Medium":
            return 0.4
        return 0.5  # Low priority
    
    def assign_tasks(self, tasks: List[Dict[str, Any]]):
        assignments = []
        priority_order = {'High': 3, 'Medium': 2, 'Low': 1}
        
        sorted_tasks = sorted(tasks, key=lambda x: (-priority_order[x['priority']], x['deadline']))
        
        for task in sorted_tasks:
            best_match = None
            best_score = -1
            best_skill_match = 0
            tie_candidates = []
            
            for member_id, member in self.team.items():
                efficiency = member.get('efficiency', 1.0)
                effective_capacity = member.get('capacity_sp', 1) * efficiency
                workload_percentage = (member.get('current_sp', 0) / effective_capacity) * 100
                
                if workload_percentage + (task['story_points'] / effective_capacity * 100) > 100:
                    continue
                
                required_skills = set(task['required_skills'])
                member_skills = set(member['skills'])
                skill_match = self._skill_similarity(required_skills, member_skills)
                
                min_threshold = self._get_threshold(task['priority'])
                if skill_match < min_threshold:
                    continue
                
                # Check experience requirement: skip if member experience is less than required
                task_exp = self.experience_levels.get(task.get('min_experience', 'Junior'), 1)
                member_exp = self.experience_levels[member['experience']]
                if member_exp < task_exp:
                    continue
                
                # Calculate score with efficiency included
                availability = (100 - workload_percentage) / 100
                exp_gap = member_exp - task_exp  # Always non-negative due to check above
                
                score = (
                    0.5 * skill_match +    # Reduced from 0.6 to make room for efficiency
                    0.3 * availability +   # Kept availability important
                    0.1 * efficiency +     # Added efficiency factor
                    0.1 * exp_gap          # Experience gap
                )
                
                if score > best_score:
                    best_score = score
                    best_match = member_id
                    best_skill_match = skill_match
                    tie_candidates = [(member_id, workload_percentage)]
                elif score == best_score:
                    tie_candidates.append((member_id, workload_percentage))
            
            # Resolve ties by fairness (task count and workload)
            if len(tie_candidates) > 1:
                tie_candidates.sort(key=lambda x: (self.task_count[x[0]], x[1]))
                best_match = tie_candidates[0][0]
            
            if best_match:
                assignments.append({
                    'task_id': task['id'],
                    'assigned_to': best_match,
                    'match_score': round(best_score, 2),
                    'skill_match': f"{int(best_skill_match * 100)}%",
                    'story_points': task['story_points']
                })
                self.team[best_match]['current_sp'] = self.team[best_match].get('current_sp', 0) + task['story_points']
                self.task_count[best_match] += 1
            else:
                assignments.append({
                    'task_id': task['id'],
                    'assigned_to': 'UNASSIGNED',
                    'match_score': 0,
                    'skill_match': 'No suitable match',
                    'story_points': task['story_points']
                })
        
        # Calculate workload summary for API response
        workload_summary = []
        for member_id, member in self.team.items():
            efficiency = member.get('efficiency', 1.0)
            effective_capacity = member.get('capacity_sp', 1) * efficiency
            current_sp = member.get('current_sp', 0)
            workload_pct = (current_sp / effective_capacity) * 100
            
            workload_summary.append({
                'member_id': member_id,
                'name': member.get('name', f'Member {member_id}'),
                'current_sp': current_sp,
                'capacity_sp': member.get('capacity_sp', 0),
                'efficiency': efficiency,
                'effective_capacity': effective_capacity,
                'workload_percentage': round(workload_pct, 1),
                'tasks_assigned': self.task_count[member_id],
                'status': 'Overloaded' if workload_pct > 100 else 'OK'
            })
        
        return assignments, workload_summary


# ----------------------------
# API-Compatible Function
# ----------------------------
def assign_tasks(team: List[Dict[str, Any]], tasks: List[Dict[str, Any]]):
    """
    API endpoint wrapper for your TaskAssigner.
    Returns: (assignments, workload_summary)
    Compatible with frontend and /data/assign endpoint.
    """
    assigner = TaskAssigner(team)
    assignments, workload_summary = assigner.assign_tasks(tasks)
    return assignments, workload_summary