import re

def suggest_effort_points(description: str, task_type: str) -> int:
    try:
        if not description:
            return 1

        desc_lower = str(description).lower()
        word_count = len(desc_lower.split())
        
        effort = 1
        
        if word_count > 50:
            effort += 2
        elif word_count > 20:
            effort += 1
            
        complex_keywords = ['api', 'database', 'auth', 'payment', 'integration', 'architecture', 'refactor']
        for word in complex_keywords:
            if word in desc_lower:
                effort += 1
                
        safe_task_type = str(task_type).upper() if task_type else ''
        if safe_task_type == 'SPIKE':
            effort += 2
        elif safe_task_type == 'BUG':
            if 'critical' in desc_lower or 'urgent' in desc_lower:
                effort += 3
                
        return min(effort, 13)
    except Exception:
        return 1