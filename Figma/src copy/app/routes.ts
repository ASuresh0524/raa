/* routes – v5 signup flow */
import { createBrowserRouter } from "react-router";
import { MarketingLayout } from "./components/MarketingLayout";
import { HomePage } from "./components/HomePage";
import { ForCliniciansPage } from "./components/ForCliniciansPage";
import { ForOrganizationsPage } from "./components/ForOrganizationsPage";
import { SecurityPage } from "./components/SecurityPage";
import { HowItWorksPage } from "./components/HowItWorksPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { SignupClinicianPage } from "./components/SignupClinicianPage";
import { SignupOrgPage } from "./components/SignupOrgPage";
import { RoleSelect } from "./components/RoleSelect";
import { ClinicianLayout } from "./components/ClinicianLayout";
import { ClinicianDashboard } from "./components/ClinicianDashboard";
import { ClinicianTasks } from "./components/ClinicianTasks";
import { ClinicianPassport } from "./components/ClinicianPassport";
import { ClinicianRequests } from "./components/ClinicianRequests";
import { ClinicianRequestDetail } from "./components/ClinicianRequestDetail";
import { ClinicianShare } from "./components/ClinicianShare";
import { ClinicianSubmitVerification } from "./components/ClinicianSubmitVerification";
import { OrgLayout } from "./components/OrgLayout";
import { OrgDashboard } from "./components/OrgDashboard";
import { OrgProviders } from "./components/OrgProviders";
import { OrgProviderDetail } from "./components/OrgProviderDetail";
import { OrgRequests } from "./components/OrgRequests";
import { OrgRequestView } from "./components/OrgRequestView";
import { OrgSubmissions } from "./components/OrgSubmissions";
import { OrgSubmissionDetail } from "./components/OrgSubmissionDetail";
import { OrgNeedsAttention } from "./components/OrgNeedsAttention";
import { OrgTaskDetail } from "./components/OrgTaskDetail";
import { OrgMonitoring } from "./components/OrgMonitoring";
import { OrgReports } from "./components/OrgReports";
import { OrgSettings } from "./components/OrgSettings";
import { RejectionDetailPage } from "./components/RejectionDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MarketingLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "for-clinicians", Component: ForCliniciansPage },
      { path: "for-organizations", Component: ForOrganizationsPage },
      { path: "security", Component: SecurityPage },
      { path: "how-it-works", Component: HowItWorksPage },
    ],
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/signup/clinician",
    Component: SignupClinicianPage,
  },
  {
    path: "/signup/organization",
    Component: SignupOrgPage,
  },
  {
    path: "/role-select",
    Component: RoleSelect,
  },
  {
    path: "/app/clinician",
    Component: ClinicianLayout,
    children: [
      { index: true, Component: ClinicianDashboard },
      { path: "tasks", Component: ClinicianTasks },
      { path: "passport", Component: ClinicianPassport },
      { path: "requests", Component: ClinicianRequests },
      { path: "requests/:id", Component: ClinicianRequestDetail },
      { path: "share", Component: ClinicianShare },
      { path: "submit-verification", Component: ClinicianSubmitVerification },
      { path: "rejections/:id", Component: RejectionDetailPage },
    ],
  },
  {
    path: "/app/org",
    Component: OrgLayout,
    children: [
      { index: true, Component: OrgDashboard },
      { path: "providers", Component: OrgProviders },
      { path: "providers/:id", Component: OrgProviderDetail },
      { path: "requests", Component: OrgRequests },
      { path: "requests/:id", Component: OrgRequestView },
      { path: "submissions", Component: OrgSubmissions },
      { path: "submissions/:id", Component: OrgSubmissionDetail },
      { path: "rejections/:id", Component: RejectionDetailPage },
      { path: "attention", Component: OrgNeedsAttention },
      { path: "attention/:id", Component: OrgTaskDetail },
      { path: "monitoring", Component: OrgMonitoring },
      { path: "reports", Component: OrgReports },
      { path: "settings", Component: OrgSettings },
    ],
  },
]);