"use client";

import { useRef, useState } from "react";
import { Plus, Download, Loader2, LayoutTemplate } from "lucide-react";
import dynamic from "next/dynamic";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import { useCreateSegmentModal } from "@/features/segments/hooks/use-create-segment-modal";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { SegmentsPage } from "./segments/page";
import { CreateSegmentModal } from "@/features/segments/components/create-segment-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

const EditProjectForm = dynamic(() => import("@/features/projects/components/edit-project-form").then(mod => mod.EditProjectForm), { loading: () => <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div> });
const ProjectAnalytics = dynamic(() => import("@/features/projects/components/project-analytics"), { ssr: false, loading: () => <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div> });
const ProjectMembers = dynamic(() => import("@/features/projects/components/project-members"), { loading: () => <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div> });

export const ProjectIdClient = () => {
    const projectId = useProjectId();
    const { data, isLoading: isLoadingProject } = useGetDummyProjects();
    const project = data?.documents.find((p) => p.id === projectId);

    const { open } = useCreateSegmentModal();
    const printRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async () => {
        if (!printRef.current || !project) return;
        setIsExporting(true);
        
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            const element = printRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowHeight: element.scrollHeight
            });
            
            const imgData = canvas.toDataURL("image/jpeg", 0.75);
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const imgH = (imgHeight * pdfWidth) / imgWidth;

            let heightLeft = imgH;
            let position = 0;

            pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgH);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgH;
                pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgH);
                heightLeft -= pdfHeight;
            }

            pdf.save(`${project.name.replace(/\s+/g, "_")}_Analytics_Report.pdf`);
        } catch (error) {
            console.error("Export failed", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoadingProject) return <div className="h-[60vh] flex items-center justify-center"><PageLoader /></div>;
    if (!project) return <PageError message="Project not found" />;

    return (
        <div className="w-full flex flex-col min-h-screen bg-background">
            <CreateSegmentModal />
            <Tabs defaultValue="segments" className="w-full flex flex-col flex-1">
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-6 py-4 gap-4 bg-card border-b border-border sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-3">
                         
                             <ProjectAvatar name={project.name} className="size-10" />

                         <div>
                             <h1 className="font-bold text-lg text-foreground leading-none">{project.name}</h1>
                             <p className="text-xs text-muted-foreground mt-1 font-medium">Project Workspace</p>
                         </div>
                    </div>

                    <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                        <TabsList className="h-10 bg-muted/80 p-1 w-full lg:w-auto overflow-x-auto justify-start border border-border">
                            <TabsTrigger value="segments" className="px-5 text-sm data-[state=active]:shadow-sm">Segments</TabsTrigger>
                            <TabsTrigger value="projectAnalytics" className="px-5 text-sm data-[state=active]:shadow-sm">Analytics</TabsTrigger>
                            <TabsTrigger value="projectMembers" className="px-5 text-sm data-[state=active]:shadow-sm">Members</TabsTrigger>
                            <TabsTrigger value="projectSettings" className="px-5 text-sm data-[state=active]:shadow-sm">Settings</TabsTrigger>
                        </TabsList>

                        <Button onClick={open} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0">
                            <Plus className="size-4 mr-2" />
                            New Segment
                        </Button>
                    </div>
                </div>

                <div className="flex-1 w-full relative">
                    <TabsContent value="segments" className="m-0 border-none outline-none h-full">
                        <SegmentsPage />
                    </TabsContent>

                    <TabsContent value="projectAnalytics" className="m-0 p-6">
                        <div className="max-w-7xl mx-auto space-y-4">
                            <div className="flex justify-end">
                                <Button 
                                    onClick={handleExportPDF} 
                                    disabled={isExporting}
                                    variant="outline"
                                    size="sm"
                                    className="bg-background hover:bg-accent border-border shadow-sm text-foreground font-medium"
                                >
                                    {isExporting ? <><Loader2 className="size-4 mr-2 animate-spin" /> Generating PDF...</> : <><Download className="size-4 mr-2" /> Export Report</>}
                                </Button>
                            </div>
                            <div ref={printRef} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden print-container">
                                <ProjectAnalytics projectId={projectId} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="projectMembers" className="m-0 p-6">
                        <div className=" ">
                           <ProjectMembers project={project} />
                        </div>
                    </TabsContent>

                    <TabsContent value="projectSettings" className="m-0 p-6">
                         <div className="">
                            <EditProjectForm initialValues={project} />
                         </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}