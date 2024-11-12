import Link from 'next/link'

export const runtime = 'edge'

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">
        <button className="flex w-full items-center justify-center bg-blue-500 p-4 text-white">Return Home</button>
      </Link>
    </div>
  )
}
