import { describe, it, expect } from 'vitest';
import { BlogPublisherSettings, DEFAULT_SETTINGS, settingsForDisk } from '../src/models/types';

/**
 * Found 2026-09-01: the GitHub token was sitting in data.json in plaintext even
 * though the vault's secrets file already held it. The cause was that
 * hydrateTokenFromSecretsFile() assigned the resolved secret onto
 * settings.githubToken -- the same object saveSettings() persists -- so changing
 * any unrelated setting copied the secret into a second file on disk.
 */
const settings = (over: Partial<BlogPublisherSettings> = {}): BlogPublisherSettings =>
  ({ ...DEFAULT_SETTINGS, ...over }) as BlogPublisherSettings;

describe('settingsForDisk', () => {
  it('never writes a token that came from the secrets file', () => {
    const live = settings({ githubToken: 'gho_from_secrets_file', repository: 'me/site' });
    expect(settingsForDisk(live, true).githubToken).toBe('');
  });

  it('keeps every other setting intact while redacting', () => {
    const live = settings({ githubToken: 'gho_from_secrets_file', repository: 'me/site', branch: 'trunk' });
    const disk = settingsForDisk(live, true);
    expect(disk.repository).toBe('me/site');
    expect(disk.branch).toBe('trunk');
  });

  it('does not mutate the in-memory settings that the session publishes with', () => {
    const live = settings({ githubToken: 'gho_from_secrets_file' });
    settingsForDisk(live, true);
    expect(live.githubToken).toBe('gho_from_secrets_file');
  });

  it('persists a token the user typed, since that is a deliberate override', () => {
    const live = settings({ githubToken: 'gho_typed_by_hand' });
    expect(settingsForDisk(live, false).githubToken).toBe('gho_typed_by_hand');
  });

  it('leaves an empty token empty either way', () => {
    expect(settingsForDisk(settings(), false).githubToken).toBe('');
    expect(settingsForDisk(settings(), true).githubToken).toBe('');
  });
});
