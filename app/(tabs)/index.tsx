import { CareStreakCard } from "@/components/dashboard/care-streak-card";
import { HeroCard } from "@/components/dashboard/hero-card";
import { QuickLog } from "@/components/dashboard/quick-log";
import { ActionModal } from "@/components/dashboard/quick-log/action-modal";
import type { ActivityType } from "@/components/dashboard/quick-log/activity-config";
import { SnoofAiInsightCard } from "@/components/dashboard/snoof-ai-insight-card";
import { TodayLogList } from "@/components/dashboard/today-log-list";
import { useCareStreak } from "@/lib/hooks/use-care-streak";
import { useSnoofAiInsight } from "@/lib/hooks/use-snoof-ai-insight";
import {
  buildOptimisticLog,
  mapLogToInitialValues,
} from "@/components/dashboard/today-log-list/mapper";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { colors } from "@/constants/colors";
import {
  useTodayLogs,
  type TodayLog,
} from "@/lib/hooks/activity-logs/use-today-logs";
import { usePetStore } from "@/lib/stores/use-pet-store";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

const DashboardScreen = () => {
  const { activePet } = usePetStore();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewingLog, setViewingLog] = useState<TodayLog | null>(null);

  const todayLogs = useTodayLogs(activePet?.id ?? null, refreshKey);
  const careStreak = useCareStreak(activePet?.id ?? null, refreshKey);
  const aiInsight = useSnoofAiInsight(activePet?.id ?? null, refreshKey);

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

  const handleLogged = useCallback(
    (type: ActivityType) => {
      todayLogs.addOptimistic(buildOptimisticLog(type));
    },
    [todayLogs],
  );

  const closeViewModal = useCallback(() => setViewingLog(null), []);

  // Edit and delete from the view-modal both flow through onLogged: the form
  // calls it after a successful update or delete. Bumping refreshKey reloads
  // HeroCard daily stats and refetches today's logs — same path as creation.
  const handleViewModalChanged = useCallback(() => {
    onRefresh();
    closeViewModal();
  }, [onRefresh, closeViewModal]);

  const viewInitialValues = useMemo(
    () => (viewingLog ? mapLogToInitialValues(viewingLog) : undefined),
    [viewingLog],
  );

  return (
    <>
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
        <QuickLog onRefresh={onRefresh} onLogged={handleLogged} />
        <TodayLogList logs={todayLogs.logs} onRowPress={setViewingLog} />
        <CareStreakCard
          days={careStreak.days}
          currentStreak={careStreak.currentStreak}
          longestStreak={careStreak.longestStreak}
          loading={careStreak.loading}
        />
        <SnoofAiInsightCard
          state={aiInsight}
          onDiscussPress={() => {
            // TODO: navigate to Snoof AI screen
          }}
        />
      </ScrollView>

      <BottomSheet
        visible={viewingLog !== null}
        onClose={closeViewModal}
        title={viewingLog ? "Log details" : undefined}
        snapHeight={0.9}
      >
        {viewingLog ? (
          <ActionModal
            activityType={viewingLog.type}
            onClose={closeViewModal}
            onLogged={handleViewModalChanged}
            readOnly
            initialValues={viewInitialValues}
          />
        ) : null}
      </BottomSheet>
    </>
  );
};

export default DashboardScreen;
