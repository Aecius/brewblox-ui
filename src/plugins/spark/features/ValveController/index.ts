import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import widget from './ValveControllerWidget.vue';
import wizard from './ValveControllerWizard.vue';

const feature: Feature = {
  id: 'ValveController',
  displayName: 'Valve Controller',
  widget: ref(widget),
  wizard: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 4,
  },
};

export default feature;
