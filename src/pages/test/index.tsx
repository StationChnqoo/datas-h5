import Services from '@/constants/services';
import { removeRule } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useRequest } from '@umijs/max';
import { Button, DatePicker, Drawer, Image, message } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import CreateForm from './components/CreateForm';

const TestMongoDB: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.MovieItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const [messageApi, contextHolder] = message.useMessage();

  const { run: delRun, loading } = useRequest(removeRule, {
    manual: true,
    onSuccess: () => {
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();
      messageApi.success('Deleted successfully and will refresh soon');
    },
    onError: () => {
      messageApi.error('Delete failed, please try again');
    },
  });

  const pad = (n: number) => `${n < 10 ? '0' : ''}${n}`;
  const columns: ProColumns<API.MovieItem>[] = [
    {
      title: '封面',
      dataIndex: 'poster',
      hideInForm: true,
      valueType: 'image',
      hideInSearch: true,
      width: 72,
      render: (_, record) =>
        record.poster ? (
          <Image style={{ width: 60, height: 80 }} src={record.poster} />
        ) : (
          <div>--</div>
        ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      hideInForm: true,
      hideInSearch: true,
    },
    {
      title: '剧情',
      dataIndex: 'plot',
      hideInForm: true,
      valueType: 'textarea',
      hideInSearch: true,
    },
    {
      title: '演员',
      dataIndex: 'cast',
      hideInForm: true,
      hideInSearch: true,
      render: (_, record) => <div>{(record?.cast || []).join(' | ')}</div>,
    },
    {
      title: '时长',
      dataIndex: 'runtime',
      sorter: false,
      hideInForm: true,
      width: 72,
      hideInSearch: true,
      render: (_, record) => (
        <div>{`${pad(Math.floor(record.runtime / 60))}:${pad(record.runtime % 60)}`}</div>
      ),
    },
    {
      title: '上映时间',
      dataIndex: 'year',
      sorter: false,
      hideInForm: true,
      width: 72,
      renderFormItem: (_, { type }: any) => {
        if (type === 'form') {
          return null;
        }
        return <DatePicker picker="year" />;
      },
    },
    {
      title: '操作',
      fixed: 'right',
      width: 100,
      hideInSearch: true,
      render: (_, record) => (
        <div style={{}}>
          <Button type="link">删除</Button>
        </div>
      ),
    },
  ];

  /**
   *  Delete node
   * @zh-CN 删除节点
   *
   * @param selectedRows
   */
  const handleRemove = useCallback(
    async (selectedRows: API.MovieItem[]) => {
      if (!selectedRows?.length) {
        messageApi.warning('请选择删除项');

        return;
      }

      await delRun({
        data: {
          key: selectedRows.map((row) => row._id),
        },
      });
    },
    [delRun],
  );

  const loadDatas = async (params: any) => {
    let result = await new Services().selectTestMongoFilms(params.current, params.pageSize);
    return result.data;
  };

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<API.MovieItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="key"
        scroll={{ x: 1024 }}
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [<CreateForm key="create" reload={actionRef.current?.reload} />]}
        request={loadDatas}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            loading={loading}
            onClick={() => {
              handleRemove(selectedRowsState);
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
          <Button type="primary">
            <FormattedMessage
              id="pages.searchTable.batchApproval"
              defaultMessage="Batch approval"
            />
          </Button>
        </FooterToolbar>
      )}

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TestMongoDB;
