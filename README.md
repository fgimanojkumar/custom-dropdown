# ng-dropdown — Angular UI Components Library

A production-ready, feature-rich component library for Angular with Dropdown, Toggle, Range, and Loader components.

## 🎯 Quick Start

### This Repository

This repo contains both the **component library** (`src/lib/`) and a **demo app** (`src/app/`).

**Library Documentation:** See [LIBRARY.md](./LIBRARY.md) for full component API and examples.

---

## 📦 Using the Library in Your Project

### Option 1: In This Project (Already Set Up)

```typescript
import { Dropdown, Toggle, Range, Loader } from '@ng-dropdown/core';
```

### Option 2: In Another Angular Project

#### Step 1: Copy the Library

Copy `src/lib/` folder to your project''s `src/` folder.

#### Step 2: Update `tsconfig.json`

Add path mapping:

```json
{
  "compilerOptions": {
    "paths": {
      "@ng-dropdown/core": ["src/lib/index.ts"]
    }
  }
}
```

#### Step 3: Import Components

```typescript
import { Component } from '@angular/core';
import { Dropdown, DropdownOption } from '@ng-dropdown/core';

@Component({
  selector: ''app-root'',
  standalone: true,
  imports: [Dropdown],
  template: `
    <app-dropdown
      placeholder="Choose an option"
      [dataArray]="[''Option 1'', ''Option 2'', ''Option 3'']"
      (onChange)="onSelect($event)">
    </app-dropdown>
  `
})
export class AppComponent {
  onSelect(value: any) {
    console.log(''Selected:'', value);
  }
}
```

---

## 📚 Documentation

| Component | Features |
|-----------|----------|
| [**Dropdown**](./LIBRARY.md#-dropdown-component) | Multi/single-select, grouping, search, badges, icons, max select, history |
| [**Toggle**](./LIBRARY.md#-toggle-component) | Custom colors, sizes, loading state |
| [**Range**](./LIBRARY.md#-range-component) | Slider with tooltip, gradient fill, custom colors |
| [**Loader**](./LIBRARY.md#-loader-component) | Full-screen loader with spinner |

👉 **Full docs:** [LIBRARY.md](./LIBRARY.md)

---

## 🚀 Run Demo Locally

```bash
npm install
npm start
```

Open browser: http://localhost:4200

---

## 📋 Component Structure

```
src/
├── app/                    (Demo app)
├── lib/                    (Component Library)
│   ├── dropdown/
│   ├── toggle/
│   ├── range/
│   ├── loader/
│   ├── pipes/
│   └── index.ts            (Public API)
└── main.ts
```

---

## ✨ Features

✅ **Angular 22+ (Standalone)**
✅ **Zero Dependencies**
✅ **TypeScript**
✅ **Reactive Forms Support**
✅ **Keyboard Navigation**
✅ **SCSS Theming**
✅ **Modern UI**

---

## 🎨 Customize

Edit `src/lib/dropdown/dropdown.scss`:

```scss
$primary: #6366f1;
$text-dark: #1e293b;
```

---

**Made with ❤️ for Angular**
