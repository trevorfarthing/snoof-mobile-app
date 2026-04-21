import { HeroCard } from "@/components/dashboard/hero-card";
import { QuickLog } from "@/components/dashboard/quick-log";
import { colors } from "@/constants/colors";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleHeroLoadingChange = useCallback(
    (loading: boolean) => {
      if (refreshing && !loading) {
        setRefreshing(false);
      }
    },
    [refreshing],
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgBase }}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <HeroCard
        refreshKey={refreshKey}
        onLoadingChange={handleHeroLoadingChange}
      />
      <QuickLog />
    </ScrollView>
  );
}
