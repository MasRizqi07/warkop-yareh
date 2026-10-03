export interface GalleryAssetDto {
  id: string;
  title: string;
  caption: string | null;
  imageUrl: string;
  branchId: string | null;
  provenance: string;
  isVerified: boolean;
  sourceUrl: string | null;
  sourceType: string | null;
  capturedAt: string | null;
  lastVerifiedAt: string | null;
  updatedAt: string;
}

export interface SiteDraftDto {
  id: string;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  isPublished: boolean;
  updatedAt: string;
  metadata: { confidence?: string; sourceReference?: string | null } | null;
}
