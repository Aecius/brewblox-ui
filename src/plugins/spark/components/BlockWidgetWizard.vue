<script lang="ts">
import get from 'lodash/get';
import isString from 'lodash/isString';
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';
import { objectStringSorter } from '@/helpers/functional';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';
import serviceStore from '@/store/services';
import { Service } from '@/store/services';

@Component
export default class BlockWidgetWizard extends WidgetWizardBase {
  currentStep: string = 'start';
  modalOpen: boolean = false;

  blockId: string = '';
  service: Service | null = null;
  block: Block | null = null;
  widget: DashboardItem | null = null;

  get serviceId(): string {
    return get(this, ['service', 'id'], '');
  }

  get blockIdRules() {
    return [
      v => !!v || 'Name must not be empty',
      v => !sparkStore.blockIds(this.serviceId).includes(v) || 'Name must be unique',
      v => v.match(/^[a-zA-Z]/) || 'Name must start with a letter',
      v => v.match(/^[a-zA-Z0-9 \(\)_\-\|]*$/) || 'Name may only contain letters, numbers, spaces, and ()-_|',
      v => v.length < 200 || 'Name must be less than 200 characters',
    ];
  }

  get blockOpts() {
    if (!this.service) {
      return [];
    }
    return sparkStore.blockValues(this.serviceId)
      .filter(block => block.type === this.typeId)
      .sort(objectStringSorter('id'));
  }

  get serviceOpts() {
    return serviceStore.serviceValues
      .filter(service => service.type === 'Spark')
      .map(service => ({
        label: service.title,
        value: service,
      }));
  }

  get blockForm() {
    return this.block
      ? featureStore.formById(this.block.type)
      : '';
  }

  get startOk() {
    return !!this.service;
  }

  get createOk() {
    return !!this.service
      && !this.blockIdRules.some(rule => isString(rule(this.blockId)));
  }

  get existingOk() {
    return !!this.service && !!this.block;
  }

  async createWidget() {
    this.ensureItem();
    const service = this.service as Service;
    const block = this.block as Block;

    if (!sparkStore.blockIds(service.id).includes(block.id)) {
      await sparkStore.createBlock([service.id, block]);
    }

    this.createItem(this.widget as DashboardItem);
  }

  changeBlockId(newId: string) {
    const errors = this.blockIdRules
      .map(rule => rule(newId))
      .filter(isString);

    if (errors.length > 0) {
      this.$q.notify({
        message: errors.join(', '),
        color: 'negative',
        icon: 'error',
      });
      return;
    }
    (this.block as Block).id = newId;
  }

  ensureItem() {
    this.block = this.block || {
      id: this.blockId,
      serviceId: this.serviceId,
      type: this.typeId,
      groups: [0],
      data: sparkStore.specs[this.typeId].generate(),
    };
    this.widget = this.widget || {
      id: this.widgetId,
      title: this.blockId,
      feature: this.typeId,
      dashboard: this.dashboardId,
      order: 0,
      config: {
        serviceId: this.serviceId,
        blockId: this.blockId,
      },
      ...this.defaultWidgetSize,
    };
  }

  mounted() {
    if (this.serviceOpts.length > 0) {
      this.service = this.serviceOpts[0].value;
    }
  }
}
</script>

<template>
  <div>
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <component
        v-if="modalOpen"
        :is="blockForm"
        :widget.sync="widget"
        :block.sync="block"
        volatile
      />
    </q-dialog>

    <q-stepper
      v-model="currentStep"
      :bordered="false"
      class="bg-dark-bright no-border"
      vertical
      animated
      dark
    >
      <q-step name="start" title="Select Service">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Service</q-item-label>
            <q-option-group v-model="service" :options="serviceOpts"/>
          </q-item-section>
        </q-item>
        <q-stepper-navigation class="row">
          <q-btn unelevated label="Back" @click="back"/>
          <q-space/>
          <q-btn
            :disable="!startOk"
            unelevated
            label="Create new Block"
            color="primary"
            class="q-mx-md"
            @click="currentStep = 'create'"
          />
          <q-btn
            :disable="!startOk"
            unelevated
            label="Use existing Block"
            color="primary"
            @click="currentStep = 'existing'"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step name="create" title="Create new Block">
        <q-item dark>
          <q-item-section>
            <q-input v-model="blockId" :rules="blockIdRules" dark label="Block name">
              <template v-slot:append>
                <q-icon name="mdi-information">
                  <q-tooltip>
                    The name of the Spark Controller Block.
                    <br>Multiple widgets can display the same Block.
                    <br>Rules:
                    <ul>
                      <li>The name must not be empty.</li>
                      <li>The name must be unique.</li>
                      <li>The name must begin with a letter (a-z).</li>
                      <li>The name must not contain brackets ([]&lt;&gt;).</li>
                      <li>The name must be less than 200 characters.</li>
                    </ul>
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-stepper-navigation class="row">
          <q-btn unelevated label="Back" @click="block = null; currentStep = 'start'"/>
          <q-space/>
          <q-btn
            :disable="!createOk"
            unelevated
            label="Configure Block"
            color="primary"
            class="q-mx-md"
            @click="ensureItem(); modalOpen = true"
          />
          <q-btn
            :disable="!createOk"
            unelevated
            label="Create"
            color="primary"
            @click="createWidget()"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step name="existing" title="Use existing Block">
        <q-item dark>
          <q-item-section>
            <q-select
              v-model="block"
              :options="blockOpts"
              :rules="[v => !!v || 'You must select a Block']"
              dark
              options-dark
              option-label="id"
              label="Block"
            >
              <template v-slot:no-option>
                <q-item dark>
                  <q-item-section class="text-grey">No results</q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <q-stepper-navigation class="row">
          <q-btn unelevated label="Back" @click="block = null; currentStep = 'start'"/>
          <q-space/>
          <q-btn
            :disable="!existingOk"
            unelevated
            label="Configure Block"
            color="primary"
            class="q-mx-md"
            @click="modalOpen = true"
          />
          <q-btn
            :disable="!existingOk"
            unelevated
            label="Create"
            color="primary"
            @click="createWidget"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>
