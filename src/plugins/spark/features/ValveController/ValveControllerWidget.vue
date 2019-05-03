<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { ValveControllerConfig } from './state';
import { ActuatorDS2413Block } from '../ActuatorDS2413/state';
import { typeName } from '../ActuatorDS2413/getters';
import { blockValues } from '../../store/getters';
import get from 'lodash/get';
import { saveBlock } from '../../store/actions';

@Component
export default class ValveControllerWidget extends WidgetBase {

  get widgetCfg(): ValveControllerConfig {
    return {
      actuatorIds: [],
      pendingState: {},
      ...this.$props.config,
    };
  }

  get actuators(): ActuatorDS2413Block[] {
    return blockValues(this.$store, this.widgetCfg.serviceId)
      .filter(block => block.type === typeName);
  }

  isEnabled(block: ActuatorDS2413Block) {
    return block.data.state === 1;
  }

  blockPendingState(block: ActuatorDS2413Block) {
    return get(this.widgetCfg.pendingState, block.id, block.data.state);
  }

  updatePendingState(block: ActuatorDS2413Block, state: number) {
    this.$set(this.widgetCfg.pendingState, block.id, state);
    this.saveConfig(this.widgetCfg);
  }

  clearPendingState(block: ActuatorDS2413Block) {
    this.$delete(this.widgetCfg.pendingState, block.id);
    this.saveConfig(this.widgetCfg);
  }

  resetPendingState() {
    this.widgetCfg.pendingState = {};
    this.saveConfig(this.widgetCfg);
  }

  applyPendingState() {
    this.actuators
      .filter(block => this.widgetCfg.pendingState[block.id] !== undefined)
      .forEach(block => {
        block.data.state = this.widgetCfg.pendingState[block.id];
        saveBlock(this.$store, this.widgetCfg.serviceId, block);
      });
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat icon="settings">
          <q-list dark bordered>
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
      <q-list dark>
        <q-item v-for="block in actuators" :key="block.id" dark>
          <q-item-section>{{ block.id }}</q-item-section>
          <q-item-section>
            <ActuatorState
              :field="blockPendingState(block)"
              :change="v => updatePendingState(block, v)"
            />
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn
              :disable="widgetCfg.pendingState[block.id] === undefined"
              round
              flat
              icon="clear"
              @click="clearPendingState(block)"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section class="col-auto">
            <q-btn outline label="reset" @click="resetPendingState"/>
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn outline label="apply" @click="applyPendingState"/>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
