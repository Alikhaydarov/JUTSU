export type CrmPlan = "none" | "basic" | "pro";

export type BusinessCrmState = {
  businessId: string;
  businessName: string;
  crmEnabled: boolean;
  crmPlan: CrmPlan;
  activatedAt?: string;
};

const CRM_STATE_KEY = "jutsu-business-crm-state";

export const defaultBusinessCrmState: BusinessCrmState = {
  businessId: "demo-restaurant-1",
  businessName: "JUTSU Demo Restaurant",
  crmEnabled: false,
  crmPlan: "none",
};

export function getBusinessCrmState(): BusinessCrmState {
  if (typeof window === "undefined") {
    return defaultBusinessCrmState;
  }

  const saved = window.localStorage.getItem(CRM_STATE_KEY);

  if (!saved) {
    return defaultBusinessCrmState;
  }

  try {
    return {
      ...defaultBusinessCrmState,
      ...(JSON.parse(saved) as Partial<BusinessCrmState>),
    };
  } catch {
    return defaultBusinessCrmState;
  }
}

export function activateBusinessCrm(plan: Exclude<CrmPlan, "none"> = "basic") {
  if (typeof window === "undefined") {
    return defaultBusinessCrmState;
  }

  const nextState: BusinessCrmState = {
    ...getBusinessCrmState(),
    crmEnabled: true,
    crmPlan: plan,
    activatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(CRM_STATE_KEY, JSON.stringify(nextState));

  return nextState;
}

export function resetBusinessCrmDemo() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CRM_STATE_KEY);
}
