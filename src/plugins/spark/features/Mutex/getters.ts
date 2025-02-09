import get from 'lodash/get';

import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { MutexBlock } from './types';

export const typeName = 'Mutex';

export const getById =
  (serviceId: string, id: string): MutexBlock =>
    sparkStore.blockById(serviceId, id, typeName);

export interface MutexBlocks {
  active: string;
  waiting: string[];
  idle: string[];
}

export const getMutexClients = (serviceId: string, mutexId: string): MutexBlocks =>
  sparkStore.blockValues(serviceId)
    .reduce(
      (mutexed: MutexBlocks, block: Block) => {
        const constraint = get(block, 'data.constrainedBy.constraints', [])
          .find(constraint => get(constraint, 'mutex.id') === mutexId);
        if (!constraint) {
          return mutexed;
        }
        if (block.data.state === 1) {
          return { ...mutexed, active: block.id };
        }
        if (constraint.limiting && constraint.mutex) {
          return { ...mutexed, waiting: [...mutexed.waiting, block.id] };
        }
        if (!constraint.limiting && constraint.mutex && block.data.state !== 1) {
          return { ...mutexed, idle: [...mutexed.idle, block.id] };
        }
        return mutexed;
      },
      {
        active: 'None',
        waiting: [],
        idle: [],
      },
    );
