declare global {
  namespace Express {
    // Inject custom properties to Request object
    export interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}

// Ensure this is treated as a module
export {};
