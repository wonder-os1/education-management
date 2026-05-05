import { Request, Response, NextFunction } from 'express'
import { isFeatureEnabled } from '../config/features'

type FeatureName = 'onlineClasses' | 'examResults' | 'parentPortal' | 'assignmentSubmission' | 'libraryManagement' | 'transportManagement' | 'feeManagement' | 'attendanceTracking' | 'smsNotifications' | 'whatsappAutomation' | 'aiChatbot' | 'advancedAnalytics'

export function requireFeature(feature: FeatureName) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!isFeatureEnabled(feature)) {
      return res.status(403).json({
        success: false,
        error: `Feature "${feature}" is not enabled for this deployment`,
      })
    }
    next()
  }
}
