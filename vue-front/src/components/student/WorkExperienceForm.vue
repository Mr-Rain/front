<template>
  <div class="work-experience-form">
    <div class="section-header">
      <h3 class="section-title">工作/实习经历</h3>
      <el-button type="primary" plain size="small" @click="addWorkExperience" :disabled="!editable">
        <el-icon><Plus /></el-icon>
        <span>添加</span>
      </el-button>
    </div>

    <div v-if="modelValue.length === 0" class="empty-state">
      <el-empty description="暂无工作经历，请点击添加" :image-size="100"></el-empty>
    </div>

    <div v-for="(work, index) in modelValue" :key="index" class="experience-item">
      <div class="experience-header">
        <h4>{{ work.company_name || '新工作经历' }} {{ work.position ? `(${work.position})` : '' }}</h4>
        <el-button
          v-if="editable"
          type="danger"
          plain
          size="small"
          @click="removeWorkExperience(index)"
        >
          <el-icon><Delete /></el-icon>
          <span class="hide-on-mobile">删除</span>
        </el-button>
      </div>

      <el-form :disabled="!editable">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="公司名称">
              <el-input v-model="work.company_name" placeholder="请输入公司名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="职位">
              <el-input v-model="work.position" placeholder="请输入职位名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

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

        <el-form-item label="工作内容描述">
          <el-input
            v-model="work.description"
            type="textarea"
            :rows="4"
            placeholder="请描述工作职责、成就等（支持Markdown格式）"
          ></el-input>
          <div class="form-tip" v-if="editable">支持Markdown格式，例如使用"-"或"*"创建列表</div>
        </el-form-item>
      </el-form>

      <!-- 预览区域 -->
      <div v-if="work.description && !editable" class="preview-section">
        <div class="preview-header">Markdown预览</div>
        <div class="markdown-preview" v-html="renderMarkdown(work.description)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { WorkExperience } from '@/types/student';
import { Plus, Delete } from '@element-plus/icons-vue';
import * as marked from 'marked'; // 需要安装: pnpm add marked

const props = defineProps({
  modelValue: {
    type: Array as () => WorkExperience[],
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
  dateRange.value = newValue.map(work => [work.start_date, work.end_date] as [string, string]);
}, { immediate: true, deep: true });

// 添加新的工作经历
const addWorkExperience = () => {
  const newWorkExperience: WorkExperience = {
    company_name: '',
    position: '',
    start_date: '',
    end_date: '',
    description: ''
  };

  const updatedValue = [...props.modelValue, newWorkExperience];
  emit('update:modelValue', updatedValue);

  // 为新添加的工作经历初始化日期范围
  dateRange.value.push(['', ''] as [string, string]);
};

// 移除工作经历
const removeWorkExperience = (index: number) => {
  const updatedValue = [...props.modelValue];
  updatedValue.splice(index, 1);
  emit('update:modelValue', updatedValue);

  // 同时移除对应的日期范围
  dateRange.value.splice(index, 1);
};

// 更新日期范围
const updateDateRange = (index: number) => {
  if (dateRange.value[index]) {
    const updatedValue = [...props.modelValue];
    updatedValue[index] = {
      ...updatedValue[index],
      start_date: dateRange.value[index][0],
      end_date: dateRange.value[index][1]
    };
    emit('update:modelValue', updatedValue);
  }
};

// 渲染Markdown内容
const renderMarkdown = (content: string): string => {
  if (!content) return '';
  try {
    return marked(content);
  } catch (e) {
    console.error('Failed to render markdown:', e);
    return content;
  }
};
</script>

<style scoped>
.work-experience-form {
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.preview-section {
  margin-top: 15px;
  border-top: 1px dashed #dcdfe6;
  padding-top: 15px;
}

.preview-header {
  font-size: 0.9rem;
  font-weight: 600;
  color: #606266;
  margin-bottom: 10px;
}

.markdown-preview {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.markdown-preview :deep(ul) {
  padding-left: 20px;
}

.markdown-preview :deep(p) {
  margin: 8px 0;
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
