import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export const exportProjectToExcel = async (analytics: any, projectName: string) => {
  if (!analytics) return;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Planora AI';
  workbook.created = new Date();

  const currency = analytics.meta?.currency || "PKR";


  const wsSummary = workbook.addWorksheet('1. Exec Summary');
  wsSummary.columns = [
    { header: 'Metric', key: 'metric', width: 35 },
    { header: 'Value', key: 'value', width: 45 }
  ];
  
  wsSummary.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  wsSummary.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  
  wsSummary.addRows([
    { metric: "Project Name", value: analytics.meta?.name || "N/A" },
    { metric: "Status", value: analytics.meta?.projectStatus?.replace(/_/g, " ") || "N/A" },
    { metric: "Start Date", value: analytics.meta?.startDate ? format(new Date(analytics.meta.startDate), "yyyy-MM-dd") : "N/A" },
    { metric: "Due Date", value: analytics.meta?.dueDate ? format(new Date(analytics.meta.dueDate), "yyyy-MM-dd") : "N/A" },
    { metric: "Overall Progress (%)", value: `${analytics.meta?.progress || 0}%` },
    { metric: "Allocated Budget", value: `${currency} ${(analytics.meta?.budget || 0).toLocaleString()}` },
    { metric: "Budget Consumed", value: `${currency} ${(analytics.kpi?.budgetUsed || 0).toLocaleString()}` },
    { metric: "COCOMO Calculated Cost", value: `${currency} ${(analytics.meta?.calculatedCost || 0).toLocaleString()}` },
    { metric: "COCOMO Calculated Effort", value: `${analytics.meta?.calculatedEffort || 0} Person-Months` },
    { metric: "Total Tasks Logged", value: analytics.kpi?.totalTasks || 0 },
    { metric: "Total Risks Logged", value: analytics.risks?.length || 0 }
  ]);

  wsSummary.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = { bottom: { style: 'thin', color: { argb: 'E2E8F0' } } };
    });
  });

  if (analytics.members && analytics.members.length > 0) {
    const wsMembers = workbook.addWorksheet('2. Team Performance');
    wsMembers.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Role', key: 'role', width: 20 },
      { header: 'Total Tasks Assigned', key: 'totalTasks', width: 25 },
      { header: 'Tasks Completed', key: 'completed', width: 20 },
      { header: 'Completion Rate', key: 'rate', width: 20 },
      { header: 'Effort Points Delivered', key: 'points', width: 25 },
      { header: 'Budget Managed', key: 'budgetM', width: 20 },
      { header: 'Budget Consumed', key: 'budgetC', width: 20 }
    ];

    // Header Formatting (Blue) + Frozen Top Row + Filters
    wsMembers.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsMembers.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
    wsMembers.autoFilter = 'A1:H1';
    wsMembers.views = [{ state: 'frozen', ySplit: 1 }];

    analytics.members.forEach((m: any) => {
      wsMembers.addRow({
        name: m.name,
        role: m.role || "Member",
        totalTasks: m.totalTasks,
        completed: m.tasksCompleted,
        rate: m.totalTasks > 0 ? `${Math.round((m.tasksCompleted / m.totalTasks) * 100)}%` : "0%",
        points: m.pointsEarned,
        budgetM: `${currency} ${m.budgetManaged.toLocaleString()}`,
        budgetC: `${currency} ${m.budgetConsumed.toLocaleString()}`
      });
    });
  }

  if (analytics.risks && analytics.risks.length > 0) {
    const wsRisks = workbook.addWorksheet('3. Risk Register');
    wsRisks.columns = [
      { header: 'Risk ID', key: 'id', width: 30 },
      { header: 'Risk Title', key: 'title', width: 60 },
      { header: 'Impact', key: 'impact', width: 20 },
      { header: 'Probability', key: 'prob', width: 20 },
      { header: 'Current Status', key: 'status', width: 20 }
    ];

    wsRisks.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsRisks.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E11D48' } }; 
    wsRisks.autoFilter = 'A1:E1';
    wsRisks.views = [{ state: 'frozen', ySplit: 1 }];

    analytics.risks.forEach((r: any) => {
      wsRisks.addRow({
        id: r.id,
        title: r.title || "Untitled Risk",
        impact: r.impact,
        prob: r.probability,
        status: r.status
      });
    });
  }

  if (analytics.tasks && analytics.tasks.length > 0) {
    const wsTasks = workbook.addWorksheet('4. Task Master Ledger');
    wsTasks.columns = [
      { header: 'Task Name', key: 'name', width: 50 },
      { header: 'Status (Column)', key: 'status', width: 20 },
      { header: 'Progress (%)', key: 'progress', width: 15 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Effort Points', key: 'points', width: 15 },
      { header: 'Allocated Budget', key: 'budget', width: 20 },
      { header: 'Assignee', key: 'assignee', width: 25 },
      { header: 'Created Date', key: 'created', width: 20 },
      { header: 'Last Updated', key: 'updated', width: 20 },
      { header: 'Task ID', key: 'id', width: 30 }
    ];

    wsTasks.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    wsTasks.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } }; 
    wsTasks.autoFilter = 'A1:J1';
    wsTasks.views = [{ state: 'frozen', ySplit: 1 }];

    analytics.tasks.forEach((task: any) => {
      wsTasks.addRow({
        name: task.name,
        status: task.column?.name || "Pending",
        progress: `${task.progress || 0}%`,
        priority: task.priority || "MEDIUM",
        points: task.effortPoints || 0,
        budget: `${currency} ${task.budget || 0}`,
        assignee: task.assigneeId || "Unassigned",
        created: task.createdAt ? format(new Date(task.createdAt), "yyyy-MM-dd") : "N/A",
        updated: task.updatedAt ? format(new Date(task.updatedAt), "yyyy-MM-dd") : "N/A",
        id: task.id,
      });
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const cleanName = projectName ? projectName.replace(/[^a-zA-Z0-9]/g, '_') : 'Project';
  saveAs(blob, `${cleanName}_Executive_Report.xlsx`);
};