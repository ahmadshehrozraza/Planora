def suggest_effort_points(description: str, task_type: str) -> dict:
    desc_lower = description.lower()

    points = 2 
    
    if "api" in desc_lower or "database" in desc_lower or "backend" in desc_lower:
        points += 3
    if "auth" in desc_lower or "security" in desc_lower:
        points += 2
    if "ui" in desc_lower or "css" in desc_lower or "frontend" in desc_lower:
        points += 1
    if "urgent" in desc_lower or "complex" in desc_lower:
        points += 2
        
    if task_type == "FEATURE":
        points += 2
        
    points = min(10, max(1, points)) 
    
    return {
        "points": points,
        "reason": f"Based on keyword density for {task_type} complexity."
    }