<template>
  <LoadingPage v-bind="{ loading, contentExists: !!reviewPoint }">
    <ShowReviewPoint
      v-if="reviewPoint"
      v-bind="{ reviewPoint }"
      :key="reviewPointId"
    />
    <div class="btn-toolbar justify-content-between">
      <label v-if="nextReviewAt" v-text="nextReviewAt" />
      <template v-else>
        <SelfEvaluateButtons @self-evaluate="selfEvaluate" />
        <button
          class="btn"
          title="remove this note from review"
          @click="removeFromReview"
        >
          <SvgNoReview />
        </button>
      </template>
    </div>
  </LoadingPage>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useLoadingApi from "../../managedApi/useLoadingApi";
import LoadingPage from "../../pages/commons/LoadingPage.vue";
import ShowReviewPoint from "./ShowReviewPoint.vue";
import SelfEvaluateButtons from "./SelfEvaluateButtons.vue";
import SvgNoReview from "../svgs/SvgNoReview.vue";
import usePopups from "../commons/Popups/usePopup";

export default defineComponent({
  setup() {
    return { ...useLoadingApi({ initalLoading: true }), ...usePopups() };
  },
  props: {
    reviewPointId: { type: Number, required: true },
  },
  components: {
    LoadingPage,
    ShowReviewPoint,
    SelfEvaluateButtons,
    SvgNoReview,
  },
  emits: ["selfEvaluated"],
  data() {
    return {
      reviewPoint: undefined as Generated.ReviewPoint | undefined,
      nextReviewAt: undefined as string | undefined,
    };
  },
  methods: {
    selfEvaluate(data: Generated.SelfEvaluate) {
      this.api.reviewMethods
        .selfEvaluate(this.reviewPointId, {
          selfEvaluation: data,
        })
        .then((reviewPoint) => {
          this.nextReviewAt = reviewPoint.nextReviewAt;
          this.$emit("selfEvaluated", reviewPoint);
        });
    },

    async removeFromReview() {
      if (
        !(await this.popups.confirm(
          `Confirm to hide this from reviewing in the future?`
        ))
      ) {
        return;
      }
      this.api.reviewMethods
        .removeFromReview(this.reviewPointId)
        .then(() => this.fetchData());
    },

    async fetchData() {
      this.reviewPoint = await this.api.reviewMethods.getReviewPoint(
        this.reviewPointId
      );
    },
  },
  watch: {
    reviewPointId() {
      this.fetchData();
    },
  },
  mounted() {
    this.fetchData();
  },
});
</script>
