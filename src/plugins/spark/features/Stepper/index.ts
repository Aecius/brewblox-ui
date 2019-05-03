import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import widget from './StepperWidget.vue';
import wizard from './StepperWizard.vue';

const feature: Feature = {
  id: 'Stepper',
  displayName: 'Stepper',
  widget: ref(widget),
  wizard: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
