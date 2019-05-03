<script lang="ts">
import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';
import Component from 'vue-class-component';
import { Service } from '@/store/services/state';
import { serviceValues } from '@/store/services/getters';
import get from 'lodash/get';


@Component
export default class ValveControllerWizard extends WidgetWizardBase {
  service: Service | null = null;

  get serviceId(): string {
    return get(this, ['service', 'id'], '');
  }

  get serviceOpts() {
    return serviceValues(this.$store)
      .filter(service => service.type === 'Spark')
      .map(service => ({
        label: service.title,
        value: service,
      }));
  }

  createWidget() {
    this.createItem({
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.typeId,
      dashboard: this.$props.dashboardId,
      order: 0,
      config: {
        serviceId: this.serviceId,
        actuatorIds: [],
      },
      ...this.defaultWidgetSize,
    });
  }

  mounted() {
    this.widgetTitle = this.typeDisplayName;
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-input v-model="widgetTitle" dark label="Widget name"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Service</q-item-label>
          <q-option-group v-model="service" :options="serviceOpts"/>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back"/>
      <q-btn :disable="!service" unelevated label="Create" color="primary" @click="createWidget"/>
    </q-card-actions>
  </div>
</template>
