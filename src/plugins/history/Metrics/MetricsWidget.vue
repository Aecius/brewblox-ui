<script lang="ts">
import get from 'lodash/get';
import parseDuration from 'parse-duration';
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { durationString } from '@/helpers/functional';
import historyStore from '@/store/history';
import { DisplayNames, Listener, QueryParams, QueryTarget } from '@/store/history';

import { addListener } from './actions';
import { DEFAULT_DECIMALS, DEFAULT_FRESH_DURATION } from './getters';
import { MetricsConfig, MetricsResult } from './types';

interface CurrentValue extends MetricsResult {
  name: string;
  stale: boolean;
}

@Component
export default class MetricsWidget extends WidgetBase {
  parseDuration = parseDuration;
  durationString = durationString;
  DEFAULT_FRESH_DURATION = DEFAULT_FRESH_DURATION;

  modalOpen: boolean = false;

  get widgetCfg(): MetricsConfig {
    return {
      targets: [],
      renames: {},
      params: {},
      freshDuration: {},
      decimals: {},
      ...this.widget.config,
    };
  }

  get targets(): QueryTarget[] {
    return this.widgetCfg.targets;
  }

  get renames(): DisplayNames {
    return this.widgetCfg.renames;
  }

  get params(): QueryParams {
    return this.widgetCfg.params;
  }

  get listeners(): Listener[] {
    return this.targets
      .map(target => historyStore.tryListenerById(this.listenerId(target)))
      .filter(listener => listener !== null && !!listener.values) as Listener[];
  }

  fieldFreshDuration(field: string) {
    return get(this.widgetCfg.freshDuration, field, DEFAULT_FRESH_DURATION);
  }

  fieldDecimals(field: string) {
    return get(this.widgetCfg.decimals, field, DEFAULT_DECIMALS);
  }

  get values(): CurrentValue[] {
    const now = new Date().getTime();
    return this.listeners
      .reduce((acc: MetricsResult[], listener: Listener) => [...acc, ...listener.values], [])
      .map(result => ({
        ...result,
        name: this.renames[result.field] || result.field,
        stale: !!result.time && (now - result.time as number > this.fieldFreshDuration(result.field)),
      }));
  }

  listenerId(target: QueryTarget): string {
    return `${this.widget.id}/${target.measurement}`;
  }

  addListeners() {
    this.targets
      .forEach(target =>
        addListener(
          this.listenerId(target),
          this.params,
          this.renames,
          target,
        ));
  }

  removeListeners() {
    this.listeners
      .forEach(listener =>
        historyStore.removeListener(listener));
  }

  resetListeners() {
    this.removeListeners();
    this.addListeners();
  }

  @Watch('widgetCfg', { deep: true })
  regraph() {
    this.$nextTick(() => this.resetListeners());
  }

  mounted() {
    this.addListeners();
  }

  destroyed() {
    this.removeListeners();
  }
}
</script>

<template>
  <q-card dark class="text-white column scroll no-wrap">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <MetricsForm v-if="modalOpen" :widget="widget" @update:widget="saveWidget"/>
    </q-dialog>

    <WidgetToolbar :title="widget.title" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="modalOpen = true">
          <q-list dark bordered>
            <ActionItem icon="refresh" label="Refresh" @click="resetListeners"/>
            <WidgetActions :field="me"/>
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section>
      <q-list dark>
        <q-item v-if="values.length === 0" dark>
          <q-item-section avatar>
            <q-icon name="warning"/>
          </q-item-section>
          <q-item-section>No metrics selected.</q-item-section>
          <q-item-section side>
            <q-btn flat text-color="white" label="Add metrics" @click="modalOpen = true"/>
          </q-item-section>
        </q-item>
        <q-item v-for="val in values" :key="val.field" dark>
          <q-item-section>
            <q-item-label caption>{{ val.name }}</q-item-label>
            <div class="row items-center">
              <big :class="{darkened: val.stale}">{{ val.value | round(fieldDecimals(val.field)) }}</big>
              <q-icon v-if="val.stale" name="warning" right size="24px"/>
            </div>
            <q-tooltip v-if="val.stale">
              {{ val.name }} was updated more than {{ durationString(fieldFreshDuration(val.field)) }} ago.
              <br>
              Last update: {{ new Date(val.time).toLocaleString() }}.
            </q-tooltip>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
