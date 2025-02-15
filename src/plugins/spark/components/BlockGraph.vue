<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { targetSplitter } from '@/components/Graph/functional';
import { defaultPresets } from '@/components/Graph/getters';
import { GraphConfig } from '@/components/Graph/types';
import { durationString } from '@/helpers/functional';
import { QueryParams } from '@/store/history';

@Component
export default class BlockGraph extends Vue {
  $refs!: {
    graph: any;
  }

  @Prop({ type: Boolean, required: true })
  readonly value!: boolean;

  @Prop({ type: String, required: true })
  readonly id!: string;

  @Prop({ type: Object, required: true })
  readonly config!: Partial<GraphConfig>;

  @Prop({ type: Function, required: true })
  readonly change!: (cfg: GraphConfig) => void;

  @Prop({ type: Boolean, default: false })
  readonly noDuration!: boolean;

  prevStrConfig: string = '';

  get modalModel() {
    return this.value;
  }

  set modalModel(val: boolean) {
    this.$emit('input', val);
  }

  get graphCfg(): GraphConfig {
    return {
      layout: {},
      params: {},
      targets: [],
      renames: {},
      axes: {},
      ...this.config,
    };
  }

  get targetKeys() {
    return targetSplitter(this.graphCfg.targets)
      .map(key => [key, this.graphCfg.renames[key] || key]);
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isRightAxis(key: string) {
    return this.graphCfg.axes[key] === 'y2';
  }

  confirmed(func: Function) {
    return (v: any) => { func(v); this.change({ ...this.graphCfg }); };
  }

  updateKeySide(key: string, isRight: boolean) {
    this.change({
      ...this.graphCfg,
      axes: {
        ...this.graphCfg.axes,
        [key]: isRight ? 'y2' : 'y',
      },
    });
  }

  applyPreset(preset: QueryParams) {
    this.change({
      ...this.graphCfg,
      params: { ...preset },
    });
  }

  parseDuration(val: string): string {
    return durationString(val);
  }

  @Watch('graphCfg')
  onCfgChange() {
    // Vue considers configuration "changed" with every block data update
    // To avoid constantly refreshing listeners, we need to do a deep compare
    const strConfig = JSON.stringify(this.graphCfg);
    if (strConfig !== this.prevStrConfig) {
      this.prevStrConfig = strConfig;
      this.$nextTick(() => this.$refs.graph && this.$refs.graph.resetListeners());
    }
  }

  mounted() {
    this.prevStrConfig = JSON.stringify(this.graphCfg);
  }
}
</script>

<template>
  <q-dialog v-model="modalModel" maximized>
    <q-card v-if="modalModel" class="text-white bg-dark-bright" dark>
      <GraphCard ref="graph" :id="id" :config="graphCfg">
        <q-btn-dropdown v-if="!noDuration" auto-close flat label="timespan" icon="mdi-timelapse">
          <q-item
            v-for="(preset, idx) in presets"
            :key="idx"
            dark
            link
            clickable
            @click="() => applyPreset(preset)"
          >
            <q-item-section>{{ preset.duration }}</q-item-section>
          </q-item>
        </q-btn-dropdown>
        <q-btn-dropdown flat label="settings" icon="settings">
          <q-item dark link clickable @click="() => $refs.duration.$el.click()">
            <q-item-section side>Duration</q-item-section>
            <q-item-section @click="() => $refs.duration.$el.click()">
              <InputPopupEdit
                ref="duration"
                :field="graphCfg.params.duration"
                :change="confirmed(v => $set(graphCfg.params, 'duration', parseDuration(v)))"
                label="Duration"
                tag="span"
              />
            </q-item-section>
          </q-item>
          <q-expansion-item label="Left or right axis">
            <q-item
              v-for="[key, renamed] in targetKeys"
              :key="key"
              dark
              link
              clickable
              @click="updateKeySide(key, !isRightAxis(key))"
            >
              <q-item-section>{{ renamed }}</q-item-section>
              <q-item-section side>
                <q-icon :class="{mirrored: isRightAxis(key)}" name="mdi-chart-line"/>
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </q-btn-dropdown>
        <q-btn v-close-popup flat label="close"/>
      </GraphCard>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="stylus">
.mirrored {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>
