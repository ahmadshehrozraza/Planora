export interface EventTypes {
  id: string;
  title: string;
  date: string;       
  endDate?: string | null;
  time: string;      
  description?: string | null;
  location?: string | null;
  notes?: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MISSED";
  project: { name: string; imageUrl?: string } | null; 
  sprint: { name: string } | null; 
  eventCreator: { name: string; avatar?: string }; 
  isOpened: boolean;    
}