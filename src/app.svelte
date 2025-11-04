<script lang="ts">
    import { tick } from 'svelte';
    import { fade, fly } from 'svelte/transition';
  
    let current = 0;
    let activeMenu: any[] = [
      {
        label: 'Start Game',
        type: 'button'
      },
      {
        label: 'Enable Cheats',
        type: 'checkbox',
        checked: false
      },
      {
        label: 'Difficulty',
        type: 'scroll',
        options: [
          { label: 'Easy' },
          { label: 'Normal' },
          { label: 'Hard' },
          { label: 'Extreme' }
        ],
        selected: 1
      },
      {
        label: 'Volume',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        value: 75
      },
      {
        label: 'Settings',
        type: 'submenu'
      },
      {
        label: 'daw',
        type: 'divider'
      }
    ];
    let activeTabs = ["Main Menu"];
    let currentTab = 0;
    let showing = true;

    let itemRefs: HTMLElement[] = [];
    let position: string = 'left';
    let banner: string = 'https://r2.fivemanage.com/2RN5mhKFpi9pXKQvjCgJe/mainui1.png';
  
    let wrapperEl: HTMLElement;
    let listEl: HTMLElement;
    let trackTop = 0, trackHeight = 0, thumbTop = 0, thumbHeight = 24;
    let scrollbarHidden = true, hasOverflow = false;
    const MIN_THUMB = 18, NO_OVERFLOW_THUMB_MAX = 28;
  
    let selectableMenu: any[] = [];
    $: selectableMenu = activeMenu.filter(o => o?.type !== 'divider');
    let selectableIndices: number[] = [];
    $: selectableIndices = activeMenu.map((o, i) => (o?.type !== 'divider' ? i : -1)).filter(i => i !== -1);
  
    function counterCurrent(): number {
      const total = selectableIndices.length;
      if (total === 0) return 0;
      const pos = selectableIndices.indexOf(current);
      if (pos !== -1) return pos + 1;
      let nearest = -1, bestDiff = Infinity;
      for (let idx = 0; idx < total; idx++) {
        const diff = Math.abs(selectableIndices[idx] - current);
        if (diff < bestDiff) { bestDiff = diff; nearest = idx; }
      }
      return nearest !== -1 ? nearest + 1 : 0;
    }
  
    function syncThumb() {
      if (!listEl) return;
      const trackScrollable = Math.max(0, trackHeight - thumbHeight);
  
      if (hasOverflow) {
        const maxScroll = Math.max(0, listEl.scrollHeight - listEl.clientHeight);
        if (listEl.scrollTop <= 1) { thumbTop = 0; return; }
        const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, listEl.scrollTop / maxScroll)) : 0;
        thumbTop = Math.round(trackScrollable * ratio);
      } else {
        const count = Math.max(1, activeMenu.length);
        const lastIdx = Math.max(1, count - 1);
        const idx = Math.min(Math.max(current, 0), count - 1);
        const ratio = count > 1 ? (idx / lastIdx) : 0;
        thumbTop = Math.round(trackScrollable * ratio);
      }
    }
  
    function measureScrollbar() {
      if (!wrapperEl || !listEl) return;
      const wrapperRect = wrapperEl.getBoundingClientRect();
      const listRect = listEl.getBoundingClientRect();
      trackTop = Math.round(listRect.top - wrapperRect.top);
      trackHeight = Math.round(listRect.height);
      const clientH = listEl.clientHeight;
      const scrollH = listEl.scrollHeight;
      hasOverflow = scrollH > clientH + 1;
      scrollbarHidden = !showing || activeMenu.length === 0;
      thumbHeight = hasOverflow
        ? Math.max(MIN_THUMB, Math.round((clientH / scrollH) * trackHeight))
        : Math.max(MIN_THUMB, Math.min(NO_OVERFLOW_THUMB_MAX, trackHeight));
      syncThumb();
    }
  
    function centerOnSelected(index: number) {
      if (!listEl) return;
      const maxScroll = Math.max(0, listEl.scrollHeight - listEl.clientHeight);
  
      if (!hasOverflow || maxScroll === 0) {
        listEl.scrollTop = 0;
        syncThumb();
        return;
      }
  
      const lastIdx = Math.max(0, activeMenu.length - 1);
      if (index <= 0) { listEl.scrollTop = 0; requestAnimationFrame(syncThumb); return; }
      if (index >= lastIdx) { listEl.scrollTop = maxScroll; requestAnimationFrame(syncThumb); return; }
  
      const item = itemRefs[index];
      if (!item) return;
      const itemTop = item.offsetTop;
      const itemCenter = itemTop + item.offsetHeight / 2;
      let target = itemCenter - listEl.clientHeight / 2;
      if (target < 0) target = 0;
      if (target > maxScroll) target = maxScroll;
      listEl.scrollTop = target;
      requestAnimationFrame(syncThumb);
    }

    const scheduleMeasure = () => requestAnimationFrame(() => requestAnimationFrame(measureScrollbar));
    function onListScroll() { syncThumb(); }
    $: if (showing) { centerOnSelected(current); }

    window.addEventListener('message', (event) => {
      const data = event.data;
      const action = data.action;
  
      if (action === 'setCurrent') {
        current = data.current - 1;
        activeMenu = data.menu;
        showing = true;

        centerOnSelected(current);
        scheduleMeasure();
      } else if (action === 'setTabs') {
        activeTabs = data.tabs || [];
        currentTab = 0;
      } else if (action === 'setTabIndex') {
        currentTab = data.index;
      } else if (action === 'setVisible') {
        showing = data.visible;
        if (showing) centerOnSelected(current);
        scheduleMeasure();
      } else if (action === 'position') {
        position = data.position;
        scheduleMeasure();
      } else if (action === 'banner') {
        banner = data.banner;
	  }
    });
</script>
  
<svelte:head>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
</svelte:head>
  
<style>
  * {
    background: none;
  }

  .toggle {
    appearance: none;
    -webkit-appearance: none;
    width: 3.3vh;
    height: 1.5vh;
    background-color: #222;
    border-radius: 1vh;
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }

  .toggle::before {
    content: '';
    position: absolute;
    width: 1.1vh;
    height: 1.1vh;
    border-radius: 50%;
    background: white;
    top: 0.2vh;
    left: 0.2vh;
    transition: transform 0.2s ease-in-out;
  }

  .toggle.on::before {
    background-color: #0026ff;
    transform: translateX(1.65vh);
  }

  .range {
    width: 7.5vh;
    height: 1.2vh;
    background: transparent;
    margin: 0;
    outline: none;
    border: 0;
  }

  .range,
  .range::-webkit-slider-thumb {
    -webkit-appearance: none;
  }
  .range::-moz-range-thumb { border: none; }

  .range::-webkit-slider-runnable-track {
    height: 0.55vh;
    border-radius: 0.75vh;
    background:
    linear-gradient(
    to right,
    rgba(255,255,255,0.95) 0 var(--pct),
    rgb(46, 46, 46) var(--pct) 100%
    );
  }

  .range::-webkit-slider-thumb {
    width: 1.1vh;
    height: 1.1vh;
    margin-top: -0.3vh;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
  }
  .range:active::-webkit-slider-thumb {
    transform: scale(1.03);
  }

  .hide-scrollbar {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .hide-scrollbar {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

	.notification-container {
		position: fixed;
		top: 50%;
		right: 2vh;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 1vh;
		z-index: 9999;
		max-width: 25vh;
	}

	.notification {
		display: flex;
		border-radius: 0.8vh;
		overflow: hidden;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
		font-family: "Segoe UI", sans-serif;
		user-select: none;
	}

	.message-box {
		position: relative;
		padding: 0.8vh 1.9vh;
		width: 100%;
		color: white;
		font-size: 1.3vh;
		display: flex;
		align-items: center;
		min-width: 18vh;
		overflow: hidden;
	}

	.message-box span {
		position: relative;
		z-index: 2;
	}

	.progress {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background-color: rgba(255, 255, 255, 0.2);
		z-index: 1;
		transition: width 0.05s linear;
		pointer-events: none;
	}

  .hide-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }

  .scrollbar-container{
    position: absolute;
    left: 0.5vh;
    width: 0.6vh;
    border-radius: 0.15vh;
    background: rgba(0,0,0,.45);
    pointer-events: none;
    z-index: 100;
    transition: height 0.2s ease-in-out, opacity 0.2s ease-in-out;
    overflow: hidden;
  }
  
  .scrollbar-container.is-hidden { opacity: 0; pointer-events: none; display: none; }
  
  .scrollbar-thumb {
    position: absolute;
    left: 0; right: 0; top: 0;
    height: 1.2vh;
    background: #000c50;
    transition: top 80ms linear, height 120ms ease;
  }
  
  .menu-divider{
    position:relative; display:flex; align-items:center; justify-content:center;
    height:2.2vh; margin:.6vh 0; pointer-events:none;
  }

  .menu-divider span{
    color:rgba(255,255,255,.7); font-size:1.0vh; font-weight:600; letter-spacing:.02em;
  }

  .menu-divider::before,
  .menu-divider::after{
    content:""; position:absolute; top:50%; transform:translateY(-50%);
    width:7vh; height:.4vh; background: rgba(255,255,255,.95); border-radius:.2vh; opacity:.95;
  }

  .menu-divider::before{ left:1.2vh } .menu-divider::after{ right:1.2vh }

  .menu-item.active {
    border-left: 0.3vh solid rgb(2, 10, 80);
  }
</style>

<!-- MENU -->
{#if showing}
    <div bind:this={wrapperEl} style="position: absolute; top: 50%; transform: translateY(-50%); left: {position == 'left' && '6.5vh' || position == 'right' && 'calc(100% - 41vh)'}; transition: 0.5s; font-family: Arial, sans-serif;" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
      <div class="scrollbar-container" style="top:{trackTop}px; height:{trackHeight}px;">
        <div class="scrollbar-thumb" style="top:{thumbTop}px; height:{thumbHeight}px;" />
      </div>

      <div style="transform: translateY(-0.6vh); margin-left: 1.75vh; width: 95%; border-radius: 0.4vh; overflow:hidden; line-height:0;">
          <img src={banner} style="display:block; width:100%; height:9.5vh; object-fit:cover; margin:0; padding:0; border:0;" />
            <div style="display:flex; background:#000; border-radius: 0.2vh; margin-top:-0.2vh;">
              {#if activeTabs.length === 1}
                <div style="
                    text-align:center;
                    padding:1.5vh 1.5vh;
                    font-size:1.15vh;
                    font-weight:500;
                    background:linear-gradient(0deg, rgb(0, 26, 255) 0%, transparent 100%);
                    color:white;
                    white-space:nowrap;">
                  {activeTabs[0]}
                </div>
              {:else}
                {#each activeTabs as tab, i}
                  <div style="
                      flex:1;
                      text-align:center;
                      padding:1.5vh 1.5vh;
                      font-size:1.15vh;
                      font-weight:500;
                      cursor:pointer;
                      transition:all 0.15s ease;
                      background:{i === currentTab ? 'linear-gradient(0deg, rgb(0, 26, 255) 0%, transparent 100%)' : 'transparent'};
                      color:white;">
                    {tab}
                  </div>
                {/each}
              {/if}
            </div>
          </div>

        <div style="position: absolute; margin-left: 1.75vh; width: 33.5vh; background: rgb(0, 0, 0, 0.8); border-radius: 0.3vh; display: flex; flex-direction: column; overflow: hidden; position: relative;">
          
          <div class="hide-scrollbar" bind:this={listEl} on:scroll={onListScroll} style="max-height: 33.6vh;">
            <div style="display: flex; flex-direction: column; gap: 0.0vh; position: relative;">
              {#each activeMenu as option, index (option.label)}
                  {#if option.type == 'divider'}
                      <div class="menu-divider"><span>{option.label}</span></div>
                  {:else}
                <div
                  bind:this={itemRefs[index]}
                  class="menu-item {index == current ? 'active' : ''}"
                  style="padding: 0.7vh 1.0vh; color: white; border-radius: 0.3vh; justify-content: space-between; display: flex; align-items: center; font-family: 'Segoe UI', sans-serif; font-size: 1.4vh; gap: 1vh; font-weight: 400; cursor: pointer; z-index: 1; {index == current ? 'background-color: rgb(0, 26, 255);' : ''}"
                >
                <span style="flex-grow: 1; text-align: left; font-size: 1.2vh; height: 100%;">
                  {option.label}
                </span>

                  {#if option.type == 'submenu'}
                      <i class="ph ph-caret-right" style="color: white; font-size: 1.2vh;"></i>
                  {:else if option.type == 'checkbox'}
                      <div class="toggle {option.checked ? 'on' : ''}"></div>
                  {:else if option.type == 'slider'}
                      <input type="range" class="range" bind:value={option.value} min={option.min} max={option.max} step={option.step} style="--pct:{option.value / option.max * 100}%;" />
                  {:else if option.type == 'scroll'}
                      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: auto; height: 100%; gap: 0.4vh;">
                        <span style="font-size: 1.2vh; line-height: 1;">-</span>
                        <span style="font-size: 1.2vh; line-height: 1;">
                          {option.options[option.selected]?.label}
                        </span>
                        <span style="font-size: 1.2vh; line-height: 1;">-</span>
                    </div>
                  {/if}
                </div>
                {/if}
              {/each}
            </div>
          </div>
        </div>

        <div style="margin-top:0.5vh; margin-left: 1.75vh; width: 90%; background: rgba(0, 0, 0); border-radius: 0.4vh; padding:0.8vh 0.9vh; font-size:1.1vh; color:#ffffff; display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#ffffff; font-weight:500;">Beta Fresh Menu</span>
          <span style="color:#ffffff; font-weight:500;">({selectableMenu.length ? counterCurrent() : 0}/{selectableMenu.length})</span>
        </div>
    </div>
{/if}
