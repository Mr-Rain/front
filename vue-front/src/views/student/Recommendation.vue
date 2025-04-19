<template>
  <div class="recommendation-page" v-loading="recommendationStore.loading">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <span>智能推荐职位</span>
          <!-- Optional: Add refresh button or filters -->
        </div>
      </template>

      <div v-if="recommendationStore.recommendedJobs.length > 0" class="recommendation-list">
          <JobCard 
            v-for="rec in recommendationStore.recommendedJobs" 
            :key="rec.job_info.id" 
            :job="rec.job_info" 
            class="recommendation-item"
          >
              <!-- Optional: Add recommendation specific info to JobCard slot -->
              <template #footer-extra>
                  <div class="recommendation-info">
                      <el-tooltip effect="dark" :content="`推荐理由: ${rec.recommendation_reason || '匹配度高'}`" placement="top">
                           <el-tag type="warning" size="small" effect="light">
                               <el-icon><MagicStick /></el-icon> 推荐分数: {{ rec.recommendation_score?.toFixed(2) || 'N/A' }}
                           </el-tag>
                      </el-tooltip>
                     <!-- Add ignore/dislike button placeholder -->
                     <!-- <el-button link type="info" size="small" @click="handleDislike(rec.job_info.id)" style="margin-left: 10px;">不感兴趣</el-button> -->
                  </div>
              </template>
          </JobCard>
      </div>
      <el-empty v-else description="暂无为你推荐的职位，可以先完善简历信息哦"></el-empty>

       <!-- Note: Pagination might not be applicable for recommendations, depends on API design -->

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRecommendationStore } from '@/stores/recommendation'; // Assuming store exists
import type { RecommendedJob } from '@/types/recommendation'; // Corrected type import
import JobCard from '@/components/common/JobCard.vue'; // Reuse JobCard
import { ElCard, ElEmpty, ElTag, ElIcon, ElTooltip } from 'element-plus';
import { MagicStick } from '@element-plus/icons-vue';

const recommendationStore = useRecommendationStore();

const fetchRecommendations = () => {
  recommendationStore.fetchRecommendations();
};

onMounted(() => {
  fetchRecommendations();
});

// Placeholder for dislike action
/*
const handleDislike = async (jobId: string | number) => {
    console.log(`Disliking job ${jobId} - Calling store action`);
    try {
        await recommendationStore.dislikeRecommendation(jobId);
        // Optionally remove from list instantly or wait for refresh
        fetchRecommendations(); 
    } catch (error) {
        // Handle error
    }
};
*/

</script>

<style scoped>
.recommendation-page {
  padding: 20px;
}

.page-card {
  /* Styles for the main card */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommendation-list {
    display: flex;
    flex-direction: column;
    gap: 20px; /* Spacing between cards */
}

.recommendation-item :deep(.job-card-footer) {
    /* Ensure footer content aligns if JobCard uses flex */
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.recommendation-info {
    display: flex;
    align-items: center;
    margin-top: 5px; /* Add some space above if footer wraps */
    margin-left: auto; /* Push to the right side of the footer */
}

.recommendation-info .el-tag {
    cursor: default; /* Indicate tag is not clickable */
}

.recommendation-info .el-icon {
    margin-right: 4px;
}
</style> 