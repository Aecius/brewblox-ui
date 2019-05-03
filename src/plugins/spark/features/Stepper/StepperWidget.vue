<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { StepperConfig, BrewStep } from './state';
import { deserialize } from '@/helpers/units/parseObject';
import get from 'lodash/get';
import { saveBlock } from '../../store/actions';
import { blockById } from '../../store/getters';

@Component
export default class StepperWidget extends WidgetBase {
  inputShown: boolean = true;
  reader: FileReader = new FileReader();
  serializedData: string = '';

  get widgetCfg(): StepperConfig {
    return {
      steps: [],
      ...this.$props.config,
    };
  }

  handleFileSelect(evt) {
    const file = evt.target.files[0];
    if (file) {
      this.reader.readAsText(file);
    } else {
      this.serializedData = '';
    }
  }

  async load() {
    this.widgetCfg.steps = JSON.parse(this.serializedData);
    this.saveConfig(this.widgetCfg);
  }

  clear() {
    this.widgetCfg.steps = [];
    this.saveConfig(this.widgetCfg);
  }

  async applyStep(step: BrewStep) {
    await Promise.all(
      Object.entries(step.changes)
        .map(([id, change]: [string, any]) => {
          const block = blockById(this.$store, this.widgetCfg.serviceId, id);
          return saveBlock(
            this.$store,
            this.widgetCfg.serviceId,
            { ...block, data: { ...block.data, ...deserialize(change) } },
          );
        })
    );
  }

  mounted() {
    this.reader.onload = e => this.serializedData = get(e, 'target.result', '');
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat icon="settings">
          <q-list dark bordered>
            <ActionItem icon="clear" label="Remove all steps" @click="clear"/>
            <ExportAction :widget-id="widgetId"/>
            <ActionItem
              v-if="$props.onCopy"
              icon="file_copy"
              label="Copy widget"
              @click="$props.onCopy(widgetId)"
            />
            <ActionItem
              v-if="$props.onMove"
              icon="exit_to_app"
              label="Move widget"
              @click="$props.onMove(widgetId)"
            />
            <ActionItem
              v-if="$props.onDelete"
              icon="delete"
              label="Delete widget"
              @click="$props.onDelete(widgetId)"
            />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <input v-if="inputShown" type="file" @change="handleFileSelect">
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn :disable="!serializedData" flat label="load" @click="load"/>
        </q-item-section>
      </q-item>

      <q-separator dark inset/>

      <q-item v-for="(step, idx) in widgetCfg.steps" :key="idx" dark>
        <q-item-section>
          {{ step.name }}
          <q-tooltip>
            <pre>{{ JSON.stringify(step.changes, null, 2) }}</pre>
          </q-tooltip>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat label="apply" @click="applyStep(step)"/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
