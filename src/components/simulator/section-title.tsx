/** Titre de section au format S'investir : libellé centré flanqué de traits bleus. */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      <Decoration side="left" />
      <h1 className="text-center font-heading text-[22px] font-normal tracking-[0.02em] text-white uppercase sm:text-[34px]">
        {children}
      </h1>
      <Decoration side="right" />
    </div>
  );
}

function Decoration({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <span className="hidden items-center sm:flex" aria-hidden>
      {!isLeft && <Node />}
      <span
        className="h-px w-16 md:w-28"
        style={{
          background: `linear-gradient(${
            isLeft ? "90deg" : "270deg"
          }, transparent, #1098f7)`,
        }}
      />
      {isLeft && <Node />}
    </span>
  );
}

function Node() {
  return (
    <span className="mx-1 size-1.5 rotate-45 bg-[#1098f7] shadow-[0_0_8px_#1098f7]" />
  );
}
