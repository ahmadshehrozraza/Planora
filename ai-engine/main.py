from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from ml_models.deadline_model import predict_deadline
from ml_models.budget_model import predict_budget_risk
from ml_models.nlp_estimator import suggest_effort_points

app = FastAPI(title="Planora AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskData(BaseModel):
    id: str
    progress: int
    effortPoints: int
    budget: float
    priority: str

class RiskData(BaseModel):
    id: str
    probability: str
    impact: str
    status: str

class ProjectAnalyticsRequest(BaseModel):
    startDate: str
    dueDate: str
    totalBudget: float
    tasks: Optional[List[TaskData]] = []
    risks: Optional[List[RiskData]] = []
    baselineEffort: Optional[float] = 0.0
    baselineCost: Optional[float] = 0.0

class TaskEstimationRequest(BaseModel):
    description: str
    taskType: str

@app.get("/")
def read_root():
    return {"status": "AI Engine is running"}

@app.post("/api/predict-analytics")
def analyze_project(data: ProjectAnalyticsRequest):
    try:
        tasks_data = data.tasks if data.tasks is not None else []
        risks_data = data.risks if data.risks is not None else []
        b_effort = data.baselineEffort if data.baselineEffort is not None else 0.0
        b_cost = data.baselineCost if data.baselineCost is not None else 0.0

        deadline_prediction = predict_deadline(
            data.startDate, 
            data.dueDate, 
            tasks_data, 
            risks_data, 
            b_effort
        )
        
        budget_risk = predict_budget_risk(
            data.totalBudget, 
            tasks_data, 
            risks_data,
            b_cost
        )

        return {
            "success": True,
            "deadline": deadline_prediction,
            "budgetRisk": budget_risk
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/suggest-effort")
def estimate_task(data: TaskEstimationRequest):
    try:
        suggestion = suggest_effort_points(data.description, data.taskType)
        return {"success": True, "suggestion": suggestion}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))