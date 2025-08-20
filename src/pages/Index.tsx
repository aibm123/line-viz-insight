import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, Cell, PieChart, Pie } from 'recharts';
import { 
  ChevronDown, ChevronRight, Cpu, AlertTriangle, CheckCircle, Info, Settings, Bot, 
  Sliders, HardDrive, Wrench, Lightbulb, Zap, Activity, ShieldCheck, GitBranch, 
  Monitor, Gauge, Thermometer, Wind, Power, Database, RefreshCw, AlertCircle,
  TrendingUp, BarChart3, PieChart as PieChartIcon, Play, Pause, StopCircle,
  WifiOff, Wifi, Signal, Battery, Clock, MapPin, Layers
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// --- TYPES ---
interface MachineMetrics {
  [key: string]: number | string;
}

interface Machine {
  id: string;
  name: string;
  category: string;
  status: 'ok' | 'warning' | 'error';
  metrics: MachineMetrics;
}

interface BatchChild {
  id: string;
  details: string;
  status: string;
  weight?: number;
  time?: string;
}

interface BatchRecord {
  id: string;
  model: string;
  shift: number;
  quantity: number;
  status: string;
  oee: number;
  operator: string;
  startTime?: string;
  endTime?: string;
  aiSummary: string;
  children: BatchChild[];
}

interface OEETrend {
  name: string;
  oee: number;
  availability?: number;
  performance?: number;
  quality?: number;
}

interface CaseStudyAnalysis {
  title: string;
  methodology?: string;
  findings: string[];
  rootCause?: string;
}

interface CaseStudySolution {
  title: string;
  immediateAction: string;
  preventiveAction?: string[];
  implementation?: {
    duration: string;
    resources: string;
    cost: string;
  };
  outcome: string;
  oeeImpact: {
    before: number;
    after: number;
    improvement?: string;
  };
}

interface CaseStudy {
  id: string;
  title: string;
  tags: string[];
  severity: string;
  impact: string;
  problem: string;
  symptoms?: string[];
  analysis: CaseStudyAnalysis;
  solution: CaseStudySolution;
  lessons?: string[];
  attachments?: string[];
}

// --- EXPANDED DATA (5x more) ---

const PALLETIZING_MACHINE_DATA = {
  conveyor1: { id: 'conveyor1', name: 'Belt Conveyor 1', category: 'transport', status: 'ok', metrics: { speed: 25.4, vibration: 0.08, power: 2.1, temp: 34.2, runtime: 340 } },
  conveyor2: { id: 'conveyor2', name: 'Belt Conveyor 2', category: 'transport', status: 'ok', metrics: { speed: 24.8, vibration: 0.12, power: 2.3, temp: 36.1, runtime: 338 } },
  infeed: { id: 'infeed', name: 'Product Infeed Station', category: 'feeding', status: 'ok', metrics: { speed: 25, throughput: 45, power: 1.2, temp: 45.2, efficiency: 94.5 } },
  scanner1: { id: 'scanner1', name: 'Barcode Scanner 1', category: 'control', status: 'ok', metrics: { readRate: 99.8, errors: 0, power: 0.3, temp: 28.5, scansPerMin: 42 } },
  boxing: { id: 'boxing', name: 'Auto Boxing Unit', category: 'packaging', status: 'ok', metrics: { speed: 24.9, errors: 1, vibration: 0.12, power: 2.5, boxes: 1247 } },
  weightCheck: { id: 'weightCheck', name: 'Weight Checker', category: 'quality', status: 'warning', metrics: { accuracy: 99.95, rejects: 2, power: 0.8, temp: 31.2, weightsPerMin: 48 } },
  picking: { id: 'picking', name: 'Robot Picker Arm', category: 'robotics', status: 'warning', metrics: { cycleTime: 3.1, errors: 3, motorCurrent: 5.8, pressure: 5.9, picks: 2840 } },
  vision1: { id: 'vision1', name: 'Vision System 1', category: 'quality', status: 'ok', metrics: { accuracy: 99.9, fps: 30, power: 1.1, temp: 42.3, inspections: 3210 } },
  palletizing: { id: 'palletizing', name: 'Palletizing Robot', category: 'robotics', status: 'ok', metrics: { accuracy: 99.98, errors: 0, load: 85, power: 4.1, pallets: 124 } },
  wrapping: { id: 'wrapping', name: 'Pallet Wrapper', category: 'packaging', status: 'ok', metrics: { tension: 15.2, errors: 0, filmUsage: 98.7, power: 1.8, wraps: 98 } },
  labeling: { id: 'labeling', name: 'Label Applicator', category: 'packaging', status: 'ok', metrics: { accuracy: 99.95, errors: 0, power: 0.9, temp: 29.8, labels: 1205 } },
  outfeed: { id: 'outfeed', name: 'Outfeed Conveyor', category: 'transport', status: 'ok', metrics: { throughput: 24.5, errors: 0, queue: 3, power: 0.8, pallets: 96 } },
  plc1: { id: 'plc1', name: 'Main PLC Controller', category: 'control', status: 'ok', metrics: { cpuLoad: 23.4, memUsage: 45.2, power: 0.4, temp: 38.9, ioStatus: 100 } },
  hmi1: { id: 'hmi1', name: 'Operator HMI Panel', category: 'control', status: 'ok', metrics: { uptime: 99.9, power: 0.2, temp: 35.1, touch: 98.5, alerts: 0 } },
  airComp: { id: 'airComp', name: 'Air Compressor', category: 'utility', status: 'ok', metrics: { pressure: 6.2, power: 12.4, temp: 68.3, flow: 85.2, hours: 2340 } },
  chiller: { id: 'chiller', name: 'Cooling Unit', category: 'utility', status: 'ok', metrics: { tempOut: 15.2, power: 8.9, flow: 42.1, efficiency: 87.4, hours: 1980 } },
  ups1: { id: 'ups1', name: 'UPS System 1', category: 'power', status: 'ok', metrics: { load: 67.8, battery: 100, power: 15.2, temp: 28.9, runtime: 480 } },
  scanner2: { id: 'scanner2', name: 'QR Scanner Exit', category: 'control', status: 'ok', metrics: { readRate: 99.7, errors: 1, power: 0.3, temp: 29.1, scansPerMin: 38 } },
  safety1: { id: 'safety1', name: 'Safety Light Curtain', category: 'safety', status: 'ok', metrics: { status: 100, beam: 100, power: 0.1, temp: 26.8, triggers: 0 } },
  motor1: { id: 'motor1', name: 'Main Drive Motor', category: 'drive', status: 'ok', metrics: { rpm: 1450, current: 15.4, power: 11.2, temp: 62.1, vibration: 0.15 } },
  encoder1: { id: 'encoder1', name: 'Position Encoder 1', category: 'sensor', status: 'ok', metrics: { resolution: 1024, accuracy: 99.99, power: 0.1, temp: 31.5, pulses: 98420 } },
  press1: { id: 'press1', name: 'Pressure Sensor 1', category: 'sensor', status: 'ok', metrics: { pressure: 5.8, accuracy: 99.9, power: 0.05, temp: 28.2, readings: 15680 } },
  valve1: { id: 'valve1', name: 'Pneumatic Valve 1', category: 'actuator', status: 'ok', metrics: { cycles: 2840, pressure: 6.0, power: 0.2, temp: 35.4, response: 45 } },
  servo1: { id: 'servo1', name: 'Servo Motor 1', category: 'drive', status: 'warning', metrics: { position: 180.5, torque: 85.2, power: 2.4, temp: 58.9, accuracy: 99.95 } },
  inverter1: { id: 'inverter1', name: 'VFD Controller 1', category: 'drive', status: 'ok', metrics: { frequency: 50.1, output: 380, power: 18.5, temp: 45.2, efficiency: 94.8 } },
  router1: { id: 'router1', name: 'Network Router', category: 'network', status: 'ok', metrics: { uptime: 99.95, packets: 45680, power: 0.8, temp: 42.1, connections: 24 } }
};

const WELDING_MACHINE_DATA = {
  loader1: { id: 'loader1', name: 'Auto Part Loader', category: 'loading', status: 'ok', metrics: { cycleTime: 5.1, accuracy: 99.9, power: 1.5, parts: 820, temp: 38.5 } },
  fixture1: { id: 'fixture1', name: 'Welding Fixture 1', category: 'fixture', status: 'ok', metrics: { clampForce: 1250, accuracy: 99.95, power: 0.8, cycles: 815, temp: 42.1 } },
  welder1: { id: 'welder1', name: 'Welding Robot 1', category: 'welding', status: 'ok', metrics: { voltage: 24.1, current: 180, gasFlow: 15.2, wireSpeed: 7.5, power: 6.8 } },
  welder2: { id: 'welder2', name: 'Welding Robot 2', category: 'welding', status: 'warning', metrics: { voltage: 23.8, current: 175, gasFlow: 14.8, wireSpeed: 7.5, power: 6.5 } },
  torch1: { id: 'torch1', name: 'Welding Torch 1', category: 'tool', status: 'ok', metrics: { temp: 280, gasFlow: 15.2, wireUsage: 85.4, power: 0.2, arc: 98.9 } },
  torch2: { id: 'torch2', name: 'Welding Torch 2', category: 'tool', status: 'warning', metrics: { temp: 295, gasFlow: 14.5, wireUsage: 87.2, power: 0.2, arc: 96.8 } },
  vision2: { id: 'vision2', name: 'Weld Vision System', category: 'quality', status: 'ok', metrics: { passRate: 99.8, defects: 1, processTime: 1.2, power: 0.5, inspections: 810 } },
  seamer: { id: 'seamer', name: 'Seam Tracker', category: 'guidance', status: 'ok', metrics: { accuracy: 99.92, tracking: 100, power: 0.4, temp: 35.8, tracks: 1620 } },
  cooling: { id: 'cooling', name: 'Cooling Station', category: 'cooling', status: 'ok', metrics: { tempIn: 180, tempOut: 40, time: 60, power: 3.1, flow: 28.5 } },
  gasSupply: { id: 'gasSupply', name: 'Shielding Gas Supply', category: 'supply', status: 'ok', metrics: { pressure: 2.8, flow: 15.0, purity: 99.98, power: 0.3, volume: 850 } },
  wireFeeder: { id: 'wireFeeder', name: 'Wire Feeder Unit', category: 'supply', status: 'ok', metrics: { speed: 7.5, tension: 35, power: 0.6, temp: 32.1, wire: 92.5 } },
  unloader: { id: 'unloader', name: 'Part Unloader', category: 'unloading', status: 'ok', metrics: { cycleTime: 4.5, errors: 0, power: 1.1, parts: 800, temp: 36.2 } },
  positioner: { id: 'positioner', name: 'Welding Positioner', category: 'positioning', status: 'ok', metrics: { rotation: 45.5, tilt: 15.2, power: 2.8, accuracy: 99.9, cycles: 405 } },
  exhaust: { id: 'exhaust', name: 'Fume Extractor', category: 'ventilation', status: 'ok', metrics: { airflow: 850, power: 4.2, filter: 85.2, temp: 28.9, hours: 2150 } },
  plc2: { id: 'plc2', name: 'Welding PLC', category: 'control', status: 'ok', metrics: { cpuLoad: 28.5, memUsage: 52.1, power: 0.4, temp: 41.2, ioStatus: 100 } },
  powerSource1: { id: 'powerSource1', name: 'Welding Power Source 1', category: 'power', status: 'ok', metrics: { voltage: 24.0, current: 180, power: 4.32, efficiency: 88.5, temp: 65.2 } },
  powerSource2: { id: 'powerSource2', name: 'Welding Power Source 2', category: 'power', status: 'warning', metrics: { voltage: 23.5, current: 175, power: 4.11, efficiency: 86.8, temp: 68.1 } },
  transformer: { id: 'transformer', name: 'Step-down Transformer', category: 'power', status: 'ok', metrics: { inputV: 480, outputV: 24, power: 15.8, efficiency: 94.2, temp: 58.9 } },
  chiller2: { id: 'chiller2', name: 'Torch Cooling Unit', category: 'cooling', status: 'ok', metrics: { tempOut: 18.5, flow: 12.5, power: 2.4, efficiency: 91.2, temp: 25.8 } },
  regulator: { id: 'regulator', name: 'Gas Pressure Regulator', category: 'control', status: 'ok', metrics: { pressureIn: 8.5, pressureOut: 2.8, flow: 15.0, accuracy: 99.8, temp: 24.5 } },
  flowmeter: { id: 'flowmeter', name: 'Gas Flow Meter', category: 'sensor', status: 'ok', metrics: { flow: 15.0, accuracy: 99.9, power: 0.1, temp: 26.3, readings: 24580 } },
  groundClamp: { id: 'groundClamp', name: 'Ground Clamp Assembly', category: 'grounding', status: 'ok', metrics: { resistance: 0.02, contact: 100, power: 0, temp: 28.1, connections: 815 } },
  arcStarter: { id: 'arcStarter', name: 'Arc Starting Unit', category: 'ignition', status: 'ok', metrics: { voltage: 6000, success: 99.5, power: 0.8, temp: 45.8, starts: 1630 } },
  wireGuide: { id: 'wireGuide', name: 'Wire Guide System', category: 'guidance', status: 'ok', metrics: { alignment: 99.9, wear: 15.2, power: 0.1, temp: 31.5, guides: 3260 } },
  preheater: { id: 'preheater', name: 'Part Preheater', category: 'heating', status: 'ok', metrics: { temp: 120, power: 8.5, efficiency: 92.8, cycles: 200, time: 180 } }
};

const PALLETIZING_BATCH_RECORDS = [
  {
    id: 'BATCH-P001', model: 'CS-XU9ZKH-8', shift: 1, quantity: 40, status: 'Hoàn thành', 
    oee: 88.2, operator: 'An Nguyễn', startTime: '06:00', endTime: '14:00',
    aiSummary: 'Lô sản xuất đạt hiệu suất tốt. Ghi nhận 1 lỗi nhỏ tại máy đóng thùng, không ảnh hưởng chất lượng.',
    children: [
      { id: 'PALLET-001A', details: 'Pallet 1A, 20 máy điều hòa', status: 'Hoàn thành', weight: 850, time: '3.2h' },
      { id: 'PALLET-001B', details: 'Pallet 1B, 20 máy điều hòa', status: 'Hoàn thành', weight: 840, time: '3.1h' }
    ]
  },
  {
    id: 'BATCH-P002', model: 'CS-U12ZKH-8', shift: 2, quantity: 30, status: 'Đang xử lý',
    oee: 84.5, operator: 'Bình Trần', startTime: '14:00', endTime: '22:00',
    aiSummary: 'Robot gắp đặt giảm 8% hiệu suất do thời gian chu kỳ tăng. Cần kiểm tra cơ cấu kẹp.',
    children: [
      { id: 'PALLET-002A', details: 'Pallet 2A, 15 máy điều hòa', status: 'Hoàn thành', weight: 635, time: '2.8h' },
      { id: 'PALLET-002B', details: 'Pallet 2B, 15 máy điều hòa', status: 'Đang xử lý', weight: 420, time: '1.9h' }
    ]
  },
  {
    id: 'BATCH-P003', model: 'CS-Z18ZKH-8', shift: 3, quantity: 35, status: 'Lên lịch',
    oee: 0, operator: 'Cường Vũ', startTime: '22:00', endTime: '06:00',
    aiSummary: 'Batch được lên lịch sản xuất ca đêm. Dự kiến hoàn thành trong 8 giờ.',
    children: [
      { id: 'PALLET-003A', details: 'Pallet 3A, 18 máy điều hòa', status: 'Chờ', weight: 0, time: '0h' },
      { id: 'PALLET-003B', details: 'Pallet 3B, 17 máy điều hòa', status: 'Chờ', weight: 0, time: '0h' }
    ]
  }
];

const WELDING_BATCH_RECORDS = [
  {
    id: 'BATCH-W001', model: 'FRAME-A1-DLX', shift: 1, quantity: 120, status: 'Hoàn thành',
    oee: 90.1, operator: 'Văn Dũng', startTime: '06:00', endTime: '14:00',
    aiSummary: 'Lô hàng hoàn thành với chất lượng cao. Ghi nhận dòng hàn ổn định suốt ca.',
    children: [
      { id: 'RACK-W01A', details: 'Giá 1A, 60 khung chassis', status: 'Hoàn thành', weight: 1800, time: '4.1h' },
      { id: 'RACK-W01B', details: 'Giá 1B, 60 khung chassis', status: 'Hoàn thành', weight: 1850, time: '3.9h' }
    ]
  },
  {
    id: 'BATCH-W002', model: 'FRAME-B2-STD', shift: 2, quantity: 150, status: 'Đang xử lý',
    oee: 86.7, operator: 'Hải Sơn', startTime: '14:00', endTime: '22:00',
    aiSummary: 'Phát hiện dòng khí bảo vệ tại Robot 2 giảm nhẹ, có thể ảnh hưởng chất lượng mối hàn.',
    children: [
      { id: 'RACK-W02A', details: 'Giá 2A, 75 khung chassis', status: 'Hoàn thành', weight: 2250, time: '3.8h' },
      { id: 'RACK-W02B', details: 'Giá 2B, 75 khung chassis', status: 'Đang xử lý', weight: 1580, time: '2.1h' }
    ]
  },
  {
    id: 'BATCH-W003', model: 'FRAME-C3-PRO', shift: 3, quantity: 100, status: 'Lên lịch',
    oee: 0, operator: 'Long Hoàng', startTime: '22:00', endTime: '06:00',
    aiSummary: 'Batch sản xuất khung cao cấp, yêu cầu đặc biệt về chất lượng hàn.',
    children: [
      { id: 'RACK-W03A', details: 'Giá 3A, 50 khung chassis', status: 'Chờ', weight: 0, time: '0h' },
      { id: 'RACK-W03B', details: 'Giá 3B, 50 khung chassis', status: 'Chờ', weight: 0, time: '0h' }
    ]
  }
];

// Enhanced Knowledge Base with full case study format
const PALLETIZING_KNOWLEDGE_BASE = [
  {
    id: 'case-p01', title: 'Case Study: Giải quyết vấn đề lỗi xếp lệch pallet', 
    tags: ['Robot', 'Calibration', 'Quality'], severity: 'Medium', impact: 'Quality',
    problem: 'Dây chuyền Palletizing ghi nhận tỷ lệ lỗi xếp pallet tăng 5% trong 3 ngày qua, gây mất ổn định pallet và phải làm lại bằng tay, ảnh hưởng nghiêm trọng đến chỉ số Quality và Availability.',
    symptoms: [
      'Sản phẩm không được xếp đúng vị trí trên pallet',
      'Pallet bị nghiêng, mất cân bằng',
      'Tăng thời gian xử lý thủ công',
      'Alarm từ vision system về độ lệch vị trí'
    ],
    analysis: {
      title: 'Phân tích sâu của AI System',
      methodology: 'Sử dụng Machine Learning để phân tích pattern dữ liệu từ 15 sensors trong 72 giờ',
      findings: [
        'AI phát hiện sự trôi điểm zero (zero-point drift) của trục Z trên robot palletizing',
        'Biểu đồ nhiệt độ cho thấy nhiệt độ motor servo tăng 8°C so với baseline',
        'Correlation analysis cho thấy độ lệch tăng dần tuyến tính theo thời gian hoạt động',
        'Vibration sensor ghi nhận frequency spike tại 45Hz (bearing wear indicator)',
        'Vision system xác nhận độ lệch vượt ngưỡng tolerance 0.5mm sau 3h hoạt động liên tục'
      ],
      rootCause: 'Thermal expansion của mechanical components kết hợp với wear của precision bearing'
    },
    solution: {
      title: 'Giải pháp tối ưu & Implementation',
      immediateAction: 'Thực hiện re-calibration điểm zero cho robot theo ISO 9283 standard',
      preventiveAction: [
        'Cài đặt automatic thermal compensation algorithm',
        'Lên lịch preventive calibration mỗi 500 operating hours',
        'Upgrade cooling system cho servo motors',
        'Implement real-time drift monitoring với automatic adjustment'
      ],
      implementation: {
        duration: '45 phút downtime cho emergency calibration',
        resources: 'Maintenance team + Robot technician',
        cost: 'Minimal - sử dụng existing calibration tools'
      },
      outcome: 'Tỷ lệ lỗi giảm từ 5% về 0.1%. Quality index phục hồi 100%. ROI achieved trong 2 shifts.',
      oeeImpact: { before: 82.1, after: 87.5, improvement: '+5.4%' }
    },
    lessons: [
      'Thermal effects cần được monitor continuously trong precision applications',
      'Predictive maintenance algorithms có thể prevent 90% similar issues',
      'Investment trong advanced cooling systems có ROI cao cho high-precision robotics'
    ],
    attachments: ['Calibration_Protocol_v2.1.pdf', 'Thermal_Analysis_Report.xlsx', 'Before_After_Comparison.mp4']
  },
  {
    id: 'case-p02', title: 'Case Study: Tối ưu hóa throughput với AI-driven scheduling',
    tags: ['AI', 'Optimization', 'Throughput'], severity: 'Low', impact: 'Efficiency',
    problem: 'Throughput của dây chuyền đạt chỉ 85% so với thiết kế, với bottleneck không rõ ràng. Management yêu cầu tăng output 15% mà không đầu tư thêm equipment.',
    symptoms: [
      'Random delays không giải thích được',
      'Machine utilization không đồng đều',
      'Buffer zones thường xuyên overflow hoặc starved',
      'OEE fluctuation không có pattern rõ ràng'
    ],
    analysis: {
      title: 'AI-Powered Bottleneck Analysis',
      methodology: 'Deep learning analysis trên 30 ngày production data với 200+ variables',
      findings: [
        'Hidden bottleneck tại conveyor transition points do non-optimal speed matching',
        'Batching strategy không tối ưu - mixing fast/slow products gây blocking',
        'Preventive maintenance schedule conflicts với peak production windows',
        'Operator break timing tạo ra cascading delays',
        'Material feeding rhythm không sync với machine capacity'
      ],
      rootCause: 'Lack of holistic system optimization - mỗi machine được tune riêng lẻ'
    },
    solution: {
      title: 'AI-Driven Dynamic Optimization System',
      immediateAction: 'Deploy real-time scheduling algorithm với predictive modeling',
      preventiveAction: [
        'Implement machine learning-based speed coordination',
        'Dynamic batching based on real-time system state',
        'Intelligent maintenance scheduling với production forecast',
        'Automated material feeding với demand prediction'
      ],
      implementation: {
        duration: '1 tuần implementation + 2 tuần fine-tuning',
        resources: 'AI team + Process engineers + IT support',
        cost: 'Software development cost only - no hardware changes'
      },
      outcome: 'Throughput increase 18.5% (vượt target). Machine utilization cân bằng 95%+. Energy efficiency tăng 12%.',
      oeeImpact: { before: 85.2, after: 91.8, improvement: '+6.6%' }
    },
    lessons: [
      'System-level optimization >>> individual machine optimization',
      'AI có thể find non-obvious patterns trong complex manufacturing systems',
      'Real-time adaptive control superior to static optimization'
    ],
    attachments: ['AI_Algorithm_Specification.pdf', 'Before_After_Metrics.xlsx', 'System_Architecture.png']
  }
];

const WELDING_KNOWLEDGE_BASE = [
  {
    id: 'case-w01', title: 'Case Study: Khắc phục lỗi mối hàn bị rỗ khí (porosity)',
    tags: ['Welding', 'Gas Flow', 'Quality'], severity: 'High', impact: 'Quality',
    problem: 'Tỷ lệ lỗi rỗ khí trên sản phẩm FRAME-B2 tăng đột biến lên 8% trong 48h, gây phải sửa chữa thủ công hàng loạt và risk recall products đã ship.',
    symptoms: [
      'Visual inspection phát hiện tiny holes trong weld beads',
      'X-ray testing confirm internal voids',
      'Strength testing giảm 15% so với specification',
      'Customer quality audit ghi nhận non-conformance'
    ],
    analysis: {
      title: 'Root Cause Analysis với Multi-sensor Fusion',
      methodology: 'Combine data từ gas flow sensors, pressure monitors, vision systems và spectrographic analysis',
      findings: [
        'AI phát hiện sự sụt giảm bất thường của lưu lượng khí bảo vệ (gas flow) tại Robot 2, correlation 0.94 với thời điểm lỗi xuất hiện',
        'Pressure sensor data cho thấy micro-leakage pattern với cyclic behavior',
        'Spectrographic analysis confirm elevated oxygen content trong shielding gas',
        'Thermal imaging reveals hot spots tại flexible hose connections',
        'Statistical analysis pinpoint exact location: flexible coupling near torch assembly'
      ],
      rootCause: 'Deterioration của O-ring seals trong flexible gas coupling do thermal cycling fatigue'
    },
    solution: {
      title: 'Comprehensive Fix & Prevention Strategy',
      immediateAction: 'Emergency replacement của gas hose assembly với improved high-temp seals',
      preventiveAction: [
        'Upgrade to premium VITON seals rated cho high-temperature cycling',
        'Install redundant pressure monitoring với alarm thresholds',
        'Implement automated leak detection system',
        'Schedule preventive replacement every 2000 operating hours',
        'Add torch cooling enhancement để reduce thermal stress'
      ],
      implementation: {
        duration: '4 giờ emergency maintenance + 1 shift testing',
        resources: 'Welding specialists + Quality team + Gas supplier support',
        cost: '$1,200 cho premium components vs $45,000 potential recall cost'
      },
      outcome: 'Porosity rate giảm từ 8% về <0.1%. Customer audit passed. Strength specs exceeded by 5%.',
      oeeImpact: { before: 81.4, after: 88.9, improvement: '+7.5%' }
    },
    lessons: [
      'Proactive seal maintenance critical trong high-thermal-cycling applications',
      'Multi-sensor fusion enables precise fault localization',
      'Premium components có lower total cost of ownership',
      'Real-time monitoring prevents quality disasters'
    ],
    attachments: ['Leak_Detection_Protocol.pdf', 'Seal_Upgrade_Specification.pdf', 'Quality_Recovery_Report.pdf']
  }
];

// Enhanced OEE trend data (5x more points)
const PALLETIZING_OEE_TREND = [
  { name: '00:00', oee: 85.2, availability: 92.1, performance: 88.4, quality: 95.8 },
  { name: '00:30', oee: 85.8, availability: 91.8, performance: 89.1, quality: 95.9 },
  { name: '01:00', oee: 86.1, availability: 92.5, performance: 88.7, quality: 96.2 },
  { name: '01:30', oee: 85.9, availability: 92.0, performance: 89.3, quality: 95.5 },
  { name: '02:00', oee: 86.4, availability: 92.8, performance: 88.9, quality: 96.1 },
  { name: '02:30', oee: 85.7, availability: 91.6, performance: 89.5, quality: 95.7 },
  { name: '03:00', oee: 86.2, availability: 92.4, performance: 89.0, quality: 96.0 },
  { name: '03:30', oee: 85.8, availability: 91.9, performance: 89.2, quality: 95.8 },
  { name: '04:00', oee: 86.5, availability: 92.6, performance: 89.4, quality: 96.3 },
  { name: '04:30', oee: 85.9, availability: 92.1, performance: 88.8, quality: 95.9 },
  { name: '05:00', oee: 86.8, availability: 93.1, performance: 89.1, quality: 96.5 },
  { name: '05:30', oee: 86.3, availability: 92.5, performance: 89.7, quality: 95.8 },
  { name: '06:00', oee: 87.3, availability: 93.4, performance: 89.2, quality: 96.7 },
  { name: '06:30', oee: 87.1, availability: 93.0, performance: 89.8, quality: 96.4 },
  { name: '07:00', oee: 87.8, availability: 93.7, performance: 89.5, quality: 96.9 },
  { name: '07:30', oee: 87.5, availability: 93.2, performance: 90.1, quality: 96.3 },
  { name: '08:00', oee: 88.1, availability: 94.0, performance: 89.7, quality: 97.1 },
  { name: '08:30', oee: 87.9, availability: 93.8, performance: 90.3, quality: 96.8 },
  { name: '09:00', oee: 88.4, availability: 94.2, performance: 90.0, quality: 97.3 },
  { name: '09:30', oee: 87.7, availability: 93.5, performance: 90.5, quality: 96.6 },
  { name: '10:00', oee: 84.5, availability: 89.2, performance: 91.2, quality: 96.8 }, // Maintenance dip
  { name: '10:30', oee: 86.8, availability: 92.4, performance: 90.1, quality: 96.4 },
  { name: '11:00', oee: 87.6, availability: 93.6, performance: 89.9, quality: 97.0 }
];

const WELDING_OEE_TREND = [
  { name: '00:00', oee: 88.5, availability: 94.2, performance: 89.1, quality: 95.8 },
  { name: '00:30', oee: 89.1, availability: 94.8, performance: 89.4, quality: 96.2 },
  { name: '01:00', oee: 89.2, availability: 94.5, performance: 90.1, quality: 95.9 },
  { name: '01:30', oee: 88.8, availability: 94.1, performance: 89.7, quality: 96.4 },
  { name: '02:00', oee: 89.5, availability: 95.0, performance: 89.8, quality: 96.1 },
  { name: '02:30', oee: 89.3, availability: 94.7, performance: 90.2, quality: 95.7 },
  { name: '03:00', oee: 90.1, availability: 95.4, performance: 90.0, quality: 96.8 },
  { name: '03:30', oee: 89.8, availability: 95.1, performance: 90.4, quality: 96.3 },
  { name: '04:00', oee: 90.4, availability: 95.7, performance: 90.1, quality: 97.0 },
  { name: '04:30', oee: 90.0, availability: 95.3, performance: 90.6, quality: 96.5 },
  { name: '05:00', oee: 90.7, availability: 96.0, performance: 90.3, quality: 97.2 },
  { name: '05:30', oee: 90.2, availability: 95.5, performance: 90.8, quality: 96.7 },
  { name: '06:00', oee: 89.5, availability: 94.8, performance: 90.5, quality: 96.4 },
  { name: '06:30', oee: 89.8, availability: 95.2, performance: 90.2, quality: 96.9 },
  { name: '07:00', oee: 90.3, availability: 95.6, performance: 90.7, quality: 96.6 },
  { name: '07:30', oee: 89.9, availability: 95.0, performance: 91.0, quality: 96.8 },
  { name: '08:00', oee: 87.2, availability: 91.8, performance: 91.3, quality: 96.1 }, // Gas flow issue
  { name: '08:30', oee: 88.6, availability: 93.5, performance: 90.9, quality: 96.5 },
  { name: '09:00', oee: 89.4, availability: 94.7, performance: 90.6, quality: 96.8 },
  { name: '09:30', oee: 89.1, availability: 94.3, performance: 91.1, quality: 96.4 },
  { name: '10:00', oee: 86.7, availability: 92.1, performance: 90.8, quality: 95.8 }, // Current issue
  { name: '10:30', oee: 88.2, availability: 93.8, performance: 90.5, quality: 96.2 },
  { name: '11:00', oee: 89.0, availability: 94.5, performance: 90.3, quality: 96.7 }
];

// --- ENHANCED UI COMPONENTS ---

const StatusBadge = ({ status, size = "sm" }) => {
  const variants = {
    ok: "status-ok",
    warning: "status-warning", 
    error: "status-error"
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };
  
  return (
    <Badge className={`${variants[status]} ${sizeClasses[size]} font-semibold border rounded-full`}>
      {status === 'ok' ? 'Online' : status === 'warning' ? 'Cảnh báo' : 'Lỗi'}
    </Badge>
  );
};

const MetricCard = ({ icon: Icon, title, value, unit, trend, status = "ok" }: { 
  icon: any; 
  title: string; 
  value: string | number; 
  unit: string; 
  trend?: number; 
  status?: string; 
}) => (
  <div className="card-glass p-4 space-y-2">
    <div className="flex items-center justify-between">
      <Icon size={20} className="text-muted-foreground" />
      <StatusBadge status={status} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value} <span className="text-sm text-muted-foreground">{unit}</span></p>
      {trend && <p className={`text-xs ${trend > 0 ? 'text-success' : 'text-error'}`}>
        {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
      </p>}
    </div>
  </div>
);

const AIInsightBot = ({ onGenerate, context, title = "Phân tích AI" }) => {
  const [insight, setInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGenerate = () => {
    setIsLoading(true);
    setInsight(null);
    setTimeout(() => {
      setInsight(onGenerate(context));
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="card-industrial p-4 mt-4">
      <Button 
        onClick={handleGenerate} 
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground"
      >
        <Bot size={18} className="mr-2" />
        {isLoading ? 'Đang phân tích...' : title}
      </Button>
      {insight && (
        <div className="mt-4 p-4 bg-info-bg border border-info rounded-lg animate-fade-in">
          <div className="font-semibold text-info mb-2">💡 AI Analysis Report</div>
          <div className="text-sm text-foreground">{insight}</div>
        </div>
      )}
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENTS ---

function EnhancedOEEDashboard({ records, trendData, lineType }) {
  const overallOee = useMemo(() => {
    const validRecords = records.filter(r => r.oee > 0);
    return validRecords.length > 0 ? 
      (validRecords.reduce((acc, r) => acc + r.oee, 0) / validRecords.length) : 0;
  }, [records]);
  
  const currentTrend = trendData[trendData.length - 1];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* OEE Overview */}
      <Card className="lg:col-span-1 card-industrial p-6">
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            {overallOee.toFixed(1)}%
          </div>
          <div className="text-lg font-semibold text-muted-foreground">
            OEE Tổng Quan
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-success">{currentTrend?.availability || 0}%</div>
              <div className="text-muted-foreground">Availability</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-warning">{currentTrend?.performance || 0}%</div>
              <div className="text-muted-foreground">Performance</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-info">{currentTrend?.quality || 0}%</div>
              <div className="text-muted-foreground">Quality</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Trend Chart */}
      <Card className="lg:col-span-2 card-industrial p-6">
        <h3 className="font-semibold mb-4">Xu hướng OEE - 12 giờ qua</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="oeeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[80, 95]} stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--surface))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)'
              }} 
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="oee" 
              stroke="hsl(var(--primary))" 
              fill="url(#oeeGradient)"
              strokeWidth={2}
              name="OEE %"
            />
            <Line 
              type="monotone" 
              dataKey="availability" 
              stroke="hsl(var(--success))" 
              strokeWidth={1.5}
              name="Availability %"
            />
            <Line 
              type="monotone" 
              dataKey="performance" 
              stroke="hsl(var(--warning))" 
              strokeWidth={1.5}
              name="Performance %"
            />
            <Line 
              type="monotone" 
              dataKey="quality" 
              stroke="hsl(var(--info))" 
              strokeWidth={1.5}
              name="Quality %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function ProductionLineOverview({ machines, records, lineType }: { 
  machines: Record<string, Machine>; 
  records: BatchRecord[]; 
  lineType: string; 
}) {
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [viewMode, setViewMode] = useState('workflow'); // 'workflow' or 'category'
  
  // Group machines by category
  const machinesByCategory = useMemo(() => {
    const categories: Record<string, Machine[]> = {};
    Object.values(machines).forEach(machine => {
      const cat = machine.category || 'other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(machine);
    });
    return categories;
  }, [machines]);
  
  const handleMachineClick = (machine) => {
    setSelectedMachine(selectedMachine?.id === machine.id ? null : machine);
  };
  
  const generateMachineInsight = (machineId) => {
    const machine = machines[machineId];
    return `🔧 Machine: ${machine.name}
📊 Status: ${machine.status === 'ok' ? 'Hoạt động bình thường' : 'Cần chú ý'}  
⚡ Power: ${Object.values(machine.metrics).find(v => typeof v === 'number' && v < 50) || 'N/A'}kW
🌡️ Temperature: ${Object.values(machine.metrics).find(v => typeof v === 'number' && v > 20 && v < 100) || 'N/A'}°C
🎯 Efficiency: ${((Math.random() * 10) + 90).toFixed(1)}%
💡 Recommendation: ${machine.status === 'warning' ? 'Lên lịch bảo trì trong 24h tới' : 'Duy trì operating parameters hiện tại'}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="card-industrial p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold">
            {lineType === 'palletizing' ? '🏭 Dây chuyền Palletizing' : '⚡ Dây chuyền Welding'}
          </h2>
          <div className="flex items-center gap-4">
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList>
                <TabsTrigger value="workflow">Workflow View</TabsTrigger>
                <TabsTrigger value="category">Category View</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Live Update
            </Button>
          </div>
        </div>
      </Card>
      
      {viewMode === 'workflow' ? (
        /* Workflow View - Original flow layout */
        <Card className="card-industrial p-6">
          <div className="flex items-center justify-between overflow-x-auto py-4 px-2 gap-4">
            {Object.values(machines).slice(0, 8).map((machine, index, arr) => (
              <React.Fragment key={machine.id}>
                <div 
                  className="flex flex-col items-center text-center cursor-pointer group"
                  onClick={() => handleMachineClick(machine)}
                >
                  <div className={`machine-node ${
                    selectedMachine?.id === machine.id ? 'bg-primary/20 border-primary animate-pulse-glow' : 
                    machine.status === 'ok' ? 'bg-success/20 border-success' : 'bg-warning/20 border-warning'
                  }`}>
                    {machine.status === 'ok' ? 
                      <CheckCircle className="text-success" size={32}/> : 
                      <AlertTriangle className="text-warning" size={32}/>
                    }
                  </div>
                  <p className={`mt-2 w-28 font-bold text-sm ${
                    selectedMachine?.id === machine.id ? 'text-primary' : 'text-foreground'
                  }`}>
                    {machine.name}
                  </p>
                  <StatusBadge status={machine.status} />
                </div>
                {index < arr.length - 1 && (
                  <div className="h-1 bg-gradient-to-r from-primary to-primary-light rounded-full flex-1 min-w-8"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>
      ) : (
        /* Category View - Grouped by machine type */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(machinesByCategory).map(([category, categoryMachines]) => (
            <Card key={category} className="card-industrial p-4">
              <h3 className="font-semibold mb-4 capitalize text-primary">
                {category} ({categoryMachines.length})
              </h3>
              <div className="space-y-3">
                {categoryMachines.map(machine => (
                  <div 
                    key={machine.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface border cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleMachineClick(machine)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        machine.status === 'ok' ? 'bg-success' : 'bg-warning'
                      }`} />
                      <span className="font-medium text-sm">{machine.name}</span>
                    </div>
                    <StatusBadge status={machine.status} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Selected Machine Details */}
      {selectedMachine && (
        <Card className="card-industrial p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary">{selectedMachine.name}</h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedMachine.status} size="md" />
              <Badge variant="outline">{selectedMachine.category}</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            {Object.entries(selectedMachine.metrics).map(([key, value]) => (
              <MetricCard
                key={key}
                icon={key.includes('temp') ? Thermometer : key.includes('power') ? Power : Gauge}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
                value={typeof value === 'number' ? value.toFixed(1) : String(value)}
                unit={key.includes('temp') ? '°C' : key.includes('power') ? 'kW' : ''}
                trend={Math.random() > 0.5 ? Math.random() * 5 : undefined}
                status={selectedMachine.status}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time metrics chart */}
            <div>
              <h4 className="font-semibold mb-4">Real-time Performance</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[
                  {name: 'T-15', value: Math.random() * 20 + 80},
                  {name: 'T-10', value: Math.random() * 20 + 80},
                  {name: 'T-5', value: Math.random() * 20 + 80},
                  {name: 'Now', value: Math.random() * 20 + 80}
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Machine controller table */}
            <div>
              <h4 className="font-semibold mb-4">Controller Status</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(selectedMachine.metrics).slice(0, 4).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell>{typeof value === 'number' ? value.toFixed(2) : String(value)}</TableCell>
                      <TableCell>
                        <div className={`w-2 h-2 rounded-full ${
                          selectedMachine.status === 'ok' ? 'bg-success' : 'bg-warning'
                        }`} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <AIInsightBot 
            onGenerate={generateMachineInsight} 
            context={selectedMachine.id}
            title={`Phân tích AI cho ${selectedMachine.name}`}
          />
        </Card>
      )}
      
      {/* Batch Management Section */}
      <BatchManagementView 
        records={records} 
        machines={machines}
        onBatchSelect={setSelectedBatch}
        selectedBatch={selectedBatch}
      />
    </div>
  );
}

function BatchManagementView({ records, machines, onBatchSelect, selectedBatch }: {
  records: BatchRecord[];
  machines: Record<string, Machine>;
  onBatchSelect: (batch: BatchRecord | null) => void;
  selectedBatch: BatchRecord | null;
}) {
  const [expandedBatches, setExpandedBatches] = useState({ [records[0]?.id]: true });
  
  const toggleBatchExpand = (id) => {
    setExpandedBatches(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const generateBatchInsight = (batchId) => {
    const batch = records.find(r => r.id === batchId);
    if (!batch) return "Không tìm thấy dữ liệu batch.";
    
    return `📋 Batch Analysis: ${batch.id}
🎯 Model: ${batch.model}
👨‍🔧 Operator: ${batch.operator} 
📊 OEE: ${batch.oee}% (${batch.oee > 85 ? 'Excellent' : batch.oee > 80 ? 'Good' : 'Needs Improvement'})
⏱️ Timeline: ${batch.startTime} - ${batch.endTime}
📦 Quantity: ${batch.quantity} units
🔍 AI Summary: ${batch.aiSummary}
💡 Next Action: ${batch.status === 'Hoàn thành' ? 'Quality audit and packaging' : 'Monitor real-time progress'}`;
  };
  
  return (
    <Card className="card-industrial p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <Database className="mr-2 text-primary" />
          Quản lý Batch Production
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 size={16} className="mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {records.map(batch => (
          <div key={batch.id} className="border border-border rounded-lg overflow-hidden">
            <div 
              className="bg-accent/50 p-4 flex items-center justify-between cursor-pointer hover:bg-accent transition-colors"
              onClick={() => toggleBatchExpand(batch.id)}
            >
              <div className="flex items-center gap-4">
                {expandedBatches[batch.id] ? 
                  <ChevronDown size={20} className="text-muted-foreground" /> : 
                  <ChevronRight size={20} className="text-muted-foreground" />
                }
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">{batch.id}</span>
                    <Badge variant="outline">{batch.model}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {batch.operator} • {batch.startTime}-{batch.endTime}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {batch.quantity} units • OEE: {batch.oee}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">OEE: {batch.oee}%</div>
                  <div className="text-xs text-muted-foreground">
                    {batch.children.filter(c => c.status === 'Hoàn thành').length}/{batch.children.length} completed
                  </div>
                </div>
                <StatusBadge 
                  status={batch.status === 'Hoàn thành' ? 'ok' : batch.status === 'Đang xử lý' ? 'warning' : 'error'} 
                  size="md"
                />
              </div>
            </div>
            
            {expandedBatches[batch.id] && (
              <div className="p-4 space-y-4 animate-slide-up">
                {/* Batch Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    icon={Activity}
                    title="Progress"
                    value={((batch.children.filter(c => c.status === 'Hoàn thành').length / batch.children.length) * 100).toFixed(0)}
                    unit="%"
                    status="ok"
                  />
                  <MetricCard
                    icon={Clock}
                    title="Duration"
                    value={batch.children.reduce((acc, c) => acc + parseFloat(c.time?.replace('h', '') || '0'), 0).toFixed(1)}
                    unit="hours"
                    status="ok"
                  />
                  <MetricCard
                    icon={HardDrive}
                    title="Total Weight"
                    value={batch.children.reduce((acc, c) => acc + (c.weight || 0), 0)}
                    unit="kg"
                    status="ok"
                  />
                </div>
                
                {/* Machine List for this Batch */}
                <div>
                  <h4 className="font-semibold mb-3">Machines Involved</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {Object.values(machines).slice(0, 8).map(machine => (
                      <div key={machine.id} className="flex items-center gap-2 p-2 bg-surface rounded border text-xs">
                        <div className={`w-2 h-2 rounded-full ${
                          machine.status === 'ok' ? 'bg-success' : 'bg-warning'
                        }`} />
                        <span className="truncate">{machine.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pallet/Rack Details */}
                <div>
                  <h4 className="font-semibold mb-3">Production Units</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit ID</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batch.children.map(child => (
                        <TableRow key={child.id}>
                          <TableCell className="font-medium">{child.id}</TableCell>
                          <TableCell>{child.details}</TableCell>
                          <TableCell>{child.weight} kg</TableCell>
                          <TableCell>{child.time || '0h'}</TableCell>
                          <TableCell>
                            <StatusBadge 
                              status={child.status === 'Hoàn thành' ? 'ok' : child.status === 'Đang xử lý' ? 'warning' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <AIInsightBot 
                  onGenerate={generateBatchInsight} 
                  context={batch.id}
                  title={`Phân tích Batch ${batch.id}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function EnhancedKnowledgeBase({ cases, lineType }) {
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const generateCaseInsight = (caseId) => {
    const caseData = cases.find(c => c.id === caseId);
    if (!caseData) return "Case study not found.";
    
    return `📚 Case Study Deep Dive: ${caseData.title}
🎯 Impact Level: ${caseData.severity} severity, ${caseData.impact} impact
🔍 Problem: ${caseData.problem.substring(0, 200)}...
💡 Key Learning: ${caseData.lessons?.[0] || 'No specific lessons documented'}
📈 OEE Improvement: ${caseData.solution.oeeImpact.improvement || 'N/A'}
🔧 Quick Action: ${caseData.solution.immediateAction}
📅 Implementation Time: ${caseData.solution.implementation?.duration || 'Not specified'}
💰 ROI: Achieved in ${Math.floor(Math.random() * 48 + 12)} hours
🎓 Recommendation: Apply similar methodology to prevent related issues`;
  };
  
  return (
    <Card className="card-industrial p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <Lightbulb className="mr-2 text-warning" />
          Knowledge Base & Case Studies
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-surface text-sm w-64"
          />
          <Button variant="outline" size="sm">
            <Wrench size={16} className="mr-2" />
            Add Case
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List */}
        <div className="space-y-4">
          {filteredCases.map(caseData => (
            <div 
              key={caseData.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedCase?.id === caseData.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedCase(selectedCase?.id === caseData.id ? null : caseData)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm line-clamp-2">{caseData.title}</h3>
                <Badge 
                  variant="outline" 
                  className={`ml-2 ${
                    caseData.severity === 'High' ? 'border-error text-error' :
                    caseData.severity === 'Medium' ? 'border-warning text-warning' : 'border-info text-info'
                  }`}
                >
                  {caseData.severity}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {caseData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{caseData.problem}</p>
              {caseData.solution?.oeeImpact && (
                <div className="mt-2 text-xs">
                  <span className="text-success font-medium">
                    OEE: +{caseData.solution.oeeImpact.improvement}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Case Details */}
        {selectedCase ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-primary">{selectedCase.title}</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedCase.impact}</Badge>
                  <Badge 
                    variant="outline"
                    className={
                      selectedCase.severity === 'High' ? 'border-error text-error' :
                      selectedCase.severity === 'Medium' ? 'border-warning text-warning' : 'border-info text-info'
                    }
                  >
                    {selectedCase.severity}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedCase.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
            
            {/* Problem Description */}
            <div className="space-y-4">
              <div className="p-4 bg-error-bg border border-error/20 rounded-lg">
                <h4 className="font-semibold text-error mb-2">🚨 Problem Statement</h4>
                <p className="text-sm">{selectedCase.problem}</p>
                {selectedCase.symptoms && (
                  <div className="mt-3">
                    <p className="font-medium text-sm mb-2">Observed Symptoms:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {selectedCase.symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Analysis */}
              {selectedCase.analysis && (
                <div className="p-4 bg-info-bg border border-info/20 rounded-lg">
                  <h4 className="font-semibold text-info mb-2">🔍 {selectedCase.analysis.title}</h4>
                  {selectedCase.analysis.methodology && (
                    <p className="text-sm mb-3"><strong>Methodology:</strong> {selectedCase.analysis.methodology}</p>
                  )}
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Key Findings:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {selectedCase.analysis.findings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                  {selectedCase.analysis.rootCause && (
                    <div className="mt-3 p-3 bg-warning-bg border border-warning/20 rounded">
                      <p className="text-sm"><strong>Root Cause:</strong> {selectedCase.analysis.rootCause}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Solution */}
              <div className="p-4 bg-success-bg border border-success/20 rounded-lg">
                <h4 className="font-semibold text-success mb-2">✅ {selectedCase.solution.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm mb-2"><strong>Immediate Action:</strong></p>
                    <p className="text-xs">{selectedCase.solution.immediateAction}</p>
                    {selectedCase.solution.preventiveAction && (
                      <div className="mt-3">
                        <p className="text-sm mb-2"><strong>Preventive Measures:</strong></p>
                        <ul className="list-disc list-inside text-xs space-y-1">
                          {selectedCase.solution.preventiveAction.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    {selectedCase.solution.implementation && (
                      <div className="mb-3">
                        <p className="text-sm mb-2"><strong>Implementation:</strong></p>
                        <div className="text-xs space-y-1">
                          <p><strong>Duration:</strong> {selectedCase.solution.implementation.duration}</p>
                          <p><strong>Resources:</strong> {selectedCase.solution.implementation.resources}</p>
                          <p><strong>Cost:</strong> {selectedCase.solution.implementation.cost}</p>
                        </div>
                      </div>
                    )}
                    <div className="p-3 bg-surface border rounded">
                      <p className="text-sm font-medium mb-1">Results:</p>
                      <p className="text-xs">{selectedCase.solution.outcome}</p>
                      {selectedCase.solution.oeeImpact && (
                        <div className="mt-2 flex items-center gap-4 text-xs">
                          <span>Before: {selectedCase.solution.oeeImpact.before}%</span>
                          <span>After: {selectedCase.solution.oeeImpact.after}%</span>
                          <span className="text-success font-medium">
                            {selectedCase.solution.oeeImpact.improvement}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* OEE Impact Visualization */}
              {selectedCase.solution.oeeImpact && (
                <div className="p-4 bg-surface border rounded-lg">
                  <h4 className="font-semibold mb-4 text-center">OEE Impact Analysis</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[{
                      name: 'OEE Impact',
                      Before: selectedCase.solution.oeeImpact.before,
                      After: selectedCase.solution.oeeImpact.after
                    }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[75, 95]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Before" fill="hsl(var(--warning))" name="Before Fix" />
                      <Bar dataKey="After" fill="hsl(var(--success))" name="After Fix" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Lessons Learned */}
              {selectedCase.lessons && (
                <div className="p-4 bg-accent border rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Lessons Learned</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {selectedCase.lessons.map((lesson, idx) => (
                      <li key={idx}>{lesson}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <AIInsightBot 
              onGenerate={generateCaseInsight} 
              context={selectedCase.id}
              title={`AI Analysis for Case ${selectedCase.id}`}
            />
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Lightbulb size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a case study to view detailed analysis</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// --- MAIN APPLICATION ---
export default function Index() {
  const [activeView, setActiveView] = useState('palletizing');
  
  const views = {
    palletizing: {
      title: 'Dây chuyền Palletizing',
      icon: GitBranch,
      machines: PALLETIZING_MACHINE_DATA,
      records: PALLETIZING_BATCH_RECORDS,
      trend: PALLETIZING_OEE_TREND,
      cases: PALLETIZING_KNOWLEDGE_BASE
    },
    welding: {
      title: 'Dây chuyền Hàn Robot',
      icon: ShieldCheck,
      machines: WELDING_MACHINE_DATA,
      records: WELDING_BATCH_RECORDS,
      trend: WELDING_OEE_TREND,
      cases: WELDING_KNOWLEDGE_BASE
    }
  };
  
  const currentViewData = views[activeView];
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                  <Cpu className="text-primary-foreground" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                    Panasonic AI Control Center
                  </h1>
                  <p className="text-xs text-muted-foreground">Industrial IoT Management Platform</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span>Kỹ sư: An Nguyễn</span>
              </div>
              <Button variant="outline" size="sm">
                <Settings size={16} className="mr-2" />
                Settings
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center gap-1 pb-4">
            {Object.entries(views).map(([key, { title, icon: Icon }]) => (
              <Button
                key={key}
                variant={activeView === key ? "default" : "ghost"}
                onClick={() => setActiveView(key)}
                className={`flex items-center gap-2 ${
                  activeView === key ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <Icon size={16} />
                {title}
              </Button>
            ))}
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <EnhancedOEEDashboard 
          records={currentViewData.records} 
          trendData={currentViewData.trend}
          lineType={activeView}
        />
        
        <ProductionLineOverview 
          machines={currentViewData.machines} 
          records={currentViewData.records}
          lineType={activeView}
        />
        
        <EnhancedKnowledgeBase 
          cases={currentViewData.cases}
          lineType={activeView}
        />
      </main>
    </div>
  );
}