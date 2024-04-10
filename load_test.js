import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 10, // Number of virtual users
  duration: '30s', // Duration of the test
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete within 200ms
  },
};

export default function () {
  // Make a GET request to the API
  let response = http.get('http://localhost:5000/api/v1/upload_image');

  // Check if the request was successful
  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  // Simulate a wait time between requests
  sleep(1);
}
