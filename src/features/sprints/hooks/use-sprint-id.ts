import { useParams } from "next/navigation";

export const useSprintId = () => {
  const params = useParams();
  return params.sprintId as string;
};