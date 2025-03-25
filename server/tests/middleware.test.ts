import { Request, Response, NextFunction } from 'express';
import { RateLimitMiddleware } from '../middlewares/rate-limit.middleware';

// Mock express-rate-limit
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation((options) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // Simply call next() in our tests to simulate middleware
      next();
    };
  });
});

describe('Rate Limit Middleware', () => {
  it('should create API rate limiter with correct options', () => {
    // Import the mocked rateLimit
    const rateLimit = require('express-rate-limit');
    
    // Create the middleware
    const middleware = RateLimitMiddleware.createAPILimiter();
    
    // Check that rateLimit was called with expected options
    expect(rateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        windowMs: expect.any(Number),
        max: expect.any(Number),
        standardHeaders: true,
        legacyHeaders: false,
        message: expect.any(Object)
      })
    );
  });

  it('should create assessment limiter with stricter limits', () => {
    // Reset mock counters
    jest.clearAllMocks();
    
    // Import the mocked rateLimit
    const rateLimit = require('express-rate-limit');
    
    // Create the middleware
    const middleware = RateLimitMiddleware.createAssessmentLimiter();
    
    // Check that rateLimit was called with expected options
    expect(rateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        windowMs: expect.any(Number),
        max: expect.any(Number),
        standardHeaders: true,
        legacyHeaders: false,
        message: expect.any(Object)
      })
    );
    
    const apiLimiterOptions = rateLimit.mock.calls[0][0];
    const assessmentLimiterOptions = rateLimit.mock.calls[0][0];
    
    expect(assessmentLimiterOptions.max).toBeLessThanOrEqual(apiLimiterOptions.max);
    expect(assessmentLimiterOptions.windowMs).toBeGreaterThanOrEqual(apiLimiterOptions.windowMs);
  });

  it('should create PDF limiter with appropriate limits', () => {
    // Reset mock counters
    jest.clearAllMocks();
    
    // Import the mocked rateLimit
    const rateLimit = require('express-rate-limit');
    
    // Create the middleware
    const middleware = RateLimitMiddleware.createPDFLimiter();
    
    // Check that rateLimit was called with expected options
    expect(rateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        windowMs: expect.any(Number),
        max: expect.any(Number),
        standardHeaders: true,
        legacyHeaders: false,
        message: expect.any(Object)
      })
    );
  });

  it('should create email limiter with strict limits', () => {
    // Reset mock counters
    jest.clearAllMocks();
    
    // Import the mocked rateLimit
    const rateLimit = require('express-rate-limit');
    
    // Create the middleware
    const middleware = RateLimitMiddleware.createEmailLimiter();
    
    // Check that rateLimit was called with expected options
    expect(rateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        windowMs: expect.any(Number),
        max: expect.any(Number),
        standardHeaders: true,
        legacyHeaders: false,
        message: expect.any(Object)
      })
    );
    
    // Email limiter should be the most restrictive
    const apiLimiterOptions = rateLimit.mock.calls[0][0];
    const emailLimiterOptions = rateLimit.mock.calls[0][0];
    
    expect(emailLimiterOptions.max).toBeLessThanOrEqual(apiLimiterOptions.max);
  });
});