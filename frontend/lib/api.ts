import {
  HealthStatus,
  InvestigationListItem,
  InvestigationDetail,
  EvidenceFile,
  AnalysisResponse,
  GraphResponse,
  TimelineResponse,
  Contradiction,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      let errBody;
      try {
        errBody = await res.json();
      } catch {
        errBody = { message: await res.text() };
      }
      const message =
        errBody?.detail?.message ||
        (typeof errBody?.detail === "string" ? errBody.detail : "API Request Failed");
      throw new ApiError(message, res.status, errBody);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `Cannot connect to EvidenceOS backend at ${API_BASE_URL}. Ensure FastAPI is running on port 8000.`,
      0,
      err
    );
  }
}

export const api = {
  getHealth: () => request<HealthStatus>("/api/health"),

  getInvestigations: () => request<InvestigationListItem[]>("/api/investigations"),

  createInvestigation: (title: string, description: string = "") =>
    request<InvestigationDetail>("/api/investigations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    }),

  getInvestigation: (id: string) => request<InvestigationDetail>(`/api/investigations/${id}`),

  deleteInvestigation: (id: string) =>
    request<void>(`/api/investigations/${id}`, { method: "DELETE" }),

  uploadEvidence: async (id: string, files: File[]): Promise<EvidenceFile[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const url = `${API_BASE_URL}/api/investigations/${id}/evidence`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      let errBody;
      try {
        errBody = await res.json();
      } catch {
        errBody = { message: await res.text() };
      }
      const message =
        errBody?.detail?.message ||
        (typeof errBody?.detail === "string" ? errBody.detail : "Upload failed");
      throw new ApiError(message, res.status, errBody);
    }

    return (await res.json()) as EvidenceFile[];
  },

  getEvidenceFile: (id: string, evidenceId: string) =>
    request<EvidenceFile & { extracted_text: string }>(
      `/api/investigations/${id}/evidence/${evidenceId}`
    ),

  analyzeInvestigation: (id: string) =>
    request<AnalysisResponse>(`/api/investigations/${id}/analyze`, {
      method: "POST",
    }),

  getInvestigationGraph: (id: string) =>
    request<GraphResponse>(`/api/investigations/${id}/graph`),

  getInvestigationTimeline: (id: string) =>
    request<TimelineResponse>(`/api/investigations/${id}/timeline`),

  getInvestigationContradictions: (id: string) =>
    request<Contradiction[]>(`/api/investigations/${id}/contradictions`),

  resolveContradiction: (
    id: string,
    contradictionId: string,
    status: "resolved" | "unresolved" | "dismissed",
    resolutionNotes: string = ""
  ) =>
    request<Contradiction>(
      `/api/investigations/${id}/contradictions/${contradictionId}/resolve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolution_notes: resolutionNotes }),
      }
    ),

  getReportUrl: (id: string, format: "markdown" | "html" = "markdown") =>
    `${API_BASE_URL}/api/investigations/${id}/report?format=${format}`,

  downloadReport: async (id: string, title: string, format: "markdown" | "html" = "markdown") => {
    const url = `${API_BASE_URL}/api/investigations/${id}/report?format=${format}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to download report");
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `EvidenceOS_Report_${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.${format === "markdown" ? "md" : "html"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};
