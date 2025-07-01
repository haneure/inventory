import React from 'react';

export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <form>
        <label>
          App Name:
          <input type="text" placeholder="Inventory App" />
        </label>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
}