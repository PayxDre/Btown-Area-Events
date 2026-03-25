import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Events That Fit{" "}
          <span className="text-blue-600">Your Schedule</span>
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Discover local events filtered by the times that work for you and
          the ages of your kids.
        </p>
        <p className="text-gray-500 mb-8">
          Block out nap times, filter by age group, and find exactly what
          your family needs.
        </p>

        <SearchBar />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-2xl mb-2">&#x1f552;</div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Block Out Times
            </h3>
            <p className="text-sm text-gray-500">
              Have a nap schedule? Block out 12-2pm and only see events
              outside those hours.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-2xl mb-2">&#x1f476;</div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Age-Appropriate
            </h3>
            <p className="text-sm text-gray-500">
              Filter for toddlers, kids, teens, or adults. Enter your
              child&apos;s age for auto-matching.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-2xl mb-2">&#x1f4cd;</div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Multiple Sources
            </h3>
            <p className="text-sm text-gray-500">
              Events from university calendars, tourism sites, and community
              boards &mdash; all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
