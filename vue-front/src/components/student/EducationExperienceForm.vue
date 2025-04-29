<template>
  <div class="education-experience-form">
    <div class="section-header">
      <h3 class="section-title">教育经历</h3>
      <el-button type="primary" plain size="small" @click="addEducation" :disabled="!editable">
        <el-icon><Plus /></el-icon>
        <span>添加</span>
      </el-button>
    </div>

    <div v-if="getCurrentValueAsArray().length === 0" class="empty-state">
      <el-empty description="暂无教育经历，请点击添加" :image-size="100"></el-empty>
    </div>

    <div v-for="(edu, index) in getCurrentValueAsArray()" :key="index" class="experience-item">
      <div class="experience-header">
        <h4>{{ edu.school || '新教育经历' }} {{ edu.degree ? `(${edu.degree})` : '' }}</h4>
        <el-button
          v-if="editable"
          type="danger"
          plain
          size="small"
          @click="removeEducation(index)"
        >
          <el-icon><Delete /></el-icon>
          <span class="hide-on-mobile">删除</span>
        </el-button>
      </div>

      <el-form :disabled="!editable">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="学校名称">
              <el-input v-model="edu.school" placeholder="请输入学校名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="专业">
              <el-input v-model="edu.major" placeholder="请输入专业名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="学位">
              <el-select v-model="edu.degree" placeholder="请选择学位" style="width: 100%">
                <el-option label="大专" value="大专"></el-option>
                <el-option label="本科" value="本科"></el-option>
                <el-option label="硕士" value="硕士"></el-option>
                <el-option label="博士" value="博士"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="时间段">
              <el-date-picker
                v-model="dateRange[index]"
                type="monthrange"
                range-separator="至"
                start-placeholder="开始月份"
                end-placeholder="结束月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                style="width: 100%"
                @change="updateDateRange(index)"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="在校经历描述">
          <el-input
            v-model="edu.description"
            type="textarea"
            :rows="3"
            placeholder="请描述在校期间的主要课程、成绩、活动等"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { EducationExperienceCamel } from '@/types/student';
import { Plus, Delete } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: {
    type: [Array, String] as unknown as () => EducationExperienceCamel[] | string,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

// 用于日期选择器的数据
const dateRange = ref<[string, string][]>([]);

// 初始化日期范围
watch(() => props.modelValue, (newValue) => {
  if (typeof newValue === 'string') {
    try {
      const parsedValue = JSON.parse(newValue);
      if (Array.isArray(parsedValue)) {
        dateRange.value = parsedValue.map((edu: EducationExperienceCamel) =>
          [edu.startDate, edu.endDate] as [string, string]);
      } else {
        dateRange.value = [];
      }
    } catch (e) {
      console.error('Failed to parse educationExperiences:', e);
      dateRange.value = [];
    }
  } else if (Array.isArray(newValue)) {
    dateRange.value = newValue.map(edu => [edu.startDate, edu.endDate] as [string, string]);
  } else {
    dateRange.value = [];
  }
}, { immediate: true, deep: true });

// 获取当前值的数组形式
const getCurrentValueAsArray = (): EducationExperienceCamel[] => {
  if (typeof props.modelValue === 'string') {
    try {
      const parsedValue = JSON.parse(props.modelValue);
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (e) {
      console.error('Failed to parse educationExperiences:', e);
      return [];
    }
  } else if (Array.isArray(props.modelValue)) {
    return props.modelValue;
  }
  return [];
};

// 添加新的教育经历
const addEducation = () => {
  const newEducation: EducationExperienceCamel = {
    school: '',
    major: '',
    degree: '',
    startDate: '',
    endDate: '',
    description: ''
  };

  const currentValue = getCurrentValueAsArray();
  const updatedValue = [...currentValue, newEducation];
  emit('update:modelValue', updatedValue);

  // 为新添加的教育经历初始化日期范围
  dateRange.value.push(['', ''] as [string, string]);
};

// 移除教育经历
const removeEducation = (index: number) => {
  const currentValue = getCurrentValueAsArray();
  const updatedValue = [...currentValue];
  updatedValue.splice(index, 1);
  emit('update:modelValue', updatedValue);

  // 同时移除对应的日期范围
  dateRange.value.splice(index, 1);
};

// 更新日期范围
const updateDateRange = (index: number) => {
  if (dateRange.value[index]) {
    const currentValue = getCurrentValueAsArray();
    const updatedValue = [...currentValue];
    updatedValue[index] = {
      ...updatedValue[index],
      startDate: dateRange.value[index][0],
      endDate: dateRange.value[index][1]
    };
    emit('update:modelValue', updatedValue);
  }
};
</script>

<style scoped>
.education-experience-form {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.experience-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.experience-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #303133;
}

.empty-state {
  padding: 20px;
  text-align: center;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .hide-on-mobile {
    display: none;
  }

  .experience-item {
    padding: 10px;
  }
}
</style>
