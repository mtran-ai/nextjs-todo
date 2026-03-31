import { createSafeActionClient } from 'next-safe-action';

import { auth } from '~/lib/auth';

export const action = createSafeActionClient({
  middleware: async () => {
    const session = await auth();

    return {
      userId: session?.user.id
    };
  }
});
