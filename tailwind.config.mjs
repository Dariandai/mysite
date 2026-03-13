/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      height: {
        'dvh': '100dvh',
        'svh': '100svh',
        'lvh': '100lvh',
      },
      minHeight: {
        'dvh': '100dvh',
        'svh': '100svh',
      },
      scrollSnapType: {
        'y-mandatory': 'y mandatory',
        'y-proximity': 'y proximity',
      },
      scrollSnapAlign: {
        'start': 'start',
        'center': 'center',
        'end': 'end',
      },
    },
  },
  plugins: [],
}
