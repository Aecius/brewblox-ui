import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import form from './GraphForm.vue';
import widget from './GraphWidget.vue';
import wizard from './GraphWizard.vue';
import { typeName } from './getters';

const feature: Feature = {
  id: typeName,
  displayName: 'Graph',
  widget: ref(widget),
  wizard: ref(wizard),
  form: ref(form),
  widgetSize: {
    cols: 10,
    rows: 5,
  },
};

export default feature;
