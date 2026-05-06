export interface EventTypes {
  id: string;
  title: string;
  date: string;       
  time: string;      
  description?: string | null;
  project: { name: string; imageUrl?: string } | null; 
  sprint: { name: string } | null; 
  eventCreator: { name: string; avatar?: string }; 
  opened: boolean;    
}