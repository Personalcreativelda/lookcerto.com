
export enum PlanType {
  FREE = 'GRÁTIS',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  credits: number;
  avatar?: string;
}

export interface MockupResult {
  id: string;
  timestamp: number;
  imageUrl: string;
  personUrl: string;
  productUrl: string;
  category: string;
  prompt: string;
}

export interface AppState {
  user: User | null;
  history: MockupResult[];
  isGenerating: boolean;
  isAuthenticated: boolean;
}

export enum Category {
  TSHIRT = 'Camiseta',
  HOODIE = 'Moletom',
  DRESS = 'Vestido',
  EYEWEAR = 'Óculos',
  CAP = 'Boné'
}
