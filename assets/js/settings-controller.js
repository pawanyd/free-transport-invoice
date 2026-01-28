import { APP_VERSION } from './version.js';

const AuthManager = (await import(`./auth.js?v=${APP_VERSION}`)).default;
const DataStoreManager = (await import(`./datastore.js?v=${APP_VERSION}`)).default;

class SettingsController {
  constructor() {
    this.authManager = new AuthManager();
    this.dataStore = new DataStoreManager();
    this.currentTab = 'company';
    this.editingCompanyId = null;
  }

  async init() {
    await this.authManager.initialize();
    if (!this.authManager.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    const initResult = await this.dataStore.initialize();
    if (!initResult.success) {
      alert('Failed to initialize database');
      return;
    }

    this.setupEventListeners();
    this.loadCompanyProfiles();
    this.loadCustomFields();
  }

  setupEventListeners() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());
    
    // Tab switching
    document.getElementById('companyTab')?.addEventListener('click', () => this.switchTab('company'));
    document.getElementById('customFieldsTab')?.addEventListener('click', () => this.switchTab('customFields'));
    document.getElementById('backupTab')?.addEventListener('click', () => this.switchTab('backup'));
    
    // Company profile
    document.getElementById('addCompanyBtn')?.addEventListener('click', () => this.openCompanyModal());
    document.getElementById('closeCompanyModal')?.addEventListener('click', () => this.closeCompanyModal());
    document.getElementById('cancelCompany')?.addEventListener('click', () => this.closeCompanyModal());
    document.getElementById('companyForm')?.addEventListener('submit', (e) => this.handleCompanySave(e));
    
    // Custom fields
    document.getElementById('addCustomFieldBtn')?.addEventListener('click', () => this.openCustomFieldModal());
    document.getElementById('closeCustomFieldModal')?.addEventListener('click', () => this.closeCustomFieldModal());
    document.getElementById('cancelCustomField')?.addEventListener('click', () => this.closeCustomFieldModal());
    document.getElementById('customFieldForm')?.addEventListener('submit', (e) => this.handleCustomFieldSave(e));
    document.getElementById('fieldType')?.addEventListener('change', (e) => this.handleFieldTypeChange(e.target.value));

    // Backup & Restore
    document.getElementById('exportBackupBtn')?.addEventListener('click', () => this.exportBackup());
    document.getElementById('importBackupBtn')?.addEventListener('click', () => this.triggerImport());
    document.getElementById('importBackupFile')?.addEventListener('change', (e) => this.handleImportFile(e));
    document.getElementById('enableBackupReminder')?.addEventListener('change', (e) => this.toggleReminderSettings(e.target.checked));
    document.getElementById('saveReminderBtn')?.addEventListener('click', () => this.saveReminderSettings());
  }

  switchTab(tab) {
    this.currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active', 'border-blue-600', 'text-blue-600');
      btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
    
    if (tab === 'company') {
      document.getElementById('companyTab')?.classList.add('active', 'border-blue-600', 'text-blue-600');
      document.getElementById('companyProfilesPanel')?.classList.remove('hidden');
    } else if (tab === 'customFields') {
      document.getElementById('customFieldsTab')?.classList.add('active', 'border-blue-600', 'text-blue-600');
      document.getElementById('customFieldsPanel')?.classList.remove('hidden');
    } else if (tab === 'backup') {
      document.getElementById('backupTab')?.classList.add('active', 'border-blue-600', 'text-blue-600');
      document.getElementById('backupPanel')?.classList.remove('hidden');
      this.loadBackupInfo();
    }
  }

  // ===== COMPANY PROFILE METHODS =====

  loadCompanyProfiles() {
    const userId = this.authManager.getUserId();
    const profiles = this.dataStore.getUserCompanyProfiles(userId);
    
    const container = document.getElementById('companyProfilesList');
    const noCompanies = document.getElementById('noCompanies');
    
    if (profiles.length === 0) {
      container.innerHTML = '';
      noCompanies?.classList.remove('hidden');
      return;
    }
    
    noCompanies?.classList.add('hidden');
    container.innerHTML = profiles.map(profile => this.renderCompanyCard(profile)).join('');
    
    // Add event listeners
    profiles.forEach(profile => {
      document.getElementById(`edit-company-${profile.id}`)?.addEventListener('click', () => this.editCompany(profile));
      document.getElementById(`delete-company-${profile.id}`)?.addEventListener('click', () => this.deleteCompany(profile.id));
      document.getElementById(`set-default-${profile.id}`)?.addEventListener('click', () => this.setDefaultCompany(profile.id));
    });
  }

  renderCompanyCard(profile) {
    return `
      <div class="border border-gray-200 rounded-lg p-4 ${profile.isDefault ? 'border-blue-500 bg-blue-50' : ''}">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-lg font-semibold">${this.escapeHtml(profile.name)}</h3>
              ${profile.isDefault ? '<span class="bg-blue-500 text-white text-xs px-2 py-1 rounded">Default</span>' : ''}
            </div>
            ${profile.address ? `<p class="text-sm text-gray-600">${this.escapeHtml(profile.address)}</p>` : ''}
            ${profile.city || profile.state || profile.pincode ? `<p class="text-sm text-gray-600">${[profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}</p>` : ''}
            <div class="mt-2 space-y-1">
              ${profile.gstNumber ? `<p class="text-sm text-gray-600"><span class="font-medium">GST:</span> ${this.escapeHtml(profile.gstNumber)}</p>` : ''}
              ${profile.panNumber ? `<p class="text-sm text-gray-600"><span class="font-medium">PAN:</span> ${this.escapeHtml(profile.panNumber)}</p>` : ''}
              ${profile.phone ? `<p class="text-sm text-gray-600"><span class="font-medium">Phone:</span> ${this.escapeHtml(profile.phone)}</p>` : ''}
              ${profile.email ? `<p class="text-sm text-gray-600"><span class="font-medium">Email:</span> ${this.escapeHtml(profile.email)}</p>` : ''}
            </div>
          </div>
          <div class="flex gap-2">
            ${!profile.isDefault ? `<button id="set-default-${profile.id}" class="text-blue-600 hover:text-blue-800 text-sm">Set Default</button>` : ''}
            <button id="edit-company-${profile.id}" class="text-orange-600 hover:text-orange-800">✏️</button>
            <button id="delete-company-${profile.id}" class="text-red-600 hover:text-red-800">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  openCompanyModal(profile = null) {
    this.editingCompanyId = profile?.id || null;
    
    document.getElementById('companyModalTitle').textContent = profile ? 'Edit Company Profile' : 'Add Company Profile';
    document.getElementById('companyId').value = profile?.id || '';
    document.getElementById('companyName').value = profile?.name || '';
    document.getElementById('companyAddress').value = profile?.address || '';
    document.getElementById('companyCity').value = profile?.city || '';
    document.getElementById('companyState').value = profile?.state || '';
    document.getElementById('companyPincode').value = profile?.pincode || '';
    document.getElementById('companyGST').value = profile?.gstNumber || '';
    document.getElementById('companyPAN').value = profile?.panNumber || '';
    document.getElementById('companyPhone').value = profile?.phone || '';
    document.getElementById('companyEmail').value = profile?.email || '';
    document.getElementById('companyWebsite').value = profile?.website || '';
    document.getElementById('companyIsDefault').checked = profile?.isDefault || false;
    
    document.getElementById('companyModal')?.classList.remove('hidden');
  }

  closeCompanyModal() {
    document.getElementById('companyModal')?.classList.add('hidden');
    document.getElementById('companyForm')?.reset();
    this.editingCompanyId = null;
  }

  editCompany(profile) {
    this.openCompanyModal(profile);
  }

  async handleCompanySave(e) {
    e.preventDefault();
    
    const userId = this.authManager.getUserId();
    const profileData = {
      userId,
      name: document.getElementById('companyName').value.trim(),
      address: document.getElementById('companyAddress').value.trim(),
      city: document.getElementById('companyCity').value.trim(),
      state: document.getElementById('companyState').value.trim(),
      pincode: document.getElementById('companyPincode').value.trim(),
      gstNumber: document.getElementById('companyGST').value.trim(),
      panNumber: document.getElementById('companyPAN').value.trim(),
      phone: document.getElementById('companyPhone').value.trim(),
      email: document.getElementById('companyEmail').value.trim(),
      website: document.getElementById('companyWebsite').value.trim(),
      isDefault: document.getElementById('companyIsDefault').checked
    };
    
    let result;
    if (this.editingCompanyId) {
      result = this.dataStore.updateCompanyProfile(this.editingCompanyId, profileData);
    } else {
      result = this.dataStore.saveCompanyProfile(profileData);
    }
    
    if (result.success) {
      this.showToast('Company profile saved successfully', 'success');
      this.closeCompanyModal();
      this.loadCompanyProfiles();
    } else {
      this.showCompanyError('Failed to save company profile: ' + result.error);
    }
  }

  async setDefaultCompany(id) {
    const userId = this.authManager.getUserId();
    const profiles = this.dataStore.getUserCompanyProfiles(userId);
    const profile = profiles.find(p => p.id === id);
    
    if (profile) {
      profile.isDefault = true;
      const result = this.dataStore.updateCompanyProfile(id, profile);
      if (result.success) {
        this.showToast('Default company updated', 'success');
        this.loadCompanyProfiles();
      }
    }
  }

  async deleteCompany(id) {
    if (!confirm('Are you sure you want to delete this company profile?')) return;
    
    const userId = this.authManager.getUserId();
    const result = this.dataStore.deleteCompanyProfile(id, userId);
    
    if (result.success) {
      this.showToast('Company profile deleted', 'success');
      this.loadCompanyProfiles();
    } else {
      this.showToast('Failed to delete company profile', 'error');
    }
  }

  // ===== CUSTOM FIELDS METHODS =====

  loadCustomFields() {
    const userId = this.authManager.getUserId();
    const fields = this.dataStore.getUserCustomFields(userId);
    
    const container = document.getElementById('customFieldsList');
    const noFields = document.getElementById('noCustomFields');
    
    if (fields.length === 0) {
      container.innerHTML = '';
      noFields?.classList.remove('hidden');
      return;
    }
    
    noFields?.classList.add('hidden');
    container.innerHTML = fields.map(field => this.renderCustomFieldCard(field)).join('');
    
    // Add event listeners
    fields.forEach(field => {
      document.getElementById(`delete-field-${field.id}`)?.addEventListener('click', () => this.deleteCustomField(field.id));
    });
  }

  renderCustomFieldCard(field) {
    const typeLabels = {
      text: 'Text',
      number: 'Number',
      date: 'Date',
      textarea: 'Text Area',
      select: 'Dropdown'
    };
    
    return `
      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-lg font-semibold">${this.escapeHtml(field.fieldLabel)}</h3>
            <p class="text-sm text-gray-600">Field Name: <code class="bg-gray-100 px-2 py-1 rounded">${this.escapeHtml(field.fieldName)}</code></p>
            <p class="text-sm text-gray-600">Type: ${typeLabels[field.fieldType] || field.fieldType}</p>
            ${field.isRequired ? '<span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mt-1">Required</span>' : ''}
            ${field.options ? `<p class="text-sm text-gray-600 mt-1">Options: ${field.options.join(', ')}</p>` : ''}
          </div>
          <div class="flex gap-2">
            <button id="delete-field-${field.id}" class="text-red-600 hover:text-red-800">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  openCustomFieldModal() {
    document.getElementById('customFieldModal')?.classList.remove('hidden');
  }

  closeCustomFieldModal() {
    document.getElementById('customFieldModal')?.classList.add('hidden');
    document.getElementById('customFieldForm')?.reset();
    document.getElementById('optionsContainer')?.classList.add('hidden');
  }

  handleFieldTypeChange(type) {
    const optionsContainer = document.getElementById('optionsContainer');
    if (type === 'select') {
      optionsContainer?.classList.remove('hidden');
    } else {
      optionsContainer?.classList.add('hidden');
    }
  }

  async handleCustomFieldSave(e) {
    e.preventDefault();
    
    const userId = this.authManager.getUserId();
    const fieldType = document.getElementById('fieldType').value;
    const fieldData = {
      userId,
      fieldName: document.getElementById('fieldName').value.trim().toLowerCase(),
      fieldLabel: document.getElementById('fieldLabel').value.trim(),
      fieldType: fieldType,
      isRequired: document.getElementById('fieldRequired').checked,
      options: null,
      displayOrder: 0
    };
    
    // Validate field name
    if (!/^[a-z_]+$/.test(fieldData.fieldName)) {
      this.showCustomFieldError('Field name must contain only lowercase letters and underscores');
      return;
    }
    
    // Get options for select fields
    if (fieldType === 'select') {
      const optionsStr = document.getElementById('fieldOptions').value.trim();
      if (!optionsStr) {
        this.showCustomFieldError('Please provide options for dropdown field');
        return;
      }
      fieldData.options = optionsStr.split(',').map(o => o.trim()).filter(Boolean);
    }
    
    const result = this.dataStore.saveCustomField(fieldData);
    
    if (result.success) {
      this.showToast('Custom field added successfully', 'success');
      this.closeCustomFieldModal();
      this.loadCustomFields();
    } else {
      this.showCustomFieldError('Failed to save custom field: ' + result.error);
    }
  }

  async deleteCustomField(id) {
    if (!confirm('Are you sure you want to delete this custom field? Existing data will not be affected.')) return;
    
    const userId = this.authManager.getUserId();
    const result = this.dataStore.deleteCustomField(id, userId);
    
    if (result.success) {
      this.showToast('Custom field deleted', 'success');
      this.loadCustomFields();
    } else {
      this.showToast('Failed to delete custom field', 'error');
    }
  }

  // ===== UTILITY METHODS =====

  showCompanyError(message) {
    const errorDiv = document.getElementById('companyErrorMessages');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
  }

  showCustomFieldError(message) {
    const errorDiv = document.getElementById('customFieldErrorMessages');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  handleLogout() {
    this.authManager.logout();
    window.location.href = 'login.html';
  }

  // ===== BACKUP & RESTORE METHODS =====

  loadBackupInfo() {
    // Load last backup date
    const lastBackup = localStorage.getItem('lastBackupDate');
    const lastBackupEl = document.getElementById('lastBackupDate');
    if (lastBackupEl) {
      if (lastBackup) {
        const date = new Date(lastBackup);
        lastBackupEl.textContent = date.toLocaleString('en-IN');
      } else {
        lastBackupEl.textContent = 'Never';
      }
    }

    // Load reminder settings
    const reminderEnabled = localStorage.getItem('backupReminderEnabled') === 'true';
    const reminderFrequency = localStorage.getItem('backupReminderFrequency') || '30';
    
    document.getElementById('enableBackupReminder').checked = reminderEnabled;
    document.getElementById('reminderFrequency').value = reminderFrequency;
    
    if (reminderEnabled) {
      document.getElementById('reminderSettings')?.classList.remove('hidden');
    }

    // Load statistics
    this.loadDatabaseStats();

    // Check if reminder is due
    this.checkBackupReminder();
  }

  loadDatabaseStats() {
    const stats = this.dataStore.getDatabaseStats();
    if (stats) {
      document.getElementById('statFreightCount').textContent = stats.freight_details || 0;
      document.getElementById('statCompanyCount').textContent = stats.company_profiles || 0;
      document.getElementById('statCustomFieldCount').textContent = stats.custom_field_definitions || 0;
      document.getElementById('statDatabaseSize').textContent = stats.sizeKB + ' KB';
    }
  }

  exportBackup() {
    const result = this.dataStore.exportBackup();
    
    if (result.success) {
      const dataStr = JSON.stringify(result.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `transport-invoice-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      // Update last backup date
      localStorage.setItem('lastBackupDate', new Date().toISOString());
      this.loadBackupInfo();
      
      this.showToast('Backup exported successfully', 'success');
    } else {
      this.showToast('Failed to export backup: ' + result.error, 'error');
    }
  }

  triggerImport() {
    document.getElementById('importBackupFile')?.click();
  }

  async handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const confirmed = confirm('WARNING: Importing a backup will replace ALL current data. Are you sure you want to continue?');
    if (!confirmed) {
      event.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      const result = await this.dataStore.importBackup(backupData);
      
      if (result.success) {
        this.showToast('Backup imported successfully. Reloading...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        this.showToast('Failed to import backup: ' + result.error, 'error');
      }
    } catch (error) {
      this.showToast('Failed to read backup file: ' + error.message, 'error');
    }
    
    event.target.value = '';
  }

  toggleReminderSettings(enabled) {
    const settings = document.getElementById('reminderSettings');
    if (enabled) {
      settings?.classList.remove('hidden');
    } else {
      settings?.classList.add('hidden');
    }
  }

  saveReminderSettings() {
    const enabled = document.getElementById('enableBackupReminder').checked;
    const frequency = document.getElementById('reminderFrequency').value;
    
    localStorage.setItem('backupReminderEnabled', enabled.toString());
    localStorage.setItem('backupReminderFrequency', frequency);
    
    if (enabled) {
      localStorage.setItem('nextBackupReminder', this.calculateNextReminder(frequency));
    } else {
      localStorage.removeItem('nextBackupReminder');
    }
    
    this.showToast('Reminder settings saved', 'success');
  }

  calculateNextReminder(days) {
    const next = new Date();
    next.setDate(next.getDate() + parseInt(days));
    return next.toISOString();
  }

  checkBackupReminder() {
    const enabled = localStorage.getItem('backupReminderEnabled') === 'true';
    if (!enabled) return;

    const nextReminder = localStorage.getItem('nextBackupReminder');
    if (!nextReminder) {
      // Set initial reminder
      const frequency = localStorage.getItem('backupReminderFrequency') || '30';
      localStorage.setItem('nextBackupReminder', this.calculateNextReminder(frequency));
      return;
    }

    const now = new Date();
    const reminderDate = new Date(nextReminder);
    
    if (now >= reminderDate) {
      // Show reminder
      const frequency = localStorage.getItem('backupReminderFrequency') || '30';
      const message = `It's time to backup your data! Last backup: ${this.getLastBackupText()}`;
      
      if (confirm(message + '\n\nWould you like to export a backup now?')) {
        this.exportBackup();
      }
      
      // Set next reminder
      localStorage.setItem('nextBackupReminder', this.calculateNextReminder(frequency));
    }
  }

  getLastBackupText() {
    const lastBackup = localStorage.getItem('lastBackupDate');
    if (!lastBackup) return 'Never';
    
    const date = new Date(lastBackup);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }
}

// Initialize
const settingsController = new SettingsController();
settingsController.init();

