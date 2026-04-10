import { NotificationService } from "@/lib/services/notification-service";
import { FavoriteService } from "@/lib/services/favorite-service";
import { SubmissionService } from "@/lib/services/submission-service";
import { ToolService } from "@/lib/services/tool-service";
import { UserActivityService } from "@/lib/services/user-activity-service";

export class UserDashboardService {
  static async getDashboard(userId: string) {
    const [favorites, submissions, activity, notifications, unreadNotificationCount, todayFeed] = await Promise.all([
      FavoriteService.listFavoritesForUser(userId, { page: 1, limit: 6 }),
      SubmissionService.listSubmissionsForUser(userId, { page: 1, limit: 6 }),
      UserActivityService.listActivitiesForUser(userId, 10),
      NotificationService.listNotificationsForUser(userId, 8),
      NotificationService.countUnreadForUser(userId),
      ToolService.getTodayToolsFeed(6)
    ]);
    const favoriteTools = favorites.data.map((item) => item.tool);
    const excludedSlugs = new Set(favoriteTools.map((tool) => tool.slug));
    const categoryCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();

    favoriteTools.forEach((tool) => {
      categoryCounts.set(tool.categorySlug, (categoryCounts.get(tool.categorySlug) ?? 0) + 1);

      tool.tags.forEach((tag) => {
        const normalizedTag = tag.trim().toLowerCase();

        if (!normalizedTag) {
          return;
        }

        tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) ?? 0) + 1);
      });
    });

    const favoriteCategorySlugs = [...categoryCounts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 3)
      .map(([slug]) => slug);
    const favoriteTags = [...tagCounts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 6)
      .map(([tag]) => tag);

    const personalizedCandidates =
      favoriteCategorySlugs.length || favoriteTags.length
        ? await ToolService.listCollectionTools({
            categorySlugs: favoriteCategorySlugs,
            tags: favoriteTags,
            limit: 12
          })
        : [];
    const personalizedTools = personalizedCandidates
      .filter((tool) => !excludedSlugs.has(tool.slug))
      .slice(0, 3);
    const fallbackTools = [...todayFeed.trendingToday, ...todayFeed.editorPicks, ...todayFeed.todayNew]
      .filter((tool, index, collection) => {
        if (excludedSlugs.has(tool.slug)) {
          return false;
        }

        return collection.findIndex((entry) => entry.slug === tool.slug) === index;
      })
      .slice(0, 3);

    return {
      favorites,
      submissions,
      activity,
      notifications: {
        data: notifications,
        unreadCount: unreadNotificationCount
      },
      dailyPicks: {
        personalized: personalizedTools.length > 0,
        tools: personalizedTools.length > 0 ? personalizedTools : fallbackTools,
        categorySlugs: favoriteCategorySlugs,
        tags: favoriteTags.slice(0, 3)
      }
    };
  }
}
