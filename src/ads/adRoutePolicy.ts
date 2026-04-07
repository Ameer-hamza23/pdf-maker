/**
 * Fullscreen interstitials should not cover heavy / fullscreen flows (editors, camera).
 * Banner placements are controlled per-screen separately.
 */
const BLOCKED_SEGMENTS = [
  "edit-pdf",
  "edit-images",
  "convert-pdf",
  "convert-images",
  "scan",
] as const;

function normalizePath(pathname: string | undefined): string {
  if (!pathname || typeof pathname !== "string") {
    return "";
  }
  return pathname.replace(/\/+$/, "").toLowerCase();
}

export function shouldShowInterstitialForPath(
  pathname: string | undefined,
): boolean {
  const p = normalizePath(pathname);
  if (p === "") {
    return false;
  }
  for (const seg of BLOCKED_SEGMENTS) {
    if (p.includes(seg)) {
      return false;
    }
  }
  return true;
}
