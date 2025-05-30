<template>
  <div class="skills-tags-form">
    <div class="section-header">
      <h3 class="section-title">技能标签</h3>
    </div>

    <div v-if="editable" class="skills-input">
      <el-form>
        <el-form-item>
          <div class="input-with-button">
            <el-input
              v-model="newSkill"
              placeholder="输入技能名称，按回车添加"
              @keyup.enter="addSkill"
            ></el-input>
            <el-button type="primary" @click="addSkill" :disabled="!newSkill.trim()">
              <el-icon><Plus /></el-icon>
              <span>添加</span>
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div class="skills-tags">
      <el-tag
        v-for="(tag, index) in tags"
        :key="index"
        :closable="editable"
        @close="removeSkill(index)"
        class="skill-tag"
        :effect="editable ? 'light' : 'plain'"
      >
        {{ tag }}
      </el-tag>
      <div v-if="tags.length === 0" class="empty-state">
        <el-empty description="暂无技能标签" :image-size="100"></el-empty>
      </div>
    </div>

    <div v-if="editable" class="skills-suggestions">
      <div class="suggestions-header">推荐技能标签</div>
      <div class="suggestions-list">
        <el-tag
          v-for="(tag, index) in suggestedSkills"
          :key="index"
          @click="addSuggestedSkill(tag)"
          class="suggestion-tag"
          effect="plain"
          :style="{ cursor: 'pointer' }"
        >
          <el-icon class="add-icon"><Plus /></el-icon>
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    type: Array as () => string[],
    required: true,
    default: () => [] // 添加默认值，确保不会是null
  },
  editable: {
    type: Boolean,
    default: false
  }
});

// 确保 modelValue 始终是数组
const tags = computed({
  get: () => {
    // 如果 modelValue 是 null 或不是数组，返回默认值
    return Array.isArray(props.modelValue) ? props.modelValue : ['暂无技能'];
  },
  set: (value) => {
    emit('update:modelValue', value);
  }
});

// 确保初始值不为 null
if (props.modelValue === null) {
  emit('update:modelValue', ['暂无技能']);
}

const newSkill = ref('');

// 推荐的技能标签
const suggestedSkills = ref([
  'JavaScript', 'TypeScript', 'Vue', 'React', 'Angular',
  'HTML5', 'CSS3', 'Sass/SCSS', 'Less',
  'Node.js', 'Express', 'Koa', 'NestJS',
  'Webpack', 'Vite', 'Rollup', 'Babel',
  'Git', 'GitHub', 'GitLab', 'CI/CD',
  'Jest', 'Vitest', 'Cypress', 'Playwright',
  'RESTful API', 'GraphQL', 'WebSocket',
  'MySQL', 'MongoDB', 'PostgreSQL', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'Azure',
  'UI/UX', 'Figma', 'Sketch', 'Adobe XD',
  'Python', 'Java', 'C++', 'Go', 'Rust',
  'Linux', 'Shell', 'Bash'
]);

// 添加技能
const addSkill = () => {
  const skill = newSkill.value.trim();
  if (!skill) return;

  // 确保modelValue是数组
  let currentSkills = Array.isArray(props.modelValue) ? props.modelValue : ['暂无技能'];

  // 如果当前只有默认的"暂无技能"，则移除它
  if (currentSkills.length === 1 && currentSkills[0] === '暂无技能') {
    currentSkills = [];
  }

  // 检查是否已存在
  if (currentSkills.includes(skill)) {
    ElMessage.warning(`技能 "${skill}" 已存在`);
    return;
  }

  const updatedValue = [...currentSkills, skill];
  emit('update:modelValue', updatedValue);
  newSkill.value = '';
};

// 移除技能
const removeSkill = (index: number) => {
  // 确保modelValue是数组
  const currentSkills = Array.isArray(props.modelValue) ? props.modelValue : ['暂无技能'];
  const updatedValue = [...currentSkills];
  updatedValue.splice(index, 1);

  // 如果删除后没有技能，则添加默认技能
  if (updatedValue.length === 0) {
    updatedValue.push('暂无技能');
  }

  emit('update:modelValue', updatedValue);
};

// 添加推荐的技能
const addSuggestedSkill = (skill: string) => {
  // 确保modelValue是数组
  let currentSkills = Array.isArray(props.modelValue) ? props.modelValue : ['暂无技能'];

  // 如果当前只有默认的"暂无技能"，则移除它
  if (currentSkills.length === 1 && currentSkills[0] === '暂无技能') {
    currentSkills = [];
  }

  // 检查是否已存在
  if (currentSkills.includes(skill)) {
    ElMessage.warning(`技能 "${skill}" 已存在`);
    return;
  }

  const updatedValue = [...currentSkills, skill];
  emit('update:modelValue', updatedValue);
};
</script>

<style scoped>
.skills-tags-form {
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

.skills-input {
  margin-bottom: 15px;
}

.input-with-button {
  display: flex;
  gap: 10px;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  min-height: 40px;
}

.skill-tag {
  margin-right: 0;
}

.skills-suggestions {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #dcdfe6;
}

.suggestions-header {
  font-size: 0.9rem;
  font-weight: 600;
  color: #606266;
  margin-bottom: 10px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.suggestion-tag {
  margin-right: 0;
  transition: all 0.3s;
}

.suggestion-tag:hover {
  color: #409EFF;
  border-color: #409EFF;
}

.add-icon {
  margin-right: 3px;
  font-size: 12px;
}

.empty-state {
  width: 100%;
  padding: 20px;
  text-align: center;
}

/* 移动端适配 */
@media (max-width: 576px) {
  .input-with-button {
    flex-direction: column;
  }
}
</style>
