// @ts-nocheck
export interface CompanyPost {
  id: string;
  companyId: string;
  companyName?: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  timestamp: number;
  pinned?: boolean;
  likesCount: number;
  commentsCount: number;
  category?: string;
  metrics?: Array<{ label: string; value: string }>;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

const STORAGE_KEY = "mansa_company_newsfeed_posts";

export function getAllStoredPosts(): CompanyPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function saveAllPosts(posts: CompanyPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent("mansa_company_posts_updated"));
  } catch (err) {
    console.error("Erreur sauvegarde actualités :", err);
  }
}

export function getPostsForCompany(companyId: string, companyName?: string): CompanyPost[] {
  const all = getAllStoredPosts();
  const normalizedId = (companyId || "").trim().toLowerCase();
  const normalizedName = (companyName || "").trim().toLowerCase();

  const filtered = all.filter((p) => {
    const pId = (p.companyId || "").trim().toLowerCase();
    const pName = (p.companyName || "").trim().toLowerCase();
    return pId === normalizedId || (normalizedName && pName && pName === normalizedName);
  });

  return filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.timestamp - a.timestamp;
  });
}

export function createCompanyPost(
  companyId: string,
  companyName: string,
  data: {
    title: string;
    content: string;
    authorName: string;
    pinned?: boolean;
    category?: string;
  }
): CompanyPost {
  const all = getAllStoredPosts();
  const newPost: CompanyPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    companyName,
    title: data.title.trim(),
    content: data.content.trim(),
    authorName: data.authorName || companyName,
    createdAt: "À l'instant",
    timestamp: Date.now(),
    pinned: Boolean(data.pinned),
    likesCount: 0,
    commentsCount: 0,
    category: data.category || "Annonce",
  };

  const updated = [newPost, ...all];
  saveAllPosts(updated);
  return newPost;
}

export function deleteCompanyPost(postId: string, companyId: string): void {
  const all = getAllStoredPosts();
  const normalizedId = (companyId || "").trim().toLowerCase();
  const updated = all.filter(
    (p) => !(p.id === postId && (p.companyId.trim().toLowerCase() === normalizedId))
  );
  saveAllPosts(updated);
}
