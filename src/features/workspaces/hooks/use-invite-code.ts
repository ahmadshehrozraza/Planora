"use client";
import { useParams } from "next/navigation";

export const useInviteCode = () => {
  const params = useParams();
  return typeof params.inviteCode === "string" ? params.inviteCode : "";
};
