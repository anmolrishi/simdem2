// JSON Web Token
// {
//   "sub": "user123@weareverise.com",
//   "first_name": "user",
//   "last_name": "123",
//   "division": "EverAI Product",
//   "department": "Product Design dev",
//   "reporting_to": "charlie.white@weareverise.com",
//   "WS-2025-1001": {
//       "roles": {
//           "simulator": ["manager", "trainer"],
//           "qa_coaching": ["coach", "admin"],
//           "knowledge_miner": ["analyst", "manager"]
//       },
//       "permissions": {
//           "simulator": {
//               "training": ["read", "write"],
//               "playback": ["read"],
//               "dashboard_admin": ["read", "write"],
//               "dashboard_trainee": ["read"]
//           },
//           "qa_coaching": {
//               "training": ["read", "write"]
//           },
//           "knowledge_miner": {
//               "miner_module": ["read", "write"]
//           }
//       }
//   },
//   "WS-2025-1002": {
//       "roles": {
//           "simulator": ["manager", "trainer"],
//           "qa_coaching": ["coach", "admin"],
//           "knowledge_miner": ["analyst", "manager"]
//       },
//       "permissions": {
//           "simulator": {
//               "training": ["read", "write"],
//               "playback": ["read"],
//               "dashboard_admin": ["read", "write"],
//               "dashboard_trainee": ["read"]
//           },
//           "qa_coaching": {
//               "training": ["read", "write"]
//           },
//           "knowledge_miner": {
//               "miner_module": ["read", "write"]
//           }
//       }
//   },
//   "iat": 1612435154,  
//   "exp": 1612445154  
// }


import { authService } from '../services/authService';

// Map dashboard routes to their corresponding permission keys
export const PERMISSION_MAP: { [key: string]: string } = {
  '/dashboard': 'dashboard-trainee',
  '/dashboard-admin': 'dashboard-admin',
  '/dashboard-manager': 'dashboard-manager',
  '/training': 'training-plan',
  '/playback': 'playback',
  '/manage-simulations': 'manage-simulations',
  '/manage-training-plan': 'manage-training-plan',
  '/assign-simulations': 'assign-simulations',
  '/settings': 'settings', // Assuming everyone has access to settings
  '/support': 'support', // Assuming everyone has access to support
  '/feedback': 'feedback', // Assuming everyone has access to feedback
};

/**
 * Check if the user has permission to access a specific path
 * @param path The route path to check
 * @returns boolean indicating if the user has permission
 */
export const hasPermission = (path: string): boolean => {
  try {
    const user = authService.getCurrentUser();

    // Log for debugging
    console.log(`Checking permission for path: ${path}`);
    console.log('Current user:', user);

    if (!user) {
      console.log('No user found, denying access');
      return false;
    }

    // For paths that don't require specific permissions
    if (!PERMISSION_MAP[path]) {
      console.log(`No permission mapping for path ${path}, allowing access`);
      return true;
    }

    // Check if the user has the required permission
    const permissionKey = PERMISSION_MAP[path];
    const hasAccess = user.permissions[permissionKey] || false;

    console.log(`Permission key: ${permissionKey}, Has access: ${hasAccess}`);
    console.log('User permissions:', user.permissions);

    return hasAccess;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Check if the user has write permission for a specific path
 * @param path The route path to check
 * @returns boolean indicating if the user has write permission
 */
export const canWrite = (path: string): boolean => {
  try {
    const user = authService.getCurrentUser();
    if (!user) return false;

    // For paths that don't require specific permissions
    if (!PERMISSION_MAP[path]) return false;

    // Check if the user has the required permission with write access
    const permissionKey = `${PERMISSION_MAP[path]}_write`;
    return user.permissions[permissionKey] || false;
  } catch (error) {
    console.error('Error checking write permissions:', error);
    return false;
  }
}