const ProductListSkeleton = () => {
  return (
    <div className="min-h-screen bg-white p-6">
      {/* User header section */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-[80px] w-[80px] animate-pulse rounded-full bg-gray-400 p-4"></div>
        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 animate-pulse rounded-lg bg-gray-400"></div>
          <div className="h-6 w-24 animate-pulse rounded-lg bg-gray-400"></div>
        </div>
      </div>

      {/* Stats card */}
      <div className="mb-8 animate-pulse rounded-lg bg-gray-400 p-6">
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-16 rounded bg-gray-300"></div>
            <div className="h-8 w-12 rounded bg-gray-300"></div>
          </div>
          <div className="h-12 w-px bg-gray-300"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-16 rounded bg-gray-300"></div>
            <div className="h-8 w-12 rounded bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-400"></div>
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-400"></div>
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-400"></div>
        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-400"></div>
      </div>
    </div>
  )
}

export default function Page() {
  return <ProductListSkeleton />
}
