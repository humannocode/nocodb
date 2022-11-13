import { SettingsPage } from '.';
import { ErdBasePage } from '../commonBase/Erd';

export class SettingsErdPage extends ErdBasePage {
  readonly settings: SettingsPage;

  constructor(settings: SettingsPage) {
    super(settings.rootPage);
    this.settings = settings;
  }

  get() {
    return this.rootPage.locator(`[data-nc="nc-settings-subtab-ERD View"]`);
  }
}
