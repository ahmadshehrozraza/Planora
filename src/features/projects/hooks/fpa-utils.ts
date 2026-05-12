
export const FPA_WEIGHTS = {
  EI: 4, 
  EO: 5,  
  EQ: 4, 
  ILF: 10, 
  EIF: 7,  
};

export const LANGUAGE_FACTORS: Record<string, number> = {
  "Next.js / React / Vue (Frontend)": 50,
  "Node.js / Express (Backend)": 50,
  "Python (FastAPI / Django)": 40,
  "Java / Spring Boot": 53,
  "C# / .NET": 54,
  "PHP / Laravel": 50,
  "Ruby on Rails": 45,
  "Go (Golang)": 40,
  "Rust": 40,
  "C++ (Object Oriented)": 80,
  "C (Low Level)": 100,
  "SQL / Database Scripts": 35,
  "HTML / CSS (Markup)": 15,
};

export const calculateFPA = (
  counts: { EI: number; EO: number; EQ: number; ILF: number; EIF: number },
  languageFactor: number
) => {
  const totalFP =
    counts.EI * FPA_WEIGHTS.EI +
    counts.EO * FPA_WEIGHTS.EO +
    counts.EQ * FPA_WEIGHTS.EQ +
    counts.ILF * FPA_WEIGHTS.ILF +
    counts.EIF * FPA_WEIGHTS.EIF;

  const totalLOC = totalFP * languageFactor;

  const kloc = totalLOC / 1000;

  return { 
    totalFP, 
    totalLOC, 
    kloc: parseFloat(kloc.toFixed(2)) // Max 2 decimal places 
  };
};