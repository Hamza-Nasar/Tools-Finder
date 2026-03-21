import { ToolService } from "@/lib/services/tool-service";

export class ToolAnalyticsService {
  static async recordToolView(slug: string) {
    return ToolService.recordViewBySlug(slug);
  }

  static async recordAffiliateClick(slug: string) {
    return ToolService.recordClickBySlug(slug);
  }

  static async recordComparisonClick(slugs: string[]) {
    const uniqueSlugs = Array.from(new Set(slugs.map((slug) => slug.trim()).filter(Boolean)));

    if (!uniqueSlugs.length) {
      return [];
    }

    return Promise.all(uniqueSlugs.map((slug) => ToolService.recordComparisonClickBySlug(slug)));
  }
}
