import { Block } from '@/plugins/spark/types';
import { DashboardItem } from '@/store/dashboards';

export interface BrewPiConfigNames {
  fridgeSensor: string;
  beerSensor: string;
  fridgeSSPair: string;
  beerSSPair: string;
  tempProfile: string;
  coolPin: string;
  heatPin: string;
  coolPwm: string;
  heatPwm: string;
  mutex: string;
  fridgeDriver: string;
  coolPid: string;
  heatPid: string;
  beerPid: string;
  graph: string;
}

export interface BrewPiConfig {
  serviceId: string;
  arrangementId: string;
  prefix: string;
  dashboardId: string;
  dashboardTitle: string;
  groups: number[];
  names: BrewPiConfigNames;
  widgets: DashboardItem[];
  createdBlocks: Block[];
  changedBlocks: Block[];
  renamedBlocks: {
    [old: string]: string;
  };
}
