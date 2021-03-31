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
      특정 모델에 대한 세부 내용을 확인할 수 있습니다.
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
      title: <FormattedMessage id="pages.model.detail.id" defaultMessage="ID" />,
      dataIndex: 'key',
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
      title: <FormattedMessage id="pages.model.detail.tc" defaultMessage="TC" />,
      dataIndex: 'tc',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.model.detail.tcVersion" defaultMessage="Version" />,
      dataIndex: 'tcVersion',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.model.detail.bleu" defaultMessage="BLEU" />,
      dataIndex: 'bleu',
      valueType: 'textarea',
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.model.detail.score" defaultMessage="Qualitative Score" />,
      dataIndex: 'score',
      sorter: true,
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
      <AxisChart></AxisChart>
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
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
