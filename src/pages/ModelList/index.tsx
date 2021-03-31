import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Input, Drawer, Typography } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import { TableListItem } from './data';
import { queryModel, updateModel, addModel, removeModel } from './service';
import AxisChart from '../../components/Charts/AxisChart';

const { Paragraph } = Typography;
const headerContent = (
  <>
    <Paragraph>
      모델 평가 이력 및 세부 정보를 관리합니다.
    </Paragraph>
    <Paragraph>
      아래 기능들을 사용할 수 있습니다.
      <ul>
        <li>등록 모델에 대한 정량 평가</li>
        <li>특정 모델에 대한 정성 평가</li>
      </ul>
    </Paragraph>
  </>
);

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: TableListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addModel({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: TableListItem[]) => {
  const hide = message.loading('삭제');
  if (!selectedRows) return true;
  try {
    await removeModel({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('삭제하였습니다. 곧 갱신됩니다.');
    return true;
  } catch (error) {
    hide();
    message.error('삭제에 실패하였습니다.');
    return false;
  }
};

const TableList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<TableListItem>();
  const [selectedRowsState, setSelectedRows] = useState<TableListItem[]>([]);
  const intl = useIntl();
  const columns: ProColumns<TableListItem>[] = [
    {
      title: <FormattedMessage id="pages.evaluation.model.id" defaultMessage="ID" />,
      dataIndex: 'key',
      valueType: 'textarea',
    },
    {
      title: (
        <FormattedMessage
          id="pages.evaluation.task"
          defaultMessage="Task"
        />
      ),
      dataIndex: 'task',
      tip: 'Task',
      formItemProps: {
        rules: [
          {
            required: true,
            message: (
              <FormattedMessage id="pages.evaluation.task" defaultMessage="Task" />
            ),
          },
        ],
      },
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>;
      },
    },
    {
      title: <FormattedMessage id="pages.evaluation.project" defaultMessage="Project" />,
      dataIndex: 'project',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.evaluation.direction" defaultMessage="Direction" />,
      dataIndex: 'direction',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.evaluation.model.version" defaultMessage="Version" />,
      dataIndex: 'version',
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.evaluation.model.owner" defaultMessage="Owner" />,
      dataIndex: 'owner',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="状态" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.default" defaultMessage="关闭" />
          ),
          status: 'Default',
        },
        1: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.running" defaultMessage="运行中" />
          ),
          status: 'Processing',
        },
        2: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.online" defaultMessage="已上线" />
          ),
          status: 'Success',
        },
        3: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.abnormal" defaultMessage="异常" />
          ),
          status: 'Error',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.evaluation.model.devScore" defaultMessage="Dev BLEU" />,
      dataIndex: 'devScore',
      valueType: 'textarea',
    },
    {
      title: (
        <FormattedMessage id="pages.evaluation.model.update" defaultMessage="Updated" />
      ),
      dataIndex: 'updatedAt',
      sorter: true,
      valueType: 'dateTime',
      hideInForm: true,
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');
        if (`${status}` === '0') {
          return false;
        }
        if (`${status}` === '3') {
          return (
            <Input
              {...rest}
              placeholder={intl.formatMessage({
                id: 'pages.searchTable.exception',
                defaultMessage: '请输入异常原因！',
              })}
            />
          );
        }
        return defaultRender(item);
      },
    },
    {
      title: <FormattedMessage id="pages.evaluation.model.option" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
            }}
          >
            <FormattedMessage id="pages.evaluation.model.option.evaluate" defaultMessage="配置" />
          </a>
        </>
      ),
    },
  ];

  return (
    <PageContainer
      extra={[
        <Button key="1" type="primary">
          신규 생성
        </Button>,
      ]}
      content={headerContent}
    >
      <ProTable<TableListItem>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: '查询表格',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={(params, sorter, filter) => queryModel({ ...params, sorter, filter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="已选择" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="服务调用次数总计"
                />{' '}
                {selectedRowsState.reduce((pre, item) => pre + item.status, 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage id="pages.searchTable.batchDeletion" defaultMessage="批量删除" />
          </Button>
          <Button type="primary">
            <FormattedMessage id="pages.searchTable.batchApproval" defaultMessage="批量审批" />
          </Button>
        </FooterToolbar>
      )}

      <Drawer
        width={600}
        visible={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.task && (
          <ProDescriptions<TableListItem>
            column={2}
            title={row?.task}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.task,
            }}
            columns={columns as ProDescriptionsItemProps<TableListItem>[]}
          />
        )}
        <AxisChart></AxisChart>
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
