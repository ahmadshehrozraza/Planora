import { Member, MemberRole } from "@/features/members/types";

export const dummyMembers: Member[] = [
  // ==================== WORKSPACE_001 ====================
  // Design & Development Workspace
  {
    id: 'member_001',
    memberId: 'user_001',
    workspaceId: 'workspace_001',
    projectId: 'project_001',
    role: MemberRole.ADMIN,
    hasAccess: true,
    joinedDate: new Date('2024-01-05'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: 'member_002',
    memberId: 'user_002',
    workspaceId: 'workspace_001',
    projectId: 'project_001',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-01-06'),
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06')
  },
  {
    id: 'member_003',
    memberId: 'user_003',
    workspaceId: 'workspace_001',
    projectId: 'project_002',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-01-07'),
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07')
  },
  {
    id: 'member_004',
    memberId: 'user_004',
    workspaceId: 'workspace_001',
    projectId: 'project_003',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-08'),
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: 'member_005',
    memberId: 'user_005',
    workspaceId: 'workspace_001',
    projectId: 'project_004',
    role: MemberRole.MEMBER,
    hasAccess: false,
    joinedDate: new Date('2024-01-09'),
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09')
  },
  {
    id: 'member_006',
    memberId: 'user_006',
    workspaceId: 'workspace_001',
    projectId: 'project_005',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'member_007',
    memberId: 'user_007',
    workspaceId: 'workspace_001',
    projectId: 'project_001',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-11'),
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: 'member_008',
    memberId: 'user_008',
    workspaceId: 'workspace_001',
    projectId: 'project_002',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-12'),
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'member_009',
    memberId: 'user_009',
    workspaceId: 'workspace_001',
    projectId: 'project_003',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-13'),
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: 'member_010',
    memberId: 'user_010',
    workspaceId: 'workspace_001',
    projectId: 'project_004',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-14'),
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'member_011',
    memberId: 'user_011',
    workspaceId: 'workspace_001',
    projectId: 'project_005',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-01'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'member_012',
    memberId: 'user_012',
    workspaceId: 'workspace_001',
    projectId: 'project_001',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-02'),
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-02')
  },
  {
    id: 'member_013',
    memberId: 'user_013',
    workspaceId: 'workspace_001',
    projectId: 'project_002',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-03'),
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-03')
  },
  {
    id: 'member_014',
    memberId: 'user_014',
    workspaceId: 'workspace_001',
    projectId: 'project_003',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-04'),
    createdAt: new Date('2024-02-04'),
    updatedAt: new Date('2024-02-04')
  },
  {
    id: 'member_015',
    memberId: 'user_015',
    workspaceId: 'workspace_001',
    projectId: 'project_004',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-05'),
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: 'member_016',
    memberId: 'user_016',
    workspaceId: 'workspace_001',
    projectId: 'project_005',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-06'),
    createdAt: new Date('2024-02-06'),
    updatedAt: new Date('2024-02-06')
  },
  {
    id: 'member_017',
    memberId: 'user_017',
    workspaceId: 'workspace_001',
    projectId: 'project_001',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-07'),
    createdAt: new Date('2024-02-07'),
    updatedAt: new Date('2024-02-07')
  },
  {
    id: 'member_018',
    memberId: 'user_018',
    workspaceId: 'workspace_001',
    projectId: 'project_002',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-08'),
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-02-08')
  },
  {
    id: 'member_019',
    memberId: 'user_019',
    workspaceId: 'workspace_001',
    projectId: 'project_003',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-09'),
    createdAt: new Date('2024-02-09'),
    updatedAt: new Date('2024-02-09')
  },
  {
    id: 'member_020',
    memberId: 'user_020',
    workspaceId: 'workspace_001',
    projectId: 'project_004',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-10'),
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: 'member_021',
    memberId: 'user_021',
    workspaceId: 'workspace_001',
    projectId: 'project_005',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-11'),
    createdAt: new Date('2024-02-11'),
    updatedAt: new Date('2024-02-11')
  },
  {
    id: 'member_022',
    memberId: 'user_022',
    workspaceId: 'workspace_001',
    projectId: 'project_001',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-12'),
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-12')
  },
  {
    id: 'member_023',
    memberId: 'user_023',
    workspaceId: 'workspace_001',
    projectId: 'project_002',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-13'),
    createdAt: new Date('2024-02-13'),
    updatedAt: new Date('2024-02-13')
  },

  // ==================== WORKSPACE_002 ====================
  // Mobile Solutions Workspace
  {
    id: 'member_024',
    memberId: 'user_001',
    workspaceId: 'workspace_002',
    projectId: 'project_006',
    role: MemberRole.ADMIN,
    hasAccess: true,
    joinedDate: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'member_025',
    memberId: 'user_002',
    workspaceId: 'workspace_002',
    projectId: 'project_007',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-01-11'),
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: 'member_026',
    memberId: 'user_003',
    workspaceId: 'workspace_002',
    projectId: 'project_008',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-01-12'),
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'member_027',
    memberId: 'user_004',
    workspaceId: 'workspace_002',
    projectId: 'project_009',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-13'),
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: 'member_028',
    memberId: 'user_005',
    workspaceId: 'workspace_002',
    projectId: 'project_010',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-14'),
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'member_029',
    memberId: 'user_024',
    workspaceId: 'workspace_002',
    projectId: 'project_006',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-03-01'),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: 'member_030',
    memberId: 'user_025',
    workspaceId: 'workspace_002',
    projectId: 'project_007',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-03-02'),
    createdAt: new Date('2024-03-02'),
    updatedAt: new Date('2024-03-02')
  },
  {
    id: 'member_031',
    memberId: 'user_034',
    workspaceId: 'workspace_002',
    projectId: 'project_008',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-04-15'),
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-15')
  },
  {
    id: 'member_032',
    memberId: 'user_035',
    workspaceId: 'workspace_002',
    projectId: 'project_009',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-05-01'),
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01')
  },
  {
    id: 'member_033',
    memberId: 'user_036',
    workspaceId: 'workspace_002',
    projectId: 'project_010',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-05-02'),
    createdAt: new Date('2024-05-02'),
    updatedAt: new Date('2024-05-02')
  },

  // ==================== WORKSPACE_003 ====================
  // E-commerce Team Workspace
  {
    id: 'member_034',
    memberId: 'user_002',
    workspaceId: 'workspace_003',
    projectId: 'project_011',
    role: MemberRole.ADMIN,
    hasAccess: true,
    joinedDate: new Date('2023-10-15'),
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-10-15')
  },
  {
    id: 'member_035',
    memberId: 'user_001',
    workspaceId: 'workspace_003',
    projectId: 'project_012',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2023-10-16'),
    createdAt: new Date('2023-10-16'),
    updatedAt: new Date('2023-10-16')
  },
  {
    id: 'member_036',
    memberId: 'user_003',
    workspaceId: 'workspace_003',
    projectId: 'project_013',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2023-10-17'),
    createdAt: new Date('2023-10-17'),
    updatedAt: new Date('2023-10-17')
  },
  {
    id: 'member_037',
    memberId: 'user_004',
    workspaceId: 'workspace_003',
    projectId: 'project_014',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2023-10-18'),
    createdAt: new Date('2023-10-18'),
    updatedAt: new Date('2023-10-18')
  },
  {
    id: 'member_038',
    memberId: 'user_005',
    workspaceId: 'workspace_003',
    projectId: 'project_015',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2023-10-19'),
    createdAt: new Date('2023-10-19'),
    updatedAt: new Date('2023-10-19')
  },
  {
    id: 'member_039',
    memberId: 'user_026',
    workspaceId: 'workspace_003',
    projectId: 'project_011',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'member_040',
    memberId: 'user_027',
    workspaceId: 'workspace_003',
    projectId: 'project_012',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-02'),
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'member_041',
    memberId: 'user_028',
    workspaceId: 'workspace_003',
    projectId: 'project_013',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-03'),
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  },
  {
    id: 'member_042',
    memberId: 'user_037',
    workspaceId: 'workspace_003',
    projectId: 'project_014',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-04-01'),
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  },

  // ==================== WORKSPACE_004 ====================
  // CRM Operations Workspace
  {
    id: 'member_043',
    memberId: 'user_003',
    workspaceId: 'workspace_004',
    projectId: 'project_016',
    role: MemberRole.ADMIN,
    hasAccess: true,
    joinedDate: new Date('2024-02-10'),
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: 'member_044',
    memberId: 'user_004',
    workspaceId: 'workspace_004',
    projectId: 'project_017',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-02-11'),
    createdAt: new Date('2024-02-11'),
    updatedAt: new Date('2024-02-11')
  },
  {
    id: 'member_045',
    memberId: 'user_005',
    workspaceId: 'workspace_004',
    projectId: 'project_018',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-02-12'),
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-12')
  },
  {
    id: 'member_046',
    memberId: 'user_001',
    workspaceId: 'workspace_004',
    projectId: 'project_019',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-13'),
    createdAt: new Date('2024-02-13'),
    updatedAt: new Date('2024-02-13')
  },
  {
    id: 'member_047',
    memberId: 'user_002',
    workspaceId: 'workspace_004',
    projectId: 'project_020',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-02-14'),
    createdAt: new Date('2024-02-14'),
    updatedAt: new Date('2024-02-14')
  },
  {
    id: 'member_048',
    memberId: 'user_029',
    workspaceId: 'workspace_004',
    projectId: 'project_016',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-05-01'),
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01')
  },
  {
    id: 'member_049',
    memberId: 'user_030',
    workspaceId: 'workspace_004',
    projectId: 'project_017',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-05-02'),
    createdAt: new Date('2024-05-02'),
    updatedAt: new Date('2024-05-02')
  },
  {
    id: 'member_050',
    memberId: 'user_031',
    workspaceId: 'workspace_004',
    projectId: 'project_018',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-05-03'),
    createdAt: new Date('2024-05-03'),
    updatedAt: new Date('2024-05-03')
  },
  {
    id: 'member_051',
    memberId: 'user_032',
    workspaceId: 'workspace_004',
    projectId: 'project_019',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-05-04'),
    createdAt: new Date('2024-05-04'),
    updatedAt: new Date('2024-05-04')
  },
  {
    id: 'member_052',
    memberId: 'user_038',
    workspaceId: 'workspace_004',
    projectId: 'project_020',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-06-01'),
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01')
  },

  // ==================== WORKSPACE_005 ====================
  // Analytics Division Workspace
  {
    id: 'member_053',
    memberId: 'user_004',
    workspaceId: 'workspace_005',
    projectId: 'project_021',
    role: MemberRole.ADMIN,
    hasAccess: true,
    joinedDate: new Date('2024-03-15'),
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: 'member_054',
    memberId: 'user_005',
    workspaceId: 'workspace_005',
    projectId: 'project_022',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-03-16'),
    createdAt: new Date('2024-03-16'),
    updatedAt: new Date('2024-03-16')
  },
  {
    id: 'member_055',
    memberId: 'user_006',
    workspaceId: 'workspace_005',
    projectId: 'project_021',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-03-17'),
    createdAt: new Date('2024-03-17'),
    updatedAt: new Date('2024-03-17')
  },
  {
    id: 'member_056',
    memberId: 'user_007',
    workspaceId: 'workspace_005',
    projectId: 'project_022',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-03-18'),
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-18')
  },

  // ==================== WORKSPACE_006 ====================
  // API Integration Hub Workspace
  {
    id: 'member_057',
    memberId: 'user_005',
    workspaceId: 'workspace_006',
    projectId: 'project_023',
    role: MemberRole.ADMIN,
    hasAccess: true,
    joinedDate: new Date('2023-11-10'),
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2023-11-10')
  },
  {
    id: 'member_058',
    memberId: 'user_033',
    workspaceId: 'workspace_006',
    projectId: 'project_023',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2023-11-11'),
    createdAt: new Date('2023-11-11'),
    updatedAt: new Date('2023-11-11')
  },
  {
    id: 'member_059',
    memberId: 'user_034',
    workspaceId: 'workspace_006',
    projectId: 'project_023',
    role: MemberRole.MEMBER,
    hasAccess: true,
    joinedDate: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },

  // ==================== ADDITIONAL PROJECT MANAGERS ====================
  {
    id: 'member_060',
    memberId: 'user_008',
    workspaceId: 'workspace_001',
    projectId: 'project_003',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2023-10-20'),
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2023-10-20')
  },
  {
    id: 'member_061',
    memberId: 'user_009',
    workspaceId: 'workspace_001',
    projectId: 'project_004',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-02-15'),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: 'member_062',
    memberId: 'user_010',
    workspaceId: 'workspace_001',
    projectId: 'project_005',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-03-20'),
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20')
  },
  {
    id: 'member_063',
    memberId: 'user_011',
    workspaceId: 'workspace_002',
    projectId: 'project_006',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2023-11-20'),
    createdAt: new Date('2023-11-20'),
    updatedAt: new Date('2023-11-20')
  },
  {
    id: 'member_064',
    memberId: 'user_012',
    workspaceId: 'workspace_002',
    projectId: 'project_007',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-04-15'),
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-15')
  },
  {
    id: 'member_065',
    memberId: 'user_013',
    workspaceId: 'workspace_002',
    projectId: 'project_008',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2024-02-01'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'member_066',
    memberId: 'user_014',
    workspaceId: 'workspace_002',
    projectId: 'project_009',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-09-20'),
    createdAt: new Date('2025-09-20'),
    updatedAt: new Date('2025-09-20')
  },
  {
    id: 'member_067',
    memberId: 'user_015',
    workspaceId: 'workspace_002',
    projectId: 'project_010',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-11-01'),
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-01')
  },
  {
    id: 'member_068',
    memberId: 'user_016',
    workspaceId: 'workspace_003',
    projectId: 'project_011',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-10-01'),
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01')
  },
  {
    id: 'member_069',
    memberId: 'user_017',
    workspaceId: 'workspace_003',
    projectId: 'project_012',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-10-25'),
    createdAt: new Date('2025-10-25'),
    updatedAt: new Date('2025-10-25')
  },
  {
    id: 'member_070',
    memberId: 'user_018',
    workspaceId: 'workspace_003',
    projectId: 'project_013',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-11-15'),
    createdAt: new Date('2025-11-15'),
    updatedAt: new Date('2025-11-15')
  },
  {
    id: 'member_071',
    memberId: 'user_019',
    workspaceId: 'workspace_003',
    projectId: 'project_014',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-11-28'),
    createdAt: new Date('2025-11-28'),
    updatedAt: new Date('2025-11-28')
  },
  {
    id: 'member_072',
    memberId: 'user_020',
    workspaceId: 'workspace_003',
    projectId: 'project_015',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-11-20'),
    createdAt: new Date('2025-11-20'),
    updatedAt: new Date('2025-11-20')
  },
  {
    id: 'member_073',
    memberId: 'user_021',
    workspaceId: 'workspace_004',
    projectId: 'project_016',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-12-01'),
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-01')
  },
  {
    id: 'member_074',
    memberId: 'user_022',
    workspaceId: 'workspace_004',
    projectId: 'project_017',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-12-10'),
    createdAt: new Date('2025-12-10'),
    updatedAt: new Date('2025-12-10')
  },
  {
    id: 'member_075',
    memberId: 'user_023',
    workspaceId: 'workspace_004',
    projectId: 'project_018',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-09-20'),
    createdAt: new Date('2025-09-20'),
    updatedAt: new Date('2025-09-20')
  },
  {
    id: 'member_076',
    memberId: 'user_024',
    workspaceId: 'workspace_004',
    projectId: 'project_019',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-10-25'),
    createdAt: new Date('2025-10-25'),
    updatedAt: new Date('2025-10-25')
  },
  {
    id: 'member_077',
    memberId: 'user_025',
    workspaceId: 'workspace_004',
    projectId: 'project_020',
    role: MemberRole.PROJECT_MANAGER,
    hasAccess: true,
    joinedDate: new Date('2025-12-10'),
    createdAt: new Date('2025-12-10'),
    updatedAt: new Date('2025-12-10')
  },

  // ==================== INACTIVE/NO ACCESS MEMBERS ====================
  {
    id: 'member_078',
    memberId: 'user_099',
    workspaceId: 'workspace_001',
    projectId: 'project_001',
    role: MemberRole.MEMBER,
    hasAccess: false,
    joinedDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: 'member_079',
    memberId: 'user_100',
    workspaceId: 'workspace_002',
    projectId: 'project_006',
    role: MemberRole.MEMBER,
    hasAccess: false,
    joinedDate: new Date('2024-02-01'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-04-01')
  }
];