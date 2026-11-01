import { collection } from "./store.ts";

export type Project = {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD, эрэмбэлэхэд ашиглана
  url?: string;
  image?: string;
  tags?: string[];
};

const projects = collection<Project>("projects");

export const readProjects = projects.read;
export const createProject = projects.create;
export const updateProject = projects.update;
export const deleteProject = projects.remove;
