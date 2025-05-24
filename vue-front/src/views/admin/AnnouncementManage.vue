<template>
  <div class="announcement-manage-container p-4">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold">系统公告管理</span>
          <el-button type="primary" :icon="EditPen" @click="handleOpenCreateDialog">发布新公告</el-button>
        </div>
      </template>

      <!-- 筛选区域 -->
      <el-form :inline="true" :model="store.query" class="mb-4">
        <el-form-item label="关键词">
          <el-input v-model="store.query.keyword" placeholder="标题/内容" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="store.query.status" placeholder="公告状态" clearable @change="handleSearch">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已撤销" value="revoked" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 公告列表 -->
      <el-table :data="store.announcements" v-loading="store.isLoading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ formatStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
            <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)" size="small">{{ formatLevel(row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetUserType" label="目标用户" width="120">
          <template #default="{ row }">
            {{ formatTargetUserType(row.targetUserType) }}
          </template>
        </el-table-column>
        <el-table-column prop="publisherName" label="发布人" width="120" />
        <el-table-column prop="publishTime" label="发布时间" width="180">
          <template #default="{ row }">{{ row.publishTime ? formatDateTime(row.publishTime) : '-' }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link :icon="Edit" @click="handleOpenEditDialog(row)">编辑</el-button>
            <el-popconfirm title="确定删除此公告吗?" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="mt-4 justify-end"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="store.total"
        v-model:current-page="store.query.pageNum"
        v-model:page-size="store.query.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 创建/编辑公告 Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑公告' : '发布新公告'"
      width="60%"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form :model="currentAnnouncementForm" ref="announcementFormRef" label-width="100px" :rules="formRules">
        <el-form-item label="标题" prop="title">
          <el-input v-model="currentAnnouncementForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input type="textarea" :rows="8" v-model="currentAnnouncementForm.content" placeholder="请输入公告内容" />
          <!--  考虑使用富文本编辑器 e.g. TinyMCE or CKEditor -->
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-select v-model="currentAnnouncementForm.level" placeholder="选择公告级别">
            <el-option label="普通" value="normal" />
            <el-option label="重要" value="important" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="currentAnnouncementForm.status" placeholder="选择公告状态">
            <el-option label="草稿" value="draft" />
            <el-option label="发布" value="published" />
            <el-option label="撤销" value="revoked" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标用户" prop="targetUserType">
          <el-select v-model="currentAnnouncementForm.targetUserType" placeholder="选择目标用户" clearable>
            <el-option label="全体用户" value="all" />
            <el-option label="学生" value="student" />
            <el-option label="企业" value="company" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitForm">{{ isEditMode ? '保存更新' : '立即创建' }}</el-button>
      </template>
    </el-dialog>

     <!-- 查看公告详情 Dialog -->
    <el-dialog v-model="viewDialogVisible" title="公告详情" width="60%">
      <div v-if="store.currentAnnouncement">
        <h3 class="text-xl font-semibold mb-2">{{ store.currentAnnouncement.title }}</h3>
        <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ store.currentAnnouncement.id }}</el-descriptions-item>
            <el-descriptions-item label="状态">
                <el-tag :type="statusTagType(store.currentAnnouncement.status)">{{ formatStatus(store.currentAnnouncement.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="级别">
                 <el-tag :type="levelTagType(store.currentAnnouncement.level)" size="small">{{ formatLevel(store.currentAnnouncement.level) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="目标用户">{{ formatTargetUserType(store.currentAnnouncement.targetUserType) }}</el-descriptions-item>
            <el-descriptions-item label="发布人">{{ store.currentAnnouncement.publisherName }}</el-descriptions-item>
            <el-descriptions-item label="发布时间">{{ store.currentAnnouncement.publishTime ? formatDateTime(store.currentAnnouncement.publishTime) : '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(store.currentAnnouncement.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(store.currentAnnouncement.updateTime) }}</el-descriptions-item>
        </el-descriptions>
        <h4 class="mt-4 mb-2 font-semibold">公告内容:</h4>
        <div class="p-4 border rounded bg-gray-50 whitespace-pre-wrap">{{ store.currentAnnouncement.content }}</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from 'vue';
import { useAnnouncementStore } from '@/stores/announcement';
import type { SystemAnnouncementDTO, CreateSystemAnnouncementRequest, UpdateSystemAnnouncementRequest } from '@/types/api/announcement';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Search, Edit, Delete, View, EditPen } from '@element-plus/icons-vue';
import { format } from 'date-fns';

const store = useAnnouncementStore();

const dialogVisible = ref(false);
const viewDialogVisible = ref(false);
const isEditMode = ref(false);
const announcementFormRef = ref<FormInstance>();

const initialFormState: CreateSystemAnnouncementRequest | UpdateSystemAnnouncementRequest = {
  title: '',
  content: '',
  level: 'normal',
  status: 'draft',
  targetUserType: 'all',
};
let currentAnnouncementForm = reactive({ ...initialFormState });
let currentEditingId = ref<number | null>(null);

const formRules = reactive<FormRules>({
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
  level: [{ required: true, message: '请选择公告级别', trigger: 'change' }],
  status: [{ required: true, message: '请选择公告状态', trigger: 'change' }],
});

// Fetch announcements on mount
onMounted(() => {
  store.fetchAnnouncements();
});

// Watch for query changes to refetch
watch(() => store.query, store.fetchAnnouncements, { deep: true });

const handleSearch = () => {
  store.query.pageNum = 1; // Reset to first page on new search
  store.fetchAnnouncements();
};

const handleSizeChange = (size: number) => {
  store.setCurrentQuery({ pageSize: size, pageNum: 1 });
};

const handleCurrentChange = (page: number) => {
  store.setCurrentQuery({ pageNum: page });
};

const handleOpenCreateDialog = () => {
  isEditMode.value = false;
  currentEditingId.value = null;
  Object.assign(currentAnnouncementForm, initialFormState); // Reset form
  dialogVisible.value = true;
};

const handleOpenEditDialog = (announcement: SystemAnnouncementDTO) => {
  isEditMode.value = true;
  currentEditingId.value = announcement.id;
  // Populate form with announcement data
  currentAnnouncementForm.title = announcement.title;
  currentAnnouncementForm.content = announcement.content;
  currentAnnouncementForm.level = announcement.level;
  currentAnnouncementForm.status = announcement.status;
  currentAnnouncementForm.targetUserType = announcement.targetUserType || 'all';
  dialogVisible.value = true;
};

const handleDialogClosed = () => {
  announcementFormRef.value?.resetFields();
  currentEditingId.value = null;
  store.resetCurrentAnnouncement();
};

const handleSubmitForm = async () => {
  if (!announcementFormRef.value) return;
  await announcementFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEditMode.value && currentEditingId.value !== null) {
          await store.updateAnnouncement(currentEditingId.value, currentAnnouncementForm as UpdateSystemAnnouncementRequest);
          ElMessage.success('公告更新成功！');
        } else {
          await store.createAnnouncement(currentAnnouncementForm as CreateSystemAnnouncementRequest);
          ElMessage.success('公告创建成功！');
        }
        dialogVisible.value = false;
        // store.fetchAnnouncements(); // Store action already re-fetches
      } catch (error) {
        ElMessage.error('操作失败，请重试。');
        console.error('Form submission error:', error);
      }
    }
  });
};

const handleDelete = async (id: number) => {
  try {
    await store.deleteAnnouncement(id);
    ElMessage.success('公告删除成功！');
    // store.fetchAnnouncements(); // Store action already re-fetches if not locally filtered
  } catch (error) {
    ElMessage.error('删除失败，请重试。');
  }
};

const handleView = async (announcement: SystemAnnouncementDTO) => {
    await store.fetchAnnouncementById(announcement.id); // Ensure currentAnnouncement is populated
    if (store.currentAnnouncement) {
        viewDialogVisible.value = true;
    } else {
        ElMessage.error('无法加载公告详情');
    }
};

// Helper functions for display
const formatDateTime = (dateTimeStr: string | undefined) => {
  if (!dateTimeStr) return '-';
  try {
    return format(new Date(dateTimeStr), 'yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    return dateTimeStr; // fallback
  }
};

const statusTagType = (status: string) => {
  if (status === 'published') return 'success';
  if (status === 'draft') return 'info';
  if (status === 'revoked') return 'warning';
  return '';
};

const formatStatus = (status: string) => {
  if (status === 'published') return '已发布';
  if (status === 'draft') return '草稿';
  if (status === 'revoked') return '已撤销';
  return status;
};

const levelTagType = (level: string) => {
    if (level === 'urgent') return 'danger';
    if (level === 'important') return 'warning';
    return 'primary';
};

const formatLevel = (level: string) => {
    if (level === 'urgent') return '紧急';
    if (level === 'important') return '重要';
    if (level === 'normal') return '普通';
    return level;
};

const formatTargetUserType = (type: string | null | undefined) => {
  if (!type || type === 'all') return '全体用户';
  if (type === 'student') return '学生';
  if (type === 'company') return '企业';
  return type;
};

</script>

<style scoped>
/* Specific styles for this component can be added here if needed. */
</style> 