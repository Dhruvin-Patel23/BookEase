import { useEffect, useState } from "react";
import { useMotionValue, useTransform, animate } from "motion/react";

export default function Counter({ to, suffix = "", duration = 1.5 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v * 10) / 10);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: "easeOut" });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [to]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}
