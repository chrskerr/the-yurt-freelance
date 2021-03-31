<script context="module">
    export async function load({ fetch }) {
        const res = await fetch("/portfolio.json");
        return { props: await res.json() };
    }
</script>

<script>
    export let items = [];
    import { onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { backOut } from "svelte/easing";
    import { blur } from "svelte/transition";

    import _ from "lodash";
    import { format, parseISO } from "date-fns";
    import technologiesMap from "./technologies.js";

    const technologies = _.map(_.uniq(_.flatMap(items, "technologies")).sort(), tech => ({
        id: tech,
        ..._.get(technologiesMap, tech),
        title: _.get(technologiesMap, [tech, "title"]) || _.startCase(tech),
    }));
    $: filterTechnologies = _.reject(technologies, { filterExclude: true });

    const highlightedTechnologies = _.orderBy(
        _.filter(technologiesMap, ({ highlighted, image }) => highlighted && image),
        ["title"],
        ["asc"],
    );

    let y,
        x,
        els = [],
        imagesToScroll = [],
        imagesOnScreen = [],
        imagesToLazyLoad = [];

    const _scrollImageToLoc = (e, el, loc) => {
        const _target = el ? el : _.get(e, "target");
        if (loc === "bottom") {
            const _image = _target.classList.contains("image") ? _target : _target.parentElement;
            const imageHeight = _image.offsetHeight;

            const _imageParent = _image.parentElement;
            const containerHeight = _imageParent.offsetHeight;

            _image.style.transitionDuration = `${_.floor((imageHeight * 1000) / 250)}ms`;
            _image.style.top = `-${imageHeight - containerHeight}px`;
        } else if (loc === "top") {
            const _image = _target.classList.contains("image") ? _target : _target.parentElement;
            _image.style.top = "0px";
        }
    };
    const _handleImageScroll = e => {
        if (x > 480) {
            _scrollImageToLoc(e, null, "bottom");
        }
    };
    const _stopImageScroll = e => {
        if (x > 480) {
            _scrollImageToLoc(e, null, "top");
        }
    };
    const _imageScrollTransitionEnd = e => {
        const _image = _.get(e, "target");
        if (_image.style.top === "0px") {
            _scrollImageToLoc(e, null, "bottom");
        } else {
            _scrollImageToLoc(e, null, "top");
        }
    };

    const _lazyLoadImages = images => {
        _.forEach(images, image => {
            const img = image.children[0];
            img.src = img.id;
        });
    };

    const _checkImagesForScrollIn = () => {
        const viewportBottom = y + window.innerHeight;

        els = _.filter(els, el => {
            if (el.offsetTop <= viewportBottom) {
                el.classList.remove("hidden");
                return false;
            } else return true;
        });
    };

    const _scrollListner = () => {
        y = window.scrollY;

        if (_.size(els) >= 0) {
            _checkImagesForScrollIn();
        }

        if (x <= 480) {
            _.forEach(imagesToScroll, (image, i) => {
                const rect = image.parentElement.getBoundingClientRect();
                if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                    console.log(image.src);
                    if (!imagesOnScreen[i]) {
                        imagesOnScreen[i] = true;
                        _scrollImageToLoc(null, image, "bottom");
                        image.addEventListener("transitionend", _imageScrollTransitionEnd);
                    }
                } else if (imagesOnScreen[i]) {
                    imagesOnScreen[i] = false;
                    _scrollImageToLoc(null, image, "top");
                    image.removeEventListener("transitionend", _imageScrollTransitionEnd);
                }
            });
        }
    };
    const _displayOnScroll = el => {
        if (_.isUndefined(y)) y = window.scrollY;
        if (el.offsetTop < y + window.innerHeight - 85) el.classList.remove("hidden");
        else els = _.concat(els, el);
    };

    let filter = "all";
    $: sortedItems = _.orderBy(
        _.filter(items, item => filter === "all" || _.includes(item.technologies, filter)),
        ["isActive", "date"],
        ["desc", "desc"],
    );

    let titleBlue = false;

    onMount(() => {
        window.addEventListener("scroll", _scrollListner);
        y = window.scrollY;

        _checkImagesForScrollIn();
        _lazyLoadImages(_.concat(imagesToScroll, imagesToLazyLoad));

        titleBlue = true;
    });

    const _scrollTo = elId => {
        const el = document.getElementById(elId);
        if (!el) return;

        if (_.size(els) >= 0 && elId !== "start") {
            els = _.filter(els, el => {
                el.classList.remove("hidden");
                el.classList.remove("slide-in");
                return false;
            });
        }

        const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

        const easingFunc = x => {
            // InOutQuad
            // https://easings.net
            return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
        };

        const numSteps = 120;
        const steps = _.map(_.range(0, numSteps + 1), step => _.round(window.scrollY + (el.offsetTop - window.scrollY) * easingFunc(step / numSteps)));
        steps[_.size(steps) - 1] = el.offsetTop;

        let i = 0;
        const step = () => {
            if (!_.isUndefined(steps[++i])) {
                window.scrollTo({ top: steps[i], left: 0 });
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };
</script>

<svelte:window bind:innerWidth={x} />

<section class="title-banner banner style3 orient-left content-align-left image-position-center">
    <div class="content">
        <h1 class={titleBlue ? "blue" : ""}>The Yurt</h1>
        <h2>Marketing and Web Development</h2>
        <p><i>noun</i> \ ˈyu̇rt, ˈyərt \</p>
        <ol>
            <li>a circular domed tent of skins or felt stretched over a collapsible lattice framework and used by pastoral peoples of inner Asia</li>
            <li>our van, which serves as transport, office and a moveable home</li>
        </ol>
        <ul class="actions">
            <li><p on:click={() => _scrollTo("start")} class="button icon feather-chevron-down">Start</p></li>
        </ul>
    </div>
    <div class="image">
        <img src="https://source.unsplash.com/_Zbbs4muqkQ/800x1000" alt="yurts in a field" />
    </div>
</section>

<section id="start" use:_displayOnScroll class="spotlight style5 blur-in hidden">
    <div class="content">
        <h2>What is "The Yurt"</h2>
        <p>The Yurt is a freelancing team between Kate Hobbs (Marketing) and Chris Kerr (Web Development).</p>
        <p>We <span class="text-emphasis">build</span> things and then draw attention to them.</p>
        <ul class="actions">
            <li><p on:click={() => _scrollTo("work-with-us")} class="button icon feather-chevron-down">Work With Us</p></li>
            <li><p on:click={() => _scrollTo("portfolio")} class="button icon feather-chevron-down">Portfolio</p></li>
        </ul>
    </div>
</section>

<section use:_displayOnScroll class="spotlight style1 orient-right content-align-left image-position-center slide-in hidden">
    <div class="content">
        <h2>Website Development</h2>
        <p><i>This is Chris; he likes to build things.</i></p>
        <p>We build high quality websites that speak to your consumers and ultimately drive your business results.</p>
        <p>With strong marketing insight layered into everything we do, your site will always be built with <span class="text-emphasis">your consumer & desired conversion at the core</span> - coming to life through the design, copy, imagery, colours, fonts, SEO & functionality required for your site.</p>
        <ul class="actions fixed tech-logos">
            {#each highlightedTechnologies as tech}
                <li><img src={`/images/tech/${tech.image}`} alt={`${tech.title} logo`} /></li>
            {/each}
        </ul>
        <ul class="actions">
            <li><p on:click={() => _scrollTo("work-with-us")} class="button icon feather-chevron-down">Work With Us</p></li>
        </ul>
    </div>
    <div class="image" bind:this={imagesToLazyLoad[0]}>
        <img id="images/chris.jpeg" alt="Chris drilling some wood" />
    </div>
</section>

<section use:_displayOnScroll class="spotlight style1 orient-left content-align-left image-position-center slide-in hidden">
    <div class="content">
        <h2>Marketing</h2>
        <p><i>This is Kate; she likes to make noise.</i></p>
        <p>We have the expertise to <span class="text-emphasis">help you grow</span> and demand attention.</p>
        <p>We also help build businesses through other aspects of marketing strategy, from overarching brand strategy, to guerilla marketing on a tight budget, to fully fledged online & offline marketing campaings.</p>
        <ul class="actions">
            <li><p on:click={() => _scrollTo("work-with-us")} class="button icon feather-chevron-down">Work With Us</p></li>
        </ul>
    </div>
    <div class="image" bind:this={imagesToLazyLoad[1]}>
        <img id="images/kate.jpeg" alt="Kate holding a helmet up and pretending to yell" />
    </div>
</section>

<section id="work-with-us" use:_displayOnScroll class="spotlight style1 orient-right content-align-left image-position-center slide-in hidden">
    <div class="content">
        <h2>Work with Us</h2>
        <p><i>This is us; we love to chat!</i></p>
        <p>Whether you require a comprehensive website build with detailed brand strategy, or simply require updates to your existing website, we are here to help.</p>
        <p>Book in for a <span class="text-emphasis">FREE</span> 15 minute strategy call to discuss what you need. There is absolutely no commitment to work with us; if you like what you hear, let's get building!</p>
        <ul class="actions">
            <li>
                <span
                    class="button fit"
                    on:click={() => {
                        Calendly.initPopupWidget({ url: "https://calendly.com/kc-freelance/15min?hide_gdpr_banner=1&text_color=000000&primary_color=189AB4" });
                        return false;
                    }}
                >
                    Schedule a time with us
                </span>
            </li>
        </ul>
    </div>
    <div class="image" bind:this={imagesToLazyLoad[2]}>
        <img id="images/chris-kate-heads.jpeg" alt="Chris and Kate together" />
    </div>
</section>

<section id="portfolio" use:_displayOnScroll class="wrapper style1 align-center blur-in hidden">
    <div class="inner">
        <h2>Portfolio</h2>
        <div class="filters">
            <span class={`clickable ${filter === "all" ? "selected" : ""}`} on:click={() => (filter = "all")}>All</span>
            {#each filterTechnologies as tech}
                <span>-</span>
                <span class={`clickable ${filter === tech.id ? "selected" : ""}`} on:click={() => (filter = tech.id)}>{tech.title}</span>
            {/each}
        </div>
        <div class="items style1 medium onscroll-slide-in">
            {#each sortedItems as item, i (item.slug)}
                <section animate:flip={{ duration: 800, easing: backOut }}>
                    <a in:blur={{ duration: 600 }} class="image-scroll" href={`/${item.slug}`}
                        ><div class="image" style="max-width: 100%;" bind:this={imagesToScroll[i]} on:mouseover={_handleImageScroll} on:mouseout={_stopImageScroll}>
                            <img id={item.image} alt={item.title} style="max-width: 100%;" />
                        </div>
                    </a>
                    <div in:blur={{ duration: 600 }} class="content">
                        <h3><a href={`/${item.slug}`}>{item.title}</a></h3>
                        {#if item.date}<p>Created: <strong>{format(parseISO(item.date), "MMM yyyy")}</strong></p>{/if}
                        <p>{item.summary}</p>
                    </div>
                </section>
            {/each}
        </div>
    </div>
</section>

<section use:_displayOnScroll class="spotlight style1 orient-right content-align-left image-position-center slide-in hidden">
    <div class="content">
        <h2>Kate & Chris</h2>
        <p><span class="text-emphasis">Chris'</span> key strengths are in JavaScript and web development, with experience in React and Node. He comes from an IT sales background and now works in software development.</p>
        <p><span class="text-emphasis">Kate</span> loves delivering brand strategy and marketing results across all communication channels. She has worked across brands from startups to household names such as Volvo, Dyson & McVitie's.</p>
    </div>
    <div class="image" bind:this={imagesToLazyLoad[3]}>
        <img id="images/kate-and-chris.jpeg" alt="Kate and Chris working next to their van" />
    </div>
</section>

<style>
    @media screen and (min-width: 736px) {
        .title-banner {
            min-height: max(600px);
        }
    }
    .title-banner img {
        border-top-right-radius: 25%;
        border-top-left-radius: 5%;
        border-bottom-right-radius: 5%;
        border-bottom-left-radius: 25%;
    }
    .title-banner .actions {
        margin: 0 0 1.5rem 0;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
    }
    .title-banner .actions p {
        margin: 0;
    }
    .title-banner .content {
        padding-right: 0 !important;
    }
    @media screen and (max-width: 735px) {
        .title-banner .content {
            padding-bottom: 6rem;
        }
    }
    .title-banner .content h1 {
        transition: color 800ms ease-in-out;
        transition-delay: 1500ms;
        will-change: color;
        margin-bottom: 0;
    }
    .title-banner .content h2 {
        margin-bottom: 2.5rem;
    }
    .title-banner .content p {
        margin-bottom: 0rem;
        font-size: 95%;
    }
    .title-banner .content ol {
        margin-left: 1rem !important;
        font-size: 90%;
    }
    .title-banner .content i {
        padding-right: 1rem !important;
        font-size: 105%;
    }
    .title-banner .content h1.blue {
        color: var(--brand-blue);
    }

    @media screen and (max-width: 690px) {
        .actions:not(.tech-logos) {
            margin-left: auto;
            margin-right: auto;
            justify-content: center;
        }
    }

    .button {
        font-size: 0.7rem !important;
    }

    .slide-in {
        transition: transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1);
        will-change: transform;
    }
    .slide-in.hidden.orient-left {
        transform: translateX(100vw);
    }
    .slide-in.hidden.orient-right {
        transform: translateX(-100vw);
    }

    .blur-in {
        transition: opacity 1500ms;
        will-change: opacity filter;
    }
    .blur-in.hidden {
        opacity: 0.2;
        filter: blur(4px);
    }
    .items > section {
        border: none;
    }

    .items .image-scroll {
        display: block;
        position: relative;
        height: 10rem;
        overflow: hidden;
        box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.05);
        transition: box-shadow 300ms ease-in-out;
        will-change: box-shadow;
        border-radius: 4px;
    }

    .items .image {
        width: 100%;
        will-change: top;
        transition: top ease-in-out;
        transition-delay: 250ms;
        position: absolute;
        top: 0;
        left: 0;
    }
    .items .image img {
        width: 100%;
    }

    @media screen and (min-width: 480px) {
        .items .image-scroll:hover {
            box-shadow: 0px 0px 2px 1px var(--brand-blue);
        }
    }

    .items .content p {
        font-size: 80%;
        margin-bottom: 0.5rem;
    }
    .items .content p:last-of-type {
        margin-bottom: 2rem;
    }
    .items .content > *:first-child::before {
        background-color: var(--brand-blue);
        content: "";
        display: block;
        height: 2px;
        margin: 2rem auto;
        width: 4rem;
    }
    .items .content > *:last-child::after {
        background-color: var(--brand-blue);
        content: "";
        display: block;
        height: 2px;
        margin: 2rem auto;
        width: 8rem;
    }

    .filters {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }
    .filters > span {
        margin: 0;
        padding: 0 0.5rem;
        color: var(--brand-blue);
    }
    .filters > span.clickable {
        cursor: pointer;
    }
    .filters > span.selected {
        font-weight: 600;
    }

    .text-emphasis {
        color: var(--brand-blue);
        font-weight: 500;
    }

    .spotlight,
    .wrapper {
        border-top: 1px dotted rgba(0, 0, 0, 0.15);
    }
    .style5 ul.actions {
        justify-content: center;
    }
    ul.actions {
        flex-wrap: wrap;
    }
    .tech-logos {
        justify-content: space-around;
    }
    .tech-logos li {
        display: flex;
        margin-bottom: 1.5rem !important;
        height: 5rem;
    }

    @media screen and (max-width: 980px) {
        .tech-logos li {
            height: 4rem;
            width: 50%;
        }
    }

    @media screen and (max-width: 736px) {
        .tech-logos li {
            height: 3rem;
        }
    }

    @media screen and (max-width: 480px) {
        .tech-logos li {
            width: 33%;
        }
        .actions .button {
            margin-bottom: 0 !important;
        }
    }

    .tech-logos img {
        object-fit: contain;
        width: 100%;
        max-width: 200px;
        height: 100%;
    }
</style>
