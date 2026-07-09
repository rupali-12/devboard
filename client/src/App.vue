<template>
  <RouterView />
  <ConfirmModal
    :show="confirmState.show.value"
    :title="confirmState.options.value.title"
    :message="confirmState.options.value.message"
    :confirm-label="confirmState.options.value.confirmLabel"
    :cancel-label="confirmState.options.value.cancelLabel"
    :type="confirmState.options.value.type"
    @confirm="onConfirm"
    @cancel="onCancel"
  />

  <!-- Global toast notifications -->
  <ToastContainer />
</template>

<script setup lang="ts">
import { useConfirm } from "@/composables/useConfirm";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import ToastContainer from "@/components/ui/ToastContainer.vue";

const { confirmState, onConfirm, onCancel } = useConfirm();
</script>
