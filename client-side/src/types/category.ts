export interface ICategory {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
}