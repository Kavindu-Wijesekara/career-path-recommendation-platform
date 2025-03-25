/**
 * Interface for all service classes
 */
export interface IService {
  // Base interface that all services will implement
  initialize(): Promise<void>;
}