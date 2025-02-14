import { ModalForm, ProForm, ProFormInstance, ProFormText, ProFormSelect,} from '@ant-design/pro-components';
import { message} from 'antd';
import { useEffect, useRef } from 'react';
import { waitTime } from '@/utils/request';
import { addAStudent, updateAStudent } from '@/services/api/students';
import { listClassesMaps } from '@/services/api/classes';

interface InputDialogProps {
  detailData?: API.StudentsDTO;
  visible: boolean;
  onClose: (result: boolean) => void;
}

interface options{
  value: number,
  label: string,
}

export const classesRecord = await listClassesMaps();

export default function InputDialog(props: InputDialogProps) {
  const form = useRef<ProFormInstance>(null);
  const genderOption:options[] =[{value:1,label:'男'},{value:0,label:'女'}]
  const classesOption:options[] = []
  classesRecord!.forEach((item: any, index: number)=>{
    classesOption.push({value: classesRecord![index].id,label:classesRecord![index].id});
  })

  useEffect(() => {
    waitTime().then(() => {
      if (props.detailData) {
        form?.current?.setFieldsValue(props.detailData);
      } else {
        form?.current?.resetFields();
      }
    });
  }, [props.detailData, props.visible]);

  const onFinish = async (values: any) => {
    const { studentName, studentNum, gender, parentName, parentTel, classId } = values;
    const data: API.StudentsDTO = {
      id: props.detailData?.id,
      studentName,
      studentNum,
      gender,
      parentName,
      parentTel,
      classId,
    };

    try {
      if (props.detailData) {
        await updateAStudent(data, { throwError: true });
      } else {
        await addAStudent(data, { throwError: true });
      }
    } catch (ex) {
      return true;
    }
    props.onClose(true);
    message.success('您是最新的！');
    window.location.reload();
    return true;
  };

  return (
    <ModalForm
      width={600}
      onFinish={onFinish}
      formRef={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => props.onClose(false),
      }}
      title={props.detailData ? '修改学生' : '新建学生'}
      open={props.visible}
    >
        <ProForm.Group>
          <ProFormText
            name="studentName"
            label="姓名"
            rules={[
              {
                required: true,
                message: '请输入学生姓名！',
              },
            ]}
          />
          <ProFormSelect
            name="gender"
            width="xs"
            label="性别"
            rules={[
              {
                required: true,
                message: '请选择性别！',
              },
            ]}
            options={genderOption}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            name="classId"
            width={200}
            label="班级号"
            rules={[
              {
                required: true,
                message: '请选择班级号！',
              },
            ]}
            options={classesOption}
            showSearch
            fieldProps={{
              placeholder: '请输入或选择',
            }}
          />
          <ProFormText
            name="studentNum"
            label="学号"
            rules={[
              () => ({
                validator(_, value) {
                  if (Number(value) <= 2147483647 && Number(value) >= Math.pow(10,9)) {
                    return Promise.resolve();
                  }
                  else {
                    return Promise.reject(new Error("请输入有效的10位数字"));
                  }
                },
                required: true
              }),
            ]
            }
            disabled={props.detailData !== undefined}
            fieldProps={{
              placeholder: '请输入10位数字',
            }}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText name="parentName" label="家长姓名" />
          <ProFormText
            name="parentTel"
            label="家长电话"
            rules={[
              () => ({
                validator(_, value) {
                  if (value === undefined || value === null || Number(value) <= 2*Math.pow(10,10)) {
                    return Promise.resolve();
                  }
                  else {
                    return Promise.reject(new Error("请输入正确的电话号码"));
                  }
                },
              }),
            ]}
          />
        </ProForm.Group>
    </ModalForm>
  );
}
