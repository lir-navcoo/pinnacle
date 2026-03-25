/**
 * API 客户端
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // 添加认证 Token（如果有）
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("token")
    : null;
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        error.detail || error.message || "请求失败",
        response.status,
        error.code
      );
    }

    // 处理 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("网络错误，请检查连接", 0);
  }
}

// API 客户端
export const api = {
  // 模板管理
  templates: {
    list: (params?: { page?: number; page_size?: number; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.page_size) query.set("page_size", String(params.page_size));
      if (params?.search) query.set("search", params.search);
      return request<{
        items: Template[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
      }>(`/templates?${query}`);
    },
    get: (id: string) => request<Template>(`/templates/${id}`),
    create: (data: Partial<Template>) =>
      request<Template>("/templates", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Template>) =>
      request<Template>(`/templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/templates/${id}`, { method: "DELETE" }),
    publish: (id: string) =>
      request<Template>(`/templates/${id}/publish`, { method: "POST" }),
    duplicate: (id: string) =>
      request<Template>(`/templates/${id}/duplicate`, { method: "POST" }),
  },

  // 渲染接口
  render: {
    create: (data: {
      template_id: string;
      params: Record<string, unknown>;
      format?: string;
      quality?: number;
      send_dingtalk?: boolean;
      dingtalk_bot_id?: string;
    }) =>
      request<{
        job_id: string;
        image_url?: string;
        status: string;
        message?: string;
      }>("/render", { method: "POST", body: JSON.stringify(data) }),
    getJob: (jobId: string) =>
      request<RenderJob>(`/render/job/${jobId}`),
    preview: (
      templateId: string,
      params: Record<string, unknown>,
      format = "png"
    ) =>
      request<Blob>(`/render/preview?template_id=${templateId}&format=${format}`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: { "Content-Type": "application/json" },
      }),
  },

  // API Key 管理
  apiKeys: {
    list: (params?: { page?: number; page_size?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.page_size) query.set("page_size", String(params.page_size));
      return request<{ items: APIKey[]; total: number }>(`/api-keys?${query}`);
    },
    create: (data: { name: string; permissions?: string[]; rate_limit?: number; template_ids?: string[] }) =>
      request<APIKey>("/api-keys", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<APIKey>) =>
      request<APIKey>(`/api-keys/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api-keys/${id}`, { method: "DELETE" }),
  },

  // 钉钉机器人
  dingtalk: {
    listBots: (params?: { page?: number; page_size?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", String(params.page));
      if (params?.page_size) query.set("page_size", String(params.page_size));
      return request<{ items: DingTalkBot[]; total: number }>(`/dingtalk/bots?${query}`);
    },
    createBot: (data: { name: string; webhook_url: string; secret?: string; description?: string }) =>
      request<DingTalkBot>("/dingtalk/bots", { method: "POST", body: JSON.stringify(data) }),
    updateBot: (id: string, data: Partial<DingTalkBot>) =>
      request<DingTalkBot>(`/dingtalk/bots/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteBot: (id: string) =>
      request<void>(`/dingtalk/bots/${id}`, { method: "DELETE" }),
    testBot: (id: string) =>
      request<{ msg_id: string; status: string }>(`/dingtalk/bots/${id}/test`, { method: "POST" }),
    send: (data: { bot_id: string; message_type: string; content: string; conversation_id?: string }) =>
      request<{ msg_id: string; status: string }>("/dingtalk/send", { method: "POST", body: JSON.stringify(data) }),
  },
};

// 类型定义
export interface Template {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  background_color: string;
  background_image?: string;
  thumbnail?: string;
  elements: TemplateElement[];
  status: "draft" | "published" | "archived";
  is_public: boolean;
  render_count: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateElement {
  id?: string;
  type: "text" | "image" | "shape" | "chart";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  opacity: number;
  lock: boolean;
  visible: boolean;
  // 文本属性
  content?: string;
  font_family?: string;
  font_size?: number;
  font_color?: string;
  text_align?: "left" | "center" | "right";
  binding_field?: string;
  // 图片属性
  src?: string;
  border_radius?: number;
  // 图表属性
  chart_type?: "bar" | "pie" | "progress";
  data?: unknown[];
}

export interface RenderJob {
  id: string;
  template_id: string;
  params: Record<string, unknown>;
  status: "pending" | "processing" | "completed" | "failed";
  image_url?: string;
  dingtalk_msg_id?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface APIKey {
  id: string;
  name: string;
  key?: string;
  prefix: string;
  permissions: string[];
  rate_limit: number;
  template_ids: string[];
  is_active: boolean;
  call_count: number;
  last_used_at?: string;
  created_at: string;
}

export interface DingTalkBot {
  id: string;
  name: string;
  webhook_url: string;
  secret?: string;
  description?: string;
  is_active: boolean;
  default_conversation_id?: string;
  send_count: number;
  success_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export { APIError };
