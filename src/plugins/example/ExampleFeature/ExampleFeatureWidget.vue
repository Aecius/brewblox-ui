<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { ExampleWidgetConfig } from '@/plugins/example/ExampleFeature/types';
import exampleStore from '@/plugins/example/store';

/*
  The WidgetBase class inherits from Vue, we inherit the properties from WidgetBase.
  The dashboard that renders this widget will provide these properties.

  WidgetBase also defines some generic getters, setters, and functions.
*/
@Component
export default class ExampleFeatureWidget extends WidgetBase {
  url: string = '';

  get widgetCfg(): ExampleWidgetConfig {
    return this.widget.config;
  }

  get messages() {
    // We define a getter for the messages here, so we can access them in the HTML code.
    // The result is cached, and will be automatically updated if the store changes.
    // Note that all widgets share the same store.
    // Widget A will see results of messages sent by Widget B
    return exampleStore.messages;
  }

  fetchBackend() {
    // We save the configuration, and call the fetch action.
    // fetchBackend() will update VueX when a result arrives, which will trigger an update of `this.messages`.
    this.saveConfig({ lastUrl: this.url });
    exampleStore.fetchBackend(this.url);
  }

  fetchExternal() {
    // Same as fetchBackend(), but with a different store action.
    this.saveConfig({ lastUrl: this.url });
    exampleStore.fetchExternal(this.url);
  }

  removeMessage(idx: number) {
    // We call the VueX mutation from here.
    // `this.messages` will update automatically afterwards.
    exampleStore.removeMessage(idx);
  }

  alert() {
    // An example notification, triggered by the button on the toolbar
    this.$q.notify({
      color: 'positive',
      icon: 'mdi-message-alert',
      message: `Hi! I'm ${this.widget.title}.`,
    });
  }

  created() {
    // created() is a standard Vue lifecycle function (https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)
    // It will be called after the properties are injected, but before the HTML is rendered.
    this.url = this.widgetCfg.lastUrl;
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <!-- displayName is inherited from ItemBase. The value is defined in the Feature definition (./index.ts) -->
    <WidgetToolbar :title="widget.title" :subtitle="displayName">
      <q-btn-dropdown flat label="actions">
        <q-list dark bordered>
          <ActionItem icon="mdi-message-alert" label="Alert" @click="alert"/>
          <WidgetActions :field="me"/>
        </q-list>
      </q-btn-dropdown>
    </WidgetToolbar>

    <q-card-section>
      <!-- The input fields and buttons at the top of the card are defined here -->
      <q-item dark>
        <q-item-section>
          <q-input v-model="url" dark label="URL"/>
        </q-item-section>
        <q-item-section side>
          <q-btn outline color="white" label="External" @click="fetchExternal"/>
        </q-item-section>
        <q-item-section side>
          <q-btn outline color="white" label="Backend" @click="fetchBackend"/>
        </q-item-section>
      </q-item>
      <!--
      All messages from the VueX store are displayed here.
      The list will re-render when a message is added or removed
      -->
      <q-item v-for="(msg, idx) in messages" :key="idx" dark>
        <q-item-section avatar>
          <q-icon :name="msg.ok ? 'check_circle' : 'error'"/>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>{{ msg.url }}</q-item-label>
          {{ msg.content }}
        </q-item-section>
        <q-item-section side>
          <q-btn round icon="delete" @click="removeMessage(idx)"/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

