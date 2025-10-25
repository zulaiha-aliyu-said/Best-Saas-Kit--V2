import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { UsersRound, Shield, Eye, Clock, Zap, CheckCircle2, UserPlus, Settings } from "lucide-react";

export const metadata = {
  title: 'Team Collaboration | Features | RepurposeAI',
  description: 'Work together with your team on content creation, management, and distribution.',
};

export default function TeamManagementPage() {
  return (
    <FeatureDetailTemplate
      badge="Teams"
      badgeColor="bg-orange-600"
      title="Team Collaboration"
      description="Collaborate seamlessly with your team on content creation and management. Share access to content, manage team member roles and permissions, track team activity, and coordinate content strategies across your organization with powerful collaboration features."
      heroIcon={UsersRound}
      heroGradient="from-orange-500 to-red-500"
      ctaPrimary="Invite Your Team"
      ctaPrimaryLink="/dashboard/settings"

      benefits={[
        {
          icon: UsersRound,
          title: "Seamless Collaboration",
          description: "Work together on content without stepping on each other's toes"
        },
        {
          icon: Shield,
          title: "Role-Based Access",
          description: "Control who can view, edit, and publish content with granular permissions"
        },
        {
          icon: Eye,
          title: "Activity Tracking",
          description: "Monitor team activity and content creation in real-time"
        },
        {
          icon: Zap,
          title: "Streamlined Workflow",
          description: "Coordinate content creation and approval processes efficiently"
        }
      ]}

      howItWorks={[
        {
          step: "1",
          title: "Invite Team Members",
          description: "Add team members via email with specific role assignments",
          color: "from-orange-500 to-red-500"
        },
        {
          step: "2",
          title: "Set Permissions",
          description: "Assign roles: Admin, Editor, Contributor, or Viewer",
          color: "from-red-500 to-pink-500"
        },
        {
          step: "3",
          title: "Collaborate",
          description: "Team members can create, edit, and schedule content together",
          color: "from-pink-500 to-purple-500"
        },
        {
          step: "4",
          title: "Track & Optimize",
          description: "Monitor team performance and optimize workflows",
          color: "from-purple-500 to-indigo-500"
        }
      ]}

      features={[
        "Team Member Invitations",
        "Role-Based Permissions (Admin, Editor, Contributor, Viewer)",
        "Shared Content Library",
        "Team Activity Dashboard",
        "Collaborative Editing",
        "Content Approval Workflow",
        "Team Calendar View",
        "Member Activity Tracking",
        "Credit Pool Sharing",
        "Team Performance Analytics",
        "Communication Tools",
        "Task Assignment",
        "Notification System",
        "Audit Logs",
        "Team Templates",
        "Shared Style Profiles"
      ]}

      useCases={[
        {
          title: "Marketing Teams",
          description: "Coordinate campaigns and content across team members"
        },
        {
          title: "Agencies",
          description: "Manage multiple clients with dedicated team workspaces"
        },
        {
          title: "Enterprise",
          description: "Scale content production across departments"
        },
        {
          title: "Content Teams",
          description: "Collaborate on content strategy and execution"
        },
        {
          title: "Startups",
          description: "Enable team-wide access to content tools"
        },
        {
          title: "Consultants",
          description: "Work with clients in shared workspaces"
        }
      ]}

      ctaTitle="Ready to Empower Your Team?"
      ctaDescription="Start collaborating and scaling your content production today."
    />
  );
}
