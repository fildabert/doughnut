import { defineComponent, h } from "vue";
import { RouterView } from "vue-router";
import usePopups from "../../components/commons/Popups/usePopup";
import routerScopeGuard from "../../routes/relative_routes";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    alert: Promise<boolean>;
  }
}

function NestedPage(
  WrappedComponent: ReturnType<typeof defineComponent>,
  scopeName: string,
  exceptRoutes: string[],
  notAllowedMessage: string
) {
  return defineComponent({
    name: "NestedPage",
    setup() {
      return usePopups();
    },
    computed: {
      isNested() {
        if (this.$route) {
          const routeParts = this.$route?.name?.toString().split("-");
          return (
            routeParts && routeParts.length > 1 && routeParts[1] !== "quiz"
          );
        }
        return true;
      },
    },
    methods: {
      async alert() {
        return this.popups.alert(notAllowedMessage);
      },
    },
    beforeRouteEnter(to, from, next) {
      next((vm) =>
        routerScopeGuard(scopeName, exceptRoutes, vm.alert)(to, from, next)
      );
    },
    beforeRouteUpdate(to, from, next) {
      routerScopeGuard(scopeName, exceptRoutes, this.alert)(to, from, next);
    },
    beforeRouteLeave(to, from, next) {
      routerScopeGuard(scopeName, exceptRoutes, this.alert)(to, from, next);
    },
    render() {
      return h("div", { class: "inner-box" }, [
        h(WrappedComponent, { ...this.$props, nested: this.isNested }),
        h(RouterView, {}),
      ]);
    },
  });
}

export default NestedPage;
