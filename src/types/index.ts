export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  shared: boolean;
  shareExpiresAt: Date | null;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
