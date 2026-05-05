import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' })
    }

    next()
  }
}

export const requireAdmin = requireRole('ADMIN')
export const requireTeacher = requireRole('ADMIN', 'TEACHER')
export const requireStaff = requireRole('ADMIN', 'TEACHER')
export const requireParent = requireRole('ADMIN', 'TEACHER', 'PARENT')
export const requireStudent = requireRole('ADMIN', 'TEACHER', 'STUDENT')
export const requireAll = requireRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
