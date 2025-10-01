/**
 * Error Reporting API Endpoint
 * Captures and logs application errors for monitoring and debugging
 */

import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
import { withApiMiddleware } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';

interface ErrorReport {
  id: string;
  type: string;
  severity: string;
  message: string;
  code?: string | number;
  metadata: {
    timestamp: string;
    userAgent?: string;
    url?: string;
    userId?: string;
    sessionId?: string;
    stackTrace?: string;
    context?: Record<string, any>;
  };
}

async function handleErrorReport(request: NextRequest) {
  try {
    const errorReport: ErrorReport = await request.json();
    
    // Validate error report
    if (!errorReport.id || !errorReport.type || !errorReport.message) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid error report format',
          code: 'INVALID_ERROR_REPORT'
        },
        { status: 400 }
      );
    }

    // Log the error
    logger.error('Client-side error reported:', {
      errorId: errorReport.id,
      type: errorReport.type,
      severity: errorReport.severity,
      message: errorReport.message,
      code: errorReport.code,
      metadata: errorReport.metadata
    });

    // Store in database for persistence and analysis
    try {
      await executeQuery(`
        INSERT INTO error_reports (
          error_id,
          error_type,
          severity,
          message,
          error_code,
          user_agent,
          url,
          user_id,
          session_id,
          stack_trace,
          context_data,
          reported_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        errorReport.id,
        errorReport.type,
        errorReport.severity,
        errorReport.message,
        errorReport.code?.toString() || null,
        errorReport.metadata.userAgent || null,
        errorReport.metadata.url || null,
        errorReport.metadata.userId || null,
        errorReport.metadata.sessionId || null,
        errorReport.metadata.stackTrace || null,
        JSON.stringify(errorReport.metadata.context || {}),
        errorReport.metadata.timestamp
      ]);
    } catch (dbError) {
      // If database insertion fails, still log but don't fail the request
      logger.error('Failed to store error report in database:', dbError);
    }

    // For high severity errors, trigger additional actions
    if (errorReport.severity === 'HIGH' || errorReport.severity === 'CRITICAL') {
      // Could send email alerts, Slack notifications, etc.
      logger.warn('High severity error reported:', {
        errorId: errorReport.id,
        type: errorReport.type,
        message: errorReport.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Error report received and processed',
      errorId: errorReport.id
    });

  } catch (error) {
    logger.error('Error processing error report:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process error report',
        code: 'ERROR_REPORT_PROCESSING_FAILED'
      },
      { status: 500 }
    );
  }
}

// Database table creation utilities
async function createErrorReportsTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS error_reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        error_id VARCHAR(255) UNIQUE NOT NULL,
        error_type VARCHAR(100) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        error_code VARCHAR(100),
        user_agent TEXT,
        url TEXT,
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        stack_trace TEXT,
        context_data TEXT,
        reported_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes separately
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_error_type ON error_reports(error_type)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_severity ON error_reports(severity)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_reported_at ON error_reports(reported_at)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_user_id ON error_reports(user_id)');
  } catch (error) {
    logger.error('Error creating error_reports table:', error);
  }
}

// Error analytics endpoint
async function getErrorAnalytics(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const errorType = searchParams.get('type');
    const severity = searchParams.get('severity');
    
    let timeCondition = '';
    switch (timeRange) {
      case '1h':
        timeCondition = "reported_at >= datetime('now', '-1 hour')";
        break;
      case '24h':
        timeCondition = "reported_at >= datetime('now', '-1 day')";
        break;
      case '7d':
        timeCondition = "reported_at >= datetime('now', '-7 days')";
        break;
      case '30d':
        timeCondition = "reported_at >= datetime('now', '-30 days')";
        break;
      default:
        timeCondition = "reported_at >= datetime('now', '-1 day')";
    }

    let whereClause = `WHERE ${timeCondition}`;
    const params: any[] = [];

    if (errorType) {
      whereClause += ' AND error_type = ?';
      params.push(errorType);
    }

    if (severity) {
      whereClause += ' AND severity = ?';
      params.push(severity);
    }

    // Get error counts by type
    const errorsByType = await executeQuery(`
      SELECT error_type, COUNT(*) as count
      FROM error_reports
      ${whereClause}
      GROUP BY error_type
      ORDER BY count DESC
    `, params);

    // Get error counts by severity
    const errorsBySeverity = await executeQuery(`
      SELECT severity, COUNT(*) as count
      FROM error_reports
      ${whereClause}
      GROUP BY severity
      ORDER BY 
        CASE severity
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          WHEN 'LOW' THEN 4
          ELSE 5
        END
    `, params);

    // Get recent errors
    const recentErrors = await executeQuery(`
      SELECT error_id, error_type, severity, message, reported_at, url
      FROM error_reports
      ${whereClause}
      ORDER BY reported_at DESC
      LIMIT 50
    `, params);

    // Get error trends (hourly counts for the time range)
    const trends = await executeQuery(`
      SELECT 
        strftime('%Y-%m-%d %H:00:00', reported_at) as hour,
        COUNT(*) as count
      FROM error_reports
      ${whereClause}
      GROUP BY strftime('%Y-%m-%d %H:00:00', reported_at)
      ORDER BY hour DESC
      LIMIT 24
    `, params);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          timeRange,
          totalErrors: Array.isArray(recentErrors) ? recentErrors.length : 0,
          errorsByType,
          errorsBySeverity
        },
        trends,
        recentErrors
      }
    });

  } catch (error) {
    logger.error('Error fetching error analytics:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch error analytics',
        code: 'ANALYTICS_FETCH_FAILED'
      },
      { status: 500 }
    );
  }
}

// Apply middleware and export handlers
export const POST = withApiMiddleware(handleErrorReport);
export const GET = withApiMiddleware(getErrorAnalytics);

// Initialize error reports table on module load
if (process.env.NODE_ENV !== 'test') {
  createErrorReportsTable().catch(error => {
    logger.error('Failed to create error_reports table:', error);
  });
}
