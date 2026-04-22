from datetime import datetime, timedelta
import numpy as np
from sklearn.linear_model import LinearRegression

def predict_deadline(start_date_str: str, due_date_str: str, tasks: list) -> dict:
    start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00")).replace(tzinfo=None)
    due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00")).replace(tzinfo=None)
    
    total_points = sum([t.effortPoints for t in tasks])
    if total_points == 0:
        return {"projectedDate": due_date_str, "isDelayed": False, "delayDays": 0, "confidenceScore": 100}

    completed_points = sum([t.effortPoints for t in tasks if t.progress == 100])
    
    if completed_points == 0:
        return {"projectedDate": due_date_str, "isDelayed": False, "delayDays": 0, "confidenceScore": 50}

    X = np.array([[0], [completed_points]])
    days_elapsed = (datetime.utcnow() - start_date).days
    y = np.array([0, days_elapsed])
    
    model = LinearRegression().fit(X, y)

    predicted_total_days = model.predict([[total_points]])[0]
    projected_date = start_date + timedelta(days=int(predicted_total_days))
    
    delay_days = (projected_date - due_date).days
    
    return {
        "projectedDate": projected_date.isoformat(),
        "isDelayed": delay_days > 0,
        "delayDays": max(0, delay_days),
        "confidenceScore": min(95, int(80 + (completed_points / total_points * 15)))
    }