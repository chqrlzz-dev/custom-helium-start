<img src="https://github.com/user-attachments/assets/e3a74da4-8c2f-4b6f-923d-48b2cea1c407" width="100%" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />

# Disclosure & Attribution

I am not affiliated with Helium or Imput.

This project was originally created for my personal use. However, as some have asked for a copy, I am sharing it here for anyone to enjoy.

- All references to "Helium" belong to Imput/Helium.
- All rights are reserved to Imput/Helium; you can support their work at [helium.computer/sponsor](https://helium.computer/sponsor).
- I am not part of Imput/Helium, nor am I affiliated with them.

---

## Original Creator & Code Attribution

**Original Code Creator:** [mlemlabs](https://github.com/mlemlabs)  
**Original Repository:** [mlemlabs/custom-helium-start](https://github.com/mlemlabs/custom-helium-start)  

This repository is a modified fork that packages the original `custom-helium-start` page as a **Chrome Extension** for easier setup and native "New Tab" overriding, overcoming browser CSP (Content Security Policy) restrictions by bundling assets natively instead of relying on external CDNs. All design choices, core layout, and concepts originate from the original creator.

---

## Chrome Extension Installation (Developer Mode)

Since this is an unpacked extension, you'll need to load it manually in Chrome via Developer Mode.

1. Download this repository as a `.zip` file (or grab the packaged `.zip` if provided) and extract it to a folder on your computer.
2. Open Google Chrome and navigate to the Extensions page: `chrome://extensions/`.
3. In the top right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button that appears in the top left.
5. Select the folder where you extracted the code (the folder containing `manifest.json`).
6. The extension is now installed! Open a new tab to see your new Helium dashboard.

### Updating Configuration
To customize your dashboard, open `assets/js/config.js` in a text editor. You can easily change your default search engine, colors, and add custom `!bang` shortcuts! After saving changes, go back to `chrome://extensions/` and click the **Refresh** icon on the extension card to apply them. All your search history and settings are stored locally in your browser's `localStorage`.
