export type ProjectType = "ORGANIC" | "SEMI_DETACHED" | "EMBEDDED";

const COCOMO_CONSTANTS = {
  ORGANIC: { a: 2.4, b: 1.05, c: 2.5, d: 0.38 },
  SEMI_DETACHED: { a: 3.0, b: 1.12, c: 2.5, d: 0.35 },
  EMBEDDED: { a: 3.6, b: 1.20, c: 2.5, d: 0.32 },
};

export const calculateCOCOMO = (kloc: number, type: ProjectType, avgSalary: number) => {
  if (!kloc || kloc <= 0) return { effort: 0, duration: 0, staff: 0, cost: 0 };

  const { a, b, c, d } = COCOMO_CONSTANTS[type];

  const effort = a * Math.pow(kloc, b);
  
  const duration = c * Math.pow(effort, d);
  
  const staff = effort / duration;
  
  const cost = effort * avgSalary;

  return {
    effort: parseFloat(effort.toFixed(2)),
    duration: parseFloat(duration.toFixed(2)),
    staff: Math.ceil(staff),
    cost: parseFloat(cost.toFixed(2)),
  };
};