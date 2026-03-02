<template>
  <div class="comments-section">
    <h2>Comments</h2>

    <div v-if="isAuthenticated" class="add-comment block">
      <div class="comment-input-wrapper">
        <VideoAuthor
          :author="userProfile"
        />

        <div class="input-area">
          <textarea
            v-model="newComment"
            placeholder="Add a comment..."
            class="comment-input"
            @keydown.ctrl.enter="submitComment"
            @keydown.meta.enter="submitComment"
          ></textarea>
          <div class="input-actions">
            <button
              v-if="newComment.trim()"
              class="btn btn-primary"
              @click="submitComment"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Sending..." : "Comment" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="comments-list">
      <div v-if="visibleComments.length === 0" class="no-comments state">
        {{ isAuthenticated ? "Be the first to comment" : "Sign in to comment" }}
      </div>

      <div v-for="comment in visibleComments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <div class="author-section">
            <div class="author-avatar">
              <VideoAuthor :author="comment" :showName="false" />
            </div>

            <div class="author-info">
              <div class="pseudo">
                {{ comment.pseudo || comment.name || 'Anonyme' }}
              </div>
              <div class="comment-date">
                {{ formatDate(comment.created_at) }}
              </div>
            </div>
          </div>

          <button
            v-if="isCommentOwner(comment)"
            class="delete-btn"
            @click="deleteComment(comment.id)"
            title="Supprimer le commentaire"
          >
            ✕
          </button>
        </div>

        <p class="comment-content">{{ comment.content }}</p>
      </div>
    </div>

    <div v-if="hasMore" class="show-more-wrapper">
      <button class="btn btn-ghost show-more-btn" @click="showMore">
        Show more comments ({{ totalComments - displayCount }} remaining)
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { API_BASE_URL } from "@/config/api";
import VideoAuthor from "./VideoAuthor.vue";

const props = defineProps({
  videoId: {
    type: Number,
    required: true
  }
});

const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
const comments = ref([]);
const newComment = ref("");
const isSubmitting = ref(false);
const userProfile = ref(null);
const displayCount = ref(3);

const visibleComments = computed(() => {
  return comments.value.slice(0, displayCount.value);
});

const totalComments = computed(() => {
  return comments.value.length;
});

const hasMore = computed(() => {
  return totalComments.value > displayCount.value;
});


function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
}

function isCommentOwner(comment) {
  return isAuthenticated.value && user.value?.sub === comment.user_auth0_id;
}

// Fetch comment and user profile on mount
async function fetchComments() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/videos/${props.videoId}/comments`);
    if (!res.ok) throw new Error("Erreur lors de la récupération des commentaires");
    comments.value = await res.json();
    console.log("DEBUG comments belts:", comments.value.map(c => ({ pseudo: c.pseudo, bjj_belt: c.bjj_belt })));
  } catch (error) {
    console.error("Erreur:", error);
  }
}

async function fetchUserProfile() {
  try {
    const token = await getAccessTokenSilently();
    const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (res.ok) {
      userProfile.value = await res.json();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
  }
}


async function submitComment() {
  if (!newComment.value.trim()) return;

  isSubmitting.value = true;
  try {
    const token = await getAccessTokenSilently();
    const res = await fetch(
      `${API_BASE_URL}/api/videos/${props.videoId}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newComment.value })
      }
    );

    if (!res.ok) throw new Error("Erreur lors de l'envoi du commentaire");

    newComment.value = "";
    await fetchComments();
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    isSubmitting.value = false;
  }
}

async function deleteComment(commentId) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) return;

  try {
    const token = await getAccessTokenSilently();
    const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Erreur lors de la suppression");

    await fetchComments();
  } catch (error) {
    console.error("Erreur:", error);
  }
}

function showMore() {
  displayCount.value += 5;
}

onMounted(async () => {
  await fetchComments();
  if (isAuthenticated.value) {
    await fetchUserProfile();
  }
});
</script>

<style scoped>

.comments-section {
  margin-bottom: 40px;
}

.comments-section h2 {
  margin-bottom: 20px;
}

.add-comment {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 24px;
}

.comment-input-wrapper {
  display: flex;
  gap: 12px;
}

.pseudo {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.input-area {
  flex: 1;
}

.comment-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.85);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 40px;
  max-height: 120px;
  outline: none;
  transition: all 0.15s ease;
}

.comment-input:focus {
  border-color: rgba(220, 38, 38, 0.55);
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.12);
  background: var(--surface);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  gap: 8px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.no-comments {
  text-align: center;
  padding: 24px;
}

.comment-item {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 16px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.author-section {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.comment-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 4px;
}

.comment-date {
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}

.delete-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: var(--radius-sm);
}

.delete-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  color: var(--brand);
}

.comment-content {
  color: var(--text);
  line-height: 1.6;
  word-break: break-word;
  margin: 0;
}

.show-more-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.show-more-btn {
  padding: 10px 20px;
  font-size: 13px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--text);
}

.show-more-btn:hover {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.2);
}

@media (max-width: 768px) {
  .comment-input-wrapper {
    gap: 10px;
  }

  .user-avatar,
  .user-avatar-placeholder {
    width: 36px;
    height: 36px;
  }

  .comment-item {
    padding: 12px;
  }
}

</style>
