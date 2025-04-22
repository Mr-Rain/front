import request from '@/utils/request';
import type { JobInfo } from '@/types/job';
import type { CompanyProfile } from '@/types/company';
import type { StudentProfile } from '@/types/student';

// 搜索结果类型
export interface SearchResult {
  jobs?: JobInfo[];
  companies?: CompanyProfile[];
  students?: StudentProfile[];
  total: number;
}

// 搜索类型
export type SearchType = 'all' | 'job' | 'company' | 'student';

// 搜索参数
export interface SearchParams {
  keyword: string;
  type?: SearchType;
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>; // 高级筛选条件
}

// 搜索历史记录
export interface SearchHistory {
  id: string | number;
  keyword: string;
  type: SearchType;
  timestamp: string;
}

// 全局搜索
export function globalSearch(params: SearchParams): Promise<{ data: SearchResult }> {
  // return request({
  //   url: '/api/search',
  //   method: 'get',
  //   params
  // });
  
  // ---- Mock Data Start ----
  console.warn('API MOCK: globalSearch is using mock data.');
  
  const mockJobs: JobInfo[] = [
    {
      id: 'job1',
      title: '前端开发工程师',
      company_id: 'company1',
      company_name: '示例科技',
      location: '北京',
      salary_range: '15k-25k',
      job_type: 'fulltime',
      experience_requirement: '3-5年',
      education_requirement: '本科',
      description: '负责公司产品的前端开发工作，使用Vue.js、React等技术栈。',
      status: 'active',
      publish_time: '2023-12-01T10:00:00Z',
      tags: ['Vue.js', 'React', 'TypeScript']
    },
    {
      id: 'job2',
      title: '后端开发工程师',
      company_id: 'company1',
      company_name: '示例科技',
      location: '上海',
      salary_range: '20k-30k',
      job_type: 'fulltime',
      experience_requirement: '3-5年',
      education_requirement: '本科',
      description: '负责公司产品的后端开发工作，使用Node.js、Java等技术栈。',
      status: 'active',
      publish_time: '2023-12-02T10:00:00Z',
      tags: ['Node.js', 'Java', 'Spring Boot']
    }
  ];
  
  const mockCompanies: CompanyProfile[] = [
    {
      id: 'company1',
      name: '示例科技',
      logo: 'https://example.com/logo.png',
      industry: '互联网',
      size: '500-1000人',
      location: '北京',
      description: '一家专注于人工智能和大数据的科技公司。',
      website: 'https://example.com',
      status: 'verified'
    },
    {
      id: 'company2',
      name: '另一家公司',
      logo: 'https://example.com/logo2.png',
      industry: '金融科技',
      size: '100-500人',
      location: '深圳',
      description: '一家专注于金融科技的创新公司。',
      website: 'https://example2.com',
      status: 'verified'
    }
  ];
  
  // 模拟搜索结果
  return new Promise((resolve) => {
    setTimeout(() => {
      const { keyword, type = 'all', page = 1, pageSize = 10 } = params;
      
      let jobs: JobInfo[] = [];
      let companies: CompanyProfile[] = [];
      
      // 根据关键词过滤
      if (type === 'all' || type === 'job') {
        jobs = mockJobs.filter(job => 
          job.title.toLowerCase().includes(keyword.toLowerCase()) ||
          job.company_name.toLowerCase().includes(keyword.toLowerCase()) ||
          job.description.toLowerCase().includes(keyword.toLowerCase()) ||
          (job.tags && job.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())))
        );
      }
      
      if (type === 'all' || type === 'company') {
        companies = mockCompanies.filter(company => 
          company.name.toLowerCase().includes(keyword.toLowerCase()) ||
          company.industry.toLowerCase().includes(keyword.toLowerCase()) ||
          company.description.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      
      // 计算总数
      const total = jobs.length + companies.length;
      
      // 分页处理
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      if (type === 'job') {
        jobs = jobs.slice(startIndex, endIndex);
        companies = [];
      } else if (type === 'company') {
        companies = companies.slice(startIndex, endIndex);
        jobs = [];
      } else {
        // 对于 'all' 类型，我们需要混合结果并进行分页
        const allResults = [...jobs, ...companies];
        const pagedResults = allResults.slice(startIndex, endIndex);
        
        // 重新分类
        jobs = pagedResults.filter(item => 'title' in item) as JobInfo[];
        companies = pagedResults.filter(item => 'name' in item) as CompanyProfile[];
      }
      
      resolve({
        data: {
          jobs,
          companies,
          total
        }
      });
    }, 500);
  });
  // ---- Mock Data End ----
}

// 获取搜索建议
export function getSearchSuggestions(keyword: string): Promise<{ data: string[] }> {
  // return request({
  //   url: '/api/search/suggestions',
  //   method: 'get',
  //   params: { keyword }
  // });
  
  // ---- Mock Data Start ----
  console.warn('API MOCK: getSearchSuggestions is using mock data.');
  
  const mockSuggestions = [
    '前端开发',
    '后端开发',
    '产品经理',
    '数据分析师',
    '人工智能',
    '机器学习',
    '深度学习',
    '示例科技',
    '另一家公司',
    '北京',
    '上海',
    '深圳',
    'Vue.js',
    'React',
    'TypeScript',
    'Node.js',
    'Java',
    'Spring Boot'
  ];
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const suggestions = keyword
        ? mockSuggestions.filter(item => item.toLowerCase().includes(keyword.toLowerCase()))
        : [];
      
      resolve({
        data: suggestions.slice(0, 10) // 最多返回10个建议
      });
    }, 300);
  });
  // ---- Mock Data End ----
}

// 获取搜索历史
export function getSearchHistory(): Promise<{ data: SearchHistory[] }> {
  // return request({
  //   url: '/api/search/history',
  //   method: 'get'
  // });
  
  // ---- Mock Data Start ----
  console.warn('API MOCK: getSearchHistory is using mock data.');
  
  // 从本地存储获取搜索历史
  const historyString = localStorage.getItem('searchHistory');
  const history: SearchHistory[] = historyString ? JSON.parse(historyString) : [];
  
  return Promise.resolve({
    data: history
  });
  // ---- Mock Data End ----
}

// 保存搜索历史
export function saveSearchHistory(keyword: string, type: SearchType = 'all'): Promise<{ success: boolean }> {
  // return request({
  //   url: '/api/search/history',
  //   method: 'post',
  //   data: { keyword, type }
  // });
  
  // ---- Mock Data Start ----
  console.warn('API MOCK: saveSearchHistory is using mock data.');
  
  // 从本地存储获取搜索历史
  const historyString = localStorage.getItem('searchHistory');
  const history: SearchHistory[] = historyString ? JSON.parse(historyString) : [];
  
  // 添加新的搜索历史
  const newHistory: SearchHistory = {
    id: Date.now().toString(),
    keyword,
    type,
    timestamp: new Date().toISOString()
  };
  
  // 检查是否已存在相同关键词
  const existingIndex = history.findIndex(item => item.keyword === keyword && item.type === type);
  if (existingIndex !== -1) {
    // 如果存在，则更新时间戳
    history.splice(existingIndex, 1);
  }
  
  // 添加到历史记录开头
  history.unshift(newHistory);
  
  // 限制历史记录数量为20条
  const limitedHistory = history.slice(0, 20);
  
  // 保存到本地存储
  localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
  
  return Promise.resolve({
    success: true
  });
  // ---- Mock Data End ----
}

// 清除搜索历史
export function clearSearchHistory(): Promise<{ success: boolean }> {
  // return request({
  //   url: '/api/search/history',
  //   method: 'delete'
  // });
  
  // ---- Mock Data Start ----
  console.warn('API MOCK: clearSearchHistory is using mock data.');
  
  // 清除本地存储中的搜索历史
  localStorage.removeItem('searchHistory');
  
  return Promise.resolve({
    success: true
  });
  // ---- Mock Data End ----
}
