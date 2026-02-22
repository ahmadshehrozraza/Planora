"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Member } from "@/features/members/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { SettingsIcon, Crown, User } from "lucide-react";
import Link from "next/link";
import { MemberAvatar } from "@/features/members/components/member-avatar";

interface MembersListProps {
    data: Member[];
    total: number;
}

export const MembersList = ({ data, total }: MembersListProps) => {
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted/50 border border-border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-foreground">
                        Members ({total})
                    </p>
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/workspaces/${workspaceId}/members`}>
                            <SettingsIcon className="size-4 text-foreground" />
                        </Link>
                    </Button>
                </div>
                <Separator className="my-2 bg-border" />

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.map((member) => (
                        <li key={member.id}>
                            <Card className="shadow-none rounded-lg overflow-hidden border border-border hover:border-primary/50 hover:shadow-sm transition-all bg-card">
                                <CardContent className="p-4">
                                    <div className="flex flex-col items-center">
                                        <MemberAvatar
                                            name={"Name"}
                                            className="size-16 border-4 border-background shadow-sm"
                                            fallbackClassname="text-lg font-bold"
                                        />

                                        <div className="mt-3 text-center">
                                            <p className="text-base font-semibold text-foreground line-clamp-1">
                                                {"member.name"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                {"member@planora.com"}
                                            </p>
                                            {/* Theme Compatible Badges for Roles */}
                                            <div className={`inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium mt-3 border ${
                                                member?.role === "ADMIN"
                                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                            }`}>
                                                {member?.role === "ADMIN" ? (
                                                    <>
                                                        <Crown className="size-3.5" />
                                                        <span className="font-semibold">Admin</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <User className="size-3.5" />
                                                        <span className="font-semibold">Member</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};