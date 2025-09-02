// src/components/ThingList.tsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Select,
  Input,
  Space,
  Pagination,
  message,
  Form,
  DatePicker,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PaginationProps } from 'antd';
import type { Thing, ThingListQuery, RuleQueryResult } from '@/types/thing';
import request from '@/api/axios';
import '@/styles/thing-list.scss';
import type { ApiResponse } from '@/types/api';
import dayjs from 'dayjs';

const { confirm } = Modal;

const ThingList: React.FC = () => {
  const [data, setData] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState<ThingListQuery>({});
  const [messageApi, contextHolder] = message.useMessage();
  const [typeOptions, setTypeOptions] = useState<{ label: string; value: string }[]>([]);
  // --- 优化点 1: 添加一个初始化完成的标志位 ---
  const [initialized, setInitialized] = useState(false);

  // 详情 & 编辑
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<Thing | null>(null);

  // 新增 / 编辑表单
  const [form] = Form.useForm();
  const [formVisible, setFormVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // 搜索时间范围
  const [searchStartTime, setSearchStartTime] = useState<string>('');
  const [searchEndTime, setSearchEndTime] = useState<string>('');

  /** 查询接口 */
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await request.post<ApiResponse<RuleQueryResult>>(
        '/api/v1/political/rules/query',
        {
          rule_type: searchQuery.type,
          rule_content: searchQuery.keyword,
          start_time: searchStartTime || undefined,
          end_time: searchEndTime || undefined,
          page,
          page_size: pageSize,
        }
      );
      const result = response.data.result;

      if (result) {
        setData(result.items ?? []);
        setTotal(result.total ?? 0);
      } else {
        setData([]);
        setTotal(0);
        message.error('获取数据失败：result 为空');
      }
    } catch (error: unknown) {
      console.error('查询失败:', error);
      message.error('获取列表数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRulesData = async () => {
    try {
      const response = await request.post('/api/v1/political/rules/type');
      const result = response.data.result;
      if (result && Array.isArray(result)) {
        const newOptions = result.map((type: string) => ({
          label: type,
          value: type,
        }));
        setTypeOptions(newOptions);
      } else {
        message.error('获取规则类型失败：result 不是数组');
      }
    } catch (error) {
      console.error('规则类型数据获取失败:', error);
      message.error('获取规则类型数据失败');
    }
  };

  // --- 优化点 2: 使用一个 useEffect 处理所有初始化逻辑 ---
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([fetchRulesData(), fetchData()]);
      setInitialized(true); // 标记初始化完成
    };
    initialize();
  }, []); // 空依赖数组，确保只在首次渲染时执行一次

  // --- 优化点 3: 修改原有的 useEffect，使其在初始化完成后才生效 ---
  useEffect(() => {
    // 如果尚未初始化，则不执行任何操作，防止在挂载时重复调用
    if (!initialized) {
      return;
    }
    fetchData();
  }, [page, pageSize, searchQuery, searchStartTime, searchEndTime, initialized]); // 添加 initialized 到依赖项

  // ... handleDelete, handleFormSubmit, columns 等其他代码保持不变 ...
  // ... (此处省略剩余未改动的代码，以保持简洁) ...

  /** 删除 */
  const handleDelete = (item: Thing) => {
    confirm({
        icon: <ExclamationCircleOutlined />,
        content: `确定要删除内容为 '${item.rule_content}' 的规则吗？`,
        async onOk() {
              try {
                await request.post('/api/v1/political/rules/delete', { id: item.id });
                messageApi.success('删除成功');
                fetchData();
              } catch (error: unknown) {
                const errorMessage = (error as Error).message || "删除失败";
                messageApi.error(errorMessage);
              }
        },
        onCancel() {
          console.log('Cancel');
        },
      });
  };

  /** 提交新增 / 编辑 */
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const formatDate = (date: dayjs.Dayjs | null | undefined) => {
        if (!date) return null;
        return dayjs(date).format('YYYY-MM-DD');
      };

      if (isEdit) {
        await request.post('/api/v1/political/rules/update', {
          id: detailData?.id,
          rule_type: values.rule_type,
          rule_content: values.rule_content,
          start_time: formatDate(values.start_time),
          end_time: formatDate(values.end_time),
        });
        messageApi.success('修改成功');
      } else {
        await request.post('/api/v1/political/rules/add', {
          rule_type: values.rule_type,
          rule_content: values.rule_content,
          start_time: formatDate(values.start_time),
          end_time: formatDate(values.end_time),
        });
        
        messageApi.success('新增成功');
      }
      setLoading(false);
      setFormVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || (isEdit ? "修改失败" : "新增失败");
      messageApi.error(errorMessage);
    }
  };

  const columns: ColumnsType<Thing> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    { title: '类型', dataIndex: 'rule_type', key: 'rule_type', align: 'center' },
    { title: '内容', dataIndex: 'rule_content', key: 'rule_content', align: 'center' },
    { title: '开始时间', dataIndex: 'start_time', key: 'start_time', align: 'center' },
    { title: '结束时间', dataIndex: 'end_time', key: 'end_time', align: 'center' },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setDetailData(record);
              setDetailVisible(true);
            }}
          >
            查看
          </Button>
          <Button
            type="link"
            onClick={() => {
              setIsEdit(true);
              setDetailData(record);
              
              const formValues = {
                ...record,
                start_time: record.start_time ? dayjs(record.start_time) : null,
                end_time: record.end_time ? dayjs(record.end_time) : null,
              };
              form.setFieldsValue(formValues);
              setFormVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            danger
            type="link"
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const paginationProps: PaginationProps = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    showTotal:(total) => `总数 ${total} 条`,
    onChange: (p, ps) => {
      setPage(p);
      setPageSize(ps || 10);
    },
  };

  const onSearch = (e: string, p: number) => {
    setSearchQuery((prev) => ({ ...prev, keyword: e.trim() }));
    setPage(p);
  };

  const handleResetSearch = () => {
    setSearchQuery({});
    setInputValue('');
    setSearchStartTime('');
    setSearchEndTime('');
    setPage(1);
  };

  return (
    <div className="thing-list-container">
      {contextHolder}
      <div className="thing-list-search">
        <Space wrap>
          <Select
            placeholder="选择类型"
            style={{ width: 150 }}
            options={typeOptions}
            allowClear
            value={searchQuery.type}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onChange={(val) => {
              setSearchQuery((prev) => ({ ...prev, type: val }));
              setPage(1);
            }}
          />
          <Input.Search
            placeholder="模糊搜索内容"
            allowClear
            enterButton
            style={{ width: 200 }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSearch={(e) => onSearch(e, 1)}
          />
          <Button onClick={handleResetSearch}>重置</Button>
          <Button
            type="primary"
            onClick={() => {
              setIsEdit(false);
              form.resetFields();
              setFormVisible(true);
            }}
          >
            新增
          </Button>
        </Space>
      </div>

      <Table
        loading={loading}
        rowKey="id"
        className="thing-list-table"
        columns={columns}
        dataSource={data}
        pagination={false}
      />

      <Pagination className="thing-list-pagination" {...paginationProps} />

      <Modal
        open={detailVisible}
        title="规则详情"
        onCancel={() => setDetailVisible(false)}
        footer={null}
      >
        {detailData && (
          <div>
            <p>ID: {detailData.id}</p>
            <p>类型: {detailData.rule_type}</p>
            <p>内容: {detailData.rule_content}</p>
            <p>开始时间: {detailData.start_time ?? '-'}</p>
            <p>结束时间: {detailData.end_time ?? '-'}</p>
          </div>
        )}
      </Modal>

      <Modal
        open={formVisible}
        title={isEdit ? '编辑规则' : '新增规则'}
        onCancel={() => setFormVisible(false)}
        
        onOk={handleFormSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="rule_type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select options={typeOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }/>
          </Form.Item>
          <Form.Item
            name="rule_content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="start_time" label="开始时间">
            <DatePicker
              placeholder="请选择开始时间"
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              onChange={() => {
                form.validateFields(['end_time']);
              }}
            />
          </Form.Item>
          <Form.Item 
            name="end_time" 
            label="结束时间"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startTime = getFieldValue('start_time');
                  if (!value || !startTime) {
                    return Promise.resolve();
                  }
                  if (dayjs(value).isBefore(dayjs(startTime))) {
                    return Promise.reject(new Error('结束时间不能早于开始时间'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              placeholder="请选择结束时间"
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              disabledDate={(current) => {
                const startTime = form.getFieldValue('start_time');
                if (!startTime) return false;
                return current && current.isBefore(dayjs(startTime), 'day');
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ThingList;