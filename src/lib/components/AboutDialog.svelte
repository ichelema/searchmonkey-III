<script lang="ts">
  import { onMount } from 'svelte';
  import { getVersion } from '@tauri-apps/api/app';

  let { onClose }: { onClose?: () => void } = $props();

  let appVersion = $state('0.0.0');

  onMount(() => {
    void getVersion()
      .then((version) => {
        appVersion = version;
      })
      .catch(() => {
        appVersion = '0.0.0';
      });
  });
</script>

<div class="modal-layer" role="presentation">
  <button class="modal-backdrop" type="button" aria-label="Close about dialog" onclick={onClose}></button>

  <div class="about-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title">
    <div class="icon-frame" aria-hidden="true">
      <img src="/favicon.png" alt="" />
    </div>

    <h2 id="about-title">Searchmonkey III</h2>
    <p class="version">Version {appVersion}</p>

    <p class="description">Fast desktop file search with regex, filters, previews, and indexing.</p>

    <p class="license">MIT</p>

    <button type="button" class="close-button" onclick={onClose}>Close</button>
  </div>
</div>

<style>
  .modal-layer {
    position: fixed;
    inset: 0;
    z-index: 46;
    display: grid;
    place-items: center;
    padding: 20px;
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba(30, 37, 45, 0.22);
  }

  .about-dialog {
    position: relative;
    z-index: 1;
    display: grid;
    justify-items: center;
    width: min(360px, 100%);
    max-width: calc(100vw - 24px);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 26px 24px 22px;
    background: var(--panel);
    box-shadow: 0 18px 38px rgba(30, 37, 45, 0.16);
    text-align: center;
  }

  .icon-frame {
    display: grid;
    width: 68px;
    height: 68px;
    border: 1px solid var(--border);
    border-radius: 16px;
    place-items: center;
    background: var(--surface);
  }

  .icon-frame img {
    width: 44px;
    height: 44px;
    object-fit: contain;
  }

  h2 {
    margin: 16px 0 0;
    color: var(--text);
    font-size: 22px;
    font-weight: 760;
    line-height: 1.15;
  }

  .version,
  .license {
    margin: 6px 0 0;
    color: var(--muted);
    font-size: 13px;
    font-weight: 600;
  }

  .description {
    max-width: 250px;
    margin: 18px 0 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.5;
  }

  .close-button {
    min-width: 110px;
    height: 38px;
    margin-top: 22px;
    border: 1px solid var(--accent);
    border-radius: 10px;
    padding: 0 16px;
    color: var(--on-accent);
    background: var(--accent);
    font: inherit;
    font-size: 13px;
    font-weight: 700;
  }

  .close-button:not(:disabled) {
    cursor: pointer;
  }

  .close-button:hover,
  .close-button:focus-visible {
    background: var(--accent-strong);
    outline: none;
  }

  @media (max-width: 520px) {
    .modal-layer {
      align-items: end;
      padding: 12px;
    }

    .about-dialog {
      width: min(360px, calc(100vw - 16px));
      padding: 22px 18px 18px;
    }
  }
</style>
