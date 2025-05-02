<template>
  <div class="recommendation-settings-page responsive-padding">
    <el-card shadow="never" class="page-card responsive-card">
      <template #header>
        <div class="card-header">
          <el-button @click="goBack" type="primary" plain class="back-button">
            <el-icon class="back-icon"><ArrowLeft /></el-icon>
            <span class="back-text">返回</span>
          </el-button>
          <span class="page-title">推荐设置</span>
        </div>
      </template>

      <el-form
        ref="settingsFormRef"
        :model="settingsForm"
        label-position="top"
        class="settings-form"
      >
        <!-- 基本设置 -->
        <div class="form-section">
          <h2 class="section-title">基本设置</h2>

          <el-form-item label="默认推荐场景">
            <el-select v-model="settingsForm.defaultScenario" style="width: 100%">
              <el-option
                v-for="scenario in scenarios"
                :key="scenario.id"
                :label="scenario.name"
                :value="scenario.id"
              />
            </el-select>
            <div class="form-tip">选择默认的推荐算法场景</div>
          </el-form-item>

          <el-form-item label="推荐数量">
            <el-slider
              v-model="settingsForm.recommendationCount"
              :min="3"
              :max="20"
              :step="1"
              show-stops
              show-input
            />
            <div class="form-tip">每次显示的推荐职位数量</div>
          </el-form-item>
        </div>

        <!-- 偏好设置 -->
        <div class="form-section">
          <h2 class="section-title">偏好设置</h2>

          <el-form-item label="职位类型">
            <el-select
              v-model="settingsForm.jobTypes"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="选择偏好的职位类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in jobTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="工作地点">
            <el-select
              v-model="settingsForm.locations"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="选择偏好的工作地点"
              style="width: 100%"
            >
              <el-option
                v-for="item in locationOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="薪资范围">
            <el-slider
              v-model="settingsForm.salaryRange"
              range
              :min="0"
              :max="50"
              :step="5"
              :format-tooltip="formatSalary"
              show-stops
            />
            <div class="salary-display">
              {{ formatSalary(settingsForm.salaryRange[0]) }} - {{ formatSalary(settingsForm.salaryRange[1]) }}
            </div>
          </el-form-item>

          <el-form-item label="工作经验">
            <el-select v-model="settingsForm.experience" style="width: 100%">
              <el-option label="不限" value="any" />
              <el-option label="应届生" value="fresh" />
              <el-option label="1-3年" value="1-3" />
              <el-option label="3-5年" value="3-5" />
              <el-option label="5年以上" value="5+" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 技能标签 -->
        <div class="form-section">
          <h2 class="section-title">技能标签</h2>
          <div class="skill-tags-section">
            <el-form-item label="添加技能标签">
              <div class="skill-input-container">
                <el-input
                  v-model="newSkill"
                  placeholder="输入技能名称，按回车添加"
                  @keyup.enter="addSkill"
                />
                <el-button type="primary" @click="addSkill" :disabled="!newSkill">添加</el-button>
              </div>
            </el-form-item>

            <div class="skill-tags">
              <el-tag
                v-for="(tag, index) in settingsForm.skills"
                :key="index"
                closable
                @close="removeSkill(index)"
                class="skill-tag"
              >
                {{ tag }}
              </el-tag>
              <div v-if="settingsForm.skills.length === 0" class="no-skills">
                暂无技能标签，请添加您感兴趣的技能
              </div>
            </div>
          </div>
        </div>

        <!-- 排除设置 -->
        <div class="form-section">
          <h2 class="section-title">排除设置</h2>

          <el-form-item label="包含已申请的职位">
            <el-switch v-model="settingsForm.includeApplied" />
            <div class="form-tip">开启后，已申请的职位也会出现在推荐列表中</div>
          </el-form-item>

          <el-form-item label="排除已拒绝的职位">
            <el-switch v-model="settingsForm.excludeRejected" />
            <div class="form-tip">开启后，已被拒绝的职位将不会出现在推荐列表中</div>
          </el-form-item>

          <el-form-item>
            <el-button type="danger" plain @click="resetDislikes">
              重置"不感兴趣"列表
            </el-button>
            <div class="form-tip">清空您标记为"不感兴趣"的职位列表，这些职位将可能再次出现在推荐中</div>
          </el-form-item>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <el-button @click="resetSettings">重置设置</el-button>
          <el-button type="primary" @click="saveSettings" :loading="saving">保存设置</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRecommendationStore } from '@/stores/recommendation';
import { getRecommendationScenarios, getRecommendedJobs } from '@/api/recommendation';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

const router = useRouter();
const recommendationStore = useRecommendationStore();
const settingsFormRef = ref();
const saving = ref(false);
const newSkill = ref('');

// 推荐场景列表
const scenarios = ref([
  { id: 'default', name: '智能推荐' },
  { id: 'skill-based', name: '基于技能' },
  { id: 'history-based', name: '基于浏览历史' }
]);

// 职位类型选项
const jobTypeOptions = [
  { value: 'full-time', label: '全职' },
  { value: 'part-time', label: '兼职' },
  { value: 'internship', label: '实习' },
  { value: 'remote', label: '远程' },
];

// 工作地点选项
const locationOptions = [
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'guangzhou', label: '广州' },
  { value: 'shenzhen', label: '深圳' },
  { value: 'hangzhou', label: '杭州' },
  { value: 'chengdu', label: '成都' },
  { value: 'nanjing', label: '南京' },
  { value: 'wuhan', label: '武汉' },
  { value: 'remote', label: '远程' },
];

// 设置表单
const settingsForm = reactive({
  defaultScenario: 'default',
  recommendationCount: 10,
  jobTypes: ['full-time', 'internship'],
  locations: [],
  salaryRange: [5, 30],
  experience: 'any',
  skills: ['JavaScript', 'Vue', 'React'],
  includeApplied: false,
  excludeRejected: true,
});

// 格式化薪资显示
const formatSalary = (value: number) => {
  return `${value}k`;
};

// 获取推荐场景列表
const fetchScenarios = async () => {
  try {
    const response = await getRecommendationScenarios();
    scenarios.value = response.data.scenarios;
  } catch (error) {
    console.error('Failed to fetch recommendation scenarios:', error);
  }
};

// 添加技能标签
const addSkill = () => {
  if (!newSkill.value.trim()) return;

  // 检查是否已存在
  if (!settingsForm.skills.includes(newSkill.value.trim())) {
    settingsForm.skills.push(newSkill.value.trim());
  }

  newSkill.value = '';
};

// 移除技能标签
const removeSkill = (index: number) => {
  settingsForm.skills.splice(index, 1);
};

// 重置"不感兴趣"列表
const resetDislikes = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置"不感兴趣"列表吗？这些职位将可能再次出现在推荐中。',
      '确认重置',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    recommendationStore.resetDislikes();
    ElMessage.success('已重置"不感兴趣"列表');
  } catch (error) {
    // 用户取消操作，不做处理
  }
};

// 保存设置
const saveSettings = async () => {
  saving.value = true;
  try {
    // 保存默认推荐场景到store
    recommendationStore.setRecommendationScenario(settingsForm.defaultScenario);

    // 保存其他设置
    // 这里应该调用API保存设置到后端
    // await saveRecommendationSettings(settingsForm);

    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000));

    ElMessage.success('设置保存成功');
  } catch (error) {
    console.error('Failed to save settings:', error);
    ElMessage.error('保存设置失败');
  } finally {
    saving.value = false;
  }
};

// 重置设置
const resetSettings = () => {
  // 重置为默认值
  Object.assign(settingsForm, {
    defaultScenario: 'default',
    recommendationCount: 10,
    jobTypes: ['full-time', 'internship'],
    locations: [],
    salaryRange: [5, 30],
    experience: 'any',
    skills: ['JavaScript', 'Vue', 'React'],
    includeApplied: false,
    excludeRejected: true,
  });

  ElMessage.success('已重置为默认设置');
};

// 返回上一页
const goBack = () => {
  router.push('/student/recommendations');
};

onMounted(() => {
  // 获取推荐场景列表
  fetchScenarios();

  // 从store中获取当前设置的推荐场景
  settingsForm.defaultScenario = recommendationStore.recommendationScenario;

  // 这里应该从后端获取用户的推荐设置
  // 模拟从后端获取数据
  // const fetchSettings = async () => {
  //   try {
  //     const response = await getRecommendationSettings();
  //     Object.assign(settingsForm, response.data);
  //   } catch (error) {
  //     console.error('Failed to fetch settings:', error);
  //   }
  // };
  // fetchSettings();
});
</script>

<style scoped>
.recommendation-settings-page {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
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

.settings-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.salary-display {
  margin-top: 10px;
  text-align: center;
  font-weight: bold;
  color: #409EFF;
}

.skill-input-container {
  display: flex;
  gap: 10px;
}

.skill-tags {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 40px;
}

.skill-tag {
  margin-right: 0;
}

.no-skills {
  color: #909399;
  font-size: 14px;
  padding: 10px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .recommendation-settings-page {
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

  .form-section {
    padding: 15px;
  }

  .skill-input-container {
    flex-direction: column;
  }
}
</style>
