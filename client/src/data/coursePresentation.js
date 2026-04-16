import {
  FiBarChart2,
  FiBookOpen,
  FiCode,
  FiCpu,
} from 'react-icons/fi'

export const courseVisuals = {
  fullstack: {
    icon: FiCode,
    mode: 'Online / Offline / Self-Paced',
    originalPrice: 'Rs 80,000',
    features: [
      'JavaScript, React, Node.js, MongoDB',
      'Java with Spring Boot fundamentals',
      'Live lectures and lifetime recordings',
      'Daily assignments and projects',
      '4 capstone projects in portfolio',
      'Mock interviews and placement support',
    ],
    tech: ['React', 'Node.js', 'MongoDB', 'Express', 'Java', 'Spring Boot'],
  },
  genai: {
    icon: FiCpu,
    mode: 'Online / Self-Paced',
    originalPrice: 'Rs 60,000',
    features: [
      'Transformer architecture from scratch',
      'RAG pipelines with vector databases',
      'LoRA and QLoRA fine-tuning techniques',
      'LangGraph multi-agent systems',
      'GPU lab support included',
      'Industry certification pathway',
    ],
    tech: ['Python', 'PyTorch', 'LangChain', 'Hugging Face', 'FastAPI', 'Docker'],
  },
  data: {
    icon: FiBarChart2,
    mode: 'Online / Offline',
    originalPrice: 'Rs 65,000',
    features: [
      'Python for data analysis',
      'SQL and query optimization',
      'Power BI and Tableau dashboards',
      'Statistical modeling fundamentals',
      'Real business case studies',
      'Direct placement pipeline',
    ],
    tech: ['Python', 'Pandas', 'SQL', 'Power BI', 'Tableau', 'NumPy'],
  },
  default: {
    icon: FiBookOpen,
    mode: 'Online / Offline',
    originalPrice: '',
    features: [
      'Industry-aligned modules',
      'Live mentorship support',
      'Project-based learning',
      'Career guidance and placement support',
    ],
    tech: ['Live Projects', 'Mentor Support', 'Assessments'],
  },
}

export const demoTimeSlots = ['10:00', '11:30', '13:00', '15:00', '17:00', '18:30']
