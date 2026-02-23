export default function ProgressBar({ step, totalSteps }) {
  const percentage = (step / totalSteps) * 100

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div className="h-1 bg-neutral-200/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neutral-300 to-[#5C1F33] transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
