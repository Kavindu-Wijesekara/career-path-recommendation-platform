import { IService } from "../interfaces/service.interface";
import { AIService } from "./ai.service";
import { PDFService } from "./pdf.service";
import { EmailService } from "./email.service";

export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, IService> = new Map();

  private constructor() {

  }


  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Initialize all services
   */
  public async initialize(): Promise<void> {
    // Register all services
    this.register("ai", new AIService());
    this.register("pdf", new PDFService());
    this.register("email", new EmailService());

    // Initialize all registered services
    const entries = Array.from(this.services.entries());
    for (const [name, service] of entries) {
      try {
        await service.initialize();
        console.log(`Service '${name}' initialized successfully`);
      } catch (error) {
        console.error(`Failed to initialize service '${name}':`, error);
      }
    }
  }

  /**
   * Register a service with the container
   * @param name Service name
   * @param service Service instance
   */
  public register(name: string, service: IService): void {
    this.services.set(name, service);
  }

  /**
   * Get a service from the container
   * @param name Service name
   * @returns Service instance
   */
  public get<T extends IService>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }
    return service as T;
  }

  /**
   * Get AI service
   */
  public getAIService(): AIService {
    return this.get<AIService>("ai");
  }

  /**
   * Get PDF service
   */
  public getPDFService(): PDFService {
    return this.get<PDFService>("pdf");
  }

  /**
   * Get Email service
   */
  public getEmailService(): EmailService {
    return this.get<EmailService>("email");
  }
}