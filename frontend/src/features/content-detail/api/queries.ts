import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  ContentAssignment,
  ContentComment,
  ContentDetailData,
  ContentStatus,
  ContentVersion,
  Platform,
} from "../types";

type PersonRecord = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

type ContentResponse = {
  success: boolean;
  data: {
    content: {
      id: string;
      companyId: string;
      createdById: string;
      title: string;
      body: string | null;
      status: ContentStatus;
      scheduledAt: string | null;
      publishedAt: string | null;
      socialAccount: {
        id: string;
        platform: Platform;
        accountName: string;
      } | null;
      assignedDesigner: PersonRecord | null;
      assignedEditor: PersonRecord | null;
      media: Array<{
        id: string;
        url: string;
        fileType: string;
        sizeBytes: number;
        createdAt: string;
      }>;
    };
  };
};

type VersionsResponse = {
  success: boolean;
  data: {
    versions: Array<{
      id: string;
      version: number;
      createdAt: string;
      title: string;
      status: ContentStatus;
      createdBy: PersonRecord | null;
    }>;
  };
};

type CommentsResponse = {
  success: boolean;
  data: {
    comments: Array<{
      id: string;
      body: string;
      type: "comment" | "approval" | "rejection";
      createdAt: string;
      user: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        role: string;
      };
    }>;
  };
};

type CompanyResponse = {
  success: boolean;
  data: {
    company: {
      id: string;
      name: string;
    };
  };
};

function getPersonName(person: PersonRecord | null | undefined) {
  if (!person) {
    return null;
  }

  const fullName = [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
  return fullName || person.email;
}

function mapAssignment(person: PersonRecord | null | undefined): ContentAssignment | null {
  if (!person) {
    return null;
  }

  return {
    id: person.id,
    name: getPersonName(person) || person.email,
    email: person.email,
  };
}

function mapVersions(versions: VersionsResponse["data"]["versions"]): ContentVersion[] {
  return versions.map((version) => ({
    id: version.id,
    version: version.version,
    createdAt: version.createdAt,
    title: version.title,
    status: version.status,
    authorName: getPersonName(version.createdBy) || "Unknown user",
  }));
}

function mapComments(comments: CommentsResponse["data"]["comments"]): ContentComment[] {
  return comments.map((comment) => ({
    id: comment.id,
    userName: [comment.user.firstName, comment.user.lastName].filter(Boolean).join(" ").trim() || comment.user.email,
    body: comment.body,
    createdAt: comment.createdAt,
    role: comment.user.role === "client" ? "client" : "agency",
    type: comment.type,
  }));
}

export function useContentDetail(id?: string) {
  return useQuery({
    queryKey: ["content-detail", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const [contentResponse, versionsResponse, commentsResponse] = await Promise.all([
        apiClient<ContentResponse>(`/contents/${id}`),
        apiClient<VersionsResponse>(`/contents/${id}/versions`),
        apiClient<CommentsResponse>(`/contents/${id}/comments`),
      ]);

      const content = contentResponse.data.content;
      const companyResponse = await apiClient<CompanyResponse>(`/companies/${content.companyId}`);

      return {
        id: content.id,
        title: content.title,
        status: content.status,
        platform: content.socialAccount?.platform ?? null,
        companyId: content.companyId,
        createdById: content.createdById,
        companyName: companyResponse.data.company.name,
        socialAccountName: content.socialAccount?.accountName ?? null,
        body: content.body,
        scheduledAt: content.scheduledAt,
        publishedAt: content.publishedAt,
        assignedDesigner: mapAssignment(content.assignedDesigner),
        assignedEditor: mapAssignment(content.assignedEditor),
        versions: mapVersions(versionsResponse.data.versions),
        comments: mapComments(commentsResponse.data.comments),
        media: content.media ?? [],
      } satisfies ContentDetailData;
    },
  });
}
