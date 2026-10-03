import { defineConfig } from '@playwright/test';

const base = process.env.BASE_PATH ?? '/abishekatp';
export default defineConfig({
    testDir: './tests',
    timeout: 45000,
    fullyParallel: true,
    use: { baseURL: `http://127.0.0.1:5174${base}/`, viewport: { width: 1440, height: 900 }, trace: 'retain-on-failure' },
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
        { name: 'firefox', use: { browserName: 'firefox' } },
        { name: 'webkit', use: { browserName: 'webkit' } }
    ],
    webServer: {
        command: process.env.TEST_PREVIEW === '1' ? 'pnpm run preview --host 127.0.0.1 --port 5174 --strictPort' : 'pnpm run dev --host 127.0.0.1 --port 5174 --strictPort',
        url: `http://127.0.0.1:5174${base}/cards/`,
        reuseExistingServer: false
    }
});