'use client';

import { useState } from "react";
import { AppShell, type Screen } from "@/components/AppShell";
import { SystemDesignScreen } from "@/features/system-design/SystemDesignScreen";
import { FeedSetupScreen } from "@/features/feed-setup/FeedSetupScreen";
import { ROConfigScreen } from "@/features/ro-config/ROConfigScreen";
import { ReportScreen } from "@/features/reporting/ReportScreen";
import { ProjectProfileScreen } from "@/features/project-profile/ProjectProfileScreen";

const Studio = () => {
  const [screen, setScreen] = useState<Screen>("design");
  const [units, setUnits] = useState<"SI" | "US">("SI");

  return (
    <AppShell active={screen} onChange={setScreen} units={units} onUnits={setUnits}>
      {screen === "profile" && <ProjectProfileScreen />}
      {screen === "design" && <SystemDesignScreen />}
      {screen === "feed" && <FeedSetupScreen />}
      {screen === "config" && <ROConfigScreen />}
      {screen === "report" && <ReportScreen />}
    </AppShell>
  );
};

export default Studio;
