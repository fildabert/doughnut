<template>
  <h2 class="display-3">Reviews</h2>
  <div class="row">
    <div class="col-sm-6">
      <div class="card text-white bg-primary mb-3">
        <div class="card-header">
          Learn New Notes
          <span class="badge bg-secondary number-of-initial-reviews">
            {{
              `${reviewing.toInitialReviewCount}/${reviewing.notLearntCount}`
            }}
          </span>
        </div>
        <div class="card-body">
          <p class="card-text">
            Do the initial review for your notes. You may try to remember them
            for the first time. Or, you can mark some as no repetition needed.
          </p>
          <router-link
            v-if="reviewing.toInitialReviewCount > 0"
            role="button"
            class="btn btn-light"
            :to="{ name: 'initial' }"
          >
            Start reviewing new notes
          </router-link>
          <h2 v-else class="">You have achieved your daily new notes goal.</h2>
        </div>
      </div>
    </div>

    <div class="col-sm-6">
      <div class="card text-white bg-success mb-3">
        <div class="card-header">
          Repeat Old Notes
          <span class="badge bg-secondary number-of-repeats">
            {{ `${reviewing.toRepeatCount}/${reviewing.learntCount}` }}
          </span>
        </div>
        <div class="card-body">
          <p class="card-text">
            Using spaced repetition technique, you only need to review the old
            notes you have learned at the optimal time.
          </p>
          <router-link
            v-if="reviewing.toRepeatCount > 0"
            role="button"
            class="btn btn-light"
            :to="{ name: 'repeat' }"
          >
            Start reviewing old notes
          </router-link>
          <h2 v-else class="">
            You have reviewed all the old notes for today.
          </h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    reviewing: {
      type: Object as PropType<Generated.ReviewStatus>,
      required: true,
    },
  },
});
</script>
