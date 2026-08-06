import { useState } from 'react'
import {
  Button,
  Card,
  Space,
  Typography,
  Badge,
  Tag,
  Avatar,
  Progress,
  Statistic,
  Row,
  Col,
  Divider,
  notification,
  ConfigProvider,
  theme,
} from 'antd'
import {
  RocketOutlined,
  ThunderboltOutlined,
  StarOutlined,
  CheckCircleOutlined,
  BellOutlined,
  HeartOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export default function App() {
  const [count, setCount] = useState(0)
  const [api, contextHolder] = notification.useNotification()

  const openNotification = () => {
    api.success({
      message: '🎉 Bravo !',
      description: 'Tailwind CSS + Ant Design fonctionnent parfaitement ensemble !',
      placement: 'topRight',
    })
  }

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      {contextHolder}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 mb-6">
            <RocketOutlined className="text-purple-400 text-xl" />
            <Text className="text-white font-semibold tracking-widest uppercase text-sm">
              React + Vite + Tailwind + Ant Design
            </Text>
          </div>
          <Title
            level={1}
            className="!text-5xl !font-extrabold !mb-2"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Projet Compulec
          </Title>
          <Paragraph className="!text-slate-400 !text-lg">
            Stack moderne : React 19 · Vite · Tailwind CSS v4 · Ant Design v5
          </Paragraph>
        </div>

        {/* Stats Row */}
        <Row gutter={[16, 16]} className="mb-8 max-w-4xl mx-auto">
          {[
            { title: 'Composants', value: 48, prefix: <ThunderboltOutlined />, color: '#a78bfa' },
            { title: 'Satisfaction', value: 100, suffix: '%', prefix: <StarOutlined />, color: '#34d399' },
            { title: 'Vitesse Build', value: 0.8, suffix: 's', prefix: <RocketOutlined />, color: '#60a5fa' },
          ].map((stat, i) => (
            <Col xs={24} sm={8} key={i}>
              <Card
                className="text-center border-0"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Statistic
                  title={<span className="text-slate-400">{stat.title}</span>}
                  value={stat.value}
                  prefix={<span style={{ color: stat.color }}>{stat.prefix}</span>}
                  suffix={stat.suffix}
                  valueStyle={{ color: stat.color, fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Counter Card */}
          <Card
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,139,250,0.3)', backdropFilter: 'blur(10px)' }}
            title={
              <span className="text-purple-300 font-bold">
                <ThunderboltOutlined className="mr-2" />
                Compteur Interactif
              </span>
            }
          >
            <div className="text-center py-4">
              <div
                className="text-7xl font-black mb-4 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {count}
              </div>
              <Space size="middle">
                <Button
                  size="large"
                  type="default"
                  onClick={() => setCount(c => Math.max(0, c - 1))}
                  className="font-bold"
                >
                  −
                </Button>
                <Button
                  size="large"
                  type="primary"
                  onClick={() => setCount(c => c + 1)}
                  icon={<HeartOutlined />}
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  Incrémenter
                </Button>
                <Button size="large" danger onClick={() => setCount(0)}>
                  Reset
                </Button>
              </Space>
              <div className="mt-4">
                <Progress
                  percent={Math.min(count * 10, 100)}
                  strokeColor={{ from: '#a78bfa', to: '#60a5fa' }}
                  trailColor="rgba(255,255,255,0.1)"
                  showInfo={false}
                />
              </div>
            </div>
          </Card>

          {/* Features Card */}
          <Card
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,165,250,0.3)', backdropFilter: 'blur(10px)' }}
            title={
              <span className="text-blue-300 font-bold">
                <CheckCircleOutlined className="mr-2" />
                Technologies Installées
              </span>
            }
          >
            <Space direction="vertical" className="w-full" size="small">
              {[
                { name: 'React 19', desc: 'UI Library', color: 'blue' },
                { name: 'Vite', desc: 'Build Tool', color: 'purple' },
                { name: 'Tailwind CSS v4', desc: 'Utility CSS', color: 'cyan' },
                { name: 'Ant Design v5', desc: 'Component Library', color: 'green' },
              ].map((tech, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Space>
                    <Badge status="success" />
                    <Text className="text-white font-medium">{tech.name}</Text>
                  </Space>
                  <Tag color={tech.color}>{tech.desc}</Tag>
                </div>
              ))}
            </Space>
          </Card>

          {/* Notification Card */}
          <Card
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(52,211,153,0.3)', backdropFilter: 'blur(10px)' }}
            className="md:col-span-2"
            title={
              <span className="text-emerald-300 font-bold">
                <BellOutlined className="mr-2" />
                Test des Notifications Ant Design
              </span>
            }
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <Paragraph className="!text-slate-300">
                  Cliquez sur le bouton pour tester le système de notifications d'Ant Design.
                  Tout fonctionne parfaitement avec Tailwind CSS !
                </Paragraph>
                <Space wrap>
                  <Avatar style={{ backgroundColor: '#7c3aed' }} icon={<RocketOutlined />} size="large" />
                  <Avatar style={{ backgroundColor: '#4f46e5' }} icon={<StarOutlined />} size="large" />
                  <Avatar style={{ backgroundColor: '#0ea5e9' }} icon={<ThunderboltOutlined />} size="large" />
                  <Avatar style={{ backgroundColor: '#10b981' }} icon={<HeartOutlined />} size="large" />
                </Space>
              </div>
              <Divider type="vertical" className="!h-20 hidden md:block" />
              <div className="text-center">
                <Button
                  type="primary"
                  size="large"
                  icon={<BellOutlined />}
                  onClick={openNotification}
                  className="!px-8 !py-6 !text-base !font-bold !rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', height: 'auto' }}
                >
                  Tester Notification
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-slate-500 text-sm">
          <Text className="!text-slate-500">
            Projet Compulec — Développé avec React + Vite + Tailwind CSS + Ant Design
          </Text>
        </div>
      </div>
    </ConfigProvider>
  )
}
