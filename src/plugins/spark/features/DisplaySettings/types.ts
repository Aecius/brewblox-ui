import { Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

export interface DisplayWidget {
  pos: number;
  color: string;
  name: string;

  // Value will be one of these
  tempSensor?: Link;
  setpointSensorPair?: Link;
  actuatorAnalog?: Link;
  pid?: Link;
}

export interface DisplaySettingsBlock extends Block {
  data: {
    name: string;
    tempUnit: 0 | 1; // 0: Celsius 1: Fahrenheit
    widgets: DisplayWidget[];
  };
}
