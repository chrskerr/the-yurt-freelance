<script context="module">
    export async function load({ page, fetch }) {
        const url = `/${page.params.slug}.json`;
        const res = await fetch(url);

        if (res.ok) {
            return {
                props: await res.json(),
            };
        }

        return {
            status: 301,
            redirect: "/",
        };
    }
</script>

<script>
    export let item;
    import { format, parseISO } from "date-fns";
    import _ from "lodash";
    import technologiesMap from "./technologies.js";

    let imageHeight, imageContainerHeight;

    const _setElToBottom = el => {
        if (imageHeight && imageContainerHeight) {
            el.style.transitionDuration = `${_.floor((imageHeight * 1000) / 350)}ms`;
            el.style.top = `-${imageHeight - imageContainerHeight}px`;
        } else setTimeout(() => _setElToBottom(el), 500);
    };

    const _handleScroll = el => {
        _setElToBottom(el);

        el.addEventListener("transitionend", () => {
            if (el.style.top === 0 || el.style.top === "0px") _setElToBottom(el);
            else el.style.top = "0px";
        });
    };

    const technologies = _.map(_.uniq(item.technologies.sort()), tech => ({
        id: tech,
        ..._.get(technologiesMap, tech),
        title: _.get(technologiesMap, [tech, "title"]) || _.startCase(tech),
    }));

    $: technologyImages = _.filter(technologies, ({ image }) => image);
</script>

<section class="wrapper style1 align-center portfolio-item">
    <div class="container">
        <a href="/" svelte:preload class="button icon small feather-chevron-left">Return</a>
        <h2 class="mb0">{item.title}</h2>
        {#if item.date}<p>Created: <strong>{format(parseISO(item.date), "MMM yyyy")}</strong></p>{/if}
        <p>{item.summary}</p>
        <div class="image scroll" bind:offsetHeight={imageContainerHeight}>
            <div bind:offsetHeight={imageHeight} use:_handleScroll>
                <img src={item.image} alt={item.title} />
            </div>
        </div>
        <ul class="actions fixed tech-logos">
            {#each technologyImages as tech}
                <li>
                    <img src={`/images/tech/${tech.image}`} alt={`${tech.title} logo`} />
                </li>
            {/each}
        </ul>
        {@html item.html}
    </div>
</section>

<style>
    .container {
        width: min(36rem, 70vw);
        margin: 0 auto;
        text-align: left;
        padding-top: 2rem;
    }
    .container > a {
        margin-bottom: 2rem;
    }
    .mb0 {
        margin-bottom: 0;
    }

    .image.scroll {
        margin: 0 auto 2rem auto;
        height: min(24rem, 80vh);
        width: 100%;
        overflow: hidden;
        box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.05);
        position: relative;
    }

    .image.scroll div {
        width: 100%;
        height: fit-content;
        position: absolute;
        top: 0;
        will-change: top;
        transition: top ease-in-out;
        transition-delay: 1s;
    }

    .image.scroll img {
        width: 100%;
    }

    .tech-logos {
        flex-wrap: wrap;
        justify-content: space-around;
    }
    .tech-logos li {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 5rem;
    }
    .tech-logos img {
        object-fit: contain;
        width: 100%;
        max-width: 200px;
        height: 100%;
    }
</style>
