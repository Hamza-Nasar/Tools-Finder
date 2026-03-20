import { FavoriteService } from "@/lib/services/favorite-service";
import { SubmissionService } from "@/lib/services/submission-service";
import { UserActivityService } from "@/lib/services/user-activity-service";

export class UserDashboardService {
  static async getDashboard(userId: string) {
    const [favorites, submissions, activity] = await Promise.all([
      FavoriteService.listFavoritesForUser(userId, { page: 1, limit: 6 }),
      SubmissionService.listSubmissionsForUser(userId, { page: 1, limit: 6 }),
      UserActivityService.listActivitiesForUser(userId, 10)
    ]);

    return {
      favorites,
      submissions,
      activity
    };
  }
}
