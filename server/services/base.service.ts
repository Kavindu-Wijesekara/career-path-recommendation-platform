import { IService } from "../interfaces/service.interface";

/**
 * Abstract base service class that implements IService
 */
export abstract class BaseService implements IService {
  async initialize(): Promise<void> {
    console.log(`Initializing ${this.constructor.name}...`);
  }
}