import Image from 'next/image';

const WORK_HISTORY = [
  {
    company: 'hugging face',
    role: 'developer docs',
    start: '2021',
    end: 'Now',
    logo: '/images/hf.png',
    url: 'https://huggingface.co',
  },
];

export function Work() {
  return (
    <div className="mt-12">
      <h2 className="text-black dark:text-gray-100 mb-6 font-medium">work</h2>
      <div className="flex flex-col gap-2">
        {WORK_HISTORY.map((job) => (
          <a
            key={job.company}
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link flex items-center justify-between group -mx-3 px-3 py-2 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden p-1.5">
                <Image
                  src={job.logo}
                  alt={job.company}
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-black dark:text-gray-100">
                  {job.company}
                </span>
                <span className="subtext">{job.role}</span>
              </div>
            </div>
            <div className="subtext tabular-nums text-sm">
              {job.start} — {job.end}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

