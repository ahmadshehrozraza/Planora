

export interface EventTypes {
  $id: string;
  title: string;
  date: string;       
  time: string;      
  description: string;
  project: { name: string };
  segment: { name: string };
  eventCreator: { name: string; avatar?: string }; 
  opened: boolean;    
}