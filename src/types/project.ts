/**
 * Organization Project Entity Definition
 */
export interface Project {
  code: string;
  name: string;
  email: string;
  secretKey: string;
  status: string;
  description?: string;
  createdAt: string;
  expireAt?: string;
}

export interface CreateProjectPayload {
  name: string;
  email: string;
  password: string;
  description?: string;
  // status?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  email?: string;
  description?: string;
  status?: string;
}

