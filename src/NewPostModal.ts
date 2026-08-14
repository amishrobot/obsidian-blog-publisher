import { App, Modal, Setting } from 'obsidian';
import { BlogTargetSettings } from './models/types';
import { slugifyTitle } from './utils/newPost';

export interface NewPostRequest {
  title: string;
  slug: string;
  type: 'post' | 'link';
  linkUrl: string;
  target: BlogTargetSettings;
}

/**
 * Prompts for the handful of fields a post cannot be published without.
 *
 * The frontmatter this produces is the same set PostService validates, so a
 * note created here is publishable the moment it exists — which is the point.
 * Creating notes by hand is what leaves posts missing `date` or `slug`.
 */
export class NewPostModal extends Modal {
  private targets: BlogTargetSettings[];
  private onSubmit: (request: NewPostRequest) => void | Promise<void>;

  private title = '';
  private slug = '';
  private slugEdited = false;
  private type: 'post' | 'link' = 'post';
  private linkUrl = '';
  private targetIndex = 0;

  private slugInput: HTMLInputElement | null = null;
  private linkRow: HTMLElement | null = null;
  private submitButton: HTMLButtonElement | null = null;

  constructor(
    app: App,
    targets: BlogTargetSettings[],
    onSubmit: (request: NewPostRequest) => void | Promise<void>,
    presetTargetIndex = 0
  ) {
    super(app);
    this.targets = targets;
    this.onSubmit = onSubmit;
    this.targetIndex = presetTargetIndex >= 0 ? presetTargetIndex : 0;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h3', { text: 'New blog post' });

    let titleInput: HTMLInputElement | null = null;

    new Setting(contentEl).setName('Title').addText((text) => {
      titleInput = text.inputEl;
      text.setPlaceholder('Ordinary Abundance').onChange((value) => {
        this.title = value;
        // The slug tracks the title until the moment it's typed in by hand,
        // after which it is left alone.
        if (!this.slugEdited) {
          this.slug = slugifyTitle(value);
          if (this.slugInput) this.slugInput.value = this.slug;
        }
        this.syncSubmitState();
      });
      text.inputEl.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          void this.submit();
        }
      });
    });

    // Only worth asking when there's an actual choice to make.
    if (this.targets.length > 1) {
      new Setting(contentEl).setName('Blog').addDropdown((dropdown) => {
        this.targets.forEach((target, index) => {
          dropdown.addOption(String(index), target.name || target.postsFolder || `Target ${index + 1}`);
        });
        dropdown.setValue(String(this.targetIndex));
        dropdown.onChange((value) => {
          this.targetIndex = Number(value) || 0;
        });
      });
    }

    new Setting(contentEl).setName('Type').addDropdown((dropdown) => {
      dropdown.addOption('post', 'Post');
      dropdown.addOption('link', 'Link');
      dropdown.setValue(this.type);
      dropdown.onChange((value) => {
        this.type = value === 'link' ? 'link' : 'post';
        if (this.linkRow) this.linkRow.style.display = this.type === 'link' ? '' : 'none';
        this.syncSubmitState();
      });
    });

    const linkSetting = new Setting(contentEl)
      .setName('Link URL')
      .setDesc('The page this post is about.')
      .addText((text) => {
        text.setPlaceholder('https://example.com/article').onChange((value) => {
          this.linkUrl = value.trim();
          this.syncSubmitState();
        });
        text.inputEl.style.width = '100%';
      });
    this.linkRow = linkSetting.settingEl;
    this.linkRow.style.display = 'none';

    new Setting(contentEl)
      .setName('Slug')
      .setDesc('URL segment. Derived from the title until you edit it.')
      .addText((text) => {
        this.slugInput = text.inputEl;
        text.setPlaceholder('ordinary-abundance').onChange((value) => {
          this.slugEdited = true;
          this.slug = value.trim();
          this.syncSubmitState();
        });
      });

    new Setting(contentEl).addButton((button) => {
      this.submitButton = button.buttonEl;
      button
        .setButtonText('Create')
        .setCta()
        .onClick(() => {
          void this.submit();
        });
    });

    this.syncSubmitState();
    window.setTimeout(() => titleInput?.focus(), 0);
  }

  private isValid(): boolean {
    if (!this.title.trim()) return false;
    if (!slugifyTitle(this.slug)) return false;
    if (this.type === 'link' && !this.linkUrl) return false;
    return true;
  }

  private syncSubmitState(): void {
    if (this.submitButton) this.submitButton.disabled = !this.isValid();
  }

  private async submit(): Promise<void> {
    if (!this.isValid()) return;
    const request: NewPostRequest = {
      title: this.title.trim(),
      slug: slugifyTitle(this.slug),
      type: this.type,
      linkUrl: this.linkUrl,
      target: this.targets[this.targetIndex] || this.targets[0] || {},
    };
    this.close();
    await this.onSubmit(request);
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
