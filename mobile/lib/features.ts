type FeatureKey =
  | 'onlineClasses'
  | 'libraryManagement'
  | 'smsNotifications'
  | 'whatsappAutomation'
  | 'aiChatbot'
  | 'advancedAnalytics'
  | 'feePayment'
  | 'transportTracking'

let features: Record<string, boolean> = {}

try {
  features = require('./features.json')
} catch {
  // features.json not yet generated
}

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return features[feature] === true
}
