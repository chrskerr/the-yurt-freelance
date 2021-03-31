---
title: The Van Diaries Blog
date: 2021-01
image: ../images/portfolio/the-van-diaries.png
summary: Our travel blog and journal
technologies: ["svelte"]
link: https://van-diaries.chrskerr.com
---

#### What We Did:
We've built a blog site to map our travels around Australia! Focussing on the best rest spots and mountain bike trails, we have built a range of filters to the map function to enable users to easily find the information that matters to them.

#### How We Did It:
This is a statically rendered blog using Markdown and the new SvelteKit.

To allow us to easily manage and update the blog, we use Svelte to create all of the views and templates, and we use Markdown files for each blog post. SvelteKit is used to statically render all content into hydratable html which is then be hosted extremely cheaply on a basic HTTP server rather than a relatively expensive dedicated host with server-side rendering (eg Wordpress).

It is built and hosted on CloudFlare Pages meaning we can write a Markdown blog post, commit, and push to GitHub, and the new content will be online within 3-5 mins. Easy enough that Kate can update the blog without any technical input ;)