import { ProjectTemplate } from '../types';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'data-science',
    name: '数据分析',
    description: '适合数据清洗、可视化和统计分析项目',
    icon: '📊',
    pythonVersion: '3.11',
    packages: ['numpy', 'pandas', 'matplotlib', 'ipykernel'],
    useCases: ['数据处理', '可视化图表', '统计分析', 'CSV/Excel 文件处理']
  },
  {
    id: 'machine-learning',
    name: '机器学习',
    description: '适合机器学习模型训练和预测项目',
    icon: '🤖',
    pythonVersion: '3.11',
    packages: ['numpy', 'pandas', 'scikit-learn', 'ipykernel'],
    useCases: ['分类任务', '回归分析', '聚类', '模型训练']
  },
  {
    id: 'web-development',
    name: 'Web 开发',
    description: '适合 Web 应用开发和 API 项目',
    icon: '🌐',
    pythonVersion: '3.11',
    packages: ['flask', 'requests', 'ipykernel'],
    useCases: ['Web 应用', 'API 开发', '网络爬虫', '后端服务']
  },
  {
    id: 'general-learning',
    name: '通用学习',
    description: '适合 Python 基础学习和通用编程练习',
    icon: '📚',
    pythonVersion: '3.11',
    packages: ['ipykernel', 'jupyterlab'],
    useCases: ['Python 基础', '算法练习', '编程学习', '实验项目']
  }
];
