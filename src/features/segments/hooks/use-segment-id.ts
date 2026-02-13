import { useParams } from "next/navigation";

export const useSegmentId = () => {
  const params = useParams();
  return params.segmentId as string;
};