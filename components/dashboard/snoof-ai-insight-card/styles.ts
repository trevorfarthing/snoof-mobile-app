import { colors, radii, spacing } from "@/constants/colors";
import { fonts, fontSizes } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing[3],
    marginTop: spacing[5],
    marginBottom: spacing[2],
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.lg,
    padding: spacing[4],
  },

  /* ── Header row ─────────────────────────────────────────────────── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.circle,
    backgroundColor: "rgba(200, 103, 46, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.caption,
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  /* ── Body text ──────────────────────────────────────────────────── */
  body: {
    fontFamily: fonts.nunito,
    fontSize: fontSizes.secondary,
    color: colors.textPrimary,
    lineHeight: fontSizes.caption * 1.55,
    marginBottom: spacing[3],
  },
  bodyFunFact: {
    color: colors.textSecondary,
  },
  nudge: {
    fontFamily: fonts.nunito,
    fontSize: fontSizes.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
    marginBottom: spacing[3],
  },

  /* ── CTA link ───────────────────────────────────────────────────── */
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
  },
  ctaText: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.secondary,
    color: colors.primary,
    letterSpacing: 0.2,
  },

  /* ── Skeleton loading state ─────────────────────────────────────── */
  skeletonLine: {
    height: 12,
    borderRadius: radii.sm,
    backgroundColor: colors.bgWarm,
    marginBottom: spacing[2],
  },
  skeletonShort: {
    width: "55%",
  },
});
