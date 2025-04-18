import apiClient from './api/interceptors';

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  fullName: string;
  profile_img_url?: string;
}

export interface UserDetails {
  user: {
    user_id: string;
    profile_img_url: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_no: string;
    division: string;
    department: string;
    reporting_to: {
      id: string;
      name: string;
    };
    hiring_date: string;
    class_id: string;
    internal_user_id: string;
    external_user_id: string;
    status: string;
    timezone?: string;
    created: {
      user: {
        id: string;
        name: string;
      };
      time: string;
    };
    updated: {
      user: {
        id: string;
        name: string;
      };
      time: string;
    };
    active: boolean;
    fullName: string;
    alreadyActivated: boolean;
  };
  workspace_roles_details: Record<string, any>;
}

// Staging
// const USERS_URL = 'https://eu2ccapsal001.eastus2.cloudapp.azure.com/uam/api/users';

//Dev
const USERS_URL = 'https://eu2ccapdagl001.eastus2.cloudapp.azure.com/uam/api/users';

export const fetchUsers = async (workspaceId: string): Promise<User[]> => {
  try {
    const response = await apiClient.post(USERS_URL, {
      params: {
        status: 'ACTIVE'
      },
      headers: {
        'X-WORKSPACE-ID': workspaceId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchUsersSummary = async (workspaceId: string): Promise<User[]> => {
  try {
    // Encode the workspaceId to ensure proper handling of special characters
    const encodedWorkspaceId = encodeURIComponent(workspaceId);
    const response = await apiClient.post(`${USERS_URL}/summary?workspace_id=${encodedWorkspaceId}`, {
      data: {
        status: 'ACTIVE'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Fetch user details by user IDs
 * @param workspaceId The workspace ID
 * @param userIds Array of user IDs to fetch details for
 * @returns Promise with array of user details
 */
export const fetchUsersByIds = async (workspaceId: string, userIds: string[]): Promise<User[]> => {
  try {
    // Encode the workspaceId to ensure proper handling of special characters
    const encodedWorkspaceId = encodeURIComponent(workspaceId);
    const response = await apiClient.post(`${USERS_URL}/summary?workspace_id=${encodedWorkspaceId}`, {
      userIds: userIds,
      status: 'ACTIVE'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users by IDs:', error);
    return []; // Return empty array instead of throwing to prevent UI crashes
  }
};

export const fetchUserDetails = async (userId: string, workspaceId: string): Promise<UserDetails> => {
  try {
    console.log(`Fetching user details from ${USERS_URL}/${userId} with workspace ID ${workspaceId}`);
    const response = await apiClient.get(`${USERS_URL}/${userId}`, {
      headers: {
        'X-WORKSPACE-ID': workspaceId
      }
    });
    console.log('User details response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};