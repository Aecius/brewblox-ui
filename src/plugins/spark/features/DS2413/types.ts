import { Block } from '@/plugins/spark/types';

export interface DS2413Block extends Block {
  data: {
    address: string;
    state: number;
  };
}
