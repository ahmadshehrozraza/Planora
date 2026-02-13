"use client";

import { useMemberId } from '@/features/members/hooks/use-member-id'
import ProjectMember from '@/features/projects/components/project-member'

import { memberFullProfile} from "./dummy-data";

export default function SingleProjectMember() {

  const memberId = useMemberId();

  return <ProjectMember memberInfo = {memberFullProfile} />
}