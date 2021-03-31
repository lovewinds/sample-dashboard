// eslint-disable-next-line import/no-extraneous-dependencies
import { Request, Response } from 'express';
import { parse } from 'url';
import { TableListItem, TableListParams } from '@/pages/ModelList/data';
import { stringify } from 'qs';

// mock tableListDataSource
const genList = (current: number, pageSize: number) => {
  const tableListDataSource: TableListItem[] = [];

  for (let i = 0; i < pageSize; i += 1) {
    const index = (current - 1) * 10 + i;
    tableListDataSource.push({
      key: index,
      task: [
        'Ondevice',
        'Server',
        'Server'
      ][i % 3],
      project: [
        'S Browser',
        'Bixby VT',
        'U Trans',
      ][i % 3],
      direction: [
        'en2ko',
        'ko2zh',
        'en2de',
      ][i % 3],
      version: [
        '20200112',
        '20201118',
        '20210403',
      ][i % 3],
      owner: 'utrans',
      status: Math.floor(Math.random() * 10) % 4,
      devScore: Math.random() * 100,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
  }
  tableListDataSource.reverse();
  return tableListDataSource;
};

let tableListDataSource = genList(1, 100);

function getModel(req: Request, res: Response, u: string) {
  let realUrl = u;
  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }
  const { current = 1, pageSize = 10 } = req.query;
  const params = (parse(realUrl, true).query as unknown) as TableListParams;

  let dataSource = [...tableListDataSource].slice(
    ((current as number) - 1) * (pageSize as number),
    (current as number) * (pageSize as number),
  );
  const sorter = JSON.parse(params.sorter as any);
  if (sorter) {
    dataSource = dataSource.sort((prev, next) => {
      let sortNumber = 0;
      Object.keys(sorter).forEach((key) => {
        if (sorter[key] === 'descend') {
          if (prev[key] - next[key] > 0) {
            sortNumber += -1;
          } else {
            sortNumber += 1;
          }
          return;
        }
        if (prev[key] - next[key] > 0) {
          sortNumber += 1;
        } else {
          sortNumber += -1;
        }
      });
      return sortNumber;
    });
  }
  if (params.filter) {
    const filter = JSON.parse(params.filter as any) as {
      [key: string]: string[];
    };
    if (Object.keys(filter).length > 0) {
      dataSource = dataSource.filter((item) => {
        return Object.keys(filter).some((key) => {
          if (!filter[key]) {
            return true;
          }
          if (filter[key].includes(`${item[key]}`)) {
            return true;
          }
          return false;
        });
      });
    }
  }

  if (params.task) {
    dataSource = dataSource.filter((data) => data.task.includes(params.task || ''));
  }
  if (params.project) {
    dataSource = dataSource.filter((data) => data.project.includes(params.project || ''));
  }
  const result = {
    data: dataSource,
    total: tableListDataSource.length,
    success: true,
    pageSize,
    current: parseInt(`${params.currentPage}`, 10) || 1,
  };

  return res.json(result);
}

function postModel(req: Request, res: Response, u: string, b: Request) {
  let realUrl = u;
  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  const body = (b && b.body) || req.body;
  const { method, name, desc, key } = body;

  switch (method) {
    /* eslint no-case-declarations:0 */
    case 'delete':
      tableListDataSource = tableListDataSource.filter((item) => key.indexOf(item.key) === -1);
      break;
    case 'post':
      (() => {
        const i = Math.ceil(Math.random() * 10000);
        const newRule = {
          key: tableListDataSource.length,
          task: [
            'Ondevice',
            'Server',
            'STT'
          ][i % 3],
          project: [
            'S Browser',
            'Bixby VT',
            'U Trans',
          ][i % 3],
          direction: [
            'en2ko',
            'ko2zh',
            'en2de',
          ][i % 3],
          version: [
            '20200112',
            '20201118',
            '20210403',
          ][i % 3],
          owner: 'utrans',
          status: Math.floor(Math.random() * 10) % 4,
          devScore: Math.random() * 100,
          updatedAt: new Date(),
          createdAt: new Date(),
        };
        tableListDataSource.unshift(newRule);
        return res.json(newRule);
      })();
      return;

    case 'update':
      (() => {
        let newRule = {};
        tableListDataSource = tableListDataSource.map((item) => {
          if (item.key === key) {
            newRule = { ...item, desc, name };
            return { ...item, desc, name };
          }
          return item;
        });
        return res.json(newRule);
      })();
      return;
    default:
      break;
  }

  const result = {
    list: tableListDataSource,
    pagination: {
      total: tableListDataSource.length,
    },
  };

  res.json(result);
}

export default {
  'GET /api/models': getModel,
  'POST /api/models': postModel,
};
