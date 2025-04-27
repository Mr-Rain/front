<template>
  <div class="resume-edit-page responsive-padding" v-loading="loading">
    <el-card shadow="never" class="page-card responsive-card">
      <template #header>
        <div class="card-header">
          <el-button @click="goBack" type="primary" plain class="back-button">
            <el-icon class="back-icon"><ArrowLeft /></el-icon>
            <span class="back-text">返回</span>
          </el-button>
          <span class="page-title">{{ isNewResume ? '创建简历' : '编辑简历' }}</span>
          <div class="header-actions">
            <el-button type="success" @click="handleSave" :loading="saving">
              <el-icon><Check /></el-icon>
              <span>保存</span>
            </el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="resumeFormRef"
        :model="resumeForm"
        :rules="resumeRules"
        label-position="top"
        class="resume-form"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h2 class="section-title">基本信息</h2>

          <el-form-item label="简历标题" prop="title">
            <el-input v-model="resumeForm.title" placeholder="例如：前端开发工程师简历"></el-input>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="resumeForm.name" placeholder="请输入姓名"></el-input>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item label="电话" prop="phone">
                <el-input v-model="resumeForm.phone" placeholder="请输入电话号码"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="resumeForm.email" placeholder="请输入邮箱地址"></el-input>
          </el-form-item>
        </div>

        <!-- 教育经历 -->
        <div class="form-section">
          <div class="section-header">
            <h2 class="section-title">教育经历</h2>
            <el-button type="primary" plain size="small" @click="addEducation">
              <el-icon><Plus /></el-icon>
              <span>添加</span>
            </el-button>
          </div>

          <div v-for="(edu, index) in resumeForm.education_experiences" :key="index" class="experience-form-item">
            <div class="experience-header">
              <h3>教育经历 #{{ index + 1 }}</h3>
              <el-button type="danger" plain size="small" @click="removeEducation(index)">
                <el-icon><Delete /></el-icon>
                <span class="hide-on-mobile">删除</span>
              </el-button>
            </div>

            <el-form-item :prop="`education_experiences.${index}.school`" :rules="{ required: true, message: '请输入学校名称', trigger: 'blur' }">
              <el-input v-model="edu.school" placeholder="学校名称"></el-input>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item :prop="`education_experiences.${index}.major`" :rules="{ required: true, message: '请输入专业', trigger: 'blur' }">
                  <el-input v-model="edu.major" placeholder="专业"></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item :prop="`education_experiences.${index}.degree`" :rules="{ required: true, message: '请输入学位', trigger: 'blur' }">
                  <el-select v-model="edu.degree" placeholder="学位" style="width: 100%">
                    <el-option label="学士" value="学士"></el-option>
                    <el-option label="硕士" value="硕士"></el-option>
                    <el-option label="博士" value="博士"></el-option>
                    <el-option label="专科" value="专科"></el-option>
                    <el-option label="其他" value="其他"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item :prop="`education_experiences.${index}.start_date`" :rules="{ required: true, message: '请选择开始日期', trigger: 'blur' }">
                  <el-date-picker
                    v-model="edu.start_date"
                    type="month"
                    placeholder="开始日期"
                    format="YYYY-MM"
                    value-format="YYYY-MM"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item :prop="`education_experiences.${index}.end_date`" :rules="{ required: true, message: '请选择结束日期', trigger: 'blur' }">
                  <el-date-picker
                    v-model="edu.end_date"
                    type="month"
                    placeholder="结束日期"
                    format="YYYY-MM"
                    value-format="YYYY-MM"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item :prop="`education_experiences.${index}.description`">
              <el-input
                v-model="edu.description"
                type="textarea"
                :rows="3"
                placeholder="在校经历描述（可选）"
              ></el-input>
            </el-form-item>
          </div>

          <el-empty v-if="!resumeForm.education_experiences?.length" description="暂无教育经历，请点击添加"></el-empty>
        </div>

        <!-- 工作经历 -->
        <div class="form-section">
          <div class="section-header">
            <h2 class="section-title">工作/实习经历</h2>
            <el-button type="primary" plain size="small" @click="addWorkExperience">
              <el-icon><Plus /></el-icon>
              <span>添加</span>
            </el-button>
          </div>

          <div v-for="(work, index) in resumeForm.work_experiences" :key="index" class="experience-form-item">
            <div class="experience-header">
              <h3>工作经历 #{{ index + 1 }}</h3>
              <el-button type="danger" plain size="small" @click="removeWorkExperience(index)">
                <el-icon><Delete /></el-icon>
                <span class="hide-on-mobile">删除</span>
              </el-button>
            </div>

            <el-form-item :prop="`work_experiences.${index}.company_name`" :rules="{ required: true, message: '请输入公司名称', trigger: 'blur' }">
              <el-input v-model="work.company_name" placeholder="公司名称"></el-input>
            </el-form-item>

            <el-form-item :prop="`work_experiences.${index}.position`" :rules="{ required: true, message: '请输入职位', trigger: 'blur' }">
              <el-input v-model="work.position" placeholder="职位"></el-input>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item :prop="`work_experiences.${index}.start_date`" :rules="{ required: true, message: '请选择开始日期', trigger: 'blur' }">
                  <el-date-picker
                    v-model="work.start_date"
                    type="month"
                    placeholder="开始日期"
                    format="YYYY-MM"
                    value-format="YYYY-MM"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item :prop="`work_experiences.${index}.end_date`" :rules="{ required: true, message: '请选择结束日期', trigger: 'blur' }">
                  <el-date-picker
                    v-model="work.end_date"
                    type="month"
                    placeholder="结束日期"
                    format="YYYY-MM"
                    value-format="YYYY-MM"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item :prop="`work_experiences.${index}.description`" :rules="{ required: true, message: '请输入工作内容描述', trigger: 'blur' }">
              <el-input
                v-model="work.description"
                type="textarea"
                :rows="4"
                placeholder="工作内容描述（支持Markdown格式）"
              ></el-input>
            </el-form-item>
          </div>

          <el-empty v-if="!resumeForm.work_experiences?.length" description="暂无工作经历，请点击添加"></el-empty>
        </div>

        <!-- 项目经历 -->
        <div class="form-section">
          <div class="section-header">
            <h2 class="section-title">项目经历</h2>
            <el-button type="primary" plain size="small" @click="addProjectExperience">
              <el-icon><Plus /></el-icon>
              <span>添加</span>
            </el-button>
          </div>

          <div v-for="(project, index) in resumeForm.project_experiences" :key="index" class="experience-form-item">
            <div class="experience-header">
              <h3>项目经历 #{{ index + 1 }}</h3>
              <el-button type="danger" plain size="small" @click="removeProjectExperience(index)">
                <el-icon><Delete /></el-icon>
                <span class="hide-on-mobile">删除</span>
              </el-button>
            </div>

            <el-form-item :prop="`project_experiences.${index}.project_name`" :rules="{ required: true, message: '请输入项目名称', trigger: 'blur' }">
              <el-input v-model="project.project_name" placeholder="项目名称"></el-input>
            </el-form-item>

            <el-form-item :prop="`project_experiences.${index}.role`" :rules="{ required: true, message: '请输入担任角色', trigger: 'blur' }">
              <el-input v-model="project.role" placeholder="担任角色"></el-input>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :xs="24" :sm="12">
                <el-form-item :prop="`project_experiences.${index}.start_date`" :rules="{ required: true, message: '请选择开始日期', trigger: 'blur' }">
                  <el-date-picker
                    v-model="project.start_date"
                    type="month"
                    placeholder="开始日期"
                    format="YYYY-MM"
                    value-format="YYYY-MM"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item :prop="`project_experiences.${index}.end_date`" :rules="{ required: true, message: '请选择结束日期', trigger: 'blur' }">
                  <el-date-picker
                    v-model="project.end_date"
                    type="month"
                    placeholder="结束日期"
                    format="YYYY-MM"
                    value-format="YYYY-MM"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item :prop="`project_experiences.${index}.description`" :rules="{ required: true, message: '请输入项目描述', trigger: 'blur' }">
              <el-input
                v-model="project.description"
                type="textarea"
                :rows="4"
                placeholder="项目描述（支持Markdown格式）"
              ></el-input>
            </el-form-item>

            <el-form-item :prop="`project_experiences.${index}.project_link`">
              <el-input v-model="project.project_link" placeholder="项目链接（可选）"></el-input>
            </el-form-item>
          </div>

          <el-empty v-if="!resumeForm.project_experiences?.length" description="暂无项目经历，请点击添加"></el-empty>
        </div>

        <!-- 技能描述 -->
        <div class="form-section">
          <h2 class="section-title">专业技能</h2>
          <el-form-item prop="skills_description">
            <el-input
              v-model="resumeForm.skills_description"
              type="textarea"
              :rows="6"
              placeholder="请描述您的专业技能（支持Markdown格式）"
            ></el-input>
            <div class="form-tip">提示：可以使用Markdown格式，例如使用"-"或"*"创建列表</div>
          </el-form-item>
        </div>

        <!-- 自我评价 -->
        <div class="form-section">
          <h2 class="section-title">自我评价</h2>
          <el-form-item prop="self_evaluation">
            <el-input
              v-model="resumeForm.self_evaluation"
              type="textarea"
              :rows="6"
              placeholder="请进行自我评价（支持Markdown格式）"
            ></el-input>
          </el-form-item>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">保存简历</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useResumeStore } from '@/stores/resume';
import type { ResumeInfo, EducationExperience, WorkExperience, ProjectExperience } from '@/types/resume';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { ArrowLeft, Check, Plus, Delete } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const resumeStore = useResumeStore();
const resumeFormRef = ref<FormInstance>();

const loading = ref(false);
const saving = ref(false);

// 获取简历ID，如果没有则为新建模式
const resumeId = route.params.id;
const isNewResume = computed(() => !resumeId || resumeId === 'new');

// 简历表单数据
const resumeForm = reactive<Partial<ResumeInfo>>({
  title: '',
  name: '',
  phone: '',
  email: '',
  education_experiences: [],
  work_experiences: [],
  project_experiences: [],
  skills_description: '',
  self_evaluation: '',
});

// 表单验证规则
const resumeRules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入简历标题', trigger: 'blur' },
    { max: 50, message: '标题不能超过50个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 20, message: '姓名不能超过20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  skills_description: [
    { required: true, message: '请描述您的专业技能', trigger: 'blur' }
  ],
  self_evaluation: [
    { required: true, message: '请进行自我评价', trigger: 'blur' }
  ]
});

// 初始化数据
onMounted(async () => {
  if (!isNewResume.value) {
    loading.value = true;
    try {
      await resumeStore.fetchResumeDetail(resumeId.toString());
      if (resumeStore.currentResume) {
        // 复制数据到表单
        Object.assign(resumeForm, resumeStore.currentResume);

        // 确保数组属性存在
        if (!resumeForm.education_experiences) resumeForm.education_experiences = [];
        if (!resumeForm.work_experiences) resumeForm.work_experiences = [];
        if (!resumeForm.project_experiences) resumeForm.project_experiences = [];
      } else {
        ElMessage.error('找不到该简历');
        goBack();
      }
    } catch (error) {
      console.error('Failed to fetch resume:', error);
      ElMessage.error('获取简历详情失败');
      goBack();
    } finally {
      loading.value = false;
    }
  } else {
    // 新建简历，初始化空数组
    resumeForm.education_experiences = [];
    resumeForm.work_experiences = [];
    resumeForm.project_experiences = [];
  }
});

// 添加教育经历
const addEducation = () => {
  if (!resumeForm.education_experiences) resumeForm.education_experiences = [];
  resumeForm.education_experiences.push({
    school: '',
    major: '',
    degree: '',
    start_date: '',
    end_date: '',
    description: ''
  });
};

// 删除教育经历
const removeEducation = (index: number) => {
  if (resumeForm.education_experiences) {
    resumeForm.education_experiences.splice(index, 1);
  }
};

// 添加工作经历
const addWorkExperience = () => {
  if (!resumeForm.work_experiences) resumeForm.work_experiences = [];
  resumeForm.work_experiences.push({
    company_name: '',
    position: '',
    start_date: '',
    end_date: '',
    description: ''
  });
};

// 删除工作经历
const removeWorkExperience = (index: number) => {
  if (resumeForm.work_experiences) {
    resumeForm.work_experiences.splice(index, 1);
  }
};

// 添加项目经历
const addProjectExperience = () => {
  if (!resumeForm.project_experiences) resumeForm.project_experiences = [];
  resumeForm.project_experiences.push({
    project_name: '',
    role: '',
    start_date: '',
    end_date: '',
    description: '',
    project_link: ''
  });
};

// 删除项目经历
const removeProjectExperience = (index: number) => {
  if (resumeForm.project_experiences) {
    resumeForm.project_experiences.splice(index, 1);
  }
};

// 保存简历
const handleSave = () => {
  if (!resumeFormRef.value) return;

  resumeFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true;
      try {
        if (isNewResume.value) {
          // 创建新简历
          await resumeStore.createResume(resumeForm);
          ElMessage.success('简历创建成功');
        } else {
          // 更新现有简历
          await resumeStore.updateResume(resumeId.toString(), resumeForm);
          ElMessage.success('简历更新成功');
        }
        // 返回简历列表页
        router.push('/student/resume');
      } catch (error) {
        console.error('Failed to save resume:', error);
        ElMessage.error('保存简历失败，请稍后重试');
      } finally {
        saving.value = false;
      }
    } else {
      ElMessage.warning('请正确填写所有必填项');
    }
  });
};

// 返回上一页
const goBack = () => {
  if (saving.value) return;

  if (isFormDirty()) {
    ElMessageBox.confirm('您有未保存的更改，确定要离开吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/student/resume');
    }).catch(() => {
      // 用户取消离开
    });
  } else {
    router.push('/student/resume');
  }
};

// 检查表单是否有修改
const isFormDirty = () => {
  // 简单实现，实际应该比较表单与原始数据
  return resumeForm.title ||
         resumeForm.education_experiences?.length ||
         resumeForm.work_experiences?.length ||
         resumeForm.project_experiences?.length ||
         resumeForm.skills_description ||
         resumeForm.self_evaluation;
};
</script>

<style scoped>
.resume-edit-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  margin-right: 15px;
}

.back-icon {
  margin-right: 5px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  flex-grow: 1;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.resume-form {
  padding: 20px 0;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
}

.experience-form-item {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.experience-header h3 {
  font-size: 1.1rem;
  margin: 0;
  color: #303133;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .resume-edit-page {
    padding: 10px;
  }

  .card-header {
    flex-wrap: wrap;
  }

  .page-title {
    order: -1;
    width: 100%;
    margin-bottom: 10px;
  }

  .header-actions {
    margin-left: auto;
  }

  .form-section {
    padding: 15px;
  }

  .experience-form-item {
    padding: 15px;
  }

  .experience-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
