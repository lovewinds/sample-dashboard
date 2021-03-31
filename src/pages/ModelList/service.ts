import request from '@/utils/request';
import { TableListParams, TableListItem } from './data';

export async function queryModel(params?: TableListParams) {
  return request('/api/models', {
    params,
  });
}

export async function removeModel(params: { key: number[] }) {
  return request('/api/models', {
    method: 'POST',
    data: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addModel(params: TableListItem) {
  return request('/api/models', {
    method: 'POST',
    data: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateModel(params: TableListParams) {
  return request('/api/models', {
    method: 'POST',
    data: {
      ...params,
      method: 'update',
    },
  });
}
