<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import DashboardLayout from '@/components/DashboardLayout.vue'
import { useConversationStore } from '@/stores/conversationStore'
import { useCurrentUser } from '@/composables/useCurrentUser'
import type { Conversation, ConversationUser } from '@/types'

const store = useConversationStore()
const { conversations, contacts, messages, currentConversationId, isLoading, error } =
  storeToRefs(store)
const { currentUserId } = useCurrentUser()

const newContactId = ref('')
const draft = ref('')
const threadEl = ref<HTMLElement | null>(null)
let pollTimer: number | undefined

const displayName = (user: ConversationUser) => {
  const full = [user.firstname, user.lastname].filter(Boolean).join(' ')
  return full || user.username
}

const partnerNames = (conversation: Conversation) => {
  const others = conversation.users.filter((u) => u.id !== currentUserId.value)
  if (!others.length) return 'Conversation'
  return others.map(displayName).join(', ')
}

const availableContacts = computed(() =>
  contacts.value.filter((c) => c.id !== currentUserId.value),
)

const currentTitle = computed(() => {
  const conversation = conversations.value.find((c) => c.id === currentConversationId.value)
  return conversation ? partnerNames(conversation) : 'Sélectionnez une conversation'
})

const scrollToBottom = async () => {
  await nextTick()
  if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight
}

watch(() => messages.value.length, scrollToBottom)

const handleStart = async () => {
  if (!newContactId.value) return
  await store.startConversation(newContactId.value)
  newContactId.value = ''
}

const handleSend = async () => {
  const content = draft.value.trim()
  if (!content) return
  const sent = await store.sendMessage(content)
  if (sent) draft.value = ''
}

const messageTime = (value: string) => value.slice(0, 16).replace('T', ' ')

onMounted(() => {
  store.fetchConversations()
  store.fetchContacts()
  pollTimer = window.setInterval(() => {
    store.refreshCurrentMessages()
  }, 5000)
})

onUnmounted(() => {
  if (pollTimer) window.clearInterval(pollTimer)
})
</script>

<template>
  <DashboardLayout>
    <hgroup>
      <h1>Messages</h1>
      <p class="muted">Discutez avec les autres membres de la communauté.</p>
    </hgroup>

    <p v-if="error" class="tiny" style="color: var(--destructive-color)">{{ error }}</p>

    <div class="messages-grid">
      <aside class="card conversations-panel">
        <form class="layout-flex layout-gap-small" @submit.prevent="handleStart">
          <select v-model="newContactId" class="primary medium" style="flex: 1">
            <option value="" disabled>Nouvelle conversation…</option>
            <option v-for="contact in availableContacts" :key="contact.id" :value="contact.id">
              {{ displayName(contact) }}
            </option>
          </select>
          <button type="submit" class="primary medium" :disabled="!newContactId || isLoading">
            Créer
          </button>
        </form>

        <div class="conversations-list">
          <p v-if="!conversations.length" class="small muted">
            Aucune conversation pour le moment.
          </p>
          <button
            v-for="conversation in conversations"
            :key="conversation.id"
            class="conversation-item"
            :class="{ active: conversation.id === currentConversationId }"
            @click="store.openConversation(conversation.id)"
          >
            <span style="font-weight: 700">{{ partnerNames(conversation) }}</span>
            <span class="tiny muted">{{ messageTime(conversation.updated_at) }}</span>
          </button>
        </div>
      </aside>

      <section class="card thread-panel">
        <h3>{{ currentTitle }}</h3>

        <div ref="threadEl" class="thread-messages">
          <p v-if="currentConversationId && !messages.length" class="small muted center">
            Aucun message. Écrivez le premier !
          </p>
          <div
            v-for="message in messages"
            :key="message.id"
            class="thread-bubble"
            :class="{ mine: message.user_id === currentUserId }"
          >
            <p>{{ message.content }}</p>
            <span class="tiny muted">{{ messageTime(message.created_at) }}</span>
          </div>
        </div>

        <form
          v-if="currentConversationId"
          class="layout-flex layout-gap-small"
          @submit.prevent="handleSend"
        >
          <input
            v-model="draft"
            type="text"
            class="primary medium full-width"
            placeholder="Votre message…"
            maxlength="2000"
          />
          <button type="submit" class="primary medium" :disabled="isLoading || !draft.trim()">
            Envoyer
          </button>
        </form>
      </section>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.messages-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-4);
  align-items: start;
}

.conversations-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.conversation-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  padding: var(--space-3);
  border: var(--border-width) solid var(--border-color);
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.conversation-item.active {
  border-color: var(--primary-color);
}

.thread-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  min-height: 60vh;
}

.thread-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-height: 55vh;
}

.thread-bubble {
  max-width: 70%;
  padding: var(--space-3);
  border: var(--border-width) solid var(--border-color);
  align-self: flex-start;
}

.thread-bubble.mine {
  align-self: flex-end;
  border-color: var(--primary-color);
}

.thread-bubble p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 900px) {
  .messages-grid {
    grid-template-columns: 1fr;
  }
}
</style>
