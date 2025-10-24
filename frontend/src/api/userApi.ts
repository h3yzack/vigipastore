import { apiClient } from "@/api/baseApi";
import { getApiErrorMessage } from "@/common/utils/exceptionUtils";
import { appConfig } from "@/common/appConfig";
import type { UserInfo } from "@/common/types/userInfo";

export async function getUserInfo(userId: string): Promise<UserInfo> {
  try {
    const response = await apiClient.get(appConfig.API.ENDPOINTS.USER_PROFILE.replace(':id', userId));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}