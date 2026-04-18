import { useMemo } from "react";
import { differenceInDays, addDays, isAfter } from "date-fns";

export const useProjectEstimations = (analytics: any) => {
  return useMemo(() => {
    if (!analytics) return null;

    const { meta, kpi } = analytics;
    const today = new Date();
    
    const daysElapsed = differenceInDays(today, new Date(meta.startDate));
    const velocity = daysElapsed > 0 ? (kpi.completedTasks / daysElapsed) : 0; 
    
    const tasksRemaining = kpi.totalTasks - kpi.completedTasks;
    const daysNeededToComplete = velocity > 0 ? Math.ceil(tasksRemaining / velocity) : 0;
    const projectedDate = addDays(today, daysNeededToComplete);
    
    const isDelayed = isAfter(projectedDate, new Date(meta.dueDate));
    const delayDays = differenceInDays(projectedDate, new Date(meta.dueDate));
    
    const avgCostPerTask = kpi.completedTasks > 0 ? (kpi.budgetUsed / kpi.completedTasks) : 0;
    const projectedTotalCost = kpi.budgetUsed + (tasksRemaining * avgCostPerTask);
    const projectedBudgetVariance = meta.budget - projectedTotalCost;

    return {
      velocity,
      tasksRemaining,
      projectedDate,
      isDelayed,
      delayDays: delayDays > 0 ? delayDays : 0,
      projectedTotalCost,
      projectedBudgetVariance
    };
  }, [analytics]);
};