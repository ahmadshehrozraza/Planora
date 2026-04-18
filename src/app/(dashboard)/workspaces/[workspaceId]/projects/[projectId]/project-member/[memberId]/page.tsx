"use client";

import ProjectMember from '@/features/projects/components/project-member';
import { useGetMemberProfile } from '@/features/projects/api/use-get-member-profile';
import { PageLoader } from '@/components/page-loader';

export default function SingleProjectMember({
  params 
} : {
  params: { memberId: string } 
}) {
  
  const { data: memberProfile, isLoading } = useGetMemberProfile({ memberId: params.memberId });

  if (isLoading) return <div className="h-screen flex items-center justify-center"><PageLoader /></div>;
  if (!memberProfile) return <div className="p-8 text-center text-muted-foreground">Member profile not found.</div>;

  return <ProjectMember memberInfo={memberProfile} />;
}