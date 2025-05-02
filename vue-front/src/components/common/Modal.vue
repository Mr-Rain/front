<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :modal="modal"
    :append-to-body="appendToBody"
    :lock-scroll="lockScroll"
    :show-close="showClose"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :before-close="handleBeforeClose"
    :draggable="draggable"
    :center="center"
    :destroy-on-close="destroyOnClose"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
    :class="['common-modal', customClass]"
  >
    <!-- Default slot for dialog content -->
    <slot></slot>

    <!-- Footer slot -->
    <template #footer v-if="!hideFooter">
      <slot name="footer">
        <!-- Default footer buttons -->
        <el-button @click="handleCancel">{{ cancelText }}</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="confirmLoading">
          {{ confirmText }}
        </el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
  // Control visibility with v-model
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '提示',
  },
  width: {
    type: [String, Number],
    default: '50%',
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  modal: {
    type: Boolean,
    default: true, // Show overlay
  },
  appendToBody: {
    type: Boolean,
    default: false,
  },
  lockScroll: {
    type: Boolean,
    default: true,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  closeOnClickModal: {
    type: Boolean,
    default: true,
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true,
  },
  beforeClose: {
    type: Function as PropType<(done: () => void) => void>,
  },
  draggable: {
      type: Boolean,
      default: false,
  },
  center: { // Center header and footer
      type: Boolean,
      default: false,
  },
  destroyOnClose: { // Destroy elements in Dialog when closed
      type: Boolean,
      default: false,
  },
  customClass: { // Custom class name for Dialog
      type: String,
      default: '',
  },
  // Footer related props
  hideFooter: {
      type: Boolean,
      default: false,
  },
  cancelText: {
      type: String,
      default: '取消',
  },
  confirmText: {
      type: String,
      default: '确定',
  },
  confirmLoading: { // Show loading state on confirm button
      type: Boolean,
      default: false,
  }
});

const emit = defineEmits([
  'update:modelValue', // For v-model support
  'open', 
  'opened', 
  'close', 
  'closed', 
  'cancel', 
  'confirm'
]);

// Use computed property for v-model binding with el-dialog
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// Event handlers that emit corresponding events
const handleOpen = () => emit('open');
const handleOpened = () => emit('opened');
const handleClose = () => {
    // Ensure modelValue is updated when closed via 'x' or escape key
    if (dialogVisible.value) {
        emit('update:modelValue', false);
    }
    emit('close');
};
const handleClosed = () => emit('closed');

const handleBeforeClose = (done: () => void) => {
  if (props.beforeClose) {
    props.beforeClose(done);
  } else {
    done();
  }
};

// Footer button actions
const handleCancel = () => {
  emit('cancel');
  dialogVisible.value = false; // Close dialog on cancel
};

const handleConfirm = () => {
  emit('confirm');
  // Dialog closing should be handled by the parent component after confirm action finishes
  // Example: parent calls `dialogVisible.value = false` after async operation
};

</script>

<style scoped>
/* Add custom styles for the modal if needed */
/* Empty rulesets were removed to fix linter errors */

/* Removed the last potentially problematic ruleset */
</style> 