import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

/**
 * Factory for creating rate limiters
 * Uses express-rate-limit package
 */
export class RateLimitMiddleware {
  /**
   * Create a general API rate limiter
   * Limits requests to 100 per 15 minutes
   */
  public static createAPILimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      message: {
        error: "Too many requests",
        message: "Too many requests from this IP, please try again after 15 minutes",
      },
    });
  }

  /**
   * Create a stricter rate limiter for assessment endpoints
   * Limits to 10 requests per hour
   */
  public static createAssessmentLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 assessment requests per hour
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "Too many assessment requests",
        message: "You can only submit 10 assessments per hour",
      },
    });
  }

  /**
   * Create a PDF generation rate limiter
   * Limits to 20 requests per hour
   */
  public static createPDFLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // limit each IP to 20 PDF generations per hour
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "Too many PDF generation requests",
        message: "You can only generate 20 PDFs per hour",
      },
    });
  }

  /**
   * Create an email sending rate limiter
   * Limits to 5 requests per hour
   */
  public static createEmailLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // limit each IP to 5 emails per hour
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "Too many email requests",
        message: "You can only send 5 emails per hour",
      },
    });
  }
}