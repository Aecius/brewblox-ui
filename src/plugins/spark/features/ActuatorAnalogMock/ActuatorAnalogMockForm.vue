<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

import { ActuatorAnalogMockBlock } from './types';

@Component
export default class ActuatorAnalogMockForm extends BlockForm {
  readonly block!: ActuatorAnalogMockBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Setting</q-item-label>
            <InputPopupEdit
              v-if="!isDriven"
              :field="block.data.setting"
              :change="callAndSaveBlock(v => block.data.setting = v)"
              type="number"
              label="target"
            />
            <big v-else>{{ block.data.setting | unit }}</big>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </q-item-section>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Clip to min</q-item-label>
            <InputPopupEdit
              :field="block.data.minSetting"
              :change="callAndSaveBlock(v => block.data.minSetting = v)"
              type="number"
              label="Setting min"
            />
          </q-item-section>
          <q-item-section style="justify-content: flex-start">
            <q-item-label caption>Clip to max</q-item-label>
            <InputPopupEdit
              :field="block.data.maxSetting"
              :change="callAndSaveBlock(v => block.data.maxSetting = v)"
              type="number"
              label="Setting max"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Value</q-item-label>
            <big>{{ block.data.value | round }}</big>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Clip to min</q-item-label>
            <InputPopupEdit
              :field="block.data.minValue"
              :change="callAndSaveBlock(v => block.data.minValue = v)"
              type="number"
              label="Value min"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Clip to max</q-item-label>
            <InputPopupEdit
              :field="block.data.maxValue"
              :change="callAndSaveBlock(v => block.data.maxValue = v)"
              type="number"
              label="Value max"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-less-than-or-equal" label="Constraints">
        <AnalogConstraints
          :service-id="block.serviceId"
          :field="block.data.constrainedBy"
          :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
        />
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
