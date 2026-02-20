"use client";

import { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetDummyProjects } from "@/features/projects/api/use-get-dummy-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
const ProjectAnalytics = dynamic(
  () => import("@/features/projects/components/project-analytics"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-xl">
         <PageLoader />
      </div>
    )
  }
);
import { PageLoader } from "@/components/page-loader";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface AnalyticsClientProps {
  workspaceId: string;
}

export const AnalyticsClient = ({ workspaceId }: AnalyticsClientProps) => {

  const { data, isLoading } = useGetDummyProjects(workspaceId);

  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >(undefined);
  const [isExporting, setIsExporting] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const activeProjectId = selectedProjectId || data?.documents?.[0]?.id;

  const handleExportPDF = async () => {
    if (!printRef.current || !activeProjectId) return;

    const project = data?.documents.find((p) => p.id === activeProjectId);
    const fileName = project ? project.name.replace(/\s+/g, "_") : "Project";

    setIsExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = printRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowHeight: element.scrollHeight,
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

      pdf.save(`${fileName}_Analytics_Report.pdf`);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-[300px]">
          <Select value={activeProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full h-10 shadow-sm">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {data?.documents.map((project) => (
                <SelectItem
                  key={project.id}
                  value={project.id}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <ProjectAvatar
                      name={project.name}
                      image={project.imageUrl}
                      className="size-6 border border-slate-100"
                    />
                    <span className="truncate">{project.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleExportPDF}
          disabled={isExporting || !activeProjectId}
          className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
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
      <div
        ref={printRef}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        {activeProjectId ? (
          <ProjectAnalytics projectId={activeProjectId} />
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-slate-50 rounded-full">
              <Loader2 className="size-6 text-slate-400 animate-spin" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Loading analytics...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
