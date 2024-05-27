import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

module.exports = async () => {
  await global.app.close();
  await (global.pg as StartedPostgreSqlContainer).stop();
};
