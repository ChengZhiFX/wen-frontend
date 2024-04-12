import { ModalForm, ProForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { convertPageData, orderBy, waitTime } from '@/utils/request';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import {Button, message} from 'antd';
import { useEffect, useRef, useState } from 'react';
import {deleteStudents, listStudents} from "@/services/api/students";
import {openConfirm} from "@/utils/ui";
import {ExportOutlined, ImportOutlined, PlusOutlined} from "@ant-design/icons";
import InputStudentInClassDialog from "@/pages/base/classes/InputStudentInClassDialog";

interface StudentsInClassDialogProps {
  detailData?: API.ClassesDTO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

export default function StudentsInClassDialog(props: StudentsInClassDialogProps) {
  const refAction = useRef<ActionType>(null);
  const [searchProps, setSearchProps] = useState<API.ClassesQueryDTO>({});
  const [students, setStudents] = useState<API.StudentsVO>();
  const [visible, setVisible] = useState(false);
  const form = useRef<ProFormInstance>(null);
  const [selectedRowKeys, selectRow] = useState<number[]>([]);
  const columns: ProColumns<API.StudentsVO>[] = [
    {
      title: '姓名',
      dataIndex: 'studentName',
      width: 80,
    },
    {
      title: '学号',
      dataIndex: 'studentNum',
      width: 120,

    },
    {
      title: '性别',
      dataIndex: 'gender',
      search: false,
      filters: true,
      onFilter: true,
      ellipsis: true,
      width: 70,
      render: (_: any, record) => {
        return record?.gender ? '男' : '女';
      },
      valueType: 'select',
      valueEnum: {
        0: {
          text: '女',
        },
        1: {
          text: '男',
        },
      }
    },
    {
      title: '家长姓名',
      dataIndex: 'parentName',
      width: 100,
      search: false,
    },
    {
      title: '家长电话',
      dataIndex: 'parentTel',
      width: 100,
      search: false,
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="modify"
          onClick={() => {
            setStudents(record);
            setVisible(true);
          }}
        >
          修改
        </a>,
        <a
          key="delete"
          onClick={async () => {
            openConfirm(`确实要永久性地删除此记录吗？`, async () => {
              let arr:number[] = [record.id!];
              await deleteStudents(arr);
              refAction.current?.reload();
            });
          }}
          style={{
            color: '#FF4D4F'
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  const onFinish = async (values: any) => {
    props.onClose(true);
    refAction.current?.reload();
    return true;
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
      title={props.detailData?.className + ' 的学生'}
      submitter={{
        searchConfig: {
          submitText: '好',
        },
        resetButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
      open={props.visible}
    >
      <ProTable<API.StudentsVO>
        actionRef={refAction}
        rowKey="classId"
        request={async (params = {}) => {
          const data: API.StudentsQueryDTO = {
            ...params,
            classId: props.detailData?.id,
          };
          return convertPageData(await listStudents(data));
        }}
        columns={columns}
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setStudents(props.detailData);
              setVisible(true);
            }}
            disabled={selectedRowKeys.length>0}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
      />
      <InputStudentInClassDialog
        detailData={students}
        onClose={(result) => {
          setVisible(false);
          result && refAction.current?.reload();
        }}
        visible={visible}
      />
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
