import React from 'react';
import {
  PageHeader, Button, Descriptions,
  Typography,
  Row, List,
  Card
} from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';

const { Paragraph } = Typography;
const { Meta } = Card;

const contentData = [
  {
    title: 'NTC 300',
    description: '5 languages',
  },
  {
    title: 'Merged 800',
    description: '5 languages',
  },
  {
    title: 'Flitto',
    description: '10 languages',
  },
  {
    title: 'WMT',
    description: '8 languages',
  },
  {
    title: '기호 TC',
    description: '5 languages',
  },
];

const content = (
  <>
    <Paragraph>
      모델 평가에 사용되는 테스트 케이스를 관리합니다.
    </Paragraph>
    <Paragraph>
      아래 기능들을 사용할 수 있습니다.
      <li>신규 TC 생성</li>
      <li>기존 TC 수정 및 반영</li>
    </Paragraph>
  </>
);

export default (): React.ReactNode => {
  return(
    <PageContainer
      extra={[
        <Button key="1" type="primary">
          신규 생성
        </Button>,
      ]}
      content={content}
    >
      <List
        grid={{ gutter: 16, column: 5 }}
        dataSource={contentData}
        renderItem={item => (
          <List.Item>
            <Card
              style={{ width: 300 }}
              actions={[
                <SettingOutlined key="setting" />,
                <EditOutlined key="edit" />,
                <EllipsisOutlined key="ellipsis" />,
              ]}
            >
              <Meta
                title={item.title}
                description={item.description}
              />
            </Card>
          </List.Item>
        )}
      />
    </PageContainer>
  );
};