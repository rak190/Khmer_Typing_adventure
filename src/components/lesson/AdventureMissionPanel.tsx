import BridgeProgress from './BridgeProgress';

type AdventureMissionPanelProps = {
  progress: number;
  total: number;
  mascotSrc: string;
};

export default function AdventureMissionPanel({ progress, total, mascotSrc }: AdventureMissionPanelProps) {
  return (
    <section
      data-testid="mission-panel"
      className="pointer-events-none absolute left-[350px] top-[126px] z-20 h-[252px] w-[900px] rounded-[34px] border-[5px] border-[#8E5A28] bg-gradient-to-b from-[#FFF8D9] via-[#FFFDF3] to-[#E9BC65] px-10 py-6 text-[#4E2D12] shadow-[inset_0_4px_0_rgba(255,255,255,.72),inset_0_-9px_0_rgba(113,67,24,.16),0_18px_28px_rgba(0,48,86,.28)]"
    >
      <img
        src={mascotSrc}
        alt=""
        draggable={false}
        className="pointer-events-none absolute bottom-[-10px] left-[-70px] h-[176px] w-[176px] object-contain drop-shadow-[0_16px_14px_rgba(71,39,16,.28)]"
      />

      <div className="mx-auto max-w-[730px] text-center">
        <h1 className="khmer-body text-[50px] font-black leading-none text-[#24395F] drop-shadow-[0_2px_0_rgba(255,255,255,.78)]">សាងសង់ស្ពានប្រាសាទ</h1>
        <p className="khmer-body mt-2 text-[21px] font-extrabold leading-tight text-[#6A421F]">ចុចគ្រាប់ចុចត្រឹមត្រូវ ដើម្បីបំភ្លឺក្តារស្ពាន។</p>
      </div>

      <div className="mt-2 flex items-center justify-center gap-5">
        <span data-testid="bridge-progress-count" className="rounded-full border-[3px] border-[#805225] bg-[#5A3518] px-6 py-1 text-[23px] font-black text-[#FFF0A8] shadow-inner">
          {progress} / {total} Keys
        </span>
      </div>

      <BridgeProgress progress={progress} total={total} />
    </section>
  );
}
