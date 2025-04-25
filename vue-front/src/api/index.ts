// 导出所有API模块
import * as userApi from './user';
import * as studentApi from './student';
import * as companyApi from './company';
import * as jobApi from './job';
import * as applicationApi from './application';
import * as resumeApi from './resume';
import * as notificationApi from './notification';
import * as messageApi from './message';
import * as statisticsApi from './statistics';
import * as feedbackApi from './feedback';

export {
  userApi,
  studentApi,
  companyApi,
  jobApi,
  applicationApi,
  resumeApi,
  notificationApi,
  messageApi,
  statisticsApi,
  feedbackApi
};

// 默认导出所有API
export default {
  user: userApi,
  student: studentApi,
  company: companyApi,
  job: jobApi,
  application: applicationApi,
  resume: resumeApi,
  notification: notificationApi,
  message: messageApi,
  statistics: statisticsApi,
  feedback: feedbackApi
};
