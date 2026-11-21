import http from 'k6/http';
import { check, sleep } from 'k6';

// This script is intentionally restricted to an explicitly supplied local test target.
const baseUrl = __ENV.BASE_URL;
const taskId = __ENV.PUBLIC_TASK_ID;
const virtualUsers = Number(__ENV.VUS || '50');
const duration = __ENV.DURATION || '30s';

if (!baseUrl || !taskId) {
  throw new Error('BASE_URL and PUBLIC_TASK_ID must be supplied. Do not target a deployed environment.');
}

export const options = {
  vus: virtualUsers,
  duration,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const browse = http.get(`${baseUrl}/api/v1/public/tasks?size=20&search=benchmark`);
  check(browse, {
    'browse responds 200': (response) => response.status === 200,
    'browse returns a page': (response) => response.json('content') !== undefined,
  });

  const detail = http.get(`${baseUrl}/api/v1/public/tasks/${taskId}`);
  check(detail, {
    'detail responds 200': (response) => response.status === 200,
    'detail returns the seeded task': (response) => response.json('taskId') === taskId,
  });

  sleep(0.2);
}
