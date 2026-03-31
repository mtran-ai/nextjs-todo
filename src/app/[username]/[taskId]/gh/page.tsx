import { db } from '~/lib/db';

const getRepoMetadata = async (taskId: string) => {
  const repo = await db.repo.findUnique({
    where: {
      taskId
    }
  });

  const meta = await fetch(`https://api.github.com/repos/${repo?.fullName}`);

  const json = await meta.json();

  return json;
};

export default async function RepoMetaPage({
  params
}: {
  params: Promise<{
    username: string;
    taskId: string;
  }>;
}) {
  const { taskId } = await params;
  const meta = await getRepoMetadata(taskId);

  return <pre>{JSON.stringify(meta, null, 2)}</pre>;
}
