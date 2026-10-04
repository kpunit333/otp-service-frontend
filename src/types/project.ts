/**
 * Organization Project Entity Definition
 */
export interface Project {
  code: string;
  name: string;
  secretKey?: string;
  status: string;
  description?: string;
  createdAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: string;
}
