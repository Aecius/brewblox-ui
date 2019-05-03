export interface BrewStep {
  name: string;
  changes: Record<string, any>;
}

export interface StepperConfig {
  serviceId: string;
  steps: BrewStep[];
}
