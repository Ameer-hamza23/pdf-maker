import { StaticBannerAd } from "@/src/ads/components/StaticBannerAd";

type Props = {
  visible?: boolean;
};

export function AdBanner({ visible = true }: Props) {
  return <StaticBannerAd visible={visible} />;
}
