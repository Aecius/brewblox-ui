<script lang="ts">
import { Component } from 'vue-property-decorator';

import { postfixedDisplayNames } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { TempSensorMockBlock } from './types';

@Component
export default class TempSensorMockWidget extends BlockWidget {
  readonly block!: TempSensorMockBlock;

  get renamedTargets() {
    return postfixedDisplayNames(
      {
        value: 'Sensor value',
      },
      this.block.data,
    );
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <TempSensorMockForm
        v-if="modalOpen"
        v-bind="$props"
        :block="block"
        @update:block="saveBlock"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Value</q-item-label>
          <UnitPopupEdit
            :field="block.data.value"
            :disabled="!block.data.connected"
            :change="callAndSaveBlock(v => block.data.value = v)"
            label="Value"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Connected</q-item-label>
          <q-toggle
            :value="block.data.connected"
            @input="v => { block.data.connected = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

