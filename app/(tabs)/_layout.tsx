import { AppHeader } from "@/components/ui/app-header";
import { AppNav } from "@/components/ui/app-nav/app-nav";
import { colors } from "@/constants/colors";
import { useMemo, useState } from "react";
import { Dimensions, View } from "react-native";
import { Route, SceneMap, TabView } from "react-native-tab-view";
import ActivityScreen from "./activity";
import HealthScreen from "./health";
import DashboardScreen from "./index";
import PetScreen from "./pet";
import TrainingScreen from "./training";

const ROUTES: Route[] = [
  { key: "pet", title: "Pet" },
  { key: "dashboard", title: "Dashboard" },
  { key: "health", title: "Health" },
  { key: "activity", title: "Activity" },
  { key: "training", title: "Training" },
];

const renderScene = SceneMap({
  pet: PetScreen,
  dashboard: DashboardScreen,
  health: HealthScreen,
  activity: ActivityScreen,
  training: TrainingScreen,
});

const INITIAL_LAYOUT = { width: Dimensions.get("window").width };

// Default to Dashboard (index 1)
const DASHBOARD_INDEX = 1;

const TabsLayout = () => {
  const [index, setIndex] = useState(DASHBOARD_INDEX);
  const routes = useMemo(() => ROUTES, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }}>
      <AppHeader />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={(props) => <AppNav {...props} />}
        initialLayout={INITIAL_LAYOUT}
      />
    </View>
  );
};

export default TabsLayout;
