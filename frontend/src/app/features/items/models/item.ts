export interface Item {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemRequest {
  name: string;
  description: string | null;
}
