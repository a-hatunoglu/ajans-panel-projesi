// Onboarding step definitions — role-specific tour configuration

export type OnboardingStep = {
  targetSelector: string;
  titleKey: string;
  descriptionKey: string;
  position: "top" | "bottom" | "left" | "right";
};

/**
 * Kullanıcı rolüne göre onboarding adımlarını döner.
 * Tüm title/description anahtarları i18n üzerinden çözülür.
 */
export function getOnboardingSteps(
  globalRole: string,
  companyRoles: string[] = [],
): OnboardingStep[] {
  // Platform Owner / Agency Admin
  if (globalRole === "platform_owner" || globalRole === "agency_admin") {
    return [
      {
        targetSelector: '[data-tour="sidebar-companies"]',
        titleKey: "onboarding.owner.step1Title",
        descriptionKey: "onboarding.owner.step1Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-contents"]',
        titleKey: "onboarding.owner.step2Title",
        descriptionKey: "onboarding.owner.step2Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-calendar"]',
        titleKey: "onboarding.owner.step3Title",
        descriptionKey: "onboarding.owner.step3Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-payments"]',
        titleKey: "onboarding.owner.step4Title",
        descriptionKey: "onboarding.owner.step4Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-activity"]',
        titleKey: "onboarding.owner.step5Title",
        descriptionKey: "onboarding.owner.step5Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="dashboard-edit"]',
        titleKey: "onboarding.owner.step6Title",
        descriptionKey: "onboarding.owner.step6Desc",
        position: "bottom",
      },
    ];
  }

  // Editor
  if (companyRoles.includes("editor")) {
    return [
      {
        targetSelector: '[data-tour="sidebar-contents"]',
        titleKey: "onboarding.editor.step1Title",
        descriptionKey: "onboarding.editor.step1Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-companies"]',
        titleKey: "onboarding.editor.step2Title",
        descriptionKey: "onboarding.editor.step2Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-calendar"]',
        titleKey: "onboarding.editor.step3Title",
        descriptionKey: "onboarding.editor.step3Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-notifications"]',
        titleKey: "onboarding.editor.step4Title",
        descriptionKey: "onboarding.editor.step4Desc",
        position: "right",
      },
    ];
  }

  // Designer
  if (companyRoles.includes("designer")) {
    return [
      {
        targetSelector: '[data-tour="sidebar-contents"]',
        titleKey: "onboarding.designer.step1Title",
        descriptionKey: "onboarding.designer.step1Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-companies"]',
        titleKey: "onboarding.designer.step2Title",
        descriptionKey: "onboarding.designer.step2Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-calendar"]',
        titleKey: "onboarding.designer.step3Title",
        descriptionKey: "onboarding.designer.step3Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-notifications"]',
        titleKey: "onboarding.designer.step4Title",
        descriptionKey: "onboarding.designer.step4Desc",
        position: "right",
      },
    ];
  }

  // Client
  if (companyRoles.includes("client")) {
    return [
      {
        targetSelector: '[data-tour="sidebar-contents"]',
        titleKey: "onboarding.client.step1Title",
        descriptionKey: "onboarding.client.step1Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-companies"]',
        titleKey: "onboarding.client.step2Title",
        descriptionKey: "onboarding.client.step2Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-calendar"]',
        titleKey: "onboarding.client.step3Title",
        descriptionKey: "onboarding.client.step3Desc",
        position: "right",
      },
      {
        targetSelector: '[data-tour="sidebar-notifications"]',
        titleKey: "onboarding.client.step4Title",
        descriptionKey: "onboarding.client.step4Desc",
        position: "right",
      },
    ];
  }

  return [];
}
