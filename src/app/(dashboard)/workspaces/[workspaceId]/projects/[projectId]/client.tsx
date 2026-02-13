"use client";

import { useRef, useState } from "react";
import { ListTodo, Loader, Plus, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import { useCreateSegmentModal } from "@/features/segments/hooks/use-create-segment-modal";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { CreateSegmentModal } from "@/features/segments/components/create-segment-modal";

import ProjectAnalytics from "@/features/projects/components/project-analytics";
import ProjectMembers from "@/features/projects/components/project-members";
import { SegmentsPage } from "./segments/page";

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

    if (isLoadingProject) {
        return <PageLoader />
    }

    if (!project) {
        return <PageError message="Project not found" />
    }

    return (
        <div className="w-full h-full flex flex-col">
            <CreateSegmentModal />
            
            <Tabs defaultValue="segments" className="w-full flex flex-col h-full">

                <div className="flex flex-col lg:flex-row justify-between items-center px-4 py-3 gap-4 bg-white border-b sticky top-0 z-10">
                    <div className="flex items-center overflow-x-auto max-w-full">
                        <TabsList className="h-9 w-full lg:w-auto">
                            <TabsTrigger value="segments" className="px-4">
                                Segments
                            </TabsTrigger>
                            <TabsTrigger value="projectAnalytics" className="px-4">
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="projectMembers" className="px-4">
                                Members
                            </TabsTrigger>
                            <TabsTrigger value="projectSettings" className="px-4">
                                Settings
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={open}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                            <Plus className="size-4 mr-2" />
                            New Segment
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                    
                    <TabsContent value="segments" className="m-0 h-full">
                        <SegmentsPage />
                    </TabsContent>

                    <TabsContent value="projectAnalytics" className="m-0">
                        <div className="space-y-4 max-w-7xl mx-auto">
                            <div className="flex justify-end">
                                <Button 
                                    onClick={handleExportPDF} 
                                    disabled={isExporting}
                                    variant="outline"
                                    size="sm"
                                    className="bg-white"
                                >
                                    {isExporting ? (
                                        <>
                                            <Loader2 className="size-4 mr-2 animate-spin" /> Generating PDF...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="size-4 mr-2" /> Download Report
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 
                                <ProjectAnalytics projectId={projectId} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="projectMembers" className="m-0 max-w-7xl mx-auto">
                        <ProjectMembers project={project} />
                    </TabsContent>

                    <TabsContent value="projectSettings">
                            <EditProjectForm initialValues={project} />

                    </TabsContent>

                </div>
            </Tabs>
        </div>
    );
}