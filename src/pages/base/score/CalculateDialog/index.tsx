import {ModalForm, ProForm, ProFormInstance, ProFormSelect, ProFormText} from '@ant-design/pro-components';
import { convertPageData, orderBy, waitTime } from '@/utils/request';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import {Button, message} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { getAverageOfClass } from '@/services/api/score';
import {downloadFile} from "@/utils/download-utils";
import {CalculatorOutlined, ExportOutlined, ImportOutlined, PlusOutlined} from "@ant-design/icons";

interface CalculateDialogProps {
  detailData?: API.AverageQueryDTO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

export default function CalculateDialog(props: CalculateDialogProps) {
  const refAction = useRef<ActionType>(null);
  const form = useRef<ProFormInstance>(null);
  const [downloading, setDownloading] = useState(false);
  const [searchProps, setSearchProps] = useState<API.AverageQueryDTO>({});
  interface options{
    value: number,
    label: string,
  }
  const option:options[] =[{value:1,label:'秋季'},{value:2,label:'春季'}]
  const yearArray: string[] = []
  const isSpring: number = new Date().getMonth()<8? 1:0;
  for (let i = new Date().getFullYear() - isSpring; i >= new Date().getFullYear() - isSpring - 5; i--) {
    yearArray.push(i.toString());
  }
  const columns: ProColumns<API.AverageVO>[] = [
    {
      title: '班级号',
      dataIndex: 'classId',
      width: 60,
      search: false,
      defaultSortOrder: 'ascend',
      sorter: true
    },
    {
      title: '班级名称',
      dataIndex: 'className',
      width: 80,
      search: false,
      sorter: false,
    },
    {
      title: '语文平均分',
      dataIndex: 'averageChineseScore',
      width: 80,
      search: false,
      sorter: true
    },
    {
      title: '数学平均分',
      dataIndex: 'averageMathScore',
      width: 80,
      search: false,
      sorter: true
    },
    {
      title: '英语平均分',
      dataIndex: 'averageEnglishScore',
      width: 80,
      search: false,
      sorter: true
    },
    {
      title: '总平均分',
      dataIndex: 'averageTotalScore',
      width: 70,
      search: false,
      sorter: true
    },
  ];

  useEffect(() => {
    waitTime().then(() => {
      if (props.detailData) {
        form?.current?.setFieldsValue(props.detailData);
      } else {
        form?.current?.resetFields();
      }
    });
  }, [props.detailData, props.visible]);
  let data: API.AverageQueryDTO;
  const onFinish = async (values: any) => {
    const { academicYear, semester } = values;
    data = {
      academicYear: academicYear,
      semester: semester,
    };
    refAction.current?.reload();
    return true;
  };

  const handleExport = () => {
    setDownloading(true);
    downloadFile(`/api/score/exportAverage`, searchProps, '班级平均成绩导出表.xls').then(() => {
      waitTime(1000).then(() => setDownloading(false));
    });
  };

  return (
    <ModalForm
      width={700}
      onFinish={onFinish}
      formRef={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => props.onClose(false),
      }}
      title={'班级平均成绩'}
      submitter={{
        searchConfig: {
          submitText: '计算',
          resetText: '关闭',
        },
      }}
      open={props.visible}
    >
      <ProForm.Group>
        <ProFormSelect
          name="academicYear"
          width='sm'
          label="学年"
          rules={[
            {
              required: true,
              message: '请输入学年！',
            },
          ]}
          options={yearArray}
          showSearch
        />
        <ProFormSelect
          name="semester"
          width='sm'
          label="学期"
          options={option}
        />
      </ProForm.Group>
      <ProTable<API.AverageVO>
        actionRef={refAction}
        rowKey="classId"
        request={async (params = {}, sort) => {
          const { academicYear, semester } = data;
          const props: API.AverageQueryDTO = {
            ...params,
            orderBy: orderBy(sort),
            academicYear,
            semester,
          };
          return convertPageData(await getAverageOfClass(props));
        }}
        columns={columns}
        search={false}
        options={false}
      />
      <Button type="default" onClick={handleExport} loading={downloading}>
        <ExportOutlined /> 导出计算结果为 Excel
      </Button>,
    </ModalForm>
  );
}

export type OptionConfig = {
  density?: false;
  reload?: false;
  setting?: false;
  search?: false;
  reloadIcon?: React.ReactNode;
  densityIcon?: React.ReactNode;
};
