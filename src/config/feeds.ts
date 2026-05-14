export type FeedCategory = "war" | "breaking" | "general";

export interface FeedSource {
  name: string;
  url: string;
  color?: string;
  category: FeedCategory;
}

export const CATEGORY_LABELS: Record<FeedCategory, string> = {
  war: "War Focused",
  breaking: "Breaking News",
  general: "General / Analysis",
};

export const CATEGORY_COLORS: Record<FeedCategory, string> = {
  war: "#ef4444",
  breaking: "#f59e0b",
  general: "#6b7280",
};

export const CATEGORY_ORDER: FeedCategory[] = ["war", "breaking", "general"];

export const RSS_FEEDS: FeedSource[] = [
  // ══════════════════════════════════════════════════
  // WAR FOCUSED — conflict, military, humanitarian
  // ══════════════════════════════════════════════════
  { name: "LBC War", url: "https://www.lbcgroup.tv/Rss/News/ar/123/%D8%AE%D8%A8%D8%B1-%D8%B9%D8%A7%D8%AC%D9%84", color: "#e11d48", category: "war" },
  { name: "ReliefWeb LB", url: "https://reliefweb.int/updates/rss.xml?country=Lebanon", color: "#0891b2", category: "war" },
  { name: "OCHA Lebanon", url: "https://reliefweb.int/updates/rss.xml?search=source%3Aocha+AND+country%3Alebanon", color: "#0277bd", category: "war" },
  { name: "UN Middle East", url: "https://news.un.org/feed/subscribe/en/news/region/middle-east/feed/rss.xml", color: "#1976d2", category: "war" },
  { name: "UN Peace", url: "https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml", color: "#1565c0", category: "war" },
  { name: "ME Monitor", url: "https://www.middleeastmonitor.com/feed/", color: "#d32f2f", category: "war" },
  { name: "ME Eye", url: "https://www.middleeasteye.net/rss", color: "#1565c0", category: "war" },
  { name: "Al Manar", url: "https://www.almanar.com.lb/rss", color: "#ffd700", category: "war" },
  { name: "+972 Mag", url: "https://www.972mag.com/feed/", color: "#7b1fa2", category: "war" },
  { name: "Mondoweiss", url: "https://mondoweiss.net/feed/", color: "#4e342e", category: "war" },
  { name: "Elec. Intifada", url: "https://electronicintifada.net/rss.xml", color: "#c62828", category: "war" },
  { name: "Crisis Group", url: "https://www.crisisgroup.org/rss.xml", color: "#b71c1c", category: "war" },
  { name: "Bellingcat", url: "https://www.bellingcat.com/feed/", color: "#ff6f00", category: "war" },
  { name: "MSF", url: "https://www.msf.org/rss/all", color: "#e53935", category: "war" },
  { name: "Amnesty", url: "https://www.amnesty.org/en/feed/", color: "#fdd835", category: "war" },
  { name: "Defense News", url: "https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml", color: "#37474f", category: "war" },
  { name: "War on Rocks", url: "https://warontherocks.com/feed/", color: "#455a64", category: "war" },

  // ══════════════════════════════════════════════════
  // BREAKING NEWS — fast-moving, includes conflict
  // ══════════════════════════════════════════════════
  { name: "LBC Breaking", url: "https://www.lbcgroup.tv/Rss/News/ar/2/%D8%B9%D8%A7%D8%AC%D9%84", color: "#e11d48", category: "breaking" },
  { name: "LBC Latest", url: "https://www.lbcgroup.tv/Rss/latest-news/ar", color: "#e11d48", category: "breaking" },
  { name: "Al Jadeed Latest", url: "https://www.aljadeed.tv/Rss/latest-news", color: "#dc2626", category: "breaking" },
  { name: "Al Jadeed Highlights", url: "https://www.aljadeed.tv/Rss/NewsHighlights", color: "#dc2626", category: "breaking" },
  { name: "NNA", url: "https://nna-leb.gov.lb/ar/rss", color: "#2563eb", category: "breaking" },
  { name: "The961", url: "https://www.the961.com/feed/", color: "#d84315", category: "breaking" },
  { name: "Times of Israel", url: "https://www.timesofisrael.com/feed/", color: "#0d47a1", category: "breaking" },
  { name: "JPost Headlines", url: "https://www.jpost.com/Rss/RssFeedsHeadlines.aspx", color: "#1a237e", category: "breaking" },
  { name: "JPost Defense", url: "https://www.jpost.com/rss/rssfeedsdefense.aspx", color: "#283593", category: "breaking" },
  { name: "Al Jazeera EN", url: "https://www.aljazeera.com/xml/rss/all.xml", color: "#d4a017", category: "breaking" },
  { name: "BBC ME", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", color: "#b71c1c", category: "breaking" },
  { name: "Al Hurra", url: "https://www.alhurra.com/api/feeds/rss", color: "#1e88e5", category: "breaking" },
  { name: "Anadolu", url: "https://www.aa.com.tr/en/rss/default?cat=world", color: "#e65100", category: "breaking" },

  // ══════════════════════════════════════════════════
  // GENERAL / ANALYSIS — broader Middle East coverage
  // ══════════════════════════════════════════════════
  // Arabic sources
  { name: "Al Jazeera AR", url: "https://www.aljazeera.net/feed", color: "#d4a843", category: "general" },
  { name: "Sky News Arabia", url: "https://www.skynewsarabia.com/rss.xml", color: "#0369a1", category: "general" },
  { name: "Sky News Arabia Today", url: "https://www.skynewsarabia.com/rss/apple/podcasts/todays_news.xml", color: "#0369a1", category: "general" },
  { name: "BBC Arabic", url: "https://feeds.bbci.co.uk/arabic/rss.xml", color: "#b91c1c", category: "general" },
  { name: "BBC AR ME", url: "https://feeds.bbci.co.uk/arabic/middleeast/rss.xml", color: "#880e4f", category: "general" },
  { name: "France 24 AR", url: "https://www.france24.com/ar/rss", color: "#2563eb", category: "general" },
  { name: "DW Arabic", url: "https://rss.dw.com/xml/rss-ar-all", color: "#0097a7", category: "general" },
  { name: "Annahar", url: "https://www.annahar.com/arabic/rss-feed", color: "#1d4ed8", category: "general" },
  { name: "Al Arabiya World", url: "https://www.alarabiya.net/feed/rss2/ar/arab-and-world.xml", color: "#c2410c", category: "general" },
  { name: "Al Arabiya Last Page", url: "https://www.alarabiya.net/feed/rss2/ar/last-page.xml", color: "#c2410c", category: "general" },
  { name: "Asharq Al-Awsat", url: "https://www.aawsat.com/feed", color: "#0f766e", category: "general" },
  { name: "Lebanon Debate", url: "https://www.lebanondebate.com/rss", color: "#8b5cf6", category: "general" },
  { name: "Al Quds", url: "https://www.alquds.co.uk/feed/", color: "#004d40", category: "general" },
  { name: "Rai Al Youm", url: "https://raialyoum.com/feed/", color: "#1b5e20", category: "general" },
  { name: "Lebanese Forces", url: "https://www.lebanese-forces.com/feed", color: "#c61c36", category: "general" },
  

  // English sources
  { name: "Al-Monitor", url: "https://www.al-monitor.com/rss", color: "#00695c", category: "general" },
  { name: "The New Arab", url: "https://www.newarab.com/rss", color: "#00838f", category: "general" },
  { name: "Guardian ME", url: "https://www.theguardian.com/world/middleeast/rss", color: "#0d47a1", category: "general" },
  { name: "Foreign Policy", url: "https://foreignpolicy.com/feed/", color: "#263238", category: "general" },
];
