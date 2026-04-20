import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
    site: 'https://gravis-home.vercel.app',
    integrations: [
        starlight({
            title: 'My Docs',
            sidebar: [
                {
                    label: 'My Notes',
                    // 这行是魔法：它会自动扫描 notes 文件夹下所有文件
                    autogenerate: { directory: 'notes' }, 
                },
            ],
        }),
    ],
});