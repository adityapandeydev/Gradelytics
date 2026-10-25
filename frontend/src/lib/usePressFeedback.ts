import { useEffect } from "react";

/** Delegated feedback covers existing and newly added buttons without delaying actions. */
export function usePressFeedback() {
  useEffect(() => {
    const running = new Map<
      HTMLElement,
      { press: Animation; ink: Animation; layer: HTMLElement }
    >();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function feedback(event: PointerEvent | KeyboardEvent) {
      if (reduced.matches || !(event.target instanceof Element)) return;
      if (
        event instanceof KeyboardEvent &&
        (event.repeat || !["Enter", " "].includes(event.key))
      )
        return;
      if (
        event instanceof PointerEvent &&
        (!event.isPrimary || event.button !== 0)
      )
        return;
      const control = event.target.closest<HTMLElement>(
        "button, a.nav-item, a.brand",
      );
      if (
        !control ||
        control.matches(":disabled, [aria-disabled='true'], .nav-scrim")
      )
        return;
      if (
        event instanceof KeyboardEvent &&
        event.key === " " &&
        control.tagName === "A"
      )
        return;
      const previous = running.get(control);
      previous?.press.cancel();
      previous?.ink.cancel();
      previous?.layer.remove();

      const layer = document.createElement("span");
      layer.className = "press-ink";
      layer.setAttribute("aria-hidden", "true");
      control.append(layer);
      const press = control.animate(
        [{ scale: "1" }, { scale: ".965", offset: 0.28 }, { scale: "1" }],
        { duration: 170, easing: "cubic-bezier(.23,1,.32,1)" },
      );
      const ink = layer.animate(
        [
          { clipPath: "circle(0% at 50% 50%)", opacity: 0.19 },
          { clipPath: "circle(100% at 50% 50%)", opacity: 0.13, offset: 0.72 },
          { clipPath: "circle(100% at 50% 50%)", opacity: 0 },
        ],
        {
          delay: 30,
          duration: 220,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "both",
        },
      );
      const current = { press, ink, layer };
      running.set(control, current);
      void ink.finished.then(
        () => {
          layer.remove();
          if (running.get(control) === current) running.delete(control);
        },
        () => layer.remove(),
      );
    }
    function clearFeedback() {
      for (const { press, ink, layer } of running.values()) {
        press.cancel();
        ink.cancel();
        layer.remove();
      }
      running.clear();
    }
    function motionPreferenceChanged() {
      if (reduced.matches) clearFeedback();
    }
    reduced.addEventListener("change", motionPreferenceChanged);
    document.addEventListener("pointerdown", feedback, true);
    document.addEventListener("keydown", feedback, true);
    return () => {
      document.removeEventListener("pointerdown", feedback, true);
      document.removeEventListener("keydown", feedback, true);
      reduced.removeEventListener("change", motionPreferenceChanged);
      clearFeedback();
    };
  }, []);
}
